'use strict';
function townBoatActive() {return ['out','fold','watch','back','home'].includes(farm.town.paperBoats.visit.stage);}
function townBoatHome() {const v=farm.town.paperBoats.visit;return v.stage==='home'&&v.day===farm.day;}
function townBoatPrice() {return farm.coins>=500000?60:farm.coins>=100000?35:18;}
function townCanInviteBoat(automatic=false) {
  const s=farm.town.paperBoats,w=weatherVisual();
  return farm.town.merchantUnlocked && farm.coins>=20000 && !isFestivalDay() && !villageWalker.festival
    && !townBoatActive() && !farm.town.childVisit && !townDonkeyVisitActive() && !plazaEavesChildWaiting()
    && !s.boats.length && !s.visit.chosen && farm.day>=s.lastTrip+3 && farm.phase>=.13 && farm.phase<.18
    && Math.abs(villageWalker.y-VILLAGE_WALKER_LAYOUT.promenade.y)<2
    && seasonTransition().winter<.6 && w.rain<.25 && w.snow<.25 && townCanSpend(townBoatPrice(),automatic);
}
function townInviteBoat(automatic=false) {
  if(!townCanInviteBoat(automatic))return false;
  const s=farm.town.paperBoats;
  s.visit={...makeTownBoatVisit(),day:farm.day,decided:true,chosen:true,automatic,cost:townBoatPrice(),stage:'out',
    route:[{x:villageWalker.x,y:812},{x:1785,y:812},{x:1785,y:950},{x:1460,y:950},
      {x:1460,y:1019},{...TOWN_LAYOUT.paperBoat.bridge}]};
  s.lastTrip=farm.day;plazaEavesReleaseChild();
  townNote('阿宁沿村路去溪桥，想折一只小纸船看看水流。');updateUI();save();return true;
}
function townBoatReturn() {
  const v=farm.town.paperBoats.visit;if(!['out','fold','watch'].includes(v.stage))return;
  v.route=[...v.route.slice(0,v.index).reverse(),{x:VILLAGE_WALKER_LAYOUT.home.x,y:812},{...VILLAGE_WALKER_LAYOUT.home}];
  v.index=0;v.wait=0;v.stage='back';save();
}
function townCancelBoatForFestival() {
  const v=farm.town.paperBoats.visit;
  if(townBoatActive()){v.stage='done';v.route=[];v.index=0;v.wait=0;}
}
function updateTownBoatVisit(dt) {
  const s=farm.town.paperBoats;let v=s.visit;
  if(farm.paused)return townBoatActive();
  if(isFestivalDay()){townCancelBoatForFestival();return false;}
  if(v.stage==='home'){if(v.day===farm.day)return true;v.stage='done';}
  if(!townBoatActive()) {
    if(v.day!==farm.day)v=s.visit=makeTownBoatVisit();
    if(!v.decided && townCanInviteBoat(true)) {
      v.day=farm.day;v.decided=true;
      if(hash(farm.day,441,2501)<.4)townInviteBoat(true);
    }
    return townBoatActive();
  }
  const w=weatherVisual();
  if(['out','fold','watch'].includes(v.stage) && (v.day!==farm.day || farm.phase>=.46 || w.rain>=.25 || w.snow>=.25))
    townBoatReturn();
  if(v.stage==='fold') {
    v.wait=Math.min(1.6,v.wait+dt);
    if(v.wait>=1.6) {
      const y=TOWN_LAYOUT.paperBoat.launchY;
      s.boats.push({x:riverCenterAt(y)+24,y,age:0,day:farm.day,color:Math.floor(hash(farm.day,441,2502)*3),noticed:false});
      s.launched++;v.stage='watch';v.wait=0;
      townNote(`阿宁在溪桥放下一只纸船，纸张花了 ${v.cost} 金，水流带着它慢慢往南走。`,true);save();
    }
    return true;
  }
  if(v.stage==='watch'){v.wait=Math.min(2.8,v.wait+dt);if(v.wait>=2.8)townBoatReturn();return true;}
  const moving={...villageWalker,route:v.route,index:v.index};
  const done=townFollowRoute(moving,dt,v.stage==='back'?VILLAGE_HOME_SPEED:VILLAGE_STROLL_SPEED);
  for(const k of ['x','y','dir','step'])villageWalker[k]=moving[k];v.index=moving.index;
  if(done) {
    if(v.stage==='back'){v.stage='home';save();}
    else if(townSpend(v.cost,'outings',v.automatic)){v.paid=true;s.spent+=v.cost;v.stage='fold';v.wait=0;villageWalker.dir=-1;save();}
    else townBoatReturn();
  }
  return true;
}
function updateTownPaperBoats(dt) {
  if(farm.paused)return;
  const s=farm.town.paperBoats;
  for(const b of s.boats){b.age+=dt;b.y=TOWN_LAYOUT.paperBoat.launchY+b.age*20;b.x=riverCenterAt(b.y)+24*Math.exp(-b.age);}
  s.boats=s.boats.filter(b=>b.age<8);
}
function townPaperBoatAt(x,y) {
  return farm.town.paperBoats.boats.find(b=>!bridgeAt(b.x,b.y)&&inRect(x,y,b.x-12,b.y-10,b.x+12,b.y+7))||null;
}
function townObservePaperBoat(b) {
  if(!b.noticed){b.noticed=true;farm.town.paperBoats.observed++;record('你看着纸船绕过一弯水纹，慢慢漂向溪流下游。');}
  else record('小纸船仍随着水流轻轻摇晃。');
  updateUI();save();
}
function townBoatActivity() {
  return ({out:'沿村路去溪桥',fold:'在桥边慢慢折纸船',watch:'看纸船顺流漂走',back:'从溪桥沿村路回家',home:'在家休息'})[farm.town.paperBoats.visit.stage]||null;
}
