'use strict';
// Saved visits share 阿宁 with the original stroll/tea/festival routines; payment follows real arrival.
function townDonkeyVisitPrice(){return farm.coins>=500000?40:farm.coins>=100000?25:15;}
function townDonkeyVisitHome(){const visit=farm.town.donkeyVisit;return visit.stage==='home'&&visit.day===farm.day;}
function townDonkeyVisitActive(){return ['out','wait','feed','return','home'].includes(farm.town.donkeyVisit.stage);}
function townDonkeyVisitAnimal(animal){const visit=farm.town.donkeyVisit;return !isFestivalDay()
  && ['out','wait','feed'].includes(visit.stage) && visit.donkey===animal.id;}
function townCanInviteDonkeyVisit(automatic=false){
  const town=farm.town,visit=town.donkeyVisit,weather=weatherVisual();
  return !isFestivalDay() && farm.phase>=.04 && farm.phase<.10 && seasonTransition().winter<.5
    && !townDonkeyVisitActive() && !townBoatActive() && !town.childVisit && !villageWalker.festival
    && farm.day>=town.lastDonkeyVisit+3 && !visit.chosen
    && Math.abs(villageWalker.y-VILLAGE_WALKER_LAYOUT.promenade.y)<2
    && town.improvements.donkeyInn.level>0 && town.donkeys.some(animal=>townDonkeyVisible(animal)&&animal.target!=='home')
    && town.construction?.id!=='donkeyInn' && weather.rain<.25 && weather.snow<.25
    && townCanSpend(townDonkeyVisitPrice(),automatic);
}
function townDonkeyVisitorRoute(){const site=TOWN_LAYOUT.donkeyInn;return [
  {x:villageWalker.x,y:TOWN_LAYOUT.flowerLaneY},{x:TOWN_LAYOUT.cartLaneX,y:TOWN_LAYOUT.flowerLaneY},
  {x:TOWN_LAYOUT.cartLaneX,y:TOWN_LAYOUT.gate.y},{x:site.lane.x,y:TOWN_LAYOUT.gate.y},{...site.lane},{...site.visitor}];}
function townInviteDonkeyVisit(automatic=false){
  if(!townCanInviteDonkeyVisit(automatic))return false;
  const town=farm.town,choices=town.donkeys.filter(animal=>townDonkeyVisible(animal)&&animal.target!=='home');
  town.donkeyVisit={...makeTownDonkeyVisit(),day:farm.day,decided:true,chosen:true,automatic,
    donkey:choices[Math.floor(townRandom()*choices.length)].id,cost:townDonkeyVisitPrice(),stage:'out',route:townDonkeyVisitorRoute()};
  town.lastDonkeyVisit=farm.day;
  townNote(`阿宁沿村路去看看${TOWN_DONKEY_NAMES[town.donkeyVisit.donkey]}，到门边后再备 ${town.donkeyVisit.cost} 金的小袋胡萝卜。`);
  updateUI();save();return true;
}
function townEndDonkeyVisit(reason){const visit=farm.town.donkeyVisit;
  if(!['out','wait','feed'].includes(visit.stage))return;
  const home=VILLAGE_WALKER_LAYOUT.home,returnRoute=visit.route.slice(0,visit.index).reverse();
  // The return passes the front door before the original strolling position: stop at home.
  if(returnRoute.at(-1)?.y===TOWN_LAYOUT.flowerLaneY && returnRoute.at(-1).x<=home.x)returnRoute.pop();
  visit.route=[...returnRoute,{x:home.x,y:TOWN_LAYOUT.flowerLaneY},{...home}];
  visit.stage='return';visit.index=0;visit.wait=0;
  townNote(`阿宁${visit.paid?'收好空纸袋':'把探访留到下回'}，沿村路回家${reason?`：${reason}`:''}。`);save();
}
function townCancelDonkeyVisitForFestival(){const visit=farm.town.donkeyVisit;
  if(townDonkeyVisitActive()){visit.stage='done';visit.route=[];visit.index=0;visit.wait=0;save();}}
function updateTownDonkeyVisit(dt){
  const town=farm.town;let visit=town.donkeyVisit;
  if(farm.paused)return townDonkeyVisitActive();
  if(isFestivalDay()){townCancelDonkeyVisitForFestival();return false;}
  if(visit.stage==='home'){
    if(visit.day===farm.day)return true;
    visit.stage='done';
  }
  if(!townDonkeyVisitActive()){
    if(visit.day!==farm.day)visit=town.donkeyVisit=makeTownDonkeyVisit();
    if(!visit.decided && townCanInviteDonkeyVisit(true)){
      visit.day=farm.day;visit.decided=true;
      if(townRandom()<.3)townInviteDonkeyVisit(true);else save();
    }
    return townDonkeyVisitActive();
  }
  const weather=weatherVisual(),animal=town.donkeys[visit.donkey];
  if(['out','wait','feed'].includes(visit.stage) && (visit.day!==farm.day || farm.phase>=.42
    || weather.rain>=.25 || weather.snow>=.25 || !animal || animal.mode==='home' || animal.target==='home'
    || town.construction?.id==='donkeyInn')){townEndDonkeyVisit('让小驴安静休息');return true;}
  if(visit.stage==='wait'){
    if(distance(animal,TOWN_LAYOUT.donkeyInn.greetSpot)<2){
      if(!townSpend(visit.cost,'outings',visit.automatic)){townEndDonkeyVisit('保留经营储备，今天先不买零食');return true;}
      visit.paid=true;visit.stage='feed';visit.wait=0;town.donkeyVisits++;
      villageWalker.waveUntil=now+2;animal.waveUntil=now+2;
      townNote(`阿宁给${TOWN_DONKEY_NAMES[animal.id]}递了一小截胡萝卜，花了 ${visit.cost} 金；两位新朋友在门边歇一会儿。`,true);save();
    }
    return true;
  }
  if(visit.stage==='feed'){
    visit.wait=Math.min(3.5,visit.wait+dt);if(visit.wait>=3.5)townEndDonkeyVisit('下回再来看你');return true;
  }
  const moving={...villageWalker,route:visit.route,index:visit.index};
  const arrived=townFollowRoute(moving,dt,visit.stage==='return'?VILLAGE_HOME_SPEED:120);
  for(const key of ['x','y','dir','step'])villageWalker[key]=moving[key];visit.index=moving.index;
  if(arrived){visit.stage=visit.stage==='return'?'home':'wait';visit.wait=0;save();}
  return true;
}
function townDonkeyVisitActivity(){const visit=farm.town.donkeyVisit;if(visit.day!==farm.day&&!['return'].includes(visit.stage))return null;
  return ({out:'沿村路去东岸看小驴',wait:'在驴驿门边等小驴走近',feed:`给${TOWN_DONKEY_NAMES[visit.donkey]}喂一小截胡萝卜`,
    return:'从驴驿沿村路回家',home:'在家休息'})[visit.stage]||null;}
