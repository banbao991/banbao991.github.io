const assert=require('node:assert/strict');
const {run,element}=require('./harness.cjs');
run(`function maintenanceTestReady(){
  const s=newFarm();s.development=makeLegacyVillageDevelopment({...s,upgrades:5,goatBarnOpen:true});
  s.upgrades=5;s.goatBarnOpen=true;s.day=11;s.phase=.15;s.coins=100000;s.weather=s.weatherFrom='sunny';
  replaceFarmState(s);farm.paused=false;
}
function maintenanceTestFrame(dt=.05){farm.phase+=dt/DAY_SECONDS;if(farm.phase>=1){farm.day++;farm.phase-=1;}updateVillageDevelopment(dt);}
replaceFarmState(newFarm());farm.paused=false;`);
assert.equal(run('startVillageMaintenance(true)'),false,'Initial infrastructure must be completed first');
assert.equal(run('farm.coins'),120);
assert.equal(run("[...villageGrassCatalog()].filter(([,p])=>p.original).every(([id,p])=>farm.development.maintenance.plants[id].growth===1&&villageWildPlantCandidates(p.source).some(q=>q.seed===p.seed&&q.x===p.x&&q.y===p.y))"),true,
  'Original plants retain exact positions and mature appearance');
run('maintenanceTestReady()');
assert.ok(run('villageMatureWeeds().length')>=30,'A fully developed village has usable meadow weeds');
assert.equal(run('villageMatureWeeds().every(p=>p.source!=="forest"&&p.source!=="mine"&&wetlandMarshDepth(p.x,p.y)>1.15)'),true);
assert.equal(run('startVillageMaintenance(true)'),true);
assert.equal(run('farm.coins'),99700);
assert.equal(run('startVillageMaintenance(true)'),false,'An active commission is never charged twice');
run('maintenanceTestFrame()');
assert.equal(run('new Set(Object.values(farm.development.maintenance.job.targets).map(t=>t.id)).size'),2);
let foundWork=false,partialSaved=false,readOnly=false;
for(let i=0;i<4000;i++){
  run('maintenanceTestFrame()');
  const active=run('farm.development.maintenance.job!==null');
  if(!active)break;
  const working=run('farm.development.crew.some(a=>a.mode==="work")');
  if(working&&!foundWork){
    foundWork=true;
    assert.equal(run('farm.development.crew.filter(a=>a.mode==="work").every(a=>villageConstructionActivity(a).includes("割草"))'),true);
    const before=run('JSON.stringify({farm,runtime:captureRuntimeState()})');
    run('renderCompleteFarmCanvas();drawVillageDevelopmentMiniMap();updateVillageMaintenanceUI()');
    assert.equal(run('JSON.stringify({farm,runtime:captureRuntimeState()})'),before,'Rendering and UI are read-only');readOnly=true;
    const archive=run('farmExportText()');
    run(`(()=>{const s=importFarmText(${JSON.stringify(archive)});replaceFarmState(s.state,s.runtime);})()`);
    assert.equal(run('JSON.stringify({farm,runtime:captureRuntimeState()})'),before,'Partial work, target, route and growth restore exactly');partialSaved=true;
    run('farm.paused=true');const paused=run('JSON.stringify({farm,runtime:captureRuntimeState()})');
    run('updateVillageDevelopment(3);updateVillageWeedGrowth(3);now+=1;renderCompleteFarmCanvas()');
    const after=run('(()=>{const r=captureRuntimeState();r.now-=1;return JSON.stringify({farm,runtime:r});})()');
    assert.equal(after,paused,'Paused growth and work freeze while display clock advances');run('farm.paused=false');
  }
  assert.equal(run('farm.development.crew.every(a=>villageMaintenanceNavigation().clear(a.x,a.y))'),true,
    'Travel samples avoid buildings, fences and open water');
}
assert.ok(foundWork&&partialSaved&&readOnly);
assert.equal(run('farm.development.maintenance.job'),null);
assert.equal(run('farm.development.maintenance.clearedTotal'),30);
assert.equal(run('farm.development.maintenance.completedJobs'),1);
assert.equal(run('farm.development.maintenance.spentTotal'),300);
assert.equal(run('farm.coins'),99700);
assert.match(run('villageMaintenanceReason(false)'),/歇几天/);
run('farm.phase=.7;for(let i=0;i<800;i++)updateVillageDevelopment(.05)');
assert.equal(run('farm.development.crew.every(a=>a.mode==="home")'),true,'Both workers return home at night');
assert.equal(run('farm.development.maintenance.completedJobs'),1);

run('maintenanceTestReady();startVillageMaintenance(true);maintenanceTestFrame();farm.weather=farm.weatherFrom="rain"');
const wet=run('JSON.stringify(farm.development.maintenance.job)');run('for(let i=0;i<250;i++)updateVillageDevelopment(.05)');
assert.equal(run('JSON.stringify(farm.development.maintenance.job)'),wet,'Heavy rain suspends actual grass work');
assert.equal(run('farm.development.crew.every(a=>a.mode==="home")'),true);
run('farm.weather=farm.weatherFrom="sunny";farm.day=20;farm.phase=.2;for(let i=0;i<600;i++)updateVillageDevelopment(.05)');
assert.equal(run('JSON.stringify(farm.development.maintenance.job)'),wet,'Festival preserves the paid commission without cutting');
assert.equal(run('farm.development.crew.every(a=>a.festival?.attending)'),true,'The same two workers attend the celebration');
run('farm.phase=.65;for(let i=0;i<800;i++)updateVillageDevelopment(.05)');
assert.equal(run('farm.development.crew.every(a=>a.festival?.stage==="home")'),true,'Festival return ends at home');
run('farm.day=21;farm.phase=.15;for(let i=0;i<4000&&farm.development.maintenance.job;i++)maintenanceTestFrame()');
assert.equal(run('farm.development.maintenance.completedJobs'),1,'The next day resumes existing work');
assert.equal(run('farm.development.maintenance.spentTotal'),300);

