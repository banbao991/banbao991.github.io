'use strict';
// A child takes a short tea outing instead of overlapping the working market frontage.
function townTeaNorthRoute(fromX,toX) {
  const y=TOWN_LAYOUT.flowerLaneY,lamp=MARKET_LAYOUT.lamps[0];
  const detour=[{x:lamp.x-24,y},{x:lamp.x-24,y:y+14},
    {x:lamp.x+28,y:y+14},{x:lamp.x+28,y}];
  // Stay on the existing 28px ribbon below the lamp's base, then rejoin its
  // northern edge before passing the merchant cart. Use the same way home.
  const crossing=fromX<=detour[0].x&&toX>=detour.at(-1).x
    ||toX<=detour[0].x&&fromX>=detour.at(-1).x;
  return [...(crossing?(fromX<toX?detour:detour.toReversed()):[]),{x:toX,y}];
}
function townTeaGuestRoute(from){
  const access=TOWN_LAYOUT.teaAccess,seat=TOWN_LAYOUT.childSeat;
  // The eastern lane joins both road ribbons and stays clear of the cart canopy.
  return [{x:from.x,y:TOWN_LAYOUT.flowerLaneY},...townTeaNorthRoute(from.x,TOWN_LAYOUT.cartLaneX),{x:TOWN_LAYOUT.cartLaneX,y:950},
    {x:access.x,y:950},{...access},{x:seat.x,y:access.y},{...seat}];
}
function townMerchantTeaRoute(){
  const access=TOWN_LAYOUT.teaAccess,seat=TOWN_LAYOUT.merchantSeat;
  return [{x:TOWN_LAYOUT.counter.x,y:950},{x:access.x,y:950},{...access},{x:seat.x,y:access.y},{...seat}];
}
function townChildReturnRoute(){
  const access=TOWN_LAYOUT.teaAccess;
  return [{x:villageWalker.x,y:access.y},{...access},{x:access.x,y:950},
    {x:TOWN_LAYOUT.cartLaneX,y:950},{x:TOWN_LAYOUT.cartLaneX,y:TOWN_LAYOUT.flowerLaneY},
    ...townTeaNorthRoute(TOWN_LAYOUT.cartLaneX,VILLAGE_WALKER_LAYOUT.home.x),{...VILLAGE_WALKER_LAYOUT.home}];
}
function townChooseMerchantRest(actor) {
  if(!villageSiteOpen('traveller'))return false;
  if(farm.town.construction || actor.restDay===farm.day || farm.phase<.26 || farm.phase>=.32)return false;
  const weather=weatherVisual();
  if(weather.rain>=.25 || weather.snow>=.25)return false;
  actor.restDay=farm.day;
  if(townRandom()>=.45)return false;
  actor.mode='walk';townSetRoute(actor,townMerchantTeaRoute(),'tea');
  return true;
}
function townBeginMerchantRest(actor) {
  actor.mode='rest';actor.walk=0;actor.wait=3.2;actor.drinking=false;
  if(farm.town.inventory.teaBlend){
    farm.town.inventory.teaBlend--;farm.town.selfTea++;actor.drinking=true;
    townNote('阿棠收好账本，在茶桌旁给自己泡了一杯花茶，歇一会儿再回货架。');
  }
  save();
}
function townEndMerchantRest(actor) {
  actor.mode='walk';actor.drinking=false;
  townSetRoute(actor,[...actor.route.slice(0,actor.index).reverse(),{...TOWN_LAYOUT.counter}],'shop');
}
function updateTownMerchantRest(actor,dt) {
  // A saved visit to the former roadside chairs ends by walking back; no tea is charged again.
  if(distance(actor,TOWN_LAYOUT.merchantSeat)>2){townEndMerchantRest(actor);return;}
  actor.wait=Math.max(0,actor.wait-dt);
  if(farm.phase>=.46){actor.mode='walk';actor.drinking=false;townSetRoute(actor,townHomeRoute(actor),'home');return;}
  const weather=weatherVisual();
  if(actor.wait===0 || weather.rain>=.25 || weather.snow>=.25)townEndMerchantRest(actor);
}
function updateTownChildVisit(dt) {
  if(!villageSiteOpen('traveller'))return false;
  const town = farm.town;
  let visit = town.childVisit;
  if (!visit && townShopOpen() && town.inventory.teaBlend > 0 && farm.phase >= .05 && farm.phase < .12
    && town.traveller.chatDay !== farm.day && hash(farm.day, 829) < .65) {
    visit = town.childVisit = { day: farm.day, stage: 'out', index: 0, wait: 0,
      route: townTeaGuestRoute(villageWalker) };
  }
  if (!visit) return false;
  if (isFestivalDay()) { town.childVisit = null; return false; }
  if(visit.stage==='out' && distance(visit.route.at(-1),TOWN_LAYOUT.childSeat)>2){
    visit.route=[...visit.route.slice(0,visit.index).reverse(),{...VILLAGE_WALKER_LAYOUT.home}];
    visit.stage='return';visit.index=0;
  }
  // Allow the complete eastern-lane approach before the afternoon return.
  if (visit.stage !== 'return' && (farm.phase >= TOWN_CHILD_TEA_RETURN_PHASE || visit.day !== farm.day
    || town.traveller.mode === 'away')) {
    visit.route = visit.stage==='out'?[...visit.route.slice(0,visit.index).reverse(),{...VILLAGE_WALKER_LAYOUT.home}]:townChildReturnRoute();
    visit.stage = 'return'; visit.index = 0;
  }
  if (visit.stage === 'tea') {
    visit.wait += dt;
    if (visit.wait >= 3.5) { visit.stage = 'return'; visit.index = 0; visit.route = townChildReturnRoute(); }
    return true;
  }
  const moving = { ...villageWalker, route: visit.route, index: visit.index };
  const done = townFollowRoute(moving, dt, visit.stage === 'return' ? VILLAGE_HOME_SPEED : VILLAGE_STROLL_SPEED);
  Object.assign(villageWalker, { x: moving.x, y: moving.y, step: moving.step, dir: moving.dir });
  visit.index = moving.index;
  if (done) {
    if (visit.stage === 'return') town.childVisit = null;
    else if (town.inventory.teaBlend > 0 && townShopOpen()) {
      visit.stage = 'tea'; visit.wait = 0; town.inventory.teaBlend--; town.teaServed++;
      town.traveller.chatDay = farm.day; town.traveller.waveUntil = now + 2;
      villageWalker.waveUntil = now + 2;
      townNote(`阿宁在驿屋喝了一杯花茶，听旅行故事：${townStoryText()}`);
    } else { visit.stage = 'return'; visit.index = 0; visit.route = townChildReturnRoute(); }
  }
  return true;
}
