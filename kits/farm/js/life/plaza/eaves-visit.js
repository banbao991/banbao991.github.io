'use strict';
function plazaEavesVisitActive() { return ['out','perch','back'].includes(farm.town.eavesVisit.stage); }
function plazaEavesChildBusy() { return !!farm.town.childVisit||townDonkeyVisitActive()||townBoatActive()||!!villageWalker.festival; }
function plazaEavesChildWaiting() {
  const v=farm.town.eavesVisit;
  return v.stage==='perch'&&v.childWait>0&&!isFestivalDay()&&!plazaEavesChildBusy();
}
function plazaEavesReleaseChild() {
  const v=farm.town.eavesVisit;
  if(v.childWait>0&&!plazaEavesChildBusy())villageWalker.dir=v.childDir;
  v.childWait=0;
}
function plazaEavesTurnBack() {
  const v=farm.town.eavesVisit;
  if(!['out','perch'].includes(v.stage))return;
  plazaEavesReleaseChild();v.stage='back';v.wait=0;
  flyPlazaSparrow(plazaSparrows[v.bird]);save();
}
function updatePlazaEavesPlan() {
  if(farm.paused)return;
  const town=farm.town,v=town.eavesVisit;
  if(v.day!==farm.day&&!plazaEavesVisitActive())Object.assign(v,makePlazaEavesVisit(),{day:farm.day,encounters:v.encounters});
  if(plazaEavesVisitActive()){
    if(v.childWait>0&&plazaEavesChildBusy())plazaEavesReleaseChild();
    if(v.day!==farm.day||isFestivalDay()||plazaCatsBadWeather()||farm.phase>=.46)plazaEavesTurnBack();
    return;
  }
  if(v.decided||isFestivalDay()||farm.phase<.14||farm.phase>=.26||seasonTransition().winter>=.7
    ||plazaCatsBadWeather()||plazaEavesChildBusy()||villageWalkerAtHome()
    ||Math.abs(villageWalker.y-VILLAGE_WALKER_LAYOUT.promenade.y)>2)return;
  const candidates=plazaSparrows.map((bird,index)=>({bird,index})).filter(({bird})=>
    ['peck','preen','perch'].includes(bird.mode)&&bird.site>=0&&PLAZA_PET_LAYOUT.birdSites[bird.site].kind!=='village-roof');
  if(!candidates.length)return;
  v.decided=true;
  if(hash(farm.day,1077)>=.45){v.stage='done';save();return;}
  const site=Math.floor(hash(farm.day,1078)*PLAZA_EAVES_SITES.length),point=PLAZA_EAVES_SITES[site];
  const chosen=candidates.sort((a,b)=>distance(a.bird,point)-distance(b.bird,point))[0];
  Object.assign(v,{chosen:true,stage:'out',bird:chosen.index,site,wait:0});
  flyPlazaSparrow(chosen.bird,PLAZA_EAVES_SITE_START+site);save();
}
function updatePlazaEavesBird(bird,index,dt) {
  const v=farm.town.eavesVisit;
  if(!plazaEavesVisitActive()||v.bird!==index)return false;
  if(v.stage==='perch'){
    v.wait=Math.max(0,v.wait-dt);bird.wait=v.wait;
    if(v.wait===0&&v.childWait===0)plazaEavesTurnBack();
    return true;
  }
  const arrived=movePlazaPet(bird,{x:bird.tx,y:bird.ty},dt,135);
  const progress=1-Math.min(1,Math.hypot(bird.tx-bird.x,bird.ty-bird.y)/bird.flightLength);
  bird.lift=Math.sin(progress*Math.PI)*30;
  if(!arrived)return true;
  bird.x=bird.tx;bird.y=bird.ty;bird.lift=0;
  if(v.stage==='out'){v.stage='perch';v.wait=6;bird.mode='perch';bird.wait=6;}
  else{bird.mode='away';bird.site=-1;bird.wait=.8;v.stage='done';v.wait=0;plazaEavesReleaseChild();}
  save();return true;
}
function updatePlazaEavesChild(dt) {
  const v=farm.town.eavesVisit;
  if(farm.paused)return plazaEavesChildWaiting();
  if(v.stage!=='perch'||plazaEavesChildBusy()||isFestivalDay()||plazaCatsBadWeather()||farm.phase>=.46){
    plazaEavesReleaseChild();return false;
  }
  if(v.childWait>0){v.childWait=Math.max(0,v.childWait-dt);
    if(v.childWait===0){villageWalker.dir=v.childDir;save();return false;}
    return true;
  }
  const bird=plazaSparrows[v.bird],road=VILLAGE_WALKER_LAYOUT.promenade;
  if(v.greeted||bird.mode!=='perch'||bird.site!==PLAZA_EAVES_SITE_START+v.site
    ||Math.abs(villageWalker.y-road.y)>2||Math.abs(villageWalker.x-bird.x)>54)return false;
  v.greeted=true;v.childWait=3.2;v.childDir=villageWalker.dir;v.encounters++;
  villageWalker.dir=bird.x<villageWalker.x?-1:1;villageWalker.waveUntil=now+2.5;
  bird.dir=villageWalker.x<bird.x?-1:1;
  townNote('广场麻雀飞来阿宁家屋檐歇脚；阿宁在村路上停下，抬头向小来客挥挥手。');save();return true;
}
function plazaEavesChildActivity(){return plazaEavesChildWaiting()?'停下看屋檐上的麻雀':null;}
function plazaEavesDescription(){const v=farm.town.eavesVisit;
  return plazaEavesVisitActive()?({out:'麻雀正飞去村口',perch:plazaEavesChildWaiting()?'阿宁在看屋檐来客':'麻雀在村口屋檐歇脚',back:'麻雀正飞回广场'}[v.stage])
    :v.day===farm.day&&v.greeted?'阿宁今天遇见了屋檐麻雀':'';
}