run(`maintenanceTestReady();let maintenanceChecks=0;
for(let i=0;i<12000;i++){
  maintenanceTestFrame(.5);
  if(i%240===0){const archive=JSON.parse(farmExportText());parseFarmSave(archive);maintenanceChecks++;}
}
const maintenanceLong={day:farm.day,jobs:farm.development.maintenance.completedJobs,
  cleared:farm.development.maintenance.clearedTotal,spent:farm.development.maintenance.spentTotal,
  checks:maintenanceChecks};`);
assert.ok(run('maintenanceLong.jobs')>=3,'Automatic upkeep repeats after rest and slow regrowth');
assert.equal(run('100000-farm.coins'),run('maintenanceLong.spent'),'Only real commissions cost money');
assert.equal(run('maintenanceLong.checks'),50);
console.log('Automatic upkeep sample:',run('JSON.stringify(maintenanceLong)'));

// Slow, bounded and reproducible regrowth, without overnight spawning on paving or cleared land.
run(`maintenanceTestReady();const growthOriginal=JSON.parse(JSON.stringify(farm)),growthRuntime=captureRuntimeState();
const probeWeed=villageMatureWeeds()[0],probeState=farm.development.maintenance.plants[probeWeed.id];
probeState.growth=0;probeState.cutAt=farm.day+farm.phase;
const growthStart=JSON.parse(JSON.stringify(farm));
function growTestDays(days){for(let d=0;d<days;d++){farm.day++;farm.phase=.15;updateVillageWeedGrowth(DAY_SECONDS);}}
growTestDays(9);`);
assert.equal(run('farm.development.maintenance.plants[probeWeed.id].growth'),0,'A cut clump rests for ten days');
assert.ok(run('[...villageGrassCatalog()].filter(([id,p])=>!p.original&&farm.development.maintenance.plants[id].growth>0).length')<=18);
run('growTestDays(80)');
assert.equal(run('villageVisibleWeeds().every(p=>villagePlantGroundAllowed(p.source,p)&&villagePlantVisible(p.source,p))'),true);
assert.ok(run('[...villageGrassCatalog()].filter(([id,p])=>!p.original&&farm.development.maintenance.plants[id].growth>0).length')<=24);
const grown=run('JSON.stringify(farm.development.maintenance)');
run('replaceFarmState(JSON.parse(JSON.stringify(growthStart)),growthRuntime);growTestDays(89)');
assert.equal(run('JSON.stringify(farm.development.maintenance)'),grown,'Random regrowth resumes deterministically');
run('farm.day=27;farm.phase=.2;const winterGrass=villageVisibleWeeds().find(p=>villageGrassGrowth(p.id)<1);const winterBefore=winterGrass&&villageGrassGrowth(winterGrass.id);updateVillageWeedGrowth(DAY_SECONDS)');
assert.equal(run('!winterGrass||villageGrassGrowth(winterGrass.id)===winterBefore'),true,'Midwinter does not advance grass growth');

run('maintenanceTestReady();startVillageMaintenance(true);maintenanceTestFrame()');
const good=JSON.parse(run('farmExportText()'));
const naturalGrass=run('[...villageGrassCatalog()].find(([,p])=>p.source==="forest")[0]');
for(const mutate of [m=>m.credit=-1,m=>m.plants[Object.keys(m.plants)[0]].growth=2,
  m=>m.plants[Object.keys(m.plants)[0]].cutAt=99999,m=>m.job.paid=1,m=>m.clearedTotal=99,
  m=>{const t=m.job.targets; t['阿砚']={...t['阿梁']};},m=>{m.plants.fake={growth:1,cutAt:null};},
  m=>{m.job.targets=[];},m=>{m.job.targets['阿梁'].id=naturalGrass;}]){
  const broken=structuredClone(good);mutate(broken.state.development.maintenance);
  assert.throws(()=>run(`importFarmText(${JSON.stringify(JSON.stringify(broken))})`),/养护/);
}
delete good.state.development.maintenance;
run(`const maintenanceOld=importFarmText(${JSON.stringify(JSON.stringify(good))});`);
assert.equal(run('maintenanceOld.state.development.maintenance.job'),null);
assert.equal(run('maintenanceOld.state.development.maintenance.spentTotal'),0);
assert.equal(run('maintenanceOld.state.coins'),99700,'Adding state does not alter an existing bank balance');
run('maintenanceTestReady();farm.coins=villageReserve()+299');
assert.equal(run('startVillageMaintenance(true)'),false,'Reserve is protected');
run('farm.coins=100000;farm.paused=true;updateVillageMaintenanceUI()');element('maintenance-request').click();
assert.equal(run('farm.development.maintenance.job.paid'),300,'The sidebar can book a commission while paused');
console.log('Village maintenance passed: fixed commission, payment/reserve, claims, continuous work, obstacle paths, rain/night/festival, pause, full restoration, old state, regrowth bounds and validation.');
