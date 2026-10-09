const assert = require('node:assert/strict');
const { run } = require('./harness.cjs');

// Reproduce the wetland work site and a saved failed route, without replacing
// the real movement, road planner, night priorities or snapshot validation.
function wetlandFixture(planks) {
  run(`(() => {
    const state=newFarm();state.day=69;state.phase=.3;state.coins=100000;
    state.upgrades=5;state.goatBarnOpen=true;state.shippedTotal=500;state.weather=state.weatherFrom='sunny';
    for(const id of ['lake','greenhouse','forest','herbs','plaza','sheep','goats']) {
      Object.assign(state.development.projects[id],{status:'complete',stage:'settle',completedAt:1});
      state.development.completedCount++;
    }
    replaceFarmState(state);updateVillageQueue();startVillageProject();
    const d=farm.development,bridge=villageProjectRoads('nursery').filter(r=>r.footBridge);
    d.roads=villageProjectRoads('nursery').filter(r=>!r.footBridge).map(r=>r.id)
      .concat(bridge.slice(0,${planks}).map(r=>r.id));d.revision++;
    d.crew=[villageMakeActor('阿梁'),villageMakeActor('阿砚',1)];
    d.crew.forEach((a,i)=>Object.assign(a,{x:155+i*6,y:1518+i*6,mode:'return',path:[],
      goal:VILLAGE_CREW_HOME.beds[i].x+':'+VILLAGE_CREW_HOME.beds[i].y}));
    Object.assign(d.residents['阿芽'].actor,{x:155,y:1532,mode:'return',path:[],
      goal:VILLAGE_CREW_HOME.door.x+':'+VILLAGE_CREW_HOME.door.y});
    farm.phase=.9;
    const saved=JSON.parse(farmExportText());
    replaceFarmState(parseFarmSave(saved),saved.runtime);
  })()`);
}

for (let planks = 0; planks <= 3; planks++) {
  wetlandFixture(planks);
  const before = run('JSON.stringify(farm.development)');
  run('farm.paused=true;updateVillageDevelopment(2)');
  assert.equal(run('JSON.stringify(farm.development)'), before);
  run('farm.paused=false');
  const progress = run('farm.development.projects.nursery.work');
  run('updateVillageDevelopment(.1)');
  assert.ok(run('farm.development.crew.every(a=>a.path.length>0)'), 'Empty saved routes must recover');
  const path = run('farm.development.crew[1].path');
  assert.deepEqual(path.at(-1), run('VILLAGE_CREW_HOME.beds[1]'));
  let clearBank = true;
  for (let step = 0; step < 300; step++) {
    run('updateVillageDevelopment(.1)');
    clearBank &&= run('farm.development.crew.every(a=>!wetlandCreekAt(a.x,a.y))');
  }
  assert.ok(clearBank, 'Return over the east grass bank, not through the creek');
  assert.equal(run('farm.development.crew.every((a,i)=>a.mode==="home"&&distance(a,VILLAGE_CREW_HOME.beds[i])<2)'), true);
  assert.equal(run('farm.development.residents["阿芽"].actor.mode'), 'home');
  assert.equal(run('farm.development.projects.nursery.work'), progress, 'No night construction');
  const arrived = run('JSON.stringify(farm.development.crew)');
  run('for(let i=0;i<20;i++)updateVillageDevelopment(.1)');
  assert.equal(run('JSON.stringify(farm.development.crew)'), arrived, 'At-home actors must not plan a detour');
  assert.ok(run('parseFarmSave(JSON.parse(farmExportText())).development'));
}

// The same grass approach must permit working on every remaining plank.
wetlandFixture(1);
run('farm.phase=.3;farm.development.crew.forEach(a=>{a.goal=null;a.path=[];});');
run('for(let i=0;i<1800&&farm.development.projects.nursery.stage==="road";i++)updateVillageDevelopment(.1)');
assert.notEqual(run('farm.development.projects.nursery.stage'), 'road');
assert.equal(run('villageProjectRoads("nursery").every(r=>villageRoadBuilt(r))'), true);

// Inspect every other developed work site with the wetland plank still present.
const allSites = run(`(() => {
  const state=newFarm();state.upgrades=5;state.goatBarnOpen=true;
  state.development=makeLegacyVillageDevelopment(state);replaceFarmState(state);
  const checked=[];
  for(const id of VILLAGE_PROJECT_IDS) {
    const site=VILLAGE_PROJECTS[id].site,goal=VILLAGE_CREW_HOME.beds[0];
    const actor={...villageMakeActor('阿梁'),x:(site.left+site.right)/2,y:Math.min(WORLD_H-25,site.bottom+22),
      path:[],goal:goal.x+':'+goal.y};
    for(let step=0;step<400&&distance(actor,goal)>=2;step++)villageActorMove(actor,goal,.1);
    if(distance(actor,goal)>=2)throw new Error(id+' cannot return home');
    checked.push(id);
  }
  return checked.length;
})()`);
assert.equal(allSites, 12);
console.log('Construction return passed: all four plank stages, saved failed-route recovery, pause, dry-bank return, both builders and owner home, stable rest, valid saves and continued bridge work.');
