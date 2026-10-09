const assert=require('node:assert/strict');
const {run,element,painted,colors}=require('./harness.cjs');

// Wealth alone cannot create a traveller, stock, or purchases in an unbuilt inn.
run('farm.coins=100000;farm.phase=.2;updateTownPlanning();updateTownTraveller(.5)');
assert.equal(run('farm.town.merchantUnlocked'),false);
const waiting=run('JSON.stringify({coins:farm.coins,seed:farm.town.seed,actor:farm.town.traveller,visits:farm.town.visits})');
assert.equal(run('townBeginVisit()'),false);
assert.equal(run('JSON.stringify({coins:farm.coins,seed:farm.town.seed,actor:farm.town.traveller,visits:farm.town.visits})'),waiting);
run('updateUI()');
assert.ok(element('town-merchant-status').textContent.includes('驿屋建成'));
assert.ok(element('festival-status').textContent.includes('广场建成'));

// No square means normal work on day 10 and no premature courier rest on day 9.
run('farm.day=9;courier=resetCourier();updateCourier(.1)');
assert.equal(run('courier.leg'),'outbound');
assert.equal(run('isFestivalDay(10)'),false);
run('farm.orders[0].due=12;const originalOrderId=farm.orders[0].id;nextDay()');
assert.equal(run('farm.orders.find(o=>o.id===originalOrderId).due'),12);
assert.equal(run('farm.celebration.count'),0);
run("farm.phase=.2;farm.weather=farm.weatherFrom='sunny'");
const beforeCoins=run('farm.coins');
assert.equal(run('prepareFestival()'),false);
assert.equal(run('townCanLaunchLanterns()'),false);
assert.equal(run('farm.coins'),beforeCoins);
assert.equal(run('updateVillageQueue();startVillageProject()'),true);
run('for(let i=0;i<800;i++)updateVillageDevelopment(.05)');
assert.equal(run('farm.development.crew.some(a=>a.festival?.day===10)'),false);
assert.ok(run('farm.development.projects.lake.work>0||farm.development.projects.lake.chunkWork>0'));

// A day-10 afternoon opening cannot change the day's schedule midway through.
run(`replaceFarmState(newFarm());farm.day=10;farm.phase=.3;farm.coins=10000;
 Object.assign(farm.development.projects.plaza,{status:'complete',stage:'settle',completedAt:10.2});
 farm.development.completedCount=1;`);
assert.equal(run('isFestivalDay()'),false);
assert.equal(run('isFestivalDay(20)'),true);
assert.equal(run('prepareFestival()'),false);
assert.equal(run('parseFarmSave(JSON.parse(farmExportText())).development.projects.plaza.completedAt'),10.2);
run('farm.day=19;farm.orders[0].due=21;const festivalOrderId=farm.orders[0].id;nextDay()');
assert.equal(run('farm.celebration.day'),20);
assert.equal(run('farm.celebration.count'),1);
assert.equal(run('farm.celebration.budget'),100);
assert.equal(run('farm.orders.find(o=>o.id===festivalOrderId).due'),22);
const afterBudget=run('farm.coins');
assert.equal(run('prepareFestival()'),false);
assert.equal(run('farm.coins'),afterBudget);
run('farm.phase=.2;updateActors(.1)');
assert.ok(run('workers.some(a=>a.festival?.day===20)'));

// Finished inn still requires savings and ordinary arrival time; pause remains effective.
run(`replaceFarmState(newFarm());farm.day=11;farm.phase=.2;farm.coins=60000;
 farm.development.projects.traveller.status='active';updateTownPlanning();updateTownTraveller(.1);`);
assert.equal(run('farm.town.visits'),0);
run(`Object.assign(farm.development.projects.traveller,{status:'complete',stage:'settle',completedAt:11.2});
 farm.development.completedCount=1;farm.coins=4999;updateTownPlanning();updateTownTraveller(.1);`);
assert.equal(run('farm.town.visits'),0);
assert.equal(run('townBeginVisit()'),false);
run('farm.coins=5000;farm.paused=true;updateTownPlanning();updateTownTraveller(.1)');
assert.equal(run('farm.town.visits'),0);
run('farm.paused=false;updateTownPlanning();updateTownTraveller(.1)');
assert.equal(run('farm.town.visits'),1);
assert.equal(run('farm.town.traveller.mode'),'arrive');
run('for(let i=0;i<100;i++)updateTownTraveller(.05)');
assert.equal(run('townShopOpen()'),true);
assert.equal(run('farm.town.traveller.tier'),0);
assert.equal(run('parseFarmSave(JSON.parse(farmExportText())).town.visits'),1);

// Earlier local saves retain paid jobs/inventory; no trading or work occurs before reopening.
run(`farm.development.projects.traveller.status='natural';farm.development.projects.traveller.completedAt=null;
 farm.development.completedCount=0;farm.town.inventory.petToy=1;
 farm.town.construction={kind:'build',id:'catComfort',level:1,cost:380,progress:.4,startedAt:11.1};`);
const preserved=run('JSON.stringify({coins:farm.coins,actor:farm.town.traveller,job:farm.town.construction,inventory:farm.town.inventory})');
run('updateTownTraveller(2);updateTownAutomaticShopping();updateUI()');
assert.equal(run('townShopOpen()||townTravellerVisible()'),false);
assert.equal(run('JSON.stringify({coins:farm.coins,actor:farm.town.traveller,job:farm.town.construction,inventory:farm.town.inventory})'),preserved);
assert.equal(run('parseFarmSave(JSON.parse(farmExportText())).town.construction.progress'),.4);
assert.equal(element('town-map-shop').hidden,true);
painted.length=0;colors.length=0;
run('drawMiniMap()');
assert.equal(colors.includes('#c7976c'),false,'An earlier saved cart is hidden on the minimap until the inn opens');
console.log('Development activity gates passed: completed infrastructure, normal early day-10 work, delayed inauguration, one budget/order extension, arrival/wealth/pause, UI and retained save progress.');
