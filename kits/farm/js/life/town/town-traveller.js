'use strict';
// 阿棠's stock, itinerary and arrival are frozen into the full farm save.
function townShopOpen() {
  const actor = farm.town.traveller;
  return villageSiteOpen('traveller') && actor.mode === 'shop' && !townTeaPartyHosting() && !isFestivalDay() && farm.phase >= .04 && farm.phase < .46;
}
function townCartPosition() {
  const actor = farm.town.traveller;
  return actor.cartAttached ? { x: actor.x + TOWN_LAYOUT.cartHitch.x,
    y: actor.y + TOWN_LAYOUT.cartHitch.y } : TOWN_LAYOUT.cart;
}
function townTravellerVisible() {
  const actor = farm.town.traveller;
  return villageSiteOpen('traveller') && actor.mode !== 'away' && !festivalAtHome(actor)
    && (actor.mode !== 'home' || ['out','gather','back'].includes(actor.festival?.stage));
}
function townTravellerActivity() {
  const actor = farm.town.traveller;
  if(!villageSiteOpen('traveller'))return '等待旅人驿屋建成';
  return festivalActivity(actor) || ({ away: '在旅途中', arrive: '推着小货车进村', shop: '整理货架，等大家来逛',
    flowers:'给驿屋门前的花盆浇水',
    walk: actor.target==='flowers'?'沿村路去看看门前花盆':actor.target==='tea'?'走到茶桌旁歇脚':actor.target === 'home' ? '收摊回驿屋休息' : actor.target === 'leave' ? '准备取车道别'
      : actor.target === 'work' ? '沿路去修缮小镇设施' : '走向小货车', home: '在驿屋休息',
    rest: townSketchDrawing()?'坐在茶桌边画旅途风景':farm.town.teaParty.stage==='tea'?'和阿葵喝花茶聊天':townTeaPartyHosting()?'在茶桌旁等阿葵':'坐在茶桌边歇脚', leave: '推车前往下一座小镇', work: farm.town.construction
      ? `${farm.town.construction.kind === 'care' ? '照料' : '修建'}${TOWN_PROJECTS[farm.town.construction.id].name} · ${Math.floor(farm.town.construction.progress * 100)}%` : '收拾修缮工具' }[actor.mode]);
}
function townSetRoute(actor, route, target) {
  actor.route = route.map(point => ({ ...point })); actor.index = 0; actor.target = target;
}
function townFollowRoute(actor, dt, speed = 150) {
  // Consume remaining movement through corners, without shortening the route or cutting diagonally.
  let remaining = dt;
  for (let i = 0; i < 160 && remaining > 0; i++) {
    const target = actor.route[actor.index];
    if (!target) return true;
    const length = distance(actor, target), travel = Math.min(length, speed * remaining);
    if (length > .01) {
      const dx = target.x - actor.x, dy = target.y - actor.y;
      actor.x += dx / length * travel; actor.y += dy / length * travel;
      if (Math.abs(dx) > .5) actor.dir = dx < 0 ? -1 : 1;
      actor.walk = (actor.walk || 0) + travel / 9; actor.step = (actor.step || 0) + travel / 9;
      remaining -= travel / speed;
    }
    if (length > travel + .01) return false;
    actor.x = target.x; actor.y = target.y; actor.index++;
  }
  return actor.index >= actor.route.length;
}
function townBeginVisit() {
  if(!villageSiteOpen('traveller')||farm.coins<TOWN_MERCHANT_MIN_COINS)return false;
  const actor = farm.town.traveller;
  const carriedTea=actor.carriedTea;
  const tier = TOWN_WEALTH_LEVELS.reduce((level, value, index) => farm.coins >= value ? index : level, 0);
  const eligible = Object.keys(TOWN_GOODS).filter(id => TOWN_GOODS[id].tier <= tier && (id!=='firewood'||seasonTransition().winter>.25)
    && (id!=='fodder'||farm.town.improvements.donkeyInn.level>0)
    && farm.town.inventory[id]<TOWN_GOODS[id].stock);
  const newest = eligible.filter(id => TOWN_GOODS[id].tier === tier);
  const pool=newest.length?newest:eligible;
  const ids = pool.length?[pool[Math.floor(townRandom() * pool.length)]]:[];
  while (ids.length < Math.min(5, eligible.length)) {
    const remaining = eligible.filter(id => !ids.includes(id));
    ids.push(remaining[Math.floor(townRandom() * remaining.length)]);
  }
  Object.assign(actor, { ...makeTownTraveller(),carriedTea, mode: 'arrive', cartAttached: true, day: farm.day, tier, stayUntil: farm.day + 1,
    offers: ids.map(id => ({ id, price: Math.round(TOWN_GOODS[id].price * (.9 + townRandom() * .2)), sold: false })) });
  const stories=TOWN_STORIES.map((story,index)=>({story,index})).filter(entry=>entry.story.season===seasonIndex());
  actor.storyIndex=stories[Math.floor(townRandom()*stories.length)].index;
  townSetRoute(actor, [{ x: 2272, y: 950 }, { x: 2272, y: 904 }, { x: 2140, y: 904 }], 'shop');
  farm.town.visits++;
  townPrepareSpecialOffer();
  prepareTownPostcard();
  townNote(`阿棠第 ${farm.town.visits} 次来访，带来了新的手作和补给。`, true);
  if (townSpecialOffer()) townNote(`阿棠挂出一张小价签：${townSpecialOfferHint()}。`);
  return true;
}
function townHomeRoute(actor) {
  // Use the east side of the cart; returning straight north would pass through its canopy.
  return [{ x: actor.x, y: 950 }, { x: 2272, y: 950 }, { x: 2272, y: 812 },
    { x: TOWN_LAYOUT.home.door.x, y: 812 }, { ...TOWN_LAYOUT.home.door }];
}
function townCounterRoute(actor) {
  return [{ x: actor.x, y: 812 }, { x: 2272, y: 812 }, { x: 2272, y: 950 },
    { x: 2180, y: 950 }, { ...TOWN_LAYOUT.counter }];
}
function updateTownTraveller(dt) {
  if (farm.paused || !villageSiteOpen('traveller')) return;
  if(villageSettleTraveller(dt))return;
  const town = farm.town, actor = town.traveller;
  if (actor.mode === 'away') {
    if (town.merchantUnlocked && farm.coins >= 5000 && farm.day >= town.nextVisit
      && !isFestivalDay() && farm.phase >= .04 && farm.phase < .35) townBeginVisit();
    return;
  }
  if (isFestivalDay()) {
    townStopFlowerVisit(true);
    actor.drinking=false;
    updateFestivalActor(actor, dt, TOWN_LAYOUT.home.door, 13, 'village');
    return;
  }
  if (actor.festival) {
    // Finish any return still in progress at the next dawn before ordinary work resumes.
    if (actor.festival.stage === 'back') {
      if (festivalMove(actor, actor.festival.back, dt, 185)) actor.festival.stage = 'home';
      return;
    }
    if (actor.festival.stage === 'home' && farm.phase < .04) return;
    actor.festival = null; actor.mode = 'home'; actor.route = []; actor.index = 0;
  }
  if(updateTownFlowerVisit(actor,dt))return;
  if (actor.mode === 'home') {
    townReturnTeaParcel(actor);
    if (farm.phase >= .04 && farm.phase < .43) {
      actor.mode = 'walk'; townSetRoute(actor, townCounterRoute(actor), 'shop');
    }
    return;
  }
  if(actor.mode==='rest'){if(!townTeaPartyHosting())updateTownMerchantRest(actor,dt);return;}
  if(actor.target==='tea' && farm.phase>=.46){
    actor.mode='walk';townSetRoute(actor,townHomeRoute(actor),'home');
  }
  if(actor.target==='tea'){
    const weather=weatherVisual();
    if(weather.rain>=.25 || weather.snow>=.25)townEndMerchantRest(actor);
  }
  if (actor.mode === 'shop') {
    townReturnTeaParcel(actor);
    if (farm.phase >= .46) {
      actor.mode = 'walk'; townSetRoute(actor, townHomeRoute(actor), 'home');
    } else if (!town.construction && farm.day >= actor.stayUntil && farm.phase >= .40 && farm.phase < .46) {
      actor.mode = 'walk';
      townSetRoute(actor, [{ x: 2140, y: 926 }, { x: 2140, y: 904 }], 'leave');
    } else {
      updateTownAutomaticShopping();
      townChooseCommission();
      if (townStartWork(actor)) return;
      if(townStartFlowerVisit())return;
      if(townChooseMerchantRest(actor))return;
    }
    return;
  }
  if (actor.mode === 'work') { updateTownProjectWork(actor, dt); return; }
  if (actor.target === 'work' && (!town.construction || farm.phase >= townProjectStop(town.construction.id))) {
    townReturnFromProject(actor, true); return;
  }
  if (townFollowRoute(actor, dt, actor.target === 'work' ? 230 : actor.target === 'home' && actor.route.length > 6 ? 230 : 150)) {
    if (actor.target === 'leave') {
      if (!actor.cartAttached) {
        actor.mode = 'leave'; actor.cartAttached = true;
        townSetRoute(actor, [{ x: 2272, y: 904 }, { x: 2272, y: 950 }, { ...TOWN_LAYOUT.gate }], 'leave');
      } else {
        actor.mode = 'away'; actor.cartAttached = false; actor.route = []; actor.index = 0;
        town.nextVisit = farm.day + 4 + Math.floor(townRandom() * 4);
        townNote(`阿棠收起小货车，道别后约好第 ${town.nextVisit} 天起再来看看。`, true);
      }
    } else if (actor.cartAttached) {
      actor.cartAttached = false; actor.mode = 'walk';
      townSetRoute(actor, [{ x: 2140, y: 926 }, { ...TOWN_LAYOUT.counter }], 'shop');
    } else if(actor.target==='tea'){
      if(townTeaPartyHosting()){actor.mode='rest';actor.walk=0;actor.wait=0;actor.drinking=false;}
      else townBeginMerchantRest(actor);
    }
    else actor.mode = actor.target === 'home' ? 'home' : actor.target === 'work' ? 'work' : 'shop';
  }
}
