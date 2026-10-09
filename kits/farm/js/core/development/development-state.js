'use strict';
// Queue, payment, partial infrastructure and temporary residents are persistent world data.
function makeVillageDevelopmentState() {
  const resident = name => [name,{stage:'home',project:null,arrivedAt:1}];
  return {version:1,sequence:0,active:null,queue:[],spentTotal:0,completedCount:0,
    roads:[],projects:Object.fromEntries(VILLAGE_PROJECT_IDS.map(id=>[id,{status:'natural',
      sequence:0,queuedAt:null,startedAt:null,completedAt:null,paid:0,stage:'road',work:0}])),
    independent:{eastFields:false,beehives:false,upperFields:false,southFields:false,market:false},
    residents:Object.fromEntries(VILLAGE_INITIAL_RESIDENTS.map(resident)),crew:[],revision:0,
    maintenance:makeVillageMaintenanceState()};
}
function makeLegacyVillageDevelopment(state, runtime = null) {
  const d=makeVillageDevelopmentState();
  for(const id of VILLAGE_PROJECT_IDS) {
    const built=id==='greenhouse'?state.upgrades>=3:id==='sheep'?state.upgrades>=4:
      id==='goats'?!!state.goatBarnOpen:true;
    if(built) {d.projects[id].status='complete';d.projects[id].completedAt=state.day;
      d.projects[id].stage='settle';d.completedCount++;}
    const owner=VILLAGE_PROJECTS[id].owner;
    if(built&&owner)d.residents[owner]??={stage:'home',project:id,arrivedAt:state.day};
  }
  // Previously permanent people retain their place even in an early old farm.
  d.residents['阿麦']={stage:'home',project:null,arrivedAt:state.day};
  for(const w of runtime?.workers||[])if(w.name)
    d.residents[w.name]??={stage:'home',project:null,arrivedAt:state.day};
  d.independent={eastFields:state.upgrades>=1,beehives:state.upgrades>=2,
    upperFields:state.upgrades>=3,southFields:state.upgrades>=4,market:state.upgrades>=5};
  return d;
}
function validateVillageDevelopment(d,state) {
  const finite=v=>typeof v==='number'&&Number.isFinite(v);
  const safe=v=>Number.isSafeInteger(v)&&v>=0;
  const invalid=()=>{throw new Error('存档里的村庄建设进度不正确。');};
  if(!d||typeof d!=='object'||d.version!==1||!safe(d.sequence)||!safe(d.spentTotal)
    ||!safe(d.completedCount)||d.completedCount>VILLAGE_PROJECT_IDS.length||!safe(d.revision)
    ||!Array.isArray(d.queue)||d.queue.length>VILLAGE_PROJECT_IDS.length
    ||new Set(d.queue).size!==d.queue.length||d.queue.some(id=>!VILLAGE_PROJECTS[id])
    ||d.active!==null&&!VILLAGE_PROJECTS[d.active]||!d.projects||!d.independent||!d.residents
    ||!Array.isArray(d.roads)||d.roads.length>3000||d.roads.some(id=>!Object.hasOwn(VILLAGE_ROAD_BY_ID,id))
    ||new Set(d.roads).size!==d.roads.length||!Array.isArray(d.crew)||d.crew.length>2)invalid();
  const sequences=new Set();let completed=0,active=0;
  for(const id of VILLAGE_PROJECT_IDS) {
    const p=d.projects[id];
    if(!p||!['natural','queued','active','complete'].includes(p.status)||!safe(p.sequence)
      ||p.sequence>d.sequence||!safe(p.paid)||!Object.hasOwn(VILLAGE_STAGE_NAMES,p.stage)
      ||!finite(p.work)||p.work<0||p.work>VILLAGE_PROJECTS[id].days*VILLAGE_WORK_DAY+1
      ||p.chunkWork!=null&&(!finite(p.chunkWork)||p.chunkWork<0||p.chunkWork>VILLAGE_PROJECTS[id].days*VILLAGE_WORK_DAY))invalid();
    for(const key of ['queuedAt','startedAt','completedAt'])
      if(p[key]!==null&&(!finite(p[key])||p[key]<1||p[key]>state.day+state.phase+1e-8))invalid();
    if(p.sequence){if(sequences.has(p.sequence))invalid();sequences.add(p.sequence);}
    if(p.status==='queued'&&(p.paid||p.startedAt!==null||!d.queue.includes(id)||!p.sequence))invalid();
    if(p.status==='active'){active++;if(d.active!==id||d.queue.includes(id)||p.paid!==VILLAGE_PROJECTS[id].price)invalid();}
    if(p.status==='complete'){completed++;if(p.completedAt===null||d.queue.includes(id))invalid();}
    if(p.status==='natural'&&(p.paid||p.sequence||d.queue.includes(id)))invalid();
    if((p.status==='active'||p.status==='complete')&&VILLAGE_PROJECTS[id].requires?.some(dep=>d.projects[dep]?.status!=='complete'))invalid();
  }
  if(active!==(d.active?1:0)||completed!==d.completedCount)invalid();
  // Arrival sequence remains historical; saved queue order is player-adjustable.
  // A pending prerequisite must already be active or precede its dependent.
  if(d.queue.some((id,i)=>VILLAGE_PROJECTS[id].requires?.some(dep=>
    d.projects[dep].status!=='complete'&&dep!==d.active
    &&(d.queue.indexOf(dep)<0||d.queue.indexOf(dep)>=i))))invalid();
  for(const key of ['eastFields','beehives','upperFields','southFields','market'])
    if(typeof d.independent[key]!=='boolean')invalid();
  const names=[...TOWN_RESIDENT_NAMES,'阿棠'];
  const actorValid=a=>a&&finite(a.x)&&finite(a.y)&&a.x>=0&&a.x<=WORLD_W&&a.y>=0&&a.y<=WORLD_H
    &&Array.isArray(a.path)&&a.path.length<=1000&&a.path.every(p=>p&&finite(p.x)&&finite(p.y)&&p.x>=0&&p.x<=WORLD_W&&p.y>=0&&p.y<=WORLD_H)
    &&finite(a.walk)&&a.walk>=0&&finite(a.step)&&a.step>=0&&finite(a.action)&&a.action>=0
    &&(a.waveUntil==null||finite(a.waveUntil)&&a.waveUntil>=0)
    &&['home','return','walk','wait','work','moving'].includes(a.mode)&&[-1,1].includes(a.dir)
    &&(a.goal===null||typeof a.goal==='string'&&a.goal.length<100);
  for(const [name,r] of Object.entries(d.residents)) {
    if(!names.includes(name)||!r||!['help','moving','home'].includes(r.stage)
      ||r.project!==null&&!VILLAGE_PROJECTS[r.project]||!finite(r.arrivedAt)||r.arrivedAt<1
      ||r.arrivedAt>state.day+state.phase+1e-8||r.actor&&(!actorValid(r.actor)||r.actor.name!==name))invalid();
    if(r.stage!=='home'&&(!r.project||!r.actor||VILLAGE_PROJECTS[r.project].owner!==name))invalid();
    if(r.actor)validateVillageFestival(r.actor,state,invalid);
  }
  if(new Set(d.crew.map(a=>a?.name)).size!==d.crew.length)invalid();
  for(const a of d.crew) {
    if(!actorValid(a)||!['阿梁','阿砚'].includes(a.name))invalid();
    validateVillageFestival(a,state,invalid);
  }
  if(state.nursery.restoreWork!=null&&(!finite(state.nursery.restoreWork)||state.nursery.restoreWork<0||state.nursery.restoreWork>VILLAGE_WORK_DAY))invalid();
  validateVillageMaintenance(d.maintenance,state);
  return d;
}
function validateVillageFestival(a,state,invalid) {
  const f=a.festival;if(!f)return;
  const path=p=>Array.isArray(p)&&p.length<=1500&&p.every(v=>v&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&v.x>=0&&v.x<=WORLD_W&&v.y>=0&&v.y<=WORLD_H);
  if(!Number.isInteger(f.day)||f.day<1||f.day>state.day||f.day%10!==0
    ||!['home','out','gather','back'].includes(f.stage)||!Number.isInteger(f.index)||f.index<0
    ||!path(f.out)||f.back&&!path(f.back)||f.index>Math.max(f.out.length,f.back?.length||0))invalid();
  if(f.activity&&(!path(f.activity.route)||!Number.isInteger(f.activity.index)||f.activity.index<0
    ||f.activity.index>f.activity.route.length||!Number.isFinite(f.activity.wait)||f.activity.wait<0
    ||!Number.isFinite(f.activity.cycle)||f.activity.cycle<0))invalid();
}
