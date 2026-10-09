'use strict';
// A paid afternoon gathering starts only after both neighbors really reach their chairs.
function townTeaPartyHosting() { return ['out','tea'].includes(farm.town.teaParty.stage); }
function townTeaPartyPrice() { return farm.coins>=500000?90:farm.coins>=100000?65:45; }
function townCanInviteTeaParty(automatic=false) {
  if(!villageSiteOpen('traveller'))return false;
  const town=farm.town,party=town.teaParty,work=orderKeeper.gardenWork,weather=weatherVisual();
  return townShopOpen() && town.visits>0 && farm.coins>=20000 && !town.construction && !town.childVisit
    && farm.phase>=.26 && farm.phase<.35 && weather.rain<.25 && weather.snow<.25
    && town.inventory.teaBlend>=2 && work?.day===farm.day && work.stage==='done'
    && !orderKeeper.routine && !orderKeeper.festival && distance(orderKeeper,EAST_GARDEN_NOTICE)<2
    && !['out','tea','return'].includes(party.stage)
    && !(party.visit===town.visits && (party.chosen || automatic && party.decided))
    && townCanSpend(townTeaPartyPrice(),automatic);
}
function townInviteTeaParty(automatic=false) {
  if(!townCanInviteTeaParty(automatic))return false;
  const town=farm.town,actor=town.traveller;
  town.teaParty={...makeTownTeaParty(),visit:town.visits,day:farm.day,decided:true,chosen:true,
    automatic,stage:'out',cost:townTeaPartyPrice(),route:townTeaGuestRoute(EAST_GARDEN_NOTICE)};
  actor.restDay=farm.day;actor.mode='walk';actor.drinking=false;
  townSetRoute(actor,townMerchantTeaRoute(),'tea');
  townNote(`阿葵忙完菜圃，答应去驿屋喝茶；两人到座后再备 ${town.teaParty.cost} 金点心。`);
  updateUI();save();return true;
}
function townEndTeaParty(reason) {
  const party=farm.town.teaParty,actor=farm.town.traveller;
  if(!townTeaPartyHosting())return;
  // Reverse only the route already walked, including when rain interrupts the approach.
  party.route=[...party.route.slice(0,party.index).reverse(),{...EAST_GARDEN_NOTICE}];
  party.index=0;party.stage='return';
  if(actor.target==='tea' || actor.mode==='rest'){
    if(farm.phase>=.46){actor.mode='walk';actor.drinking=false;townSetRoute(actor,townHomeRoute(actor),'home');}
    else townEndMerchantRest(actor);
  }
  if(reason)townNote(`${party.paid?'茶会散了':'茶会暂缓'}：${reason}${party.paid?'':'，尚未取茶或付点心费'}。`);
  save();
}
function updateTownTeaParty(dt) {
  if(farm.paused)return;
  const town=farm.town,party=town.teaParty,actor=town.traveller;
  if(isFestivalDay()){
    if(['out','tea','return'].includes(party.stage)){party.stage='done';party.route=[];party.index=0;actor.drinking=false;}
    return;
  }
  if(party.stage==='home' && party.day!==farm.day)party.stage='done';
  if(townTeaPartyHosting()){
    if(distance(party.route.at(-1),TOWN_LAYOUT.childSeat)>2){townEndTeaParty('茶桌还没准备好，下回再聚');return;}
    const weather=weatherVisual();
    if(party.day!==farm.day || farm.phase>=.46 || weather.rain>=.25 || weather.snow>=.25
      || town.construction || actor.mode==='away'){
      townEndTeaParty(weather.rain>=.25||weather.snow>=.25?'天气变了，沿路回去休息':'收好茶杯，接着各自的日程');return;
    }
    if(party.stage==='out' && party.index===party.route.length
      && distance(orderKeeper,TOWN_LAYOUT.childSeat)<2
      && actor.mode==='rest' && distance(actor,TOWN_LAYOUT.merchantSeat)<2){
      if(town.inventory.teaBlend<2 || !townSpend(party.cost,'gatherings',party.automatic)){
        townEndTeaParty('留好花茶和经营储备，下回再聚');return;
      }
      party.paid=true;party.stage='tea';party.wait=0;
      town.inventory.teaBlend-=2;town.teaServed++;town.selfTea++;town.teaParties++;
      actor.drinking=true;actor.waveUntil=now+2;orderKeeper.waveUntil=now+2;
      townNote(`阿葵和阿棠坐下喝花茶，分了${['春花饼','夏果酥','秋栗糕','冬姜饼'][seasonIndex()]}；点心 ${party.cost} 金，茶香在院子里慢慢散开。`,true);
      save();
    }else if(party.stage==='tea'){
      party.wait+=dt;if(party.wait>=4)townEndTeaParty('谢谢招待，阿葵沿村路回告示牌');
    }
    return;
  }
  if(party.stage==='return')return;
  if(party.visit!==town.visits)town.teaParty={...makeTownTeaParty(),visit:town.visits};
  if(townCanInviteTeaParty(true)){
    if(townRandom()<.4)townInviteTeaParty(true);
    else {Object.assign(town.teaParty,{day:farm.day,decided:true,stage:'done'});save();}
  }
}
function updateTownTeaPartyGuest(dt) {
  const party=farm.town.teaParty;
  if(party.stage==='home' && party.day===farm.day)return true;
  if(!['out','tea','return'].includes(party.stage))return false;
  if(farm.paused)return true;
  orderKeeper.facing='down';
  if(party.stage==='tea')return true;
  if(party.stage==='return' && farm.phase>=NIGHT_START && !party.returnHome){
    const remaining=party.route.slice(party.index),laneY=TOWN_LAYOUT.flowerLaneY;
    const north=remaining.findIndex(point=>point.y===laneY);
    const approach=Math.abs(orderKeeper.y-laneY)<2?[]:north>=0?remaining.slice(0,north+1):[{x:orderKeeper.x,y:laneY}];
    party.route=[...approach,...townTeaNorthRoute(approach.at(-1)?.x??orderKeeper.x,ORDER_KEEPER_HOME.x),{...ORDER_KEEPER_HOME}];
    party.index=0;party.returnHome=true;
  }
  const moving={...orderKeeper,route:party.route,index:party.index};
  const arrived=townFollowRoute(moving,dt,185);
  Object.assign(orderKeeper,{x:moving.x,y:moving.y,dir:moving.dir,step:moving.step,walk:moving.walk});
  party.index=moving.index;
  if(arrived && party.stage==='return'){
    party.stage=party.returnHome?'home':'done';party.route=[];party.index=0;save();
  }
  return true;
}
function townTeaPartyGuestSeated() {
  const party=farm.town.teaParty;
  return !isFestivalDay() && distance(orderKeeper,TOWN_LAYOUT.childSeat)<2
    && (party.stage==='tea' || party.stage==='out' && party.index===party.route.length);
}
function townTeaPartyGuestActivity() {
  const party=farm.town.teaParty;
  return party.stage==='out'?'沿村路去驿屋赴茶会':party.stage==='tea'?'和阿棠喝花茶、聊邻里日常'
    :party.stage==='return'?party.returnHome?'从驿屋沿村路回家':'从驿屋回村口告示牌'
    :party.stage==='home'&&party.day===farm.day?'在小屋里休息':null;
}
