'use strict';
function villageMaintenanceOpen() {
  const d=farm.development;
  return d.completedCount===VILLAGE_PROJECT_IDS.length&&!d.active&&!d.queue.length
    &&Object.values(d.residents).every(r=>r.stage==='home')&&!farm.town.traveller.villageSettling;
}
function villageGrassGrowth(id) {return farm.development.maintenance.plants[id]?.growth??1;}
function villageVisibleWeeds(clearance=villageWildPlantClearance(),onlyNew=false) {
  const context=villagePlantGroundContext();
  return [...villageGrassCatalog().values()].filter(p=>(!onlyNew||!p.original)&&villageGrassGrowth(p.id)>0
    &&villagePlantGroundAllowed(p.source,p,context)&&villagePlantVisible(p.source,p,clearance));
}
function villageWeedManaged(p) {
  // Natural forest and wetland habitat remains untouched; only settled dry meadows are maintained.
  return p.source!=='forest'&&p.source!=='mine'&&villageSiteOpen(p.source)
    &&wetlandMarshDepth(p.x,p.y)>1.15;
}
function villageWeedWorkPoint(p) {return {x:p.x-12,y:p.y-7};}
function villageMatureWeeds() {
  const nav=villageMaintenanceNavigation();
  return villageVisibleWeeds().filter(p=>villageWeedManaged(p)&&villageGrassGrowth(p.id)>=1
    &&nav.clear(villageWeedWorkPoint(p).x,villageWeedWorkPoint(p).y));
}
function villageMaintenanceRandom() {
  const m=farm.development.maintenance;m.seed=(Math.imul(m.seed,1664525)+1013904223)>>>0;return m.seed/4294967296;
}
function updateVillageWeedGrowth(dt) {
  if(farm.paused)return;
  const m=farm.development.maintenance,stamp=farm.day+farm.phase;
  m.growthClock+=dt;if(m.growthClock<.5)return;
  dt=m.growthClock;m.growthClock=0;
  const season=seasonTransition(),weather=weatherVisual();
  const rate=(1-season.winter)*(1-season.autumn*.55)*(1+weather.rain*.15);
  const context=villagePlantGroundContext(),masks=villageWildPlantClearance(),available=[];
  let added=0;
  for(const [id,p]of villageGrassCatalog()){
    const s=m.plants[id];
    if(!villagePlantGroundAllowed(p.source,p,context)||!villagePlantVisible(p.source,p,masks)){
      if(s.growth>0){s.growth=0;s.cutAt=stamp;}
      continue;
    }
    available.push(p);if(!p.original&&s.growth>0)added++;
    if(s.growth>0&&s.growth<1)s.growth=Math.min(1,s.growth+dt/DAY_SECONDS*rate/VILLAGE_MAINTENANCE.growDays);
  }
  m.credit=Math.min(2,m.credit+dt/DAY_SECONDS*rate*1.7);
  if(m.credit<1)return;
  const alive=available.filter(p=>m.plants[p.id].growth>0);
  const choices=available.filter(p=>{
    const s=m.plants[p.id];
    return s.growth===0&&(p.original||added<VILLAGE_MAINTENANCE.maxNewGrass)
      &&(s.cutAt===null||stamp-s.cutAt>=VILLAGE_MAINTENANCE.regrowDelay)
      &&alive.every(other=>distance(p,other)>=12)
      &&alive.filter(other=>distance(p,other)<60).length<VILLAGE_MAINTENANCE.localLimit;
  });
  if(!choices.length)return;
  const plant=choices[Math.floor(villageMaintenanceRandom()*choices.length)];
  m.plants[plant.id].growth=.035;m.credit--;
}
function villageMaintenanceReason(manual=true,matureCount=null) {
  const m=farm.development.maintenance;
  if(!villageMaintenanceOpen())return '全部工程完成、邻居安顿后开放';
  if(m.job)return '阿梁和阿砚正在完成本次委托';
  if(!manual&&m.lastFinished!==null&&farm.day+farm.phase-m.lastFinished<VILLAGE_MAINTENANCE.cooldown)return '施工队歇几天，再照料草地';
  const required=manual?VILLAGE_MAINTENANCE.target:VILLAGE_MAINTENANCE.trigger;
  if((matureCount??villageMatureWeeds().length)<required)return `成熟草簇不足 ${required} 簇`;
  if(farm.coins<VILLAGE_MAINTENANCE.price+villageReserve())return `需 ${VILLAGE_MAINTENANCE.price} 金，并保留经营储备`;
  return null;
}
function startVillageMaintenance(manual=false) {
  if(villageMaintenanceReason(manual))return false;
  const d=farm.development,m=d.maintenance;
  if(!d.crew.length)d.crew=[villageMakeActor('阿梁'),villageMakeActor('阿砚',1)];
  farm.coins-=VILLAGE_MAINTENANCE.price;m.spentTotal+=VILLAGE_MAINTENANCE.price;
  m.job={startedAt:farm.day+farm.phase,paid:VILLAGE_MAINTENANCE.price,cleared:0,targets:{}};
  record(`村庄委托阿梁、阿砚照料草地：清理 ${VILLAGE_MAINTENANCE.target} 簇杂草，支付 ${VILLAGE_MAINTENANCE.price} 金。`);
  save();return true;
}
function updateVillageMaintenance(dt) {
  if(farm.paused)return;
  updateVillageWeedGrowth(dt);
  if(villageMaintenanceOpen()&&!isFestivalDay()&&farm.phase>=.1&&farm.phase<NIGHT_START&&villageWorkingWeather())
    startVillageMaintenance(false);
}
function updateVillageMaintenanceCrew(a,index,dt,weather) {
  const m=farm.development.maintenance,job=m.job;
  if(!job||farm.phase<.1||farm.phase>=NIGHT_START||!weather){
    a.mode=weather?'return':'wait';
    if(villageMaintenanceMove(a,VILLAGE_CREW_HOME.beds[index],dt))a.mode='home';
    return;
  }
  const claimed=new Set(Object.values(job.targets).map(t=>t.id));
  let target=job.targets[a.name];
  if(target&&m.plants[target.id].growth<1){delete job.targets[a.name];target=null;a.goal=null;a.path=[];}
  if(!target){
    if(Object.keys(job.targets).length>=VILLAGE_MAINTENANCE.target-job.cleared){a.mode='wait';return;}
    const ordered=villageMatureWeeds().filter(p=>!claimed.has(p.id)).sort((p,q)=>distance(a,p)-distance(a,q));
    for(const p of ordered){
      const goal=villageWeedWorkPoint(p),path=villageMaintenancePath(a,goal);if(!path)continue;
      target=job.targets[a.name]={id:p.id,work:0};a.path=path;a.goal=`${goal.x}:${goal.y}`;a.action=0;break;
    }
  }
  if(!target){a.mode='return';if(villageMaintenanceMove(a,VILLAGE_CREW_HOME.beds[index],dt))a.mode='home';return;}
  const plant=villageGrassCatalog().get(target.id),goal=villageWeedWorkPoint(plant);
  a.mode='walk';if(!villageMaintenanceMove(a,goal,dt))return;
  a.mode='work';target.work=Math.min(VILLAGE_MAINTENANCE.workSeconds,target.work+dt*weather);a.action+=dt*weather;
  if(target.work<VILLAGE_MAINTENANCE.workSeconds)return;
  const grass=m.plants[target.id];grass.growth=0;grass.cutAt=farm.day+farm.phase;
  job.cleared++;m.clearedTotal++;delete job.targets[a.name];a.goal=null;a.path=[];a.action=0;
  if(job.cleared===VILLAGE_MAINTENANCE.target){
    m.completedJobs++;m.lastFinished=farm.day+farm.phase;m.job=null;
    for(const crew of farm.development.crew){crew.mode='return';crew.path=[];crew.goal=null;}
    record(`阿梁、阿砚清理好 ${VILLAGE_MAINTENANCE.target} 簇杂草，收好工具，草地又清爽了一些。`);save();
  }
}
function villageMaintenanceActivity(a) {
  const m=farm.development.maintenance,target=m.job?.targets[a.name],plant=target&&villageGrassCatalog().get(target.id);
  if(!plant)return a.mode==='home'?'在施工队小屋休息':a.mode==='return'?'收好工具回施工队小屋':'等候下一处草地养护';
  const place=VILLAGE_MAINTENANCE_PLACES[plant.source];
  return a.mode==='work'?`在${place}附近割草 · ${Math.floor(target.work/VILLAGE_MAINTENANCE.workSeconds*100)}%`
    :a.mode==='walk'?`去${place}附近照料草地`:null;
}
function villageWeedHint(x,y) {
  const weed=villageVisibleWeeds().find(p=>Math.abs(p.x-x)<11&&y>=p.y-15&&y<=p.y+5);
  if(!weed)return null;
  const growth=villageGrassGrowth(weed.id);
  return {target:`grass:${weed.id}`,text:`${growth<1?'嫩草簇 · 正在慢慢长高':'杂草簇'} · ${villageWeedManaged(weed)?'施工队会受托照料':'自然地带的草木'}`};
}
