const assert=require('node:assert/strict');
const {run,element,getStoredSave}=require('./harness.cjs');

function fixture(ids,active=null){
  run(`(()=>{
    const state=newFarm();state.coins=100000;state.phase=.2;state.paused=true;
    const d=state.development;
    if(${JSON.stringify(active)}){
      const id=${JSON.stringify(active)},p=d.projects[id];d.active=id;
      Object.assign(p,{status:'active',sequence:++d.sequence,paid:VILLAGE_PROJECTS[id].price,startedAt:1.2,work:12});
      d.spentTotal=p.paid;
    }
    for(const id of ${JSON.stringify(ids)}){
      Object.assign(d.projects[id],{status:'queued',sequence:++d.sequence,queuedAt:1.2});d.queue.push(id);
    }
    replaceFarmState(state);updateUI();
  })()`);
}
const queue=()=>Array.from(run('farm.development.queue'));
const savedQueue=()=>Array.from(run('parseFarmSave(JSON.parse(farmExportText())).development.queue'));

// No dependency: A B C becomes C A B, with historical arrival records intact.
fixture(['lake','greenhouse','forest']);
const arrival=run('JSON.stringify(Object.values(farm.development.projects).map(p=>[p.sequence,p.queuedAt]))');
const coins=run('farm.coins');
assert.equal(run("prioritizeVillageProject('forest')"),true);
assert.deepEqual(queue(),['forest','lake','greenhouse']);
assert.equal(run('farm.coins'),coins);
assert.equal(run('JSON.stringify(Object.values(farm.development.projects).map(p=>[p.sequence,p.queuedAt]))'),arrival);
assert.deepEqual(savedQueue(),queue());
const unchanged=run('JSON.stringify(farm)');
assert.equal(run("prioritizeVillageProject('forest')"),false);
assert.equal(run("prioritizeVillageProject('mine')"),false);
assert.equal(run('JSON.stringify(farm)'),unchanged,'No-op clicks must not append logs or alter progress');

// Real prerequisite: sheep A, greenhouse B, goats C becomes A C B.
fixture(['sheep','greenhouse','goats']);
assert.equal(run("villageQueuePriorityIndex('goats')"),1);
assert.equal(run("prioritizeVillageProject('goats')"),true);
assert.deepEqual(queue(),['sheep','goats','greenhouse']);
assert.deepEqual(savedQueue(),queue());
assert.throws(()=>run(`(()=>{const saved=JSON.parse(farmExportText());saved.state.development.queue=['goats','sheep','greenhouse'];parseFarmSave(saved);})()`),/建设进度/);

// Chained dependencies constrain the selected project without moving others.
run("VILLAGE_PROJECTS.greenhouse.requires=['lake'];VILLAGE_PROJECTS.forest.requires=['greenhouse']");
try{
  fixture(['lake','plaza','greenhouse','herbs','forest']);
  assert.equal(run("prioritizeVillageProject('forest')"),true);
  assert.deepEqual(queue(),['lake','plaza','greenhouse','forest','herbs']);
  assert.deepEqual(savedQueue(),queue());
}finally{
  run('delete VILLAGE_PROJECTS.greenhouse.requires;delete VILLAGE_PROJECTS.forest.requires');
}

// An active prerequisite is already ahead of every waiting slot; it is untouched.
fixture(['lake','greenhouse','goats'],'sheep');
const active=run('JSON.stringify({id:farm.development.active,project:farm.development.projects.sheep,spent:farm.development.spentTotal})');
assert.equal(run("prioritizeVillageProject('goats')"),true);
assert.deepEqual(queue(),['goats','lake','greenhouse']);
assert.equal(run('JSON.stringify({id:farm.development.active,project:farm.development.projects.sheep,spent:farm.development.spentTotal})'),active);
assert.equal(run("prioritizeVillageProject('sheep')"),false);
assert.deepEqual(savedQueue(),queue());

// The real UI click works while paused, persists immediately and retains buttons.
fixture(['lake','greenhouse','forest']);
const list=element('construction-queue'),nodes=[...list.children];
run('updateUI();updateUI()');assert.deepEqual(list.children,nodes);
nodes[2].click();
assert.deepEqual(queue(),['forest','lake','greenhouse']);
assert.deepEqual(list.children,[nodes[2],nodes[0],nodes[1]]);
assert.match(element('construction-queue-feedback').textContent,/森林居所已提前到第 1 位/);
assert.deepEqual(JSON.parse(getStoredSave()).state.development.queue,queue());
assert.equal(run('farm.paused'),true);

// Automatic arrivals append, and the real next start follows the manual order.
run('farm.paused=false;updateVillageQueue()');
assert.deepEqual(queue().slice(0,3),['forest','lake','greenhouse']);
assert.equal(run('startVillageProject()'),true);
assert.equal(run('farm.development.active'),'forest');
assert.equal(run('farm.development.projects.forest.paid'),1500);
assert.equal(run("prioritizeVillageProject('forest')"),false);
assert.ok(run('parseFarmSave(JSON.parse(farmExportText())).development'));
console.log('Construction queue passed: independent and dependent priority, chains, active project preservation, no-op clicks, stable paused UI, immediate cache, full saves, invalid dependency rejection, new arrivals and next actual start.');
