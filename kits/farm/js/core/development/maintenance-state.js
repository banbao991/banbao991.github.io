'use strict';
const VILLAGE_MAINTENANCE = {target:30,trigger:30,price:300,cooldown:5,regrowDelay:10,
  growDays:8,workSeconds:2.8,maxNewGrass:24,localLimit:12};
const VILLAGE_MAINTENANCE_PLACES = {lake:'西湖',greenhouse:'主场温室',herbs:'山谷香草居',
  plaza:'苔谷广场',sheep:'南方牧场',goats:'山羊牧场',nursery:'湿地苗圃',
  scenic:'南方山谷',traveller:'旅人驿屋',donkeyRoad:'东岸草地'};
let villageGrassCatalogCache=null;
function villageGrassCatalog() {
  if(villageGrassCatalogCache)return villageGrassCatalogCache;
  const catalog=new Map();
  for(const source of VILLAGE_PROJECT_IDS)for(const plant of villageWildPlantCandidates(source)){
    if(plant.kind!=='grass')continue;
    const id=`${source}:${plant.seed}`;
    catalog.set(id,{...plant,id,source,original:true});
    // Dormant nearby sites let new growth join irregular clumps, without moving existing grass.
    if(hash(plant.seed,VILLAGE_PROJECT_IDS.indexOf(source),2081)<.42){
      const x=Math.round(plant.x+(hash(plant.seed,2083)-.5)*70);
      const y=Math.round(plant.y+(hash(plant.seed,2087)-.5)*60);
      if(x>16&&y>24&&x<WORLD_W-16&&y<WORLD_H-24)
        catalog.set(`${id}:new`,{...plant,x,y,id:`${id}:new`,seed:plant.seed+300000,source,original:false});
    }
  }
  return villageGrassCatalogCache=catalog;
}
function makeVillageMaintenanceState(day=1) {
  return {version:1,plants:Object.fromEntries([...villageGrassCatalog()].map(([id,p])=>
    [id,{growth:p.original?1:0,cutAt:null}])),seed:843719,credit:0,growthClock:0,
    job:null,spentTotal:0,clearedTotal:0,completedJobs:0,lastFinished:null};
}
function validateVillageMaintenance(m,state) {
  const fail=()=>{throw new Error('存档里的草地生长或村庄养护进度不正确。');};
  const finite=v=>typeof v==='number'&&Number.isFinite(v);
  const count=v=>Number.isSafeInteger(v)&&v>=0;
  const time=v=>finite(v)&&v>=1&&v<=state.day+state.phase+1e-8;
  const catalog=villageGrassCatalog();
  if(!m||m.version!==1||!m.plants||Object.keys(m.plants).length!==catalog.size
    ||!count(m.seed)||m.seed>4294967295||!finite(m.credit)||m.credit<0||m.credit>2.000001
    ||!finite(m.growthClock)||m.growthClock<0||m.growthClock>=.5+1e-8
    ||!count(m.spentTotal)||!count(m.clearedTotal)||!count(m.completedJobs)
    ||m.lastFinished!==null&&!time(m.lastFinished))fail();
  for(const [id,p]of Object.entries(m.plants))if(!catalog.has(id)||!p||!finite(p.growth)
    ||p.growth<0||p.growth>1||p.cutAt!==null&&!time(p.cutAt))fail();
  const job=m.job;
  if(job!==null){
    if(!job||!time(job.startedAt)||job.paid!==VILLAGE_MAINTENANCE.price
      ||!count(job.cleared)||job.cleared>=VILLAGE_MAINTENANCE.target||!job.targets
      ||typeof job.targets!=='object'||Array.isArray(job.targets)
      ||state.development.completedCount!==VILLAGE_PROJECT_IDS.length)fail();
    const ids=[];
    for(const [name,t]of Object.entries(job.targets)){
      if(!['阿梁','阿砚'].includes(name)||!t||!catalog.has(t.id)
        ||!Object.hasOwn(VILLAGE_MAINTENANCE_PLACES,catalog.get(t.id).source)||!finite(t.work)
        ||t.work<0||t.work>VILLAGE_MAINTENANCE.workSeconds||m.plants[t.id].growth<1)fail();
      ids.push(t.id);
    }
    if(new Set(ids).size!==ids.length||ids.length>VILLAGE_MAINTENANCE.target-job.cleared)fail();
  }
  if(m.spentTotal!==VILLAGE_MAINTENANCE.price*(m.completedJobs+(job?1:0))
    ||m.clearedTotal!==VILLAGE_MAINTENANCE.target*m.completedJobs+(job?.cleared||0)
    ||(m.completedJobs>0)!==(m.lastFinished!==null))fail();
  return m;
}
