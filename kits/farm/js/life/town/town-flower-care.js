'use strict';
// Rain and small errands help bought flowers; neglect never reduces their ordinary growth.
function townPrepareFlowerCare(){
  const care=farm.town.flowerCare,stamp=farm.day+farm.phase;let added=false;
  while(care.pots.length<farm.town.inventory.flowerPot){care.pots.push({damp:.7,boost:0,agedAt:stamp,lastWater:0});added=true;}
  if(added)save();
}
function updateTownFlowerCare(dt){
  if(farm.paused)return;
  townPrepareFlowerCare();const stamp=farm.day+farm.phase,weather=weatherVisual();
  for(const pot of farm.town.flowerCare.pots){
    const elapsed=clamp(stamp-pot.agedAt,0,1);
    pot.damp=clamp(pot.damp+elapsed*(weather.rain*.9-.18*(1-weather.rain)),0,1);pot.agedAt=stamp;
  }
}
function townFlowerSoilText(index){const damp=farm.town.flowerCare.pots[index]?.damp ?? .7;
  return damp>.65?'土壤湿润':damp>.35?'土壤微润':'土壤稍干，等雨水或阿棠照料';}
function townFlowerVisitActive(){return ['out','water','back'].includes(farm.town.flowerCare.visit.stage);}
function townCanWaterFlowers(manual=false){
  const town=farm.town,visit=town.flowerCare.visit,weather=weatherVisual();
  return townShopOpen() && !town.construction && !town.childVisit && visit.day!==farm.day
    && !townFlowerVisitActive() && farm.phase>=.13 && farm.phase<.24
    && weather.rain<.25 && weather.snow<.25
    && town.flowerCare.pots.some(pot=>pot.damp<(manual?.65:.35));
}
function townStartFlowerVisit(manual=false){
  if(!townCanWaterFlowers(manual))return false;
  const care=farm.town.flowerCare,actor=farm.town.traveller,lane=TOWN_LAYOUT.flowerLaneY;
  const targets=care.pots.flatMap((pot,index)=>pot.damp<(manual?.65:.35)?[index]:[]);
  care.visit={day:farm.day,stage:'out',targets,index:0,wait:0};
  actor.mode='walk';townSetRoute(actor,[{x:TOWN_LAYOUT.cartLaneX,y:actor.y},{x:TOWN_LAYOUT.cartLaneX,y:lane},
    ...targets.map(index=>({x:TOWN_LAYOUT.flowerPots[index].x,y:lane}))],'flowers');
  townNote('阿棠提起小水壶，沿院外村路去看看门前的花盆。');save();return true;
}
function townStopFlowerVisit(festival=false){
  const visit=farm.town.flowerCare.visit,actor=farm.town.traveller;
  if(!['out','water'].includes(visit.stage))return;
  if(festival){visit.stage='done';actor.mode='walk';actor.target='shop';return;}
  visit.stage='back';
  actor.mode='walk';townSetRoute(actor,[...actor.route.slice(0,actor.index).reverse(),
    {...TOWN_LAYOUT.counter},...(farm.phase>=.46?townHomeRoute(TOWN_LAYOUT.counter):[])],farm.phase>=.46?'home':'shop');save();
}
function updateTownFlowerVisit(actor,dt){
  const visit=farm.town.flowerCare.visit;
  if(visit.stage==='back'){
    if(actor.mode==='shop'||actor.mode==='home'){visit.stage='done';save();}
    return false;
  }
  if(!['out','water'].includes(visit.stage))return false;
  const weather=weatherVisual();
  if(visit.day!==farm.day || farm.phase>=.35 || weather.rain>=.25 || weather.snow>=.25
    || farm.town.construction){townStopFlowerVisit();return true;}
  if(visit.stage==='out'){
    const moving={...actor,route:actor.route.slice(0,3+visit.index)};
    const arrived=townFollowRoute(moving,dt);
    for(const key of ['x','y','dir','walk','step','index'])actor[key]=moving[key];
    if(arrived){visit.stage='water';visit.wait=0;actor.mode='flowers';actor.walk=0;}
    return true;
  }
  visit.wait=Math.min(1.2,visit.wait+dt);
  if(visit.wait<1.2)return true;
  const index=visit.targets[visit.index],pot=farm.town.flowerCare.pots[index];
  pot.damp=1;pot.lastWater=farm.day+farm.phase;pot.boost=Math.min(.3,pot.boost+.08);farm.town.flowerCare.waterings++;
  visit.index++;visit.wait=0;
  if(visit.index>=visit.targets.length){townNote('阿棠给门前花盆浇好了水，收起水壶沿路回货架。');townStopFlowerVisit();}
  else{visit.stage='out';actor.mode='walk';}
  save();return true;
}
function inviteTownFlowerCare(){
  townPrepareFlowerCare();
  if(!townStartFlowerVisit(true))record('花盆暂时不需要水，或阿棠在忙；晴朗上午、他营业且没有其他委托时再来看看。');
  updateUI();save();
}
