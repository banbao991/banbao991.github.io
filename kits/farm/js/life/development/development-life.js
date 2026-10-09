'use strict';
function villageMakeActor(name,index=0) {
  return {name,x:VILLAGE_CREW_HOME.beds[index%2].x,y:VILLAGE_CREW_HOME.door.y,
    path:[],walk:0,step:0,dir:1,mode:'home',goal:null,
    shirt:index%2?'#8e9ca6':'#b08d64',hat:'#d9ba76',action:0};
}
function villageActorMove(a,goal,dt,speed=155) {
  const key=`${goal.x}:${goal.y}`;
  if(distance(a,goal)<2){a.path=[];a.goal=key;return true;}
  // Imported actors may carry a failed, empty route for this same destination.
  // Retry from their real position instead of treating it as a completed plan.
  if(a.goal!==key||!a.path.length){
    const path=villageWalkingPath(a,goal);
    if(!path){a.path=[];a.goal=null;return false;}
    a.path=path;a.goal=key;
  }
  let remaining=dt;
  while(a.path.length&&remaining>0) {
    const p=a.path[0],len=distance(a,p),travel=Math.min(len,remaining*speed);
    if(len>.01){const dx=p.x-a.x,dy=p.y-a.y;a.x+=dx/len*travel;a.y+=dy/len*travel;
      if(Math.abs(dx)>.1)a.dir=dx<0?-1:1;a.walk+=travel/9;a.step=a.walk;remaining-=travel/speed;}
    if(len>travel+.01)break;a.x=p.x;a.y=p.y;a.path.shift();
  }
  return distance(a,goal)<2;
}
function villageWorkingWeather() {
  const w=weatherVisual();return w.rain>.75||w.snow>.65?0:1-w.rain*.45-w.snow*.4;
}
function villageConstructionActivity(a) {
  const stage=farm.development.active?farm.development.projects[farm.development.active].stage:'settle';
  const home=villageResidentReturnsHome(a.name)?'牧场小屋':'施工队小屋';
  return festivalActivity(a)||(villageMaintenanceOpen()&&['阿梁','阿砚'].includes(a.name)?villageMaintenanceActivity(a):null)||({home:`在${home}休息`,return:`收好工具回${home}`,walk:'沿路去施工',
    wait:'等天气好转',work:stage==='settle'?'正在整理工地':'正在'+VILLAGE_STAGE_NAMES[stage],
    moving:villageResidentReturnsHome(a.name)?'协助结束，回家休息':'搬入新居'}[a.mode]||'在村里休息');
}
function villageNextRoad(id) {
  const graph=villageRoadGraph(),pending=villageProjectRoads(id).filter(r=>!villageRoadBuilt(r));
  return pending.find(r=>graph.nodes.some(b=>villageRoadAdjacent(r,b)))||pending.findLast(r=>r.footBridge)||null;
}
function villageWorkTarget(id) {
  const p=farm.development.projects[id];
  if(p.stage==='road'){
    const next=villageNextRoad(id);if(!next)return null;
    if(next.footBridge)return {point:{x:NURSERY_LAYOUT.creekBridge.x+37,y:NURSERY_LAYOUT.creekBridge.y+11},road:next};
    // Stand at the connected end; do not walk into an unfinished bridge or road.
    const built=villageRoadGraph().nodes.filter(b=>villageRoadAdjacent(next,b));
    const nearest=built.sort((a,b)=>distance(villageRoadCenter(a),villageRoadCenter(next))
      -distance(villageRoadCenter(b),villageRoadCenter(next)))[0];
    return {point:villageRoadCenter(nearest),road:next};
  }
  const s=VILLAGE_PROJECTS[id].site;
  return {point:{x:(s.left+s.right)/2,y:Math.min(WORLD_H-25,s.bottom+22)}};
}
function villageAdvanceWork(id,dt,target) {
  const d=farm.development,p=d.projects[id],spec=VILLAGE_PROJECTS[id],total=spec.days*VILLAGE_WORK_DAY;
  if(p.stage==='road') {
    const roads=villageProjectRoads(id),pending=roads.filter(r=>!villageRoadBuilt(r));
    if(!pending.length){p.stage=spec.roadOnly?'settle':'clear';p.work=total*.3;d.revision++;return;}
    // Use a separate saved chunk timer: other projects may already have built shared segments.
    p.chunkWork=(p.chunkWork||0)+dt;
    if(target?.road&&p.chunkWork>=total*.3/Math.max(1,roads.length)){
      p.chunkWork=0;d.roads.push(target.road.id);d.revision++;
    }
    p.work=total*.3*(1-pending.length/Math.max(1,roads.length));
    return;
  }
  p.work=Math.min(total,p.work+dt);
  const ratio=p.work/total;
  const stage=spec.roadOnly?'settle':ratio<.4?'clear':ratio<.9?'build':'settle';
  if(p.stage!==stage){p.stage=stage;d.revision++;}
  if(ratio>=1)finishVillageProject(id);
}
function villageOwnerHome(name) {
  if(name==='阿蓼')return ANGLER_HOME;
  if(name==='阿森')return FOREST_HOME;
  if(name==='阿栀')return VALLEY_WORKER_LAYOUT.home;
  if(name==='阿牧')return PASTURE_WORKER_LAYOUT.home;
  if(name==='阿芽')return NURSERY_LAYOUT.home.door;
  if(name==='阿矿')return MINE_HOME;
  return VILLAGE_CREW_HOME.door;
}
function villageActivateOwner(name,a) {
  if(name==='阿栀')addValleyWorker();
  if(name==='阿牧')addPastureWorker();
  const actor=name==='阿蓼'?angler:name==='阿森'?forestKeeper:name==='阿芽'?nurseryKeeper:
    name==='阿矿'?miner:workers.find(w=>w.name===name);
  if(actor)Object.assign(actor,{x:a.x,y:a.y,path:[],route:[],task:null,action:0,festival:null});
  if(name==='阿矿'){miner.mode='home';miner.nextDeliveryDay=farm.day+3;}
  if(name==='阿蓼'){angler.mode='home';angler.routine=null;}
  if(name==='阿森'){forestKeeper.mode='home';forestKeeper.choiceDay=0;}
  if(name==='阿牧'){farm.woolReady=true;farm.goatMilkReady=villageSiteOpen('goats');}
}
function updateVillageResidents(dt) {
  const d=farm.development;
  for(const [name,r]of Object.entries(d.residents))if(r.stage!=='home') {
    const a=r.actor??=villageMakeActor(name),home=name==='阿牧'&&villageSiteOpen('sheep')?PASTURE_WORKER_LAYOUT.home:VILLAGE_CREW_HOME.door;
    if(isFestivalDay()){a.mode='wait';updateFestivalActor(a,dt,home,6+VILLAGE_PROJECT_IDS.indexOf(r.project)%8,'construction');continue;}
    if(a.festival?.stage==='back') {if(festivalMove(a,a.festival.back,dt))a.festival=null;continue;}
    if(a.festival){a.festival=null;a.path=[];a.goal=null;}
    if(r.stage==='moving') {
      a.mode='moving';if(villageActorMove(a,villageOwnerHome(name),dt)){
        r.stage='home';villageActivateOwner(name,a);delete r.actor;
        record(villageResidentReturnsHome(name)?`${name}完成协助，回家继续照料牧场。`:`${name}搬入新家，开始照料自己的小天地。`);
      }continue;
    }
    const target=d.active===r.project?villageWorkTarget(r.project):null;
    if(farm.phase<.1||farm.phase>=NIGHT_START||!villageWorkingWeather()||!target){
      a.mode='return';if(villageActorMove(a,home,dt))a.mode='home';
    }else{a.mode='walk';if(villageActorMove(a,{x:target.point.x,y:target.point.y+14},dt))a.mode='work';}
  }
}
function updateVillageDevelopment(dt) {
  const d=farm.development;if(!d||farm.paused)return;
  updateVillageMaintenance(dt);
  updateVillageQueue();
  // Complete a family's move before accepting the next job.
  if(!Object.values(d.residents).some(r=>r.stage==='moving')&&!farm.town.traveller.villageSettling)startVillageProject();
  if(d.active&&d.crew.length===0)d.crew=[villageMakeActor('阿梁'),villageMakeActor('阿砚',1)];
  updateVillageResidents(dt);
  const weather=villageWorkingWeather(),working=d.active&&!isFestivalDay()&&farm.phase>=.1&&farm.phase<NIGHT_START&&weather>0;
  const target=working?villageWorkTarget(d.active):null;
  if(working&&!target){villageAdvanceWork(d.active,0,null);return;}
  for(const [i,a]of d.crew.entries()) {
    if(isFestivalDay()){a.mode='wait';updateFestivalActor(a,dt,VILLAGE_CREW_HOME.beds[i],14+i,'construction');continue;}
    if(a.festival?.stage==='back'){if(festivalMove(a,a.festival.back,dt))a.festival=null;continue;}
    if(a.festival){a.festival=null;a.path=[];a.goal=null;}
    if(villageMaintenanceOpen()){updateVillageMaintenanceCrew(a,i,dt,weather);continue;}
    if(!working){a.mode=weather?'return':'wait';if(villageActorMove(a,VILLAGE_CREW_HOME.beds[i],dt))a.mode='home';continue;}
    a.mode='walk';
    const point=i?{x:target.point.x+6,y:target.point.y+6}:target.point;
    if(villageActorMove(a,point,dt)){
      a.mode='work';a.action+=dt;
      if(i===0)villageAdvanceWork(d.active,dt*weather,target);
    }
  }
}
