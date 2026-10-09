const assert=require('node:assert/strict');
const {run,element,painted,colors}=require('./harness.cjs');
assert.equal(run('farm.day'),1);
require('./world-reset-checks.cjs')(run,assert,element);
assert.equal(run('Object.values(farm.development.projects).every(p=>p.status==="natural")'),true);
assert.equal(run('workers.map(w=>w.name).join(",")'),'阿满,小禾,阿青');
assert.equal(run("villageResidentWorking('阿森')||villageResidentWorking('阿芽')||villageResidentWorking('阿矿')"),false);
assert.equal(run("VILLAGE_ROADS.filter(r=>r.bridge&&villageRoadBuilt(r)).length"),1);
assert.equal(run("villageRoadAt(620,1699)||villageRoadAt(2390,1480)"),false);
assert.equal(run("villageSceneItemVisible('mine-home')||villageSceneItemVisible('nursery-home')||villageSceneItemVisible('plaza-stage')"),false);
assert.equal(run('JSON.stringify(parseFarmSave(JSON.parse(farmExportText())).development)===JSON.stringify(farm.development)'),true);
// Future facilities cannot consume supplies or collect invisible-region cargo.
run('farm.phase=.2;farm.town.inventory.birdFeed=4;farm.town.inventory.birdNest=1;updateTownEcology(.2);updateTownBirdBath(.2)');
assert.equal(run('farm.town.birds.length'),0);
assert.equal(run('farm.town.inventory.birdFeed'),4);
assert.equal(run('farm.town.birdBath.ready'),false);
assert.equal(run("townGoodsUseful('birdFeed')||townGoodsUseful('firewood')||townGoodsUseful('windchime')||townGoodsUseful('flowerPot')"),false);
run('farm.coins=1500;updateVillageQueue();farm.coins=700');
assert.equal(run('startVillageProject()'),false);
assert.equal(run('farm.development.queue[0]'),'lake');
assert.equal(run('farm.development.spentTotal'),0);
run('farm.coins=100000;farm.shippedTotal=500;farm.phase=.2;updateVillageQueue()');
assert.equal(run('farm.development.queue.length'),9);
assert.equal(run('farm.development.queue[0]'),'lake');
assert.equal(run('startVillageProject()'),true);
assert.equal(run('farm.coins'),99200);
assert.equal(run('startVillageProject()'),false);
assert.equal(run('farm.development.residents["阿蓼"].stage'),'help');
run('updateVillageDevelopment(.05)');
const paused=run('farm.paused=true;JSON.stringify(farm.development)');
run('updateVillageDevelopment(20)');
assert.equal(run('JSON.stringify(farm.development)'),paused);
run('farm.paused=false;farm.weather=farm.weatherFrom="rain";farm.phase=.2');
assert.equal(run('villageWorkingWeather()'),0);
run('farm.weather=farm.weatherFrom="sunny"');
// Festival attendance requires an already completed square; restore this temporary fixture afterwards.
const beforeFestival=run('JSON.stringify(farm.development)');
run(`Object.assign(farm.development.projects.plaza,{status:'complete',stage:'settle',completedAt:1});
 farm.development.queue=farm.development.queue.filter(id=>id!=='plaza');farm.development.completedCount++;farm.development.revision++;`);
const celebrating=run(`(()=>{
 farm.day=10;farm.phase=.2;const work=farm.development.projects.lake.work;
 for(let i=0;i<600;i++)updateVillageDevelopment(.05);
 const atGather=farm.development.crew.every(a=>a.festival?.stage==='gather');
 const save=JSON.parse(farmExportText());parseFarmSave(save);
 farm.phase=.48;for(let i=0;i<800;i++)updateVillageDevelopment(.05);
 return {atGather,unchanged:farm.development.projects.lake.work===work,
 home:farm.development.crew.every(a=>a.festival?.stage==='home')};
})()`);
assert.ok(Object.values(celebrating).every(Boolean),JSON.stringify(celebrating));
run(`farm.development=JSON.parse(${JSON.stringify(beforeFestival)})`);
assert.equal(run(`(()=>{const save=JSON.parse(farmExportText());delete save.state.development;const before=save.state.coins;const result=parseFarmSave(save);return result.coins===before&&villageSiteOpen('mine',result)&&villageSiteOpen('lake',result)&&!villageSiteOpen('sheep',result);})()`),true);
assert.throws(()=>run('const bad=JSON.parse(farmExportText());bad.state.development.roads.push("made-up:0");parseFarmSave(bad)'),/建设进度/);
// Use real builder movement, time, queue, bridges, festivals, migration and saved progress.
const finished=run(`(()=>{
 farm.weather=farm.weatherFrom='sunny';farm.day=11;farm.phase=.2;farm.coins=200000;
 let steps=0,checks=0;const phases=new Set();
 for(;steps<180000&&farm.development.completedCount<12;steps++){
   updateVillageDevelopment(.2);phases.add(farm.development.active?farm.development.projects[farm.development.active].stage:'idle');
   farm.phase+=.2/DAY_SECONDS;if(farm.phase>=1){farm.phase=0;farm.day++;farm.weather=farm.weatherFrom='sunny';}
   if(steps%800===0){prepareFestival();const saved=JSON.parse(farmExportText());const parsed=parseFarmSave(saved);validateRuntimeSnapshot(saved.runtime);
     const before=JSON.stringify(farm.development),coins=farm.coins;
     replaceFarmState(parsed,saved.runtime);
     const assertSnapshot=JSON.stringify(farm.development)===before&&farm.coins===coins;
     if(!assertSnapshot)throw new Error('Construction import changed progress or payment');checks++;}
 }
 return {steps,day:farm.day,count:farm.development.completedCount,active:farm.development.active,
   pending:farm.development.active?villageProjectRoads(farm.development.active).filter(r=>!villageRoadBuilt(r)).map(r=>r.id):[],
   crew:farm.development.crew,checks,phases:[...phases],coins:farm.coins,spent:farm.development.spentTotal};
})()`);
console.log('construction run:',JSON.stringify({...finished,crew:finished.crew.map(a=>({name:a.name,x:a.x,y:a.y,mode:a.mode}))}));
assert.equal(finished.count,12,'Every region must finish under actual builder movement');
assert.ok(finished.checks>10);
assert.ok(['road','clear','build','settle'].every(p=>finished.phases.includes(p)));
assert.equal(finished.spent,47800);
run('farm.phase=.2;farm.day++;for(let i=0;i<2000;i++)updateVillageDevelopment(.05)');
assert.equal(run('Object.values(farm.development.residents).every(r=>r.stage==="home")'),true);
assert.equal(run('parseFarmSave(JSON.parse(farmExportText())).development.completedCount'),12);
console.log('Village development checks passed.');
