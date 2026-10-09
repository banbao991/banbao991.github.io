const assert=require('node:assert/strict');
const {run,painted,colors,fs,path}=require('./harness.cjs');
// A reproducible economy run starts with the real 120-gold farm, without player help.
run(`Math=Object.create(Math);let testSeed=712;
Math.random=()=>{testSeed=(testSeed*1664525+1013904223)>>>0;return testSeed/4294967296;};
let autonomousChecks=0;`);
for(let batch=0;batch<100&&run('farm.development.completedCount')<12;batch++){
  run(`for(let tick=0;tick<1500;tick++){
    const dt=.5*(farm.phase>=NIGHT_START?2.1:1);
    motionNow+=dt;now+=.5;farm.phase+=dt/DAY_SECONDS;
    if(farm.phase>=1)nextDay();updateActors(dt);
    if(tick%300===0){const saved=JSON.parse(farmExportText());parseFarmSave(saved);validateRuntimeSnapshot(saved.runtime);autonomousChecks++;}
  }`);
  painted.length=0;colors.length=0;
  if(batch%10===0)console.log(JSON.stringify(run('({day:farm.day,coins:farm.coins,completed:farm.development.completedCount,active:farm.development.active,shipped:farm.shippedTotal})')));
}
const result=run('({day:farm.day,coins:farm.coins,completed:farm.development.completedCount,active:farm.development.active,checks:autonomousChecks,shipped:farm.shippedTotal,visits:farm.town.visits})');
console.log('autonomous farm:',JSON.stringify(result));
assert.equal(result.completed,12,'An unattended farm can finance and finish every infrastructure project');
assert.ok(result.visits>0&&result.shipped>100);
assert.equal(run('parseFarmSave(JSON.parse(farmExportText())).development.completedCount'),12);
if(process.env.FARM_QA_SAVE)fs.writeFileSync(path.resolve(process.env.FARM_QA_SAVE),run('farmExportText()'));
console.log('Autonomous development checks passed.');
