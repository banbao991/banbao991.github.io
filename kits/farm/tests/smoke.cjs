const assert=require('node:assert/strict');
const {run:runRaw,element,sandbox,root,elements,documentListeners,colors,painted,exportPainted,exportColors,downloads,downloadBlobs,pageScripts,scripts,fs,path,vm,context2d,imageContext2d,getLatestImageCanvas,getStoredSave}=require('./harness.cjs');

// Existing-life regressions use infrastructure from an imported old world. New construction has a dedicated suite.
// Artificial scenario date jumps start a fresh journal page, like a real dawn.
// The real nextDay() lifecycle and full daily retention have dedicated suites.
runRaw(`function setRegressionDay(day){if(day!==farm.day)farm.events=[];farm.day=day;}
function regressionFarmFixture(){const s=newFarm();s.development=makeLegacyVillageDevelopment({...s,upgrades:5,goatBarnOpen:true});s.development.independent=makeVillageDevelopmentState().independent;return s;}
function syncRegressionInfrastructure(){if(!farm.development)return;for(const id of ['greenhouse','sheep','goats']){
const built=id==='greenhouse'?farm.upgrades>=3:id==='sheep'?farm.upgrades>=4:!!farm.goatBarnOpen;
const p=farm.development.projects[id];p.status=built?'complete':'natural';p.completedAt=built?farm.day:null;p.stage=built?'settle':'road';
}farm.development.completedCount=Object.values(farm.development.projects).filter(p=>p.status==='complete').length;
for(const p of Object.values(farm.development.projects))if(p.completedAt!==null)p.completedAt=Math.min(p.completedAt,farm.day);
farm.development.independent={eastFields:farm.upgrades>=1,beehives:farm.upgrades>=2,upperFields:farm.upgrades>=3,southFields:farm.upgrades>=4,market:farm.upgrades>=5};
if(farm.upgrades>=4)farm.development.residents['阿牧']={stage:'home',project:'sheep',arrivedAt:farm.day};}
farm.development=makeLegacyVillageDevelopment(farm);`);
const run=code=>runRaw('syncRegressionInfrastructure();'+code.replaceAll('newFarm()','regressionFarmFixture()')
  .replace(/farm.upgrades\s*=\s*([0-9]+)\s*;/g,'farm.upgrades=$1;syncRegressionInfrastructure();')
  .replace(/\bfarm\.day\s*=(?!=)\s*([^;]+);/g,'setRegressionDay($1);')
  .replace(/\bfarm\.day\+\+;/g,'setRegressionDay(farm.day+1);'));
run('function updateVillageNeighbours(dt) { updateAngler(dt); updateOrderKeeper(dt); }');

assert.equal(run('farm.day'), 1);
require('./world-reset-checks.cjs')(run, assert, element);
runRaw('replaceFarmState(regressionFarmFixture())');

const worldStatus = run(`(() => {
  const original = { farm, angler, nurseryKeeper, courier };
  farm = newFarm(); farm.day = 10; farm.phase = .8;
  angler = { ...resetAngler(), ...ANGLER_HOME, festival: { day: 10, stage: 'home', index: 0 } };
  nurseryKeeper = { ...resetNurseryKeeper(), festival: { day: 10, stage: 'home', index: 0 } };
  updateUI();
  const festivalHome = $('angler-status').textContent.includes('阿蓼 · 在家休息')
    && $('nursery-keeper-status').textContent.includes('阿芽 · 在家休息')
    && !$('angler-status').textContent.includes('赴会中');
  farm.day = 11; farm.phase = .3; farm.nursery.level = 3;
  angler.festival = null; nurseryKeeper.festival = null;
  nurseryKeeper.goal = 'rest'; nurseryKeeper.path = [];
  nurseryKeeper.x = NURSERY_LAYOUT.rest.x; nurseryKeeper.y = NURSERY_LAYOUT.rest.y;
  updateUI();
  const resting = $('nursery-keeper-status').textContent.includes('在长椅上休息');
  nurseryKeeper.path = [{ ...NURSERY_LAYOUT.rest }]; updateUI();
  const walking = $('nursery-keeper-status').textContent.includes('正去长椅歇脚');
  nurseryKeeper.goal = 'home'; nurseryKeeper.path = []; Object.assign(nurseryKeeper, NURSERY_LAYOUT.home.door);
  farm.phase = .8; updateUI();
  const ordinaryHome = $('angler-status').textContent.includes('在钓鱼小屋休息')
    && $('nursery-keeper-status').textContent.includes('在湿地小屋休息');
  const mineName = $('mine-status').textContent.startsWith('阿矿 · ');
  $('shipping-details').open = true; $('ecology-details').open = true;
  const planNode = $('shipping-plan');
  farm.fishTotal = 1234; farm.berries = 7; farm.upgrades = 5; updateUI();
  const stableDetails = $('shipping-details').open && $('ecology-details').open
    && $('shipping-plan') === planNode;
  const labels = $('forest-status').textContent.includes('果篮野莓 7 份')
    && $('lake-statistics').textContent.includes('累计钓获 1234 尾')
    && !$('next-unlock').textContent.includes('四片区域');
  let navigation = true;
  courier = { ...resetCourier(), x: 1200, y: 1000 };
  const points = { forest: FOREST_HOME, lake: {x:LAKE_X,y:LAKE_Y},
    nursery: {x:320,y:1625.5}, mine: {x:1769,y:1600}, courier,
    ridge: RIDGE_OWL_PERCHES[0], 'valley-lake': VALLEY_LAKE_CENTER };
  for (const [id, target] of Object.entries(points)) {
    $('status-locate-' + id).click();
    const top = screenToWorld(0,0), bottom = screenToWorld(W,H);
    navigation &&= target.x >= top.x && target.x <= bottom.x
      && target.y >= top.y && target.y <= bottom.y;
  }
  const unknown = focusWorldStatus('missing') === false;
  $('shipping-details').open = false; $('ecology-details').open = false;
  ({farm,angler,nurseryKeeper,courier} = original); updateUI();
  return {festivalHome, resting, walking, ordinaryHome, mineName, stableDetails, labels, navigation, unknown};
})()`);
assert.ok(Object.values(worldStatus).every(Boolean),
  `World status shares actual activities, preserves disclosures and locates all regions: ${JSON.stringify(worldStatus)}`);

const eastGardenIsolation = run(`(() => {
  const originalFarm = farm, originalKeeper = orderKeeper;
  farm = newFarm(); orderKeeper = resetOrderKeeper();
  const before = { coins:farm.coins, orders:JSON.stringify(farm.orders),
    depots:JSON.stringify(farm.depots), marketGoods:JSON.stringify(farm.marketGoods),
    cargo:JSON.stringify(courier.cargo) };
  const bed = farm.eastGarden.beds[0], crop = bed.kind;
  bed.readyAt = eastGardenClock() - .01;
  tendEastGardenBed(0);
  const harvested = farm.eastGarden.basket[crop] === 1 && farm.eastGarden.harvestTotal === 1
    && eastGardenProgress(0) < .1;
  farm.day = 10; farm.phase = .1;
  advanceEastGardenDay();
  const feast = farm.eastGarden.festivalServed === 1 && eastGardenBasketCount() === 0;
  const isolated = farm.coins === before.coins && JSON.stringify(farm.orders) === before.orders
    && JSON.stringify(farm.depots) === before.depots
    && JSON.stringify(farm.marketGoods) === before.marketGoods
    && JSON.stringify(courier.cargo) === before.cargo;
  const restored = parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});
  const persisted = restored.eastGarden.harvestTotal === 1 && restored.eastGarden.festivalServed === 1;
  farm = originalFarm; orderKeeper = originalKeeper; updateUI();
  return {harvested,feast,isolated,persisted};
})()`);
assert.ok(Object.values(eastGardenIsolation).every(Boolean),
  'Village vegetables grow, feed the feast and persist without touching farm income, orders or freight');
const eastGardenRoutine = run(`(() => {
  const originalFarm = farm, originalKeeper = orderKeeper;
  farm = newFarm(); orderKeeper = resetOrderKeeper();
  farm.day = 2; farm.phase = .1;
  const bed = farm.eastGarden.beds[0];
  bed.plantedAt = 1; bed.readyAt = 2;
  for (let index = 0; index < 650; index++) {
    farm.phase += .05 / DAY_SECONDS;
    updateEastGardenKeeper(.05);
  }
  const result = { finished:orderKeeper.gardenWork?.stage === 'done',
    harvested:farm.eastGarden.harvestTotal > 0,
    backAtNotice:Math.hypot(orderKeeper.x - EAST_GARDEN_NOTICE.x,
      orderKeeper.y - EAST_GARDEN_NOTICE.y) < 2,
    basketHint:describe(MARKET_LAYOUT.garden.basket.x,MARKET_LAYOUT.garden.basket.y)?.text.includes('村口菜篮') };
  farm = originalFarm; orderKeeper = originalKeeper; updateUI();
  return result;
})()`);
assert.ok(Object.values(eastGardenRoutine).every(Boolean),
  'A-Kui follows the village footpath, tends the vegetable beds and returns to the notice board');
const eastGardenFacing = run(`(() => {
  const originalFarm = farm, originalKeeper = orderKeeper;
  farm = newFarm(); farm.day = 2; farm.phase = .2;
  orderKeeper = resetOrderKeeper();
  orderKeeper.gardenWork = {day:2,stage:'beds',routeIndex:3,targets:[0,14],targetIndex:0,action:0};
  orderKeeper.x = eastGardenBedPoint(0).x;
  orderKeeper.y = MARKET_LAYOUT.garden.entrance.y;
  updateEastGardenKeeper(.05);
  const upper = orderKeeper.facing === 'up';
  orderKeeper.gardenWork.targetIndex = 1;
  orderKeeper.x = eastGardenBedPoint(14).x;
  updateEastGardenKeeper(.05);
  const lower = orderKeeper.facing === 'down';
  farm = originalFarm; orderKeeper = originalKeeper;
  return upper && lower;
})()`);
assert.ok(eastGardenFacing, 'A-Kui faces the upper and lower beds while tending each row');
assert.ok(run(`MARKET_LAYOUT.garden.aisle.height >= 28
  && eastGardenBedPoint(14).y - eastGardenBedPoint(0).y >= 58
  && MARKET_LAYOUT.garden.bottom + T <= RIVER_BRIDGES[2].y - 6`),
  'The wider garden aisle keeps both crop rows clear of the southern road');
assert.equal(run(`(() => {
  const older = {version:1,state:JSON.parse(JSON.stringify(newFarm()))};
  delete older.state.eastGarden;
  return parseFarmSave(older).eastGarden.beds.length;
})()`), 28, 'Existing browser saves gain an independent village garden');
const journalDayLimit = run(`(() => {
  const previousDay=farm.day, previousPhase=farm.phase;
  farm.day=1000;farm.phase=.45;updateUI();
  const compact=ui.day.textContent==='1000' && ui.day.classList.contains('is-compact')
    && ui.daySummary.title.includes('第 1000 天') && ui.daySummary.title.includes(timeText());
  farm.day=10000;updateUI();
  const capped=ui.day.textContent==='9999' && ui.daySummary.title.includes('第 10000 天');
  farm.day=previousDay;farm.phase=previousPhase;updateUI();
  return {compact,capped,normal:ui.day.textContent==='01'&&!ui.day.classList.contains('is-compact')};
})()`);
assert.ok(journalDayLimit.compact && journalDayLimit.capped && journalDayLimit.normal,
  'The journal stays compact after day 1000 and reveals the full day and time on hover');
assert.equal(element('order-list').children.length, 3, 'The notice board starts with three orders');
assert.equal(run('LAKE_Y'), 929, 'The whole southern lake shifts two 32px tiles south');
assert.equal(run('DEPOT_SITES.lake.y'), 1019, 'The fish box follows the lake');
assert.equal(run('COURIER_TRAILS.find(trail=>trail.x===476).y'), 1003, 'The fish-box road follows the lake');
assert.ok(run('courierRoadAt(500,1019) && depotAt(476,1019)==="lake"'), 'The fish box remains reachable from its road');
assert.ok(run('lakeDucks.every(duck=>lakeAt(duck.x,duck.y))'), 'Both ducks start on the moved water');
assert.ok(run('farm.fishSpots.every(site=>lakeAt(site.x,site.y))'), 'Daily fish spots follow the moved water');
assert.ok(run('regionTrees.some(([x,y])=>x===72 && y===1024)'), 'The southwest shore tree follows the lake');
const shiftedCache = run(`(() => {
  const saved = JSON.parse(JSON.stringify({version:1,state:farm,runtime:captureRuntimeState()}));
  delete saved.state.lakeLayoutVersion;
  for (const site of saved.state.fishSpots) site.y -= SOUTH_LAKE_SHIFT_Y;
  for (const duck of saved.runtime.lakeDucks) { duck.y -= SOUTH_LAKE_SHIFT_Y; duck.ty -= SOUTH_LAKE_SHIFT_Y; }
  const before = saved.state.fishSpots[0]?.y;
  const parsed = parseFarmSave(saved);
  return { version:parsed.lakeLayoutVersion, fishDelta:parsed.fishSpots[0]?.y-before,
    duckY:saved.runtime.lakeDucks[0].y, duckTargetY:saved.runtime.lakeDucks[0].ty };
})()`);
assert.equal(shiftedCache.version, 2);
assert.equal(shiftedCache.fishDelta, 64, 'Cached fish spots migrate with the lake');
assert.equal(shiftedCache.duckY, 905, 'Cached ducks migrate with the lake');
assert.equal(shiftedCache.duckTargetY, 920, 'Cached duck targets migrate with the lake');
const movedPastureCache = run(`(() => {
  const saved = { version:1, state:newFarm(), runtime:{
    sheep:[{x:766,y:847,tx:770,ty:850},{x:867,y:888,tx:865,ty:886}],
    meadowGoats:[{x:1040,y:887,tx:1114,ty:904},{x:1137,y:905,tx:1060,ty:881}],
    workers:[{name:'阿牧',x:816,y:749,task:{type:'wool',index:0},route:[{x:800,y:850}],action:.2}],
    courier:{leg:'return',x:1170,y:980,stopIndex:8,routeVariant:null,night:null}
  }};
  delete saved.state.mapLayoutVersion;
  const state = parseFarmSave(saved);
  return {version:state.mapLayoutVersion,sheepY:saved.runtime.sheep[0].y,
    goatY:saved.runtime.meadowGoats[0].y,workerY:saved.runtime.workers[0].y,
    workerTask:saved.runtime.workers[0].task,courierStop:saved.runtime.courier.stopIndex};
})()`);
assert.equal(movedPastureCache.version, 2);
assert.ok(movedPastureCache.sheepY > 1400 && movedPastureCache.goatY > 1400
  && movedPastureCache.workerY > 1300, 'Old cached animals and caretaker move south with the barns');
assert.equal(movedPastureCache.workerTask, null, 'The caretaker drops a task aimed at the former pasture');
assert.equal(movedPastureCache.courierStop, 0, 'A returning courier replans from his cottage after the layout change');
assert.equal(element('ledger-details').hidden, true, 'The detailed ledger starts collapsed');
element('ledger-toggle').click();
assert.equal(element('ledger-details').hidden, false, 'The ledger toggle reveals detailed entries');
assert.equal(element('ledger-acorn-total').textContent, '0 枚');
element('ledger-toggle').click();
assert.equal(element('ledger-details').hidden, true, 'The ledger can return to its compact view');
assert.equal(run('compactLedgerNumber(999999)'), '999999');
assert.equal(run('compactLedgerNumber(1001234)'), '100万');
assert.equal(run('compactLedgerNumber(123456789)'), '1.23亿');
const largeLedger = run(`(() => {
  const before={coins:farm.coins,harvested:farm.harvested,milkTotal:farm.milkTotal,
    nurseryTotal:farm.nursery.harvestTotal,expanded:farm.ledgerExpanded,
    wheat:farm.depots.farm.wheat};
  farm.coins=1001234;farm.harvested=999999;farm.milkTotal=123456789;
  farm.nursery.harvestTotal=1001234;farm.depots.farm.wheat=1001234;
  farm.ledgerExpanded=true;updateUI();
  const preview={coins:ui.coins.textContent,coinsExact:ui.coins.title,
    sixDigits:ui.harvest.textContent,milk:$('ledger-milk-total').textContent,
    milkExact:$('ledger-milk-total').title,nursery:$('ledger-nursery').textContent,
    freight:$('ledger-goods-detail').children[0].children[1].textContent};
  farm.coins=before.coins;farm.harvested=before.harvested;farm.milkTotal=before.milkTotal;
  farm.nursery.harvestTotal=before.nurseryTotal;farm.ledgerExpanded=before.expanded;
  if(before.wheat==null)delete farm.depots.farm.wheat;else farm.depots.farm.wheat=before.wheat;
  updateUI();return preview;
})()`);
assert.ok(largeLedger.coins==='100万' && largeLedger.coinsExact==='1001234'
  && largeLedger.sixDigits==='999999' && largeLedger.milk==='123456789 份'
  && largeLedger.milkExact==='' && largeLedger.nursery.startsWith('1001234 份 / ')
  && largeLedger.freight.includes('小麦 1001234'),
'Only overview values are abbreviated; the expanded ledger and freight list keep exact counts');
assert.match(run('timeText()'), /早晨 07:55/);
run('farm.phase = .75; updateUI(); render()');
assert.ok(painted.every(([x, y]) => x < run('WORLD_W') + 52 && y < run('WORLD_H') + 80), 'Region art stays in world coordinates');
assert.match(run('timeText()'), /凌晨 00:00/);
assert.equal(run('farm.day'), 1, 'Midnight stays in the same farm day');
assert.ok(colors.includes('rgba(29,43,82,0.66)'), 'Midnight is dark');
colors.length = 0;
run('farm.phase = .98; render()');
assert.ok(colors.includes('rgba(29,43,82,0.13)'), 'The scene brightens before sunrise');
assert.equal(run('farm.nightLogged'), false);
const depthAudit = run(`(() => {
  const originalState = JSON.parse(JSON.stringify(farm)), originalRuntime = JSON.parse(JSON.stringify(captureRuntimeState()));
  try {
    const state = newFarm(); state.day = 13; state.phase = .3; state.upgrades = 6;
    state.goatBarnOpen = true; state.nursery.level = 3; state.view = {x:1400,y:1200,zoom:1};
    replaceFarmState(state);
    const actor = workers.find(w => w.name === '阿青'); actor.task = null;
    const ids = () => farmSceneItems().map(item => item.id);
    const before = (order,a,b) => order.indexOf(a)>=0 && order.indexOf(b)>=0 && order.indexOf(a)<order.indexOf(b);
    const buildings = farmSceneItems().filter(item => ['farm-house','coop-building','cow-barn','greenhouse',
      'forest-cabin','courier-cottage','sheep-barn','goat-barn','valley-worker-home','valley-windmill',
      'fishing-hut','nursery-home','mine-home','mine-cave','mine-rest-shelter','tea-house','valley-lookout',
      'plaza-stage','plaza-well','east-windmill','cat-house'].includes(item.id) || item.id.startsWith('village-home:'));
    const scenery = [...buildings,...farmSceneItems().filter(item => item.id.startsWith('tree:')
      || item.id.startsWith('pine:') || item.id.startsWith('perch-tree:'))];
    const errors = [];
    for (const item of scenery) {
      actor.x = 816; actor.y = item.y - 32;
      if(!before(ids(),'worker:阿青',item.id)) errors.push(item.id+':behind');
      actor.y = item.y + 10;
      if(!before(ids(),item.id,'worker:阿青')) errors.push(item.id+':front');
    }
    const fences = [];
    for (const [id,front] of [['cow-fence-front',17*T+28],['sheep-fence-front',SHEEP_LAYOUT.pen.bottom],
      ['goat-fence-front',GOAT_LAYOUT.pen.bottom+3]]) {
      for (const visitor of [actor,courier,orderKeeper,miner]) {
        const name = visitor===actor?'worker:阿青':visitor===courier?'courier':visitor===orderKeeper?'order-keeper':'miner';
        visitor.y=front-32; visitor.x=795; miner.mode='rest';
        const back=before(ids(),name,id);
        visitor.y=front+10; const ahead=before(ids(),id,name);
        fences.push(back&&ahead);
      }
    }
    orderKeeper.x=eastGardenBedPoint(0).x;orderKeeper.y=MARKET_LAYOUT.garden.entrance.y;
    const garden=ids();
    const gardenLayers=before(garden,'east-garden-plant:0','order-keeper')
      && before(garden,'order-keeper','east-garden-plant:14');
    const pier=ids();
    const fishing=before(pier,'pier-back','angler-fishing')&&before(pier,'angler-fishing','pier-front');
    const groundOwl=ids();const firstPerch=RIDGE_OWL_PERCHES[0];
    const owlBranch=before(groundOwl,'owl-home-branch','ridge-owl');
    ridgeOwl.perchIndex=3;ridgeOwl.flying=false;
    const owlTree=before(ids(),'perch-tree:spruce','ridge-owl');
    farm.day=20;farm.phase=.3;
    const festival=ids();
    const canopy=before(festival,'plaza-well','festival-canopy')&&before(festival,'plaza-stage','festival-canopy')
      && before(festival,'festival-canopy','festival-pole:704');
    const site=PLAZA_PET_LAYOUT.birdSites.findIndex(site=>site.kind==='well');
    Object.assign(plazaSparrows[0],PLAZA_PET_LAYOUT.birdSites[site],{site,mode:'perch'});
    const sparrow=before(ids(),'plaza-well','plaza-sparrow:0');
    const backRails = farmSceneItems().filter(item => item.id.startsWith('cow-rail:') || item.id==='goat-rail-back');
    const railRects=[], fill=ctx.fillRect;
    try {ctx.fillRect=(x,y,w,h)=>railRects.push({x,y,w,h});backRails.forEach(item=>item.draw());}
    finally{ctx.fillRect=fill;}
    const doorwayClear=!railRects.some(rect=>(rect.y<300 && rect.x<=802 && rect.x+rect.w>802)
      || (rect.y>1300 && rect.x<=1130 && rect.x+rect.w>1130));
    const stable = JSON.stringify({state:JSON.parse(JSON.stringify(farm)),runtime:captureRuntimeState()});
    render(); renderCompleteFarmCanvas();
    const pure=stable===JSON.stringify({state:JSON.parse(JSON.stringify(farm)),runtime:captureRuntimeState()});
    const unique = ids().length===new Set(ids()).size;
    let recovered=false;
    try{collectSceneItems(()=>{throw new Error('depth-test')})}catch{recovered=sceneQueue===null}
    return {errors,sceneryCount:scenery.length,buildings:buildings.length,fences,gardenLayers,fishing,
      owlBranch,owlTree,canopy,sparrow,doorwayClear,pure,unique,recovered};
  } finally {replaceFarmState(originalState,originalRuntime);}
})()`);
assert.deepEqual(Array.from(depthAudit.errors), [], 'Every building and tree switches correctly across the sole-depth line');
assert.ok(depthAudit.buildings >= 20 && depthAudit.sceneryCount > 45, 'Depth audit includes all districts and the tree groves');
assert.ok(depthAudit.fences.every(Boolean), 'Workers, courier, garden keeper and miner cross all three front fences correctly');
for(const field of ['gardenLayers','fishing','owlBranch','owlTree','canopy','sparrow','doorwayClear','pure','unique','recovered'])
  assert.ok(depthAudit[field], 'Rendering regression: '+field);


run('farm.phase = .57; farm.paused = false; tick(50)');
assert.equal(run('farm.day'), 1, 'The clock does not jump to a new day at dusk');
run('farm.phase = .4; last = 0; tick(50)');
const daytimeStep = run('farm.phase - .4');
run('farm.phase = .7; last = 0; tick(50)');
const nighttimeStep = run('farm.phase - .7');
assert.ok(nighttimeStep > daytimeStep * 2, 'Night clock runs faster while staying continuous');
const pausedPositions = ['foxPosition()', 'villagerPosition()', 'pondDuckPosition()', 'anglerPosition()',
  '({x:cows[0].x,y:cows[0].y})', '({x:lakeDucks[0].x,y:lakeDucks[0].y})',
  '({x:ridgeDeer.x,y:ridgeDeer.y})'].map(expression => JSON.stringify(run(expression)));
const stoppedMotionClock = run('motionNow');
const stoppedRiverCurrent = JSON.stringify(run('riverCurrentMarks()'));
const idleBefore = run('pausePulse(0)');
run('farm.paused=true;tick(last+65);tick(last+65)');
assert.equal(run('motionNow'), stoppedMotionClock, 'Travel time freezes while paused');
assert.equal(JSON.stringify(run('riverCurrentMarks()')), stoppedRiverCurrent, 'River current freezes while paused');
assert.notEqual(run('pausePulse(0)'), idleBefore, 'Local idle animation continues while paused');
assert.deepEqual(['foxPosition()', 'villagerPosition()', 'pondDuckPosition()', 'anglerPosition()',
  '({x:cows[0].x,y:cows[0].y})', '({x:lakeDucks[0].x,y:lakeDucks[0].y})',
  '({x:ridgeDeer.x,y:ridgeDeer.y})'].map(expression => JSON.stringify(run(expression))), pausedPositions,
  'People and animals hold their world positions while paused');
const pausedWeatherMotion = run(`(() => {
  const saved = { now, last, phase:farm.phase, paused:farm.paused,
    weather:farm.weather, weatherFrom:farm.weatherFrom, motionNow };
  const moveTo = ctx.moveTo, fillRect = ctx.fillRect, gradient = ctx.createRadialGradient;
  const drops = [], flakes = [], clouds = [];
  ctx.moveTo = (x,y) => { drops.push([x,y]); moveTo.call(ctx,x,y); };
  ctx.createRadialGradient = (...args) => { clouds.push(args[0]); return gradient.apply(ctx,args); };
  ctx.fillRect = (x,y,w,h) => {
    if (ctx.fillStyle === '#fff9e9' || ctx.fillStyle === '#eaf2ed') flakes.push([x,y]);
    fillRect.call(ctx,x,y,w,h);
  };
  try {
    farm.paused=true; farm.phase=.3; farm.weather='rain'; farm.weatherFrom='rain';
    weatherAndLight(); const rainBefore=drops[0];
    tick(last+65); drops.length=0; weatherAndLight(); const rainAfter=drops[0];
    const frozen=motionNow===saved.motionNow && farm.phase===.3 && weatherVisual().rain===1;
    farm.weather='snow'; farm.weatherFrom='snow';
    flakes.length=0; weatherAndLight(); const snowBefore=flakes[0];
    tick(last+65); flakes.length=0; weatherAndLight(); const snowAfter=flakes[0];
    farm.weather='cloud'; farm.weatherFrom='cloud';
    clouds.length=0; weatherAndLight(); const cloudBefore=clouds[0];
    tick(last+65); clouds.length=0; weatherAndLight(); const cloudAfter=clouds[0];
    return {rainMoved:JSON.stringify(rainBefore)!==JSON.stringify(rainAfter),
      snowMoved:JSON.stringify(snowBefore)!==JSON.stringify(snowAfter),
      cloudMoved:cloudBefore!==cloudAfter, frozen};
  } finally {
    ctx.moveTo=moveTo;ctx.fillRect=fillRect;ctx.createRadialGradient=gradient;
    now=saved.now;last=saved.last;motionNow=saved.motionNow;
    farm.phase=saved.phase;farm.paused=saved.paused;
    farm.weather=saved.weather;farm.weatherFrom=saved.weatherFrom;
  }
})()`);
assert.ok(Object.values(pausedWeatherMotion).every(Boolean),
  'Clouds, rain and snow move during pause while weather intensity, farm time and actor time stay fixed');
run('farm.paused=false');
run('farm.phase = .98; nextDay()');
assert.equal(run('farm.day'), 2);
assert.equal(run('farm.phase'), 0);
assert.equal(run('farm.eggsReady'), true);
assert.equal(run('farm.weatherFrom'), 'sunny', 'A new day remembers the previous weather');

run("farm.weatherFrom='rain';farm.weather='sunny';farm.phase=0");
assert.equal(run('weatherVisual().rain'), 1, 'Rain persists at the instant the forecast changes');
run('farm.phase=.075');
assert.ok(Math.abs(run('weatherVisual().rain')-.5)<.01, 'Rain fades gradually through the morning');
colors.length = 0;
run('render()');
assert.ok(colors.includes('rgba(80,100,119,0.045)'), 'The rain overlay uses intermediate opacity');
run('farm.phase=.15');
assert.equal(run('weatherVisual().rain'), 0, 'Rain has fully cleared after the transition');
run("farm.weatherFrom='sunny';farm.weather='sunny'");
assert.equal(run("chooseWeather(3,.1)"), 'snow', 'Winter mornings can bring actual snowfall');
assert.equal(run("chooseWeather(3,.36)"), 'rain', 'Winter still has other weather');
assert.ok(run("[0,1,2].every(season=>chooseWeather(season,.1)!=='snow')"), 'Snow is selected only in winter');
run("farm.day=26;farm.phase=.075;farm.weatherFrom='sunny';farm.weather='snow'");
assert.ok(Math.abs(run('weatherVisual().snow')-.5)<.01, 'Snow eases in through the morning');
assert.equal(run('weatherVisual().rain'), 0, 'Snow is distinct from rain');
colors.length=0;run('updateUI();render()');
assert.ok(colors.includes('#fff9e9') || colors.includes('#eaf2ed'), 'Snowfall paints visible flakes');
assert.match(run('ui.weather.textContent'), /晴朗转飘雪|飘雪/, 'The weather panel identifies snowfall');
run("farm.day=2;farm.phase=0;farm.weatherFrom='sunny';farm.weather='sunny'");

run('farm.day=8;farm.phase=.9999');
const springToSummerBefore = run('seasonTransition().palette.grass');
run('farm.day=9;farm.phase=0');
const springToSummerAfter = run('seasonTransition().palette.grass');
assert.equal(springToSummerBefore, springToSummerAfter, 'Season color does not jump at the calendar boundary');
assert.ok(run('seasonTransition().amount') > .45 && run('seasonTransition().amount') < .55, 'Calendar boundary falls in the middle of the visual transition');
run('farm.day=32;farm.phase=.99');
assert.ok(run('seasonTransition().winter') > .45 && run('seasonTransition().winter') < .55, 'Winter snow fades through the turn of the year');
run('farm.day=2;farm.phase=0');

const edgeStep = run(`(() => {
  const at = (x,y) => groundCells[(y/GROUND_STEP)*groundColumns+x/GROUND_STEP];
  return [Math.abs(at(944,400).east-at(960,400).east),Math.abs(at(496,624).south-at(496,640).south)];
})()`);
assert.ok(edgeStep.every(step => step < .35), 'Biome colors blend across the former rectangular borders');
assert.ok(run('groundCells[(832/GROUND_STEP)*groundColumns+1104/GROUND_STEP].village') < .01,
  'The ground between sheep and river keeps the sheep meadow palette');
assert.ok(run('groundCells[(832/GROUND_STEP)*groundColumns+1504/GROUND_STEP].village') > .99,
  'The east bank keeps the village palette');

const overlaps = (a, b) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
const riverCenter = run('riverCenterAt');
const touchesRiver = box => {
  for (let y = box.y1; y <= box.y2; y += 2) {
    const center = riverCenter(y);
    if (box.x1 < center + 38 && box.x2 > center - 36) return true;
  }
  return false;
};
const bridges = run('RIVER_BRIDGES');
const riverFlow = run(`(() => {
  const before=riverCurrentMarks(4), after=riverCurrentMarks(5);
  let movingSouth=0, insideWater=true;
  for(let i=0;i<before.length;i++) {
    const a=before[i],b=after[i];
    if(a.y>=0 && a.y<WORLD_H-50 && b.y>a.y) movingSouth++;
    if(a.y>=0 && a.y<WORLD_H-12)
      insideWater&&=riverAt(a.x-5,a.y+4) && riverAt(a.x+5,a.y+8);
  }
  return {movingSouth,insideWater,total:before.length};
})()`);
assert.ok(riverFlow.movingSouth >= 45, 'Most surface ripples travel from north to south each second');
assert.equal(riverFlow.insideWater, true, 'Moving ripples remain in the water channel');
assert.equal(riverFlow.total, 58, 'The current has broad and fine ripple layers');
const riverPaintOrder = run(`(() => {
  const originalCurrent=drawRiverCurrent,originalBridge=drawRiverBridge,order=[];
  drawRiverCurrent=()=>{order.push('current');originalCurrent()};
  drawRiverBridge=bridge=>{order.push('bridge');originalBridge(bridge)};
  try{drawRegionGround();drawRegionPaths();return order}
  finally{drawRiverCurrent=originalCurrent;drawRiverBridge=originalBridge}
})()`);
assert.equal(riverPaintOrder.join(','), ['current', ...bridges.map(() => 'bridge')].join(','),
  'The current passes underneath every bridge');
for (const bridge of bridges) {
  for (let y = bridge.y - 4; y <= bridge.y + bridge.height + 4; y += 2) {
    const center = riverCenter(y);
    assert.ok(bridge.west < center - 36 && bridge.east > center + 38, `Bridge at ${bridge.y} reaches both riverbanks`);
  }
  assert.ok(bridge.westRoad <= bridge.west && bridge.eastRoad >= bridge.east, 'Roads join both ends of each bridge');
}
const roadBoxes = [
  { x1: 604, y1: 600, x2: 638, y2: run('SOUTH_VALLEY_ROAD_END') },
  { x1: 1220, y1: 311, x2: 1252, y2: 1209 },
  ...bridges.flatMap(b => [
    { x1: b.westRoad, y1: b.y, x2: b.west, y2: b.y + b.height },
    { x1: b.east, y1: b.y, x2: b.eastRoad, y2: b.y + b.height }
  ])
];
assert.ok(roadBoxes.every(box => !touchesRiver(box)), 'Roads reach the bridges without painting over the river');
assert.ok(run(`CENTRAL_PLAZA.left - 638 === 1220 - CENTRAL_PLAZA.right
  && CENTRAL_PLAZA.top > FOREST_TREE_SITES.at(-1)[1] + 24 && CENTRAL_PLAZA.bottom <= 1005 - 30`),
  'The widened central plaza has balanced road margins and clears the moved tree');
assert.ok(run(`SCENIC_PATHS.every(path => valleyTrees.every(([x,y]) =>
  !(path.x < x+30 && path.x+path.w > x-29 && path.y < y+25 && path.y+path.h > y-48)))`),
  'The new walking paths clear the southern tree crowns');
assert.ok(run(`(() => {
  const lower = SCENIC_PATHS.at(-1);
  return SOUTH_VALLEY_ROAD_END >= lower.y + 16
    && lower.x === 604 && lower.h === RIVER_BRIDGES[2].height
    && VALLEY_GARDEN_LAYOUT.teaHouse.top - (lower.y + lower.h) >= 48
    && VALLEY_GARDEN_LAYOUT.lookout.top - (lower.y + lower.h) >= 48
    && WORLD_H - VALLEY_GARDEN_LAYOUT.teaHouse.bottom >= 64;
})()`), 'The valley road matches the main width, joins without a gap, and leaves room around the moved scenery');
assert.ok(run(`(() => {
  const tree = valleyTrees.find(([, , seed]) => seed === 85);
  return tree[0] + 30 + 32 <= VALLEY_GARDEN_LAYOUT.lookout.left
    && tree[1] + 27 <= WORLD_H;
})()`), 'The tree beside the lookout moves west with a full crown-width clearance');
const roadJoinPaint = [];
const previousRoadFill = context2d.fillRect;
context2d.fillRect = function (x, y, w, h) {
  roadJoinPaint.push({ x, y, w, h, color: this.fillStyle });
};
try { run('drawRegionPaths()'); }
finally { context2d.fillRect = previousRoadFill; }
const roadJoinColorAt = (x, y) => roadJoinPaint.findLast(paint =>
  x >= paint.x && x < paint.x + paint.w && y >= paint.y && y < paint.y + paint.h)?.color;
for (const y of [1003, 1005, 1038, 1040, 1189, 1191, 1222, 1224, 1680, 1683, 1703, 1713])
  assert.equal(roadJoinColorAt(620, y), '#d0b586', `No visible cross-strip remains on the valley road at y=${y}`);
const fixtures = {
  cowBarn: { x1: 701, y1: 74, x2: 934, y2: 272 },
  forestCabin: { x1: 1021, y1: 132, x2: 1188, y2: 257 },
  firstHome: { x1: 1450, y1: 683, x2: 1567, y2: 786 },
  middleHome: { x1: 1640, y1: 683, x2: 1757, y2: 786 },
  lastHome: { x1: 1830, y1: 683, x2: 1947, y2: 786 },
  firstStall: { x1: 1530, y1: 844, x2: 1648, y2: 917 },
  secondStall: { x1: 1820, y1: 844, x2: 1938, y2: 917 },
  eastGarden: { x1: 1480, y1: 1086, x2: 1900, y2: 1153 },
  eastFountain: { x1: 1674, y1: 847, x2: 1752, y2: 925 },
  eastNotice: { x1: 1450, y1: 843, x2: 1495, y2: 916 },
  eastPlaza: { x1: 1432, y1: 730, x2: 2016, y2: 962 },
  fishingHut: { x1: 455, y1: 899, x2: 536, y2: 989 },
  greenhouse: { x1: 525, y1: 92, x2: 674, y2: 242 },
  windmill: { x1: 942, y1: 140, x2: 1010, y2: 220 },
  sheepBarn: { x1: 749, y1: 1306, x2: 869, y2: 1379 },
  sheepPen: { x1: 704, y1: 1360, x2: 948, y2: 1585 },
  goatBarn: { x1: 1018, y1: 1310, x2: 1156, y2: 1405 },
  goatPen: { x1: 990, y1: 1394, x2: 1180, y2: 1570 },
  teaHouse: { x1: 806, y1: 1767, x2: 922, y2: 1839 },
  lookout: { x1: 1100, y1: 1767, x2: 1228, y2: 1828 }
};
for (const name of ['firstHome', 'middleHome', 'lastHome', 'firstStall', 'secondStall',
  'eastGarden', 'eastFountain', 'eastNotice', 'eastPlaza']) {
  assert.ok(!touchesRiver(fixtures[name]), `${name} stays on the east bank`);
}
assert.ok(run(`(() => {
  for (let time = 0; time < 100; time++) {
    now = time;
    const visitor = villagerPosition();
    if (visitor.x <= riverCenterAt(visitor.y) + 38 || visitor.x < MARKET_LAYOUT.district.left
      || visitor.x >= MARKET_LAYOUT.district.right) return false;
  }
  now = 0;
  return true;
})()`), 'Village visitors remain in the east-bank plaza');
assert.ok(!overlaps(fixtures.greenhouse, fixtures.windmill), 'Windmill clears the greenhouse');
assert.ok(fixtures.windmill.x1 - fixtures.cowBarn.x2 >= 8, 'Windmill blades clear the cow barn and silo');
assert.ok(fixtures.forestCabin.x1 - fixtures.windmill.x2 >= 8, 'Windmill blades clear the forest cabin');
assert.ok(roadBoxes.every(box => !overlaps(box, fixtures.windmill)), 'Windmill clears the roads');
assert.equal(run('EAST_WINDMILL.bounds.left'), fixtures.windmill.x1, 'Windmill hit bounds follow its artwork');
assert.equal(run('EAST_WINDMILL.bounds.right'), fixtures.windmill.x2, 'Windmill hit bounds follow its artwork');
assert.ok(roadBoxes.every(box => !overlaps(box, fixtures.sheepPen)), 'Roads route around the sheep pen');
for (const name of ['goatBarn', 'goatPen']) {
  assert.ok(!touchesRiver(fixtures[name]), `${name} clears the river`);
  assert.ok(roadBoxes.every(box => !overlaps(box, fixtures[name])), `${name} clears the roads`);
  assert.ok(!overlaps(fixtures.sheepPen, fixtures[name]), `${name} clears the sheep pen`);
}
for (const [x, y] of [...run('regionTrees'), ...run('valleyTrees'), ...run('orchardTrees')]) {
  const crown = { x1: x - 29, y1: y - 48, x2: x + 30, y2: y + 27 };
  assert.ok(!touchesRiver(crown), `Tree at ${x},${y} stays on land`);
  assert.ok(roadBoxes.every(box => !overlaps(box, crown)), `Tree at ${x},${y} clears the roads`);
  assert.ok(!overlaps(fixtures.fishingHut, crown), `Tree at ${x},${y} clears the fishing hut`);
  for (const name of ['forestCabin', 'firstHome', 'middleHome', 'lastHome', 'greenhouse', 'windmill', 'sheepBarn', 'goatBarn', 'goatPen', 'teaHouse', 'lookout']) {
    assert.ok(!overlaps(fixtures[name], crown), `Tree at ${x},${y} clears ${name}`);
  }
}
for (const left of ['eastFountain', 'eastNotice']) for (const right of ['firstStall', 'secondStall']) {
  assert.ok(!overlaps(fixtures[left], fixtures[right]), `${left} and ${right} have separate space`);
}
assert.ok(!overlaps(fixtures.firstStall, fixtures.secondStall), 'The two stalls have separate space');
assert.ok(run('MARKET_LAYOUT.district.bottom + T <= RIVER_BRIDGES[1].y - 6'), 'A full grass tile separates the plaza from the road edge');
assert.ok(run('MARKET_LAYOUT.garden.bottom + T <= RIVER_BRIDGES[2].y - 6'), 'A full grass tile separates the garden from the road edge');
const hiveSites = run('HIVE_SITES');
for (const hive of hiveSites) {
  const box = { x1: hive.x - 12, y1: hive.y, x2: hive.x + 12, y2: hive.y + 29 };
  assert.ok(!overlaps(box, { x1: 192, y1: 256, x2: 224, y2: 608 }), 'Beehives clear the main vertical road');
  assert.ok(box.y2 + 32 <= 576, 'Beehives have a grass tile before the orchard road');
}
assert.ok(run('farm.forage.every(site => !riverAt(site.x, site.y, 18) && !bridgeAt(site.x, site.y))'), 'Forage sprites clear the river and bridges');
assert.ok(run(`(() => {
  const oldDay = farm.day, oldSpawnDay = farm.forageSpawnDay, oldSites = farm.forage;
  let valid = true;
  for (let day = 1; day <= 48; day++) {
    farm.day = day; farm.forageSpawnDay = 0; spawnForageForDay();
    valid &&= farm.forage.length >= 7 && farm.forage.length <= 11;
    valid &&= farm.forage.every(site => !riverAt(site.x, site.y, 18) && !bridgeAt(site.x, site.y)
      && !(site.x > 1202 && site.x < 1268 && site.y > 300 && site.y < 1232)
      && !(site.x > 397 && site.x < 524 && site.y > 1214));
  }
  farm.day = oldDay; farm.forageSpawnDay = oldSpawnDay; farm.forage = oldSites;
  return valid;
})()`), 'Daily forage avoids roads, river and planted garden');
assert.ok(!touchesRiver(fixtures.eastGarden), 'Community garden is on the east bank');
const villagePaintStart = painted.length;
run('drawVillage()');
assert.ok(painted.slice(villagePaintStart).every(([x]) => x >= fixtures.eastPlaza.x1),
  'Village buildings are drawn only on the east bank');
assert.ok(run(`(() => {
  for (let y = 256; y < 288; y += 2) for (let x = 192; x < 224; x += 2) {
    if (((x - 134) / 84) ** 2 + ((y - 190) / 80) ** 2 < 1.09) return false;
  }
  return true;
})()`), 'Main pond does not paint underneath the orchard road');
const riverSample = { x: Math.round(riverCenter(900)), y: 900 };
let riverSampleColor = null;
const previousFillRect = context2d.fillRect;
context2d.fillRect = function (x, y, width, height) {
  if (x <= riverSample.x && x + width > riverSample.x && y <= riverSample.y && y + height > riverSample.y) {
    riverSampleColor = this.fillStyle;
  }
  return previousFillRect.call(this, x, y, width, height);
};
run('drawRegionGround();drawRegionPaths();drawVillage()');
context2d.fillRect = previousFillRect;
assert.ok(['#64a2aa', '#a7d1c5'].includes(riverSampleColor), 'The village scenery leaves the right river visible');
painted.length = 0;
run('(()=>{const phase=farm.phase;farm.phase=.8;try{drawVillage();drawRegionNight(1)}finally{farm.phase=phase}})()');
for (const home of run('MARKET_LAYOUT.homes')) {
  assert.ok(painted.some(([x, y]) => x === home.x + 22 && y === home.y + 70),
    'Each moved village window receives its own night light');
}
for (const lamp of run('MARKET_LAYOUT.lamps')) {
  assert.ok(painted.some(([x, y]) => x === lamp.x - 4 && y === lamp.y - 6),
    'The village lamp glow follows its visible post');
}
const nightColorStart = colors.length;
run('drawRegionNight(1)');
assert.ok(colors.slice(nightColorStart).every(color => typeof color === 'object'),
  'Regional light overlays draw only soft gradients, never opaque windows or posts');

assert.equal(run('WORLD_W'), 2560);
assert.equal(run('WORLD_H'), 1920);
assert.equal(run('W'), 1152);
assert.equal(run('H'), 816);
run('setZoom(.7); centerCamera(WORLD_W, WORLD_H)');
assert.ok(run('farm.view.x >= 0 && farm.view.y >= 0'), 'Zoomed-out camera stays inside the world');
assert.ok(run('farm.view.x + W / farm.view.zoom <= WORLD_W + .01 && farm.view.y + H / farm.view.zoom <= WORLD_H + .01'), 'Zoomed-out viewport fits the world');
run('setZoom(1); centerCamera(480, 320)');
run('centerCamera(1300, 600)');
assert.ok(run('farm.view.x') > 0, 'Mini-map can move the viewport east');
run('centerCamera(WORLD_W, 900)');
assert.ok(Math.abs(run('farm.view.x + W - WORLD_W')) < .01, 'The camera reaches the expanded eastern edge');
run('centerCamera(1300, 600)');
const focus = run('screenToWorld(480, 528)');
run('setZoom(1.4, 480, 528)');
assert.ok(Math.abs(run('screenToWorld(480, 528).x') - focus.x) < 1, 'Zoom keeps its focus point');
run('centerCamera(480, 320); setZoom(1)');

for (const [x, y, kind] of [
  [195, 1220, 'valley-lake'], [100, 400, 'orchard'], [100, 200, 'pond'],
  [100, 595, 'shipping-stall'], [255, 700, 'carrier-cottage'], [242, 929, 'south-lake'], [470, 934, 'fishing-hut'],
  [340, 964, 'rowboat'], [400, 919, 'lake-dock'], [976, 196, 'east-windmill'],
  [1100, 200, 'forest-cabin'], [832, 1087, 'valley-windmill'],
  [715, 1100, 'valley-worker-home'], [963, 1100, 'valley-chair'],
  [1033, 1097, 'valley-herbs'], [860, 1802, 'valley-tea-house'],
  [1160, 1802, 'valley-lookout'], [1040, 1250, 'valley'],
  [450, 1250, 'valley-garden'], [1600, 1100, 'east-garden'],
  [1713, 886, 'fountain'], [1250, 310, 'bridge'], [205, 75, 'coop'],
  [400, 180, 'house'], [800, 180, 'barn'], [900, 550, 'cow-pasture'],
  [1470, 750, 'courier-village-home'], [1700, 750, 'village-walker-home'], [1470, 870, 'notice-board'],
  [1870, 950, 'market-receiving'], [1190, 950, 'village-west'], [1100, 1200, 'village-west-south'],
  [1100, 790, 'central-plaza'], [1060, 940, 'central-plaza'],
  [935, 728, 'central-stage'], [1076, 688, 'central-well'],
  [788, 934, 'central-bench'], [710, 687, 'central-flowers'],
  [1980, 777, 'market-lamp'], [1980, 892, 'market-lamp'], [1442, 932, 'market-lamp'],
  [800, 1380, 'future-pasture'],
  [400, 835, 'meadow'], [100, 1100, 'southwest-meadow'], [1100, 510, 'forest'],
  [10, 400, 'main-farm']
]) {
  assert.equal(run(`landmarkAt(${x},${y})`), kind, `${kind} tooltip occupies the correct place`);
  assert.ok(run(`describe(${x},${y})?.text`), `${kind} has a description`);
}
assert.equal(run(`landmarkAt(riverCenterAt(900),900)`), 'river');
painted.length = 0;
run('drawMeadowScenery()');
assert.equal(painted.length, 0, 'The goat building site has no stakes or timber before the sheep pasture opens');
assert.doesNotMatch(run('describe(1100,790).text'), /山羊舍|1500/, 'The initial empty grass has no premature goat barn hint');
assert.equal(run('landmarkAt(600,150)'), 'main-farm', 'Unbuilt greenhouse has no building hint');
for (const [x, y, kind] of [[242,775,'meadow'],[195,1148,'southwest-meadow'],[100,750,'meadow'],[100,840,'meadow']]) {
  assert.equal(run(`landmarkAt(${x},${y})`), kind, 'Region hint stops at its drawn boundary');
}
assert.match(run('describe(195,1220).text'), /西南小湖/, 'The lower-left lake is described as a lake');
assert.match(run('describe(860,1802).text'), /南谷茶亭/, 'The southern tea house has a local hint');
assert.match(run('describe(1160,1802).text'), /临河观景台/, 'The river lookout has a local hint');
assert.ok(run(`(() => {
  const layout = VALLEY_GARDEN_LAYOUT;
  const places = [layout.herbs, layout.teaHouse, layout.lookout];
  return places.every(place => {
    if (place.left < 0 || place.top < 0 || place.right > WORLD_W || place.bottom > WORLD_H) return false;
    for (let y = place.top; y < place.bottom; y += 8) for (let x = place.left; x < place.right; x += 8) {
      if (riverAt(x, y, 24) || bridgeAt(x, y)) return false;
    }
    return true;
  }) && layout.herbs.left > 978 && layout.teaHouse.right < 930 && layout.lookout.top >= 1222 + 32;
})()`), 'New valley landmarks clear the river, bridge, tree crowns, and lower road');
assert.notEqual(run('landmarkAt(35,480)'), 'beehive', 'The hive hint is hidden before construction');
run('farm.upgrades=2');
assert.equal(run('landmarkAt(35,480)'), 'beehive');
assert.match(run('describe(35,480).text'), /蜂箱.*每两天/, 'The beehive shows its own hover hint');
run('centerCamera(35,480)');
const hiveScreen = run('({x:(35-farm.view.x)*farm.view.zoom,y:(480-farm.view.y)*farm.view.zoom})');
element('farm-map').listeners.pointermove({ clientX: hiveScreen.x, clientY: hiveScreen.y });
assert.match(element('map-tooltip').textContent, /蜂箱/, 'Pointer hover reaches the painted beehive');
run('centerCamera(480,320);farm.upgrades=0');
assert.match(run('describe(100,400).text'), /果园/, 'The orchard is still described as an orchard');
assert.doesNotMatch(run('describe(100,900).text'), /果园|货摊/, 'Broad orchard and stall hints no longer leak south');
assert.match(run('describe(workers[0].x,workers[0].y).text'), /阿满/, 'A visible worker has a worker hint');
const workerScreen = run('({x:(workers[0].x-farm.view.x)*farm.view.zoom,y:(workers[0].y-farm.view.y)*farm.view.zoom})');
element('farm-map').listeners.pointermove({ clientX: workerScreen.x, clientY: workerScreen.y });
assert.match(element('map-tooltip').textContent, /阿满.*田地、鸡蛋、牛奶/, 'Hover reveals the worker name and shared role');
element('farm-map').listeners.click({ clientX: workerScreen.x, clientY: workerScreen.y });
assert.match(run('farm.events[0].text'), /阿满向你挥手/, 'Clicking a worker gets a personal reply');
assert.ok(run('workers[0].waveUntil > now'), 'A greeting briefly animates the worker');
assert.ok(run(`(() => {
  const worker = workers[0], old = { x: worker.x, y: worker.y }, plot = farm.plots[0];
  worker.x = (plot.x + .5) * T; worker.y = (plot.y + .5) * T;
  const inspectText = describe(worker.x, worker.y).text;
  tool = 'water'; const fieldText = describe(worker.x, worker.y).text;
  tool = 'inspect'; worker.x = old.x; worker.y = old.y;
  return inspectText.includes('阿满') && fieldText.includes(crops[plot.crop].name);
})()`), 'Inspect mode names the worker over a field while farming tools target the field');
for (const [point, label] of [['foxPosition()', '狐狸'], ['villagerPosition()', '阿宁'],
  ['pondDuckPosition()', '池塘小鸭'], ['anglerPosition()', '阿蓼']]) {
  assert.match(run(`describe(${point}.x,${point}.y).text`), new RegExp(label), `${label} hint follows the moving sprite`);
}
run('farm.phase=.8');
run('for(let i=0;i<260;i++)updateForestFox(.05)');
assert.equal(run('foxAt(foxPosition().x,foxPosition().y)'), false, 'Fox walks home before its sleeping hint disappears');
run('for(let i=0;i<120;i++)updateVillageWalker(.05)');
assert.equal(run('villageWalkerAtHome()'), true, `阿宁 walks into the second village home at night: ${JSON.stringify(run('villageWalker'))}`);
assert.equal(run('villagerAt(villagerPosition().x,villagerPosition().y)'), false, 'Villager hint disappears after reaching home');
run('for(let i=0;i<80;i++)updateVillageNeighbours(.05)');
assert.equal(run('anglerAt(anglerPosition().x,anglerPosition().y)'), false, 'Angler hint disappears after reaching home at night');
run('farm.phase=0');
const villagePace = run(`(() => {
  const savedWalker=villageWalker, savedMotion=motionNow, savedPhase=farm.phase;
  villageWalker={...resetVillageWalker(),x:1600,y:812,dir:1};
  farm.phase=.25; updateVillageWalker(.1);
  const stroll=villageWalker.x-1600;
  villageWalker.x=1600; villageWalker.y=812; farm.phase=NIGHT_START+.01;
  updateVillageWalker(.1);
  const headingHome=villageWalker.x-1600;
  villageWalker=savedWalker; motionNow=savedMotion; farm.phase=savedPhase;
  return {stroll,headingHome};
})()`);
assert.ok(villagePace.stroll >= 5.19 && villagePace.stroll <= 5.21,
  '阿宁 walks steadily across the full two-house promenade');
assert.ok(villagePace.headingHome >= 4.39 && villagePace.headingHome <= 4.41,
  '阿宁 returns home at the original unaccelerated pace');
const villageWalk = run(`(() => {
  const oldMotion=motionNow;
  villageWalker=resetVillageWalker(); farm.phase=.25;
  let staysInLane=true,clearOfCourier=true,clearOfMarket=true,minX=Infinity,maxX=-Infinity;
  for(let i=0;i<480;i++) {
    motionNow+=.05; updateVillageWalker(.05);
    if(i<30) continue;
    const {x,y}=villageWalker;
    staysInLane&&=x>=VILLAGE_WALKER_LAYOUT.promenade.left-1
      && x<=VILLAGE_WALKER_LAYOUT.promenade.right+1 && y>=806 && y<=817;
    clearOfCourier&&=x+11<1785-28 && Math.hypot(x-1655,y-950)>50;
    clearOfMarket&&=y+20<MARKET_LAYOUT.fountain.y-39 && y+20<844;
    minX=Math.min(minX,x); maxX=Math.max(maxX,x);
  }
  const hint=describe(villageWalker.x,villageWalker.y).text;
  farm.phase=NIGHT_START+.01;
  updateVillageWalker(.05);
  const visibleOnWay=villagerAt(villageWalker.x,villageWalker.y);
  for(let i=0;i<160 && !villageWalkerAtHome();i++)updateVillageWalker(.05);
  const home={x:villageWalker.x,y:villageWalker.y,hidden:!villagerAt(villageWalker.x,villageWalker.y)};
  farm.phase=.05;
  for(let i=0;i<30;i++)updateVillageWalker(.05);
  const leftHome=!villageWalkerAtHome();
  motionNow=oldMotion;
  return {staysInLane,clearOfCourier,clearOfMarket,minX,maxX,hint,
    visibleOnWay,home,leftHome};
})()`);
assert.equal(villageWalk.staysInLane, true, '阿宁 strolls only in front of the two village homes');
assert.equal(villageWalk.clearOfCourier, true, '阿宁 clears both 阿运 forest lane and market cart stop');
assert.equal(villageWalk.clearOfMarket, true, '阿宁 clears the fountain and market awnings');
assert.ok(villageWalk.minX <= 1540 && villageWalk.maxX >= 1715,
  '阿宁 reaches both 阿运 and her own home fronts');
assert.match(villageWalk.hint, /阿宁.*阿运与阿宁的小屋前散步/);
assert.equal(villageWalk.visibleOnWay, true, '阿宁 stays visible while returning home');
assert.deepEqual([villageWalk.home.x,villageWalk.home.y], [1723,792]);
assert.equal(villageWalk.home.hidden, true, '阿宁 disappears indoors only after reaching the door');
assert.equal(villageWalk.leftHome, true, '阿宁 walks outside again the following morning');
assert.match(run('describe(1700,750).text'), /阿宁的小屋/);
assert.ok(run(`(() => {
  const archived=JSON.parse(JSON.stringify(captureRuntimeState()));
  validateRuntimeSnapshot(archived);
  return archived.villageWalker.x===villageWalker.x && archived.villageWalker.y===villageWalker.y;
})()`), '阿宁’s position travels with the full farm save');
run('villageWalker.x=1690;villageWalker.y=812;farm.phase=.25;centerCamera(1690,812)');
const villageScreen=run('({x:(villageWalker.x-farm.view.x)*farm.view.zoom+worldPadding().x,y:(villageWalker.y-farm.view.y)*farm.view.zoom+worldPadding().y})');
element('farm-map').listeners.pointermove({clientX:villageScreen.x,clientY:villageScreen.y});
assert.match(element('map-tooltip').textContent, /阿宁.*阿运与阿宁的小屋前散步/, 'The live pointer hint names 阿宁');
element('farm-map').listeners.click({clientX:villageScreen.x,clientY:villageScreen.y});
assert.match(run('farm.events[0].text'), /阿宁笑着向你挥手/, 'Clicking 阿宁 receives a greeting');
assert.ok(run('villageWalker.waveUntil>now'), '阿宁 raises a hand when greeted');
run('villageWalker=resetVillageWalker()');
run('centerCamera(195,1220)');
const lakeScreen = run('({x:(195-farm.view.x)*farm.view.zoom,y:(1220-farm.view.y)*farm.view.zoom})');
element('farm-map').listeners.pointermove({ clientX: lakeScreen.x, clientY: lakeScreen.y });
assert.match(element('map-tooltip').textContent, /西南小湖/, 'Pointer hover resolves the lower-left lake');
run('setZoom(1.4);centerCamera(195,1220)');
const zoomedLakeScreen = run('({x:(195-farm.view.x)*farm.view.zoom,y:(1220-farm.view.y)*farm.view.zoom})');
element('farm-map').listeners.pointermove({ clientX: zoomedLakeScreen.x, clientY: zoomedLakeScreen.y });
assert.match(element('map-tooltip').textContent, /西南小湖/, 'The lake hover stays aligned after zooming');
run('setZoom(1);centerCamera(480,320)');

element('mini-map').listeners.pointerdown({ clientX: 230, clientY: 130, pointerId: 1 });
assert.ok(run('farm.view.x') > 0, 'Clicking the mini-map repositions the main view');
element('mini-map').listeners.pointerup({ pointerId: 1 });
run('centerCamera(480, 320)');

const focusBefore = run('farm.orders[0].focus');
element('order-list').children[0].children[2].listeners.click();
assert.equal(run('farm.orders[0].focus'), !focusBefore, 'The order planting preference is interactive');
element('farm-map').listeners.click({ clientX: 205, clientY: 75 });
assert.equal(run('farm.chickenLove'), 1, 'Clicking the coop feeds the chickens');

function clickWorld(x, y) {
  run(`centerCamera(${x}, ${y})`);
  const screen = run(`({x:(${x}-farm.view.x)*farm.view.zoom,y:(${y}-farm.view.y)*farm.view.zoom})`);
  element('farm-map').listeners.click({ clientX: screen.x, clientY: screen.y });
}
assert.equal(run('farm.valleyHerbs.length'), 6, 'Six individual herb beds are ready from the first day');
assert.match(run('describe(1033,1097).text'), /薰衣草.*可以逐株采摘/, 'A ready herb has its own hint');
const coinsBeforeHerbs = run('farm.coins');
const herbTotalBefore = run('farm.herbTotal');
clickWorld(1033, 1097);
assert.equal(run('farm.coins'), coinsBeforeHerbs, 'A picked herb waits in the valley depot for delivery');
assert.equal(run('farm.depots.valley.lavender'), 1, 'The valley depot holds the lavender');
assert.equal(run('farm.herbTotal'), herbTotalBefore + 1);
assert.equal(run('valleyHerbProgress(farm.valleyHerbs[0])'), 0, 'The harvested herb returns to a seedling');
assert.equal(run('valleyHerbProgress(farm.valleyHerbs[1])'), 1, 'Adjacent herbs retain their growth');
clickWorld(1033, 1097);
assert.equal(run('farm.herbTotal'), herbTotalBefore + 1, 'A growing herb cannot be harvested twice');
run('farm.day+=2');
assert.equal(run('valleyHerbProgress(farm.valleyHerbs[0])'), 1, 'A picked herb regrows over farm time');
run('farm.day-=2');
run('centerCamera(1033,1097)');
const herbScreen = run('({x:(1033-farm.view.x)*farm.view.zoom,y:(1097-farm.view.y)*farm.view.zoom})');
element('farm-map').listeners.pointermove({ clientX: herbScreen.x, clientY: herbScreen.y });
assert.match(element('map-tooltip').textContent, /薰衣草.*生长中/, 'Herb hover follows the visible plant');
run('centerCamera(480,320)');
run("farm.weatherFrom='rain';farm.weather='rain'");
clickWorld(1087, 1097);
assert.ok(Math.abs(run('farm.valleyHerbs[1].readyAt-farm.valleyHerbs[1].pickedAt')-1.5)<.01,
  'Rain shortens the herb regrowth interval');
run("farm.weatherFrom='sunny';farm.weather='sunny'");
const herbDay = run('farm.day');
run('farm.day=27');
clickWorld(1141, 1097);
assert.ok(Math.abs(run('farm.valleyHerbs[2].readyAt-farm.valleyHerbs[2].pickedAt')-3)<.01,
  'Cold winter lengthens the herb regrowth interval');
run(`farm.day=${herbDay}`);
run('resetMeadowLife();farm.phase=.3');
assert.equal(run('goatAt(meadowGoats[0].x,meadowGoats[0].y)'), null, 'Goats are absent before the barn is built');
assert.doesNotMatch(run('describe(1100,790).text'), /山羊舍|1500/, 'The building site is not visible on the first day');
const hiddenGoatX = run('meadowGoats[0].x');
run('updateMeadowLife(.5)');
assert.equal(run('meadowGoats[0].x'), hiddenGoatX, 'Hidden goats do not wander before the unlock');
run('farm.goatBarnOpen=true');
assert.match(run('describe(meadowGoats[0].x,meadowGoats[0].y-15).text'), /山羊糯米/, 'Goat hover follows its sprite');
const goatBeforeMove = run('meadowGoats[0].x');
run('updateMeadowLife(.5)');
assert.ok(run('meadowGoats[0].x') > goatBeforeMove, 'Goats wander through their pasture');
clickWorld(run('meadowGoats[0].x'), run('meadowGoats[0].y-15'));
assert.ok(run('meadowGoats[0].excited') > 0, 'Clicking a goat makes it hop');
assert.match(run('farm.events[0].text'), /糯米/);
assert.ok(run(`(() => {
  for (let i = 0; i < 400; i++) {
    updateMeadowLife(.5);
    if (meadowGoats.some(goat => goat.x < GOAT_LAYOUT.pen.left + 24 || goat.x > GOAT_LAYOUT.pen.right - 24
      || goat.y < GOAT_LAYOUT.pen.top + 21 || goat.y > GOAT_LAYOUT.pen.bottom - 21)) return false;
  }
  return true;
})()`), 'Goats stay inside their paddock');
run("resetMeadowLife();farm.weatherFrom='rain';farm.weather='rain';updateMeadowLife(.1)");
assert.equal(run('meadowGoats[0].tx'), run('GOAT_LAYOUT.homes[0].x'), 'Goats return to shelter in heavy rain');
run("farm.weatherFrom='sunny';farm.weather='sunny';farm.phase=.8;updateMeadowLife(.1)");
assert.equal(run('meadowGoats[1].ty'), run('GOAT_LAYOUT.homes[1].y'), 'Goats return to shelter at night');
run('farm.phase=.3;resetMeadowLife()');
run('farm.goatBarnOpen=false');
const pondDuckPoint = run('pondDuckPosition()');
clickWorld(pondDuckPoint.x, pondDuckPoint.y);
assert.match(run('farm.events[0].text'), /池塘小鸭/, 'The pond duck click matches its hover hint');
const loveBeforeCoop = run('farm.chickenLove');
clickWorld(100, 70);
assert.equal(run('farm.chickenLove'), loveBeforeCoop + 1, 'The coop building follows the same click rule as its hover hint');
const mushroom = run("farm.forage.find(site=>site.kind==='mushroom' && Math.hypot(site.x-squirrel.x,site.y-squirrel.y)>35)");
const forageCount = run('farm.forage.length');
const coinBeforeForage = run('farm.coins');
clickWorld(mushroom.x, mushroom.y);
assert.equal(run('farm.coins'), coinBeforeForage, 'A picked mushroom waits for the village carrier');
assert.equal(run('farm.depots.forest.mushroom'), 1, 'Forest goods enter their own depot');
assert.equal(run('farm.forage.length'), forageCount - 1, 'The collected site disappears');
clickWorld(mushroom.x, mushroom.y);
assert.equal(run('farm.coins'), coinBeforeForage, 'The same mushroom cannot be collected twice');
const berry = run("farm.forage.find(site=>site.kind==='berry' && Math.hypot(site.x-squirrel.x,site.y-squirrel.y)>35)");
clickWorld(berry.x, berry.y);
assert.equal(run('farm.berries'), 1, 'Berries enter the basket');
const acornsBeforeGift = run("farm.forage.filter(site=>site.kind==='acorn').length");
const squirrelLocation = run('({x:squirrel.x,y:squirrel.y})');
clickWorld(squirrelLocation.x, squirrelLocation.y);
assert.equal(run('farm.berries'), 0, 'Feeding consumes one berry');
assert.equal(run('farm.squirrelTrust'), 1, 'Feeding grows squirrel trust');
run('farm.berries=2;feedSquirrel();feedSquirrel()');
assert.equal(run('farm.squirrelTrust'), 3);
assert.ok(run("farm.forage.some(site=>site.kind==='acorn')"), 'The squirrel reveals an acorn after three feeds');
element('ledger-toggle').click();
assert.equal(element('ledger-acorn-left').textContent, `${acornsBeforeGift + 1} 枚`, 'The ledger shows the unpicked gift');
run("collectForage(farm.forage.find(site=>site.id.includes('-gift-')))");
assert.equal(run('farm.acornPickedTotal'), 1, 'Picked acorns receive their own running total');
assert.equal(run('farm.mushroomPickedTotal'), 1, 'Mushrooms receive their own running total');
assert.equal(run('farm.berryPickedTotal'), 1, 'Gathered berries are counted even after feeding');
assert.equal(element('ledger-acorn-total').textContent, '1 枚', 'The expanded ledger reflects the collected acorn');
assert.equal(element('ledger-acorn-left').textContent, `${acornsBeforeGift} 枚`, 'The collected gift leaves the pending count');
run('squirrel.wait=0;squirrel.tx=squirrel.x+75;squirrel.ty=squirrel.y');
const squirrelBeforeMove = run('squirrel.x');
run('updateWildlife(.5)');
assert.ok(run('squirrel.x') > squirrelBeforeMove, 'The squirrel runs autonomously');

run('resetRidgeLife();farm.phase=.3');
const owlPerches = run('RIDGE_OWL_PERCHES');
assert.equal(owlPerches.length, 5, 'The owl has a pine and four spaced landing trees');
assert.equal(new Set(owlPerches.map(perch => perch.kind)).size, owlPerches.length, 'Each perch has its own tree form');
assert.ok(owlPerches.some(perch => perch.kind === 'elm' && perch.x < 1689), 'The green elm sits left of the hare clearing');
assert.ok(owlPerches.some(perch => perch.kind === 'spruce' && perch.x > 1821 && perch.y > 324), 'The spruce stays right of the hare clearing below the road');
assert.ok(owlPerches.some(perch => perch.kind === 'birch' && perch.x === 1560 && perch.y === 215
  && perch.x > riverCenter(perch.y) + 100 && perch.baseY + 8 < bridges[0].y), 'The birch stands east of the river and north of the upper road');
assert.ok(owlPerches.some(perch => perch.kind === 'maple' && perch.x === 1970 && perch.y === 200), 'The maple now occupies the former birch site');
for (let i = 0; i < owlPerches.length; i++) for (let j = i + 1; j < owlPerches.length; j++) {
  const a = owlPerches[i], b = owlPerches[j];
  assert.ok(Math.hypot(a.x - b.x, a.y - b.y) >= 150, `${a.name} and ${b.name} leave breathing room`);
}
for (const perch of owlPerches.slice(1)) {
  const crown = { x1: perch.x - 58, y1: perch.y - 118, x2: perch.x + 56, y2: perch.baseY + 8 };
  assert.ok(crown.x1 >= 0 && crown.x2 <= run('WORLD_W') && crown.y1 >= 0 && crown.y2 <= run('WORLD_H'), `${perch.name} stays on the map`);
  assert.ok(!touchesRiver(crown) && roadBoxes.every(box => !overlaps(box, crown)), `${perch.name} clears the river and road`);
  assert.ok(!overlaps(fixtures.middleHome, crown), `${perch.name} clears the village home`);
  for (const [x, y] of run('regionTrees')) {
    assert.ok(!overlaps(crown, { x1: x - 29, y1: y - 48, x2: x + 30, y2: y + 27 }), `${perch.name} leaves a gap from the existing trees`);
  }
  assert.match(run(`describe(${perch.x},${perch.y-45}).text`), new RegExp(perch.name), `${perch.name} has a tree hint`);
}
painted.length = 0;
run('drawRidgeScenery()');
for (const perch of owlPerches.slice(1)) {
  assert.ok(painted.some(([x, y]) => x === perch.x - 19 && y === perch.y + 6), `${perch.name} has a branch at the owl's landing height`);
}
for (const [name, label] of [['ridgeDeer', '小鹿'], ['ridgeHare', '野兔'], ['ridgeOwl', '猫头鹰']]) {
  assert.match(run(`describe(${name}.x,${name}.y-12).text`), new RegExp(label), `${label} hint follows its sprite`);
}
const deerBeforeMove = run('ridgeDeer.x');
run('updateRidgeLife(.5)');
assert.ok(run('ridgeDeer.x') < deerBeforeMove, 'The deer wanders across the clearing');
assert.ok(run('ridgeHare.x') > 1740, 'The hare starts hopping after its pause');
assert.match(run('describe(ridgeDeer.x,ridgeDeer.y-20).text'), /小鹿/, 'Deer hover tracks its moving position');
assert.ok(run(`(() => {
  for (let i = 0; i < 450; i++) {
    updateRidgeLife(.5);
    if (ridgeDeer.x < 1640 || ridgeDeer.x > 1855 || ridgeDeer.y < 140 || ridgeDeer.y > 260
      || ridgeHare.x < 1640 || ridgeHare.x > 1855 || ridgeHare.y < 390 || ridgeHare.y > 540) return false;
  }
  return true;
})()`), 'Deer and hare stay in their forest clearings over time');
run('resetRidgeLife()');
run('setZoom(1.4);centerCamera(ridgeDeer.x,ridgeDeer.y)');
const zoomedDeerScreen = run('({x:(ridgeDeer.x-farm.view.x)*farm.view.zoom,y:(ridgeDeer.y-20-farm.view.y)*farm.view.zoom})');
element('farm-map').listeners.pointermove({ clientX: zoomedDeerScreen.x, clientY: zoomedDeerScreen.y });
assert.match(element('map-tooltip').textContent, /小鹿/, 'Northern wildlife hover stays aligned after zooming');
run('setZoom(1);centerCamera(480,320)');
clickWorld(run('ridgeDeer.x'), run('ridgeDeer.y-20'));
assert.ok(run('ridgeDeer.startled') > 0, 'Clicking the deer makes it leap away');
clickWorld(run('ridgeHare.x'), run('ridgeHare.y-10'));
assert.ok(run('ridgeHare.startled') > 0, 'Clicking the hare makes it hop');
run('resetRidgeLife();ridgeOwl.perchIndex=3;ridgeOwl.targetIndex=3;ridgeOwl.x=1990;ridgeOwl.y=555;ridgeOwl.tx=1990;ridgeOwl.ty=555');
clickWorld(run('ridgeOwl.x'), run('ridgeOwl.y-17'));
assert.ok(run('ridgeOwl.flapping') > 0 && run('ridgeOwl.flying'), 'Clicking the owl makes it spread its wings');
assert.equal(run('ridgeOwl.targetIndex'), 3, 'Clicking keeps the blue spruce as its destination');
for (let i = 0; i < 6; i++) run('updateRidgeLife(.5)');
assert.ok(Math.hypot(run('ridgeOwl.x') - 1990, run('ridgeOwl.y') - 555) < .01 && !run('ridgeOwl.flying'), 'The owl returns to the same tree after being clicked');
assert.match(run('describe(ridgeOwl.x,ridgeOwl.y-15).text'), /蓝杉/, 'The resting owl hint names its actual tree');
run("farm.weatherFrom='rain';farm.weather='rain';updateRidgeLife(.1)");
assert.equal(run('ridgeDeer.tx'), 1800, 'The deer seeks shelter in heavy rain');
assert.equal(run('ridgeHare.hidden'), true, 'The hare hides in heavy rain');
assert.equal(run('ridgeOwl.tx'), 1990, 'Rain leaves the owl on its current tree');
run("farm.weatherFrom='sunny';farm.weather='sunny';resetRidgeLife();farm.phase=.8");
run('updateRidgeLife(.1)');
const nightDestination = run('ridgeOwl.targetIndex');
assert.ok(nightDestination > 0 && nightDestination < owlPerches.length, 'The owl starts one autonomous night flight');
assert.equal(run('ridgeOwl.patrolDay'), run('farm.day'), 'The night flight is marked for this day');
for (let i = 0; i < 50 && run('ridgeOwl.flying'); i++) run('updateRidgeLife(.5)');
assert.equal(run('ridgeOwl.perchIndex'), nightDestination, 'The owl lands at its selected tree');
assert.ok(!run('ridgeOwl.flying'), 'The owl rests after landing');
const landedX = run('ridgeOwl.x'), landedY = run('ridgeOwl.y');
for (let i = 0; i < 60; i++) run('updateRidgeLife(.5)');
assert.equal(run('ridgeOwl.x'), landedX, 'The owl does not patrol a second time that night');
assert.equal(run('ridgeOwl.y'), landedY, 'The owl stays on its landing branch');
clickWorld(landedX, landedY - 15);
for (let i = 0; i < 6; i++) run('updateRidgeLife(.5)');
assert.ok(Math.hypot(run('ridgeOwl.x') - landedX, run('ridgeOwl.y') - landedY) < .01, 'A nighttime click returns the owl to its current tree');
assert.equal(run('ridgeOwl.patrolDay'), run('farm.day'), 'A clicked wing stretch does not count as another night patrol');
run('farm.phase=.3;updateRidgeLife(.5)');
assert.equal(run('ridgeOwl.x'), landedX, 'Daylight does not send the owl back to the pine');
const owlTestDay = run('farm.day');
run('farm.day++;farm.phase=.8;updateRidgeLife(.1)');
assert.equal(run('ridgeOwl.patrolDay'), owlTestDay + 1, 'A new night allows one new patrol');
assert.notEqual(run('ridgeOwl.targetIndex'), nightDestination, 'The next patrol goes to a different tree');
run(`farm.day=${owlTestDay};farm.phase=.3;resetRidgeLife()`);
run('ridgeOwl.perchIndex=1;ridgeOwl.targetIndex=1;ridgeOwl.x=1560;ridgeOwl.y=215');
assert.equal(run('chooseRidgeOwlPerch(0).kind'), 'pine', 'The old pine remains one possible landing tree');
run('ridgeOwl.tx=1615;ridgeOwl.ty=470;ridgeOwl.wait=7;refreshRidgeOwlRoute()');
assert.ok(run('RIDGE_OWL_PERCHES.some(perch => perch.x === ridgeOwl.tx && perch.y === ridgeOwl.ty)'), 'A saved flight to a removed tree receives a current perch');
assert.equal(run('ridgeOwl.wait'), 0, 'A stale destination is cleared');
run('resetRidgeLife();ridgeOwl.x=1970;ridgeOwl.y=200;ridgeOwl.tx=1700;ridgeOwl.ty=555;delete ridgeOwl.perchIndex;delete ridgeOwl.targetIndex;delete ridgeOwl.patrolDay;refreshRidgeOwlRoute()');
assert.equal(run('ridgeOwl.perchIndex'), 2, 'An older browser save finds the owl’s actual resting tree');
assert.equal(run('ridgeOwl.tx'), 1970, 'An older daytime click returns the owl to that tree');
run('resetRidgeLife();ridgeOwl.perchIndex=3;ridgeOwl.targetIndex=3;ridgeOwl.x=1700;ridgeOwl.y=555;ridgeOwl.tx=1700;ridgeOwl.ty=555;refreshRidgeOwlRoute()');
assert.equal(run('ridgeOwl.perchIndex'), 4, 'A saved owl on the moved spruce finds the nearer new elm');
assert.equal(run('ridgeOwl.tx'), 1575, 'The saved owl flies to a real branch after the layout change');
run('farm.phase=.8;updateRidgeLife(.1)');
assert.equal(run('ridgeDeer.tx'), 1800, 'The deer settles near trees at night');
run('ridgeOwl.x=ridgeHare.x+20;ridgeOwl.y=ridgeHare.y-25;ridgeOwl.flying=true;farm.phase=.3;updateRidgeLife(.1)');
assert.equal(run('ridgeHare.hidden'), true, 'The hare ducks when the owl flies near');
run('resetRidgeLife();farm.phase=.3');

assert.ok(run(`(() => {
  const oldDay=farm.day, oldSpawnDay=farm.forageSpawnDay, oldSites=farm.forage;
  let valid=true;
  for (let day=1; day<=64; day++) {
    farm.day=day; farm.forageSpawnDay=0; spawnForageForDay();
    valid &&= farm.forage.length>=7 && farm.forage.length<=11;
    valid &&= farm.forage.every(site=>!ridgeForageClear(site.x,site.y));
  }
  farm.day=oldDay; farm.forageSpawnDay=oldSpawnDay; farm.forage=oldSites;
  return valid;
})()`), 'Daily forage keeps its count and clears the new animal routes');

assert.ok(run('farm.fishSpots.length') >= 3, 'The lake has several fish spots each day');
assert.ok(run('farm.fishSpots.every(site => lakeDepth(site.x,site.y) < .6)'), 'Fish spots stay in the water');
assert.ok(run(`(() => {
  const oldDay = farm.day, oldSpawnDay = farm.fishSpawnDay, oldSpots = farm.fishSpots;
  let valid = true;
  for (let day = 1; day <= 64; day++) {
    farm.day = day; farm.fishSpawnDay = 0; spawnFishForDay();
    valid &&= farm.fishSpots.length >= 3 && farm.fishSpots.length <= 4;
    valid &&= farm.fishSpots.every(site => lakeDepth(site.x, site.y) < .6);
  }
  farm.day = oldDay; farm.fishSpawnDay = oldSpawnDay; farm.fishSpots = oldSpots;
  return valid;
})()`), 'Daily lake spawning stays within its advertised range');
const fish = run('farm.fishSpots[0]');
const fishCount = run('farm.fishSpots.length');
const coinsBeforeFishing = run('farm.coins');
clickWorld(fish.x, fish.y);
assert.equal(run('farm.fishSpots.length'), fishCount - 1, 'Fishing removes one spot at a time');
assert.equal(run('farm.coins'), coinsBeforeFishing, 'Fish earnings wait until delivery');
assert.equal(run(`farm.depots.lake.${fish.kind}`), 1, 'The southern lake keeps its catch in the fish box');
assert.equal(run('farm.fishTotal'), 1);
assert.equal(run(fish.kind === 'gold' ? 'farm.goldFishTotal' : 'farm.carpTotal'), 1, 'The caught fish is counted by kind');
clickWorld(fish.x, fish.y);
assert.equal(run('farm.fishTotal'), 1, 'A caught fish cannot be caught twice');
const duckX = run('lakeDucks[0].x');
run('updateLake(.5)');
assert.notEqual(run('lakeDucks[0].x'), duckX, 'Ducks swim independently');

run('resetValleyLife();farm.phase=.3');
assert.ok(run('valleyLakeAt(valleyOtter.x,valleyOtter.y) && valleyLakeAt(valleyTurtle.x,valleyTurtle.y) && valleyLakeAt(valleyHeron.x,valleyHeron.y) && valleyLakeAt(valleyShoal.x,valleyShoal.y)'), 'Valley creatures begin in the small lake');
for (const [name, label] of [['valleyOtter', '水獭'], ['valleyTurtle', '乌龟'], ['valleyHeron', '苍鹭'], ['valleyShoal', '小鱼']]) {
  assert.match(run(`describe(${name}.x,${name}.y).text`), new RegExp(label), `${label} hint follows the sprite`);
}
const otterBeforeMove = run('valleyOtter.x');
run('updateValleyLife(.5)');
assert.ok(run('valleyOtter.x') > otterBeforeMove, 'The otter swims without input');
assert.ok(run('valleyTurtle.x') !== 251 && run('valleyHeron.x') < 294, 'Turtle and heron follow their own routes');
assert.ok(run('valleyLakeAt(valleyOtter.x,valleyOtter.y) && valleyLakeAt(valleyTurtle.x,valleyTurtle.y) && valleyLakeAt(valleyShoal.x,valleyShoal.y)'), 'Swimming routes remain in the lake');
assert.match(run('describe(valleyOtter.x,valleyOtter.y).text'), /水獭/, 'The otter hint follows it after moving');
assert.ok(run(`(() => {
  for (let i = 0; i < 400; i++) {
    updateValleyLife(.5);
    if (![valleyOtter, valleyHeron, valleyShoal].every(actor => valleyLakeDepth(actor.x, actor.y) < 1.07)) return false;
    if(!valleyLakeAt(valleyTurtle.x,valleyTurtle.y)&&!turtleBaskCorridor(valleyTurtle))return false;
  }
  return true;
})()`), 'Valley creatures stay in or beside the lake over time');
run('valleyShoal.x=valleyOtter.x+12;valleyShoal.y=valleyOtter.y;valleyShoal.scatter=0;updateValleyLife(.1)');
assert.ok(run('valleyShoal.scatter') > 0, 'The fish school scatters from a nearby otter');
run('resetValleyLife()');
clickWorld(run('valleyOtter.x'), run('valleyOtter.y'));
assert.ok(run('valleyOtter.dive') > 0, 'Clicking the otter makes it dive');
assert.match(run('farm.events[0].text'), /水獭/);
clickWorld(run('valleyTurtle.x'), run('valleyTurtle.y'));
assert.ok(run('valleyTurtle.hide') > 0, 'Clicking the turtle makes it withdraw into its shell');
clickWorld(run('valleyHeron.x'), run('valleyHeron.y-18'));
assert.ok(run('valleyHeron.flap') > 0, 'Clicking the heron makes it flap');
clickWorld(run('valleyShoal.x'), run('valleyShoal.y'));
assert.ok(run('valleyShoal.scatter') > 0, 'Clicking the fish school disperses it');
run("farm.weatherFrom='rain';farm.weather='rain';updateValleyLife(.1)");
assert.ok(run('valleyTurtle.hide') > 0, 'The turtle hides in heavy rain');
assert.equal(run('valleyHeron.tx'), 299, 'The heron heads for its sheltered perch in rain');
run("farm.weatherFrom='sunny';farm.weather='sunny';farm.phase=.8;updateValleyLife(.1)");
assert.equal(run('valleyOtter.tx'), 143, 'The otter rests by the bank at night');
run('farm.phase=.3');

run("const growingPlot=farm.plots.find(p=>p.crop==='wheat');growingPlot.age=0;growingPlot.watered=true;farm.phase=.999");
const beforeDawnGrowth = run('cropVisualProgress(growingPlot)');
run('growingPlot.age=1;farm.phase=0');
assert.ok(Math.abs(run('cropVisualProgress(growingPlot)')-beforeDawnGrowth)<.01, 'Crop art grows continuously through the day boundary');
run('farm.phase=.5');
assert.ok(run('cropVisualStage(growingPlot)') >= 3, 'Growing crops use intermediate sprites');
run("for (const name of Object.keys(crops)) for (const fraction of [0,.2,.4,.6,.8,1]) drawCropSprite({crop:name,age:crops[name].days*fraction,watered:true,plantedAt:null},320,410)");
const yesterdaySites = run('farm.forage.map(site=>site.id).join()');
const yesterdayFish = run('farm.fishSpots.map(site=>site.id).join()');
run('nextDay()');
assert.notEqual(run('farm.forage.map(site=>site.id).join()'), yesterdaySites, 'Wild food respawns at new daily positions');
assert.notEqual(run('farm.fishSpots.map(site=>site.id).join()'), yesterdayFish, 'Lake fishing spots refresh each day');

run('centerCamera(480, 320)');
const chickenLove = run('farm.chickenLove');
element('farm-map').listeners.pointerdown({ clientX: 205, clientY: 75, pointerId: 2 });
element('farm-map').listeners.pointermove({ clientX: 110, clientY: 75, pointerId: 2 });
element('farm-map').listeners.pointerup({ pointerId: 2 });
element('farm-map').listeners.click({ clientX: 110, clientY: 75 });
assert.equal(run('farm.chickenLove'), chickenLove, 'A drag does not trigger a map interaction');

run("farm.orders = [{ id: 99, crop: 'wheat', target: 1, progress: 0, due: 7, reward: 90, focus: true }]");
run("const ripe = farm.plots.findIndex(p => p.crop === 'wheat'); farm.plots[ripe].age = crops.wheat.days; finishTask({ type: 'harvest', index: ripe }, workers[0])");
assert.equal(run('farm.orders[0].progress'), 0, 'Harvesting alone does not complete a village delivery');
run("collectDepot('farm');deliverCourierGoods()");
assert.equal(run('farm.orders.length'), 0, 'The order completes when the carrier delivers the crop');
assert.ok(run('farm.harvested') > 0);
const splitDelivery = run(`(() => {
  farm.orders = [
    {id:101,crop:'wheat',target:2,progress:0,due:5,reward:60,focus:false},
    {id:102,crop:'wheat',target:2,progress:0,due:7,reward:60,focus:false}
  ];
  courier.cargo = {wheat:3}; deliverCourierGoods();
  return { ids:farm.orders.map(order=>order.id), progress:farm.orders[0].progress };
})()`);
assert.equal(splitDelivery.ids.join(','), '102', 'One shipment completes only the earliest due order');
assert.equal(splitDelivery.progress, 1, 'Remaining goods advance the next order without double counting');

const previousPlots = run('farm.plots.length');
const upperExpansion = run(`(() => {
  const playingFarm = farm;
  farm = newFarm();
  try {
    farm.coins = 250; expandIfReady();
    const eastCount = farm.plots.length - 42;
    farm.coins = 430; expandIfReady();
    farm.coins = 680; expandIfReady();
    const upperSouthCount = farm.plots.length - 42 - eastCount;
    return { eastCount, upperSouthCount,
      clear: farm.plots.every(plot => !roadsideExpansionPlot(plot)),
      rightGap: farm.plots.filter(plot => plot.x >= 15).every(plot => plot.x * T + T + T <= 608),
      bottomGap: farm.plots.filter(plot => plot.y >= 16).every(plot => plot.y * T + T + T <= 576) };
  } finally { farm = playingFarm; updateUI(); }
})()`);
assert.equal(upperExpansion.eastCount, 18, 'The eastern expansion omits the road-facing column');
assert.equal(upperExpansion.upperSouthCount, 10, 'The greenhouse expansion omits the road-facing row');
assert.ok(upperExpansion.clear && upperExpansion.rightGap && upperExpansion.bottomGap,
  'Expanded upper fields keep one full grass tile before both roads');
run('farm.upgrades=3;farm.coins=1200;expandIfReady()');
assert.equal(run('farm.upgrades'), 4, 'The autonomous southern field expansion advances independently');
assert.equal(run('farm.goatBarnOpen'), false, 'The goat barn does not open at the sheep threshold');
assert.equal(run('landmarkAt(1100,1355)'), 'future-goat-barn');
assert.equal(run('landmarkAt(1100,1460)'), 'future-goat-pen');
assert.match(run('describe(1100,1355).text'), /自然地带/, 'An unbuilt goat barn remains natural terrain');
assert.equal(run('landmarkAt(600,150)'), 'greenhouse');
assert.equal(run('landmarkAt(800,1355)'), 'sheep-barn');
assert.equal(run('landmarkAt(880,1490)'), 'sheep-pasture');
assert.equal(run('farm.plots.length'), previousPlots + 32);
assert.equal(run('farm.plots.filter(p => p.x >= 10 && p.x <= 17 && p.y >= 20 && p.y <= 23).length'), 32, 'Southern field sits inland from the lake');
assert.ok(run('farm.plots.filter(p => p.y >= 19).every(p => !lakeAt(p.x * T, p.y * T + T))'), 'Southern plots do not enter the lake');
assert.ok(run('farm.plots.filter(p => p.y >= 19).every(p => p.y * T >= 608 + T && p.x * T + T + (T - 4) <= 604)'), 'Southern plots keep a grass strip from the inset road');
assert.ok(run("workers.some(w=>w.name==='阿青')"));
run('addPastureWorker()');
assert.ok(run("workers.some(w=>w.name==='阿牧')"), 'An imported sheep barn retains its caretaker');
assert.equal(run('landmarkAt(PASTURE_WORKER_LAYOUT.rest.x,PASTURE_WORKER_LAYOUT.rest.y)'), 'pasture-bench',
  'The caretaker has a resting place between both barns');
assert.ok(run(`(() => {
  for (let i = 0; i < 80; i++) updateActors(.1);
  const cowsInside = cows.every(c => c.x - 35 > 683 && c.x + 37 < 931 && c.y - 27 > 283 && c.y + 28 < 552);
  const sheepInside = sheep.every(s => s.x - 22 > SHEEP_LAYOUT.pen.left + 8
    && s.x + 27 < SHEEP_LAYOUT.pen.right - 8 && s.y - 18 > SHEEP_LAYOUT.pen.top + 20
    && s.y + 18 < SHEEP_LAYOUT.pen.bottom);
  return cowsInside && sheepInside;
})()`), 'Moving cows and sheep stay within their enclosures');
run(`localStorage.getItem = () => JSON.stringify({ version: 1, state: {
  ...newFarm(), upgrades: 4, southFieldVersion: 1, fieldLayoutVersion: 1,
  plots: [{ x: 8, y: 21, crop: 'wheat', age: 1, watered: true },
    { x: 8, y: 22, crop: null, age: 0, watered: false },
    { x: 18, y: 12, crop: 'corn', age: 2, watered: true },
    { x: 17, y: 12, crop: null, age: 0, watered: false }]
} })`);
assert.ok(run('loadFarm().plots.some(p => p.x === 10 && p.y === 20 && p.crop === "wheat" && p.age === 1)'),
  'An old southern crop moves into a surviving plot');
assert.ok(run('loadFarm().plots.some(p => p.x === 17 && p.y === 12 && p.crop === "corn" && p.age === 2)'),
  'An old east-edge crop moves into a surviving plot');
assert.ok(run('loadFarm().plots.every(p => !roadsideExpansionPlot(p))'), 'Older saves lose only the road-adjacent plots');
const expandedSave = run(`(() => {
  const state = newFarm();
  state.upgrades = 4; state.southFieldVersion = 2;
  state.plots = fieldCells({left:10,right:16,top:20,bottom:22})
    .map(({x,y})=>({x,y,crop:'carrot',age:1.4,watered:true}));
  const before = JSON.stringify(state.plots);
  const restored = parseFarmSave({version:1,state});
  const firstPass = JSON.stringify(restored.plots);
  parseFarmSave({version:1,state:restored});
  const unopened = newFarm(); unopened.southFieldVersion = 2;
  return {count:restored.plots.length, preserved:JSON.stringify(restored.plots.slice(0,21))===before,
    edges:restored.plots.some(p=>p.x===17&&p.y===23), stable:JSON.stringify(restored.plots)===firstPass,
    unopened:parseFarmSave({version:1,state:unopened}).plots.length===42};
})()`);
assert.equal(expandedSave.count,32,'An already-open southern field gains its row and column');
assert.ok(expandedSave.preserved && expandedSave.edges && expandedSave.stable && expandedSave.unopened,
  'Field extension preserves crop data and task indices, is idempotent and waits for unlock');
run('localStorage.getItem = () => null');
run('farm.upgrades=4;farm.goatBarnOpen=false;farm.coins=1499;expandIfReady()');
assert.equal(run('farm.goatBarnOpen'), false, 'The goat barn stays closed below 1500 coins');
run('farm.coins=1500;expandIfReady()');
assert.equal(run('farm.goatBarnOpen'), false, 'Autonomous chores never bypass the new goat construction contract');
run('farm.goatBarnOpen=true;syncRegressionInfrastructure();updateUI()');
assert.equal(run('landmarkAt(1100,1355)'), 'goat-barn');
assert.equal(run('landmarkAt(1100,1460)'), 'goat-pen');
run('farm.coins=1900;expandIfReady()');
assert.equal(run('farm.upgrades'), 5, 'The village market opens on its threshold');
assert.equal(run('landmarkAt(1550,880)'), 'village-market');
assert.equal(run('landmarkAt(1840,880)'), 'mine-market-stall');
assert.equal(run('landmarkAt(1190,870)'), 'village-west', 'The west bank does not contain a market stall');
run('centerCamera(1840,880)');
assert.equal(element('region-label').textContent, '村口集市', 'The east-bank viewport is labeled as the market');
run('centerCamera(1130,880)');
assert.equal(element('region-label').textContent, '苔谷广场', 'The west-bank viewport identifies the new plaza');
run('centerCamera(480,320)');
run('farm.phase=.42;centerCamera(1900,900);render();farm.phase=.8;render();centerCamera(480,320)');

run("const latePlot=farm.plots[0];latePlot.crop='wheat';latePlot.age=0;latePlot.plantedAt=.8;latePlot.watered=true;farm.phase=.999");
const lateGrowthBefore = run('cropVisualProgress(latePlot)');
run('nextDay()');
assert.ok(Math.abs(run('cropVisualProgress(latePlot)')-lateGrowthBefore)<.01, 'Late planting continues smoothly at dawn');
assert.ok(run('latePlot.age') < .25, 'Late planting grows only for elapsed daylight');

run('villageWalker.x=1690;villageWalker.y=812');
element('reset-button').listeners.click();
assert.equal(run('farm.upgrades'), 0, 'Reset starts a new farm');
assert.equal(run('workers.length'), 3, 'Reset starts with the three main-farm residents');
assert.equal(run('farm.view.x'), 0, 'Reset returns the camera home');
assert.deepEqual(Array.from(run('[villageWalker.x,villageWalker.y]')), [1723,792], 'Reset returns 阿宁 to the middle home');
assert.ok(run('farm.fishSpots.length') >= 3 && run('farm.fishTotal') === 0, 'Reset restores the lake');
assert.equal(run('valleyOtter.x'), 155, 'Reset restores the small-lake habitat');
assert.equal(run('ridgeDeer.x'), 1744, 'Reset restores the northern forest habitat');
assert.equal(run('meadowGoats[0].x'), 1040, 'Reset restores the goat pasture');
assert.equal(run('farm.goatBarnOpen'), false, 'Reset closes the goat barn again');
assert.equal(run('farm.valleyHerbs.length'), 6, 'Reset replants the valley herb garden');
assert.equal(run("workers.map(w=>w.name).join(',')"), '阿满,小禾,阿青', 'Future specialists arrive with development');
runRaw('replaceFarmState(regressionFarmFixture())');
assert.equal(run('DAY_SECONDS'), 72, 'The longer day leaves time for a visible delivery circuit');
run('farm.upgrades=5;farm.goatBarnOpen=true;syncRegressionInfrastructure()');
assert.ok(run(`(() => {
  const routes = [[COURIER_HOME, ...COURIER_OUTBOUND]];
  for(let mask=0;mask<1<<DEPOT_IDS.length;mask++) {
    const planned=DEPOT_IDS.filter((_,i)=>mask&(1<<i));
    const base=courierReturnBase(planned);
    routes.push([COURIER_REST,...base,...(planned.includes('forest')?COURIER_FOREST_RETURN:COURIER_DIRECT_RETURN)]);
  }
  for (const points of routes) for (let i = 1; i < points.length; i++) {
    const a = points[i-1], b = points[i], steps = Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/8);
    for (let j = 0; j <= steps; j++) {
      const x = a.x + (b.x-a.x)*j/steps, y = a.y + (b.y-a.y)*j/steps;
      if (!courierRoadAt(x,y) || (riverAt(x,y,2) && !bridgeAt(x,y))) return false;
    }
  }
  return true;
})()`), 'Every departure-time cargo plan stays on actual roads and crosses water only on bridges');
assert.ok(run(`(() => {
  const stops = courierReturnBase(['pasture','valley']).filter(point => point.depot);
  return stops.map(point => point.depot).join(',') === 'pasture,valley'
    && stops[0].x < stops[1].x && stops[0].y === DEPOT_SITES.pasture.y;
})()`), 'The courier collects pasture goods before herbs on the eastbound southern road');
assert.ok(run(`(() => {
  const points = [COURIER_HOME, ...COURIER_OUTBOUND];
  const length = points.slice(1).reduce((total, point, i) => total + Math.hypot(point.x-points[i].x,point.y-points[i].y),0);
  return COURIER_SPEED >= 150 && length/COURIER_SPEED < (NIGHT_START-.18)*DAY_SECONDS;
})()`), 'The faster outward trip reaches the cottage within the first day');
assert.ok(run(`(() => {
  const points=[COURIER_REST,...COURIER_RETURN_BASE,...COURIER_FOREST_RETURN];
  const length=points.slice(1).reduce((total,point,i)=>total+Math.hypot(point.x-points[i].x,point.y-points[i].y),0);
  return length/COURIER_SPEED+DEPOT_IDS.length*.32 < (NIGHT_START-.02)*DAY_SECONDS;
})()`), 'Even the six-box forest circuit can reach the village before dusk');
assert.ok(run(`COURIER_OUTBOUND.every(p=>MARKET_LAYOUT.lamps.every(lamp=>Math.hypot(p.x-lamp.x,p.y-lamp.y)>50))`),
  'The outward route clears all three village lamps');
assert.ok(run(`(() => {
  const elm=RIDGE_OWL_PERCHES.find(perch=>perch.kind==='elm');
  const westLane=COURIER_FOREST_RETURN.find(point=>point.y===307 && point.x>1400);
  const southLane=COURIER_FOREST_RETURN.find(point=>point.y===640 && point.x===westLane.x);
  return westLane.x+30<elm.x-58 && southLane.x===westLane.x
    && COURIER_FOREST_RETURN.every(point=>point.y>=600 || point.x<1680);
})()`), 'The forest return descends west of the elm and leaves the hare clearing whole');
assert.ok(run(`(() => {
  const roadHitsTree = COURIER_TRAILS.some(road => regionTrees.some(([x,y]) =>
    road.x < x+30 && road.x+road.w > x-29 && road.y < y+25 && road.y+road.h > y-48));
  const routes = [[COURIER_HOME,...COURIER_OUTBOUND], [COURIER_REST,...COURIER_RETURN_BASE,...COURIER_DIRECT_RETURN],
    [COURIER_RETURN_BASE.at(-1),...COURIER_FOREST_RETURN]];
  const cartHitsLamp = routes.some(points => points.slice(1).some((point,i) => {
    const start=points[i], steps=Math.ceil(Math.hypot(point.x-start.x,point.y-start.y)/6);
    return Array.from({length:steps+1},(_,j) => {
      const x=start.x+(point.x-start.x)*j/steps, y=start.y+(point.y-start.y)*j/steps;
      return MARKET_LAYOUT.lamps.some(lamp => x-28 < lamp.x+8 && x+30 > lamp.x-8
        && y-30 < lamp.y+29 && y+23 > lamp.y-8);
    }).some(Boolean);
  }));
  return !roadHitsTree && !cartHitsLamp;
})()`), 'New lanes clear tree sprites and the cart clears all village lamps');
assert.ok(run("workers.filter(w=>['阿满','小禾','阿青','阿麦'].includes(w.name)).every(w=>['milk','eggs','harvest','plant','water','fruit','honey'].every(t=>workerCanDoTask(w,t)))"),
  'All four main-farm villagers share farming, eggs and milk duties');
const addedWorker = run(`(() => {
  const originalState=JSON.parse(JSON.stringify(farm)), originalRuntime=JSON.parse(JSON.stringify(captureRuntimeState()));
  try {
    const helper=workers.find(w=>w.name==='阿麦');
    const hint=describe(helper.x,helper.y).text.includes('阿麦');
    addFarmWorker();addFarmWorker();
    const unique=workers.filter(w=>w.name==='阿麦').length===1;
    farm.phase=.2;farm.coins=0;farm.eggsReady=false;farm.fruitReady=false;farm.honeyReady=false;
    cows.forEach(c=>c.milk=false);
    farm.plots=[{x:17,y:23,crop:'wheat',age:crops.wheat.days,watered:true}];
    workers.forEach(w=>{w.task=null;w.route=[];w.action=0;});
    helper.task={type:'harvest',index:0};helper.action=.3;
    Object.assign(helper,taskPoint(helper.task));
    const previous=depotCount('pasture');updateFarmWorkers(.1);
    const harvested=!farm.plots[0].crop && depotCount('pasture')===previous+1;
    helper.task=null;farm.phase=NIGHT_START;
    for(let i=0;i<100;i++)updateFarmWorkers(.1);
    const home=distance(helper,workerHome(helper))<20;
    const archive=JSON.parse(farmExportText());
    const snapshot=archive.runtime.workers.find(w=>w.name==='阿麦');
    const saved=snapshot.x===helper.x && snapshot.y===helper.y;
    return {hint,unique,harvested,home,saved};
  } finally {replaceFarmState(originalState,originalRuntime);}
})()`);
assert.ok(Object.values(addedWorker).every(Boolean),
  `The additional worker is visible, harvests the new edge, sleeps and saves: ${JSON.stringify(addedWorker)}`);
run('assignTask(workers[0]);assignTask(workers[1]);assignTask(workers[2]);assignTask(workers[3])');
assert.equal(run('workers[0].task.type'), 'milk', 'A main-farm worker milks the first cow');
assert.equal(run('workers[1].task.type'), 'milk', 'Another main-farm worker milks the second cow');
assert.equal(run('workers[2].task.type'), 'eggs', 'The third worker handles the chicken coop');
assert.equal(run('workers[3].task.type'), 'herb', 'The valley specialist handles herbs');
assert.equal(run("workers[3].route.map(point=>point.x).join(',')"), '715,982,982',
  'The herb worker heads east from home along the southern path');
assert.ok(run(`(() => {
  const points=[VALLEY_WORKER_LAYOUT.home,...workers[3].route,taskPoint(workers[3].task)];
  return points.slice(1).reduce((length,point,i)=>length+distance(point,points[i]),0)<520;
})()`), 'The direct southern herb route is shorter than the old loop around the mill');
const herbWorkPath = run(`(() => {
  farm.phase=.2;courier.lastReturnDay=farm.day;
  let crossedMill=false;
  for(let i=0;i<300;i++) {
    updateActors(.1);
    crossedMill ||= inRect(workers[3].x,workers[3].y,774,1029,890,1186);
  }
  return {crossedMill};
})()`);
assert.equal(herbWorkPath.crossedMill, false, 'The direct herb route still clears the windmill');
assert.equal(run('farm.herbTotal'), 6, 'The valley specialist harvests all six ready herbs without player input');
assert.equal(run('depotCount(\'valley\')'), 6, 'The valley specialist stores the herbs in the valley box');
assert.ok(run("distance(workers.find(w=>w.name==='阿栀'),VALLEY_WORKER_LAYOUT.chair)<20"),
  'The valley specialist returns to the rocking chair when work is done');
assert.ok(run(`(() => {
  const home=VALLEY_WORKER_LAYOUT.home, chair=VALLEY_WORKER_LAYOUT.chair;
  const pine=regionTrees.find(([x,y])=>x===912 && y===1125);
  return home.right < 774 && pine && pine[0]+18 < chair.x-29
    && chair.x+31 < VALLEY_GARDEN_LAYOUT.herbs.left;
})()`), 'Home, shifted pine, chair and herb beds keep separate footprints');
const valleyNightTrip = run(`(() => {
  const worker = workers.find(w=>w.name==='阿栀');
  farm.phase = NIGHT_START + .02;
  let crossedMill = false;
  for(let i=0;i<300;i++) {
    updateActors(.1);
    crossedMill ||= inRect(worker.x,worker.y,774,1029,890,1186);
  }
  return {distance:distance(worker,VALLEY_WORKER_LAYOUT.home),crossedMill};
})()`);
assert.ok(valleyNightTrip.distance < 20, 'At night the valley worker returns to her cottage');
assert.equal(valleyNightTrip.crossedMill, false, 'Her night route goes around the windmill');
assert.match(run('describe(715,1100).text'), /阿栀的小屋/, 'The new home has its own hover hint');
run('farm.phase=.18;for(let i=0;i<300;i++)updateActors(.1)');
assert.ok(run("distance(workers.find(w=>w.name==='阿栀'),VALLEY_WORKER_LAYOUT.chair)<20"),
  'In daylight she returns from home to the chair when no herbs need picking');
for (const [x, y] of [[970, 1170], [715, 1209]]) {
  assert.ok(run(`(() => {
    const worker=workers.find(w=>w.name==='阿栀');
    worker.x=${x};worker.y=${y};worker.task=null;worker.route=[];
    farm.phase=.18;farm.valleyHerbs.forEach(herb=>herb.readyAt=farm.day+3);
    for(let i=0;i<120;i++)updateActors(.05);
    return distance(worker,VALLEY_WORKER_LAYOUT.chair)<16;
  })()`), `The valley worker reaches the chair from ${x},${y} without waypoint jitter`);
}
element('reset-button').listeners.click();
runRaw('replaceFarmState(regressionFarmFixture())');
run("farm.upgrades=4;stockGood('farm','wheat',2);stockGood('pasture','wool',1);stockGood('valley','lavender',1);stockGood('lake','carp',1);stockGood('forest','mushroom',1);farm.phase=.2");
assert.equal(run('DEPOT_SITES.farm.y'), 558, 'The main farm box moves one tile north of the road');
assert.ok(run('DEPOT_SITES.farm.y+16 < 576'), 'The main box artwork clears the road surface');
assert.match(run('describe(DEPOT_SITES.farm.x,DEPOT_SITES.farm.y).text'), /主场货箱.*小麦 2/, 'Depot hover lists its actual cargo');
run('farm.ledgerExpanded=true;updateLedgerUI()');
assert.equal(element('ledger-goods-detail').children.length, 5,
  'The expanded ledger gives each stocked location its own row');
assert.equal(element('ledger-goods-detail').children[0].children[0].textContent, '主场货箱：',
  'The freight row keeps its place name separate from the wrapping cargo text');
run("for(let i=0;i<1000 && courier.leg!=='rest';i++)updateCourier(.05)");
assert.equal(run('courier.leg'), 'rest', 'The first day ends at the small freight cottage');
assert.equal(run('courier.cargo.wheat'), undefined, 'The outward trip does not collect goods');
assert.equal(run('courier.x'), 256, 'The courier rests beside the freight stall');
assert.equal(run('farm.shippedTotal'), 0, 'The first day brings no goods to market');
const forestJourney = run(`(() => {
  const order = [], oldCollect = collectDepot;
  let usedForestRoad = false;
  collectDepot = id => { order.push(id); oldCollect(id); };
  farm.day++; farm.phase=.2;
  try {
    for (let i=0;i<2000 && courier.leg!=='market';i++) {
      updateCourier(.05);
      if (courier.routeVariant==='forest') usedForestRoad=true;
      if (!courierRoadAt(courier.x,courier.y)) throw new Error('The cart left the road');
    }
    return { order, usedForestRoad, leg:courier.leg };
  } finally { collectDepot=oldCollect; }
})()`);
assert.equal(forestJourney.leg, 'market', 'The second day completes at the village');
assert.equal(forestJourney.order.join(','), 'farm,lake,pasture,valley,forest', 'The return trip collects in the requested order');
assert.equal(forestJourney.usedForestRoad, true, 'Forest stock sends the cart around the eastern forest');
assert.equal(run('farm.shippedTotal'), 6, 'Goods from all five regions arrive at the village');
assert.equal(run('DEPOT_IDS.reduce((sum,id)=>sum+depotCount(id),0)'), 0, 'Delivered goods leave every source depot');
assert.ok(run('farm.coins') > 120, 'Income is credited when the cart reaches the market');
element('reset-button').listeners.click();
runRaw('replaceFarmState(regressionFarmFixture())');
const directJourney = run(`(() => {
  farm.phase=.2;
  updateCourier(.05);
  const planned=[...courier.plannedDepots];
  stockGood('farm','wheat',1);
  stockGood('forest','mushroom',1);
  for(let i=0;i<1000 && courier.leg!=='rest';i++) updateCourier(.05);
  farm.day++; farm.phase=.2;
  let direct=false, forest=false;
  for(let i=0;i<2000 && courier.leg!=='market';i++) {
    updateCourier(.05);
    direct ||= courier.routeVariant==='direct';
    forest ||= courier.routeVariant==='forest';
  }
  return {direct,forest,leg:courier.leg,planned};
})()`);
assert.equal(directJourney.leg, 'market');
assert.equal(directJourney.direct, false, 'Forest goods added during the outward day enable the return detour');
assert.equal(directJourney.forest, true, 'The forest loop uses stock on return departure day');
assert.equal(directJourney.planned.length, 0, 'Outward departure defers every pickup decision');
assert.equal(run('depotCount("farm")+depotCount("forest")'), 0,
  'Both boxes stocked during the outward day are included at return departure');
assert.equal(run('farm.shippedTotal'), 2, 'Both newly stocked boxes are collected on this return trip');
const allDepotReturnPlans = run(`(() => {
  const goods={farm:'wheat',lake:'carp',nursery:'seedPacket',pasture:'wool',valley:'mint',forest:'acorn'};
  return DEPOT_IDS.every((id,index)=>{
    replaceFarmState(newFarm());farm.upgrades=4;farm.nursery.level=1;farm.phase=.2;
    for(const box of DEPOT_IDS)stockGood(box,goods[box]);
    updateCourier(.05);
    if(courier.plannedDepots.length)return false;
    for(let tick=0;tick<1000&&courier.leg!=='rest';tick++)updateCourier(.05);
    for(const box of DEPOT_IDS)farm.depots[box]={};
    stockGood(id,goods[id],2);
    farm.day=2;farm.phase=.2;updateCourier(.05);
    if(courier.plannedDepots.length!==1||courier.plannedDepots[0]!==id)return false;
    const skipped=DEPOT_IDS[(index+1)%DEPOT_IDS.length];
    stockGood(skipped,goods[skipped]);stockGood(id,goods[id]);
    const snapshot=JSON.parse(JSON.stringify(captureRuntimeState()));
    validateRuntimeSnapshot(snapshot);restoreRuntimeSnapshot(snapshot);
    if(courier.plannedDepots.length!==1||courier.plannedDepots[0]!==id)return false;
    for(let tick=0;tick<2000&&courier.leg!=='market';tick++)updateCourier(.05);
    return courier.leg==='market'&&farm.shippedTotal===3
      && depotCount(id)===0&&depotCount(skipped)===1;
  });
})()`);
assert.ok(allDepotReturnPlans,
  'Every box uses return-departure stock, collects all goods on arrival and preserves the fixed plan across saves');
const emptyReturnPlan = run(`(() => {
  replaceFarmState(newFarm());farm.nursery.level=1;farm.phase=.2;
  for(const id of DEPOT_IDS)stockGood(id,'milk');
  updateCourier(.05);
  for(let tick=0;tick<1000&&courier.leg!=='rest';tick++)updateCourier(.05);
  for(const id of DEPOT_IDS)farm.depots[id]={};
  farm.day=2;farm.phase=.2;updateCourier(.05);
  const empty=courier.plannedDepots.length===0;
  for(const id of DEPOT_IDS)stockGood(id,'milk');
  for(let tick=0;tick<2000&&courier.leg!=='market';tick++)updateCourier(.05);
  return empty&&courier.leg==='market'&&farm.shippedTotal===0
    && DEPOT_IDS.every(id=>depotCount(id)===1);
})()`);
assert.ok(emptyReturnPlan,
  'Boxes emptied before return departure are skipped, and later new goods wait for the next trip');
element('reset-button').listeners.click();
runRaw('replaceFarmState(regressionFarmFixture())');
const plannedForestCollection = run(`(() => {
  stockGood('forest','mushroom',1);
  farm.phase=.2;updateCourier(.05);
  const planned=[...courier.plannedDepots];
  stockGood('forest','acorn',2);
  for(let i=0;i<1000 && courier.leg!=='rest';i++)updateCourier(.05);
  farm.day++;farm.phase=.2;updateCourier(.05);
  const returnPlan=[...courier.plannedDepots];
  stockGood('forest','acorn',4);
  const snapshot=JSON.parse(JSON.stringify(captureRuntimeState()));
  validateRuntimeSnapshot(snapshot);restoreRuntimeSnapshot(snapshot);
  const persisted=courier.plannedDepots.includes('forest') && courier.leg==='return';
  for(let i=0;i<2000 && courier.leg!=='market';i++)updateCourier(.05);
  return {planned,returnPlan,persisted,leg:courier.leg,forestRemaining:depotCount('forest'),
    mushrooms:farm.marketGoods.mushroom,acorns:farm.marketGoods.acorn};
})()`);
assert.equal(plannedForestCollection.planned.join(','), '', 'Outward departure defers the forest decision');
assert.equal(plannedForestCollection.returnPlan.join(','), 'forest', 'Return departure commits the stocked forest box');
assert.equal(plannedForestCollection.persisted, true, 'The return forest decision survives a complete runtime save');
assert.equal(plannedForestCollection.leg, 'market');
assert.equal(plannedForestCollection.forestRemaining, 0, '阿运 empties the whole forest box when he actually reaches it');
assert.deepEqual([plannedForestCollection.mushrooms,plannedForestCollection.acorns], [1,6],
  'New forest goods added after return departure join the planned pickup');
element('reset-button').listeners.click();
runRaw('replaceFarmState(regressionFarmFixture())');
const villageNight = run(`(() => {
  farm.phase=NIGHT_START+.02;
  let onRoad=true;
  for(let i=0;i<150 && !courier.night?.sleeping;i++) {
    updateCourier(.05); onRoad&&=courierRoadAt(courier.x,courier.y);
  }
  return {side:courier.night?.side,sleeping:courier.night?.sleeping,
    x:courier.x,y:courier.y,onRoad,visible:courierAt(courier.x,courier.y)};
})()`);
assert.equal(villageNight.side, 'village', '阿运 chooses a village home while on the east bank');
assert.equal(villageNight.sleeping, true, '阿运 enters the village home before dawn');
assert.equal(villageNight.onRoad, true, 'The village night route follows streets');
assert.equal(villageNight.visible, false, '阿运 is hidden after entering the village home');
assert.deepEqual([villageNight.x,villageNight.y], [run('COURIER_VILLAGE_DOOR.x'),run('COURIER_VILLAGE_DOOR.y')]);
assert.equal(run(`(() => {
  const archived=JSON.parse(JSON.stringify(captureRuntimeState()));
  validateRuntimeSnapshot(archived); restoreRuntimeSnapshot(archived);
  return courier.night?.sleeping;
})()`), true, 'An overnight stop survives a complete runtime archive');
run('farm.phase=.03;for(let i=0;i<160 && courier.night;i++)updateCourier(.05)');
assert.equal(run('courier.night'), null, 'The village sleeper retraces the walk to his cart at dawn');
assert.deepEqual(Array.from(run('[courier.x,courier.y]')), [1655,950], 'The market trip resumes at its prior position');

const farmNight = run(`(() => {
  courier={...resetCourier(),x:620,y:800,leg:'outbound',stopIndex:4,cargo:{honey:2}};
  farm.phase=NIGHT_START+.02;
  let onRoad=true,bad=null;
  for(let i=0;i<260 && !courier.night?.sleeping;i++) {
    updateCourier(.05); if(!courierRoadAt(courier.x,courier.y)) {onRoad=false;bad??=[courier.x,courier.y];}
  }
  return {side:courier.night?.side,sleeping:courier.night?.sleeping,
    x:courier.x,y:courier.y,onRoad,bad,visible:courierAt(courier.x,courier.y)};
})()`);
assert.equal(farmNight.side, 'farm', '阿运 chooses his freight cottage while on the farm bank');
assert.equal(farmNight.sleeping, true, '阿运 enters the north door of the freight cottage');
assert.equal(farmNight.onRoad, true, `The farm night route follows roads to the cottage: ${farmNight.bad}`);
assert.equal(farmNight.visible, false, '阿运 is hidden inside the freight cottage');
assert.deepEqual([farmNight.x,farmNight.y], [run('COURIER_COTTAGE_DOOR.x'),run('COURIER_COTTAGE_DOOR.y')]);
run('farm.phase=.03;for(let i=0;i<260 && courier.night;i++)updateCourier(.05)');
assert.equal(run('courier.night'), null, '阿运 returns to the same farm road position at dawn');
assert.deepEqual(Array.from(run('[courier.x,courier.y]')), [620,800]);
assert.equal(run('courier.stopIndex'), 4, 'Sleeping does not skip a delivery waypoint');
assert.equal(run('courier.cargo.honey'), 2, 'Sleeping preserves cart cargo');

const forestNight = run(`(() => {
  courier={...resetCourier(),x:1228,y:500,leg:'return',stopIndex:3,
    routeVariant:'forest',plannedDepots:['forest'],cargo:{mushroom:1}};
  farm.phase=NIGHT_START+.02;
  let onRoad=true;
  for(let i=0;i<320 && !courier.night?.sleeping;i++) {
    updateCourier(.05); onRoad&&=courierRoadAt(courier.x,courier.y);
  }
  return {sleeping:courier.night?.sleeping,side:courier.night?.side,
    onRoad,pathLength:courier.night?.path.length};
})()`);
assert.equal(forestNight.side, 'farm', 'On the western forest bank 阿运 still uses his own cottage');
assert.equal(forestNight.sleeping, true, 'The forest return reaches the cottage during the night');
assert.equal(forestNight.onRoad, true, 'Night travel omits completed collection loops but keeps to roads');
assert.ok(forestNight.pathLength < 15, 'Completed depot spurs are omitted from the night route');
run('farm.phase=.03;for(let i=0;i<320 && courier.night;i++)updateCourier(.05)');
assert.equal(run('courier.night'), null);
assert.deepEqual(Array.from(run('[courier.x,courier.y]')), [1228,500], 'The forest journey resumes where it was interrupted');
assert.equal(run('courier.cargo.mushroom'), 1);

const eastReturnNight = run(`(() => {
  courier={...resetCourier(),x:1785,y:800,leg:'return',stopIndex:7,
    routeVariant:'forest',plannedDepots:['forest'],cargo:{mushroom:2}};
  farm.phase=NIGHT_START+.02;
  let onRoad=true;
  for(let i=0;i<220 && !courier.night?.sleeping;i++) {
    updateCourier(.05); onRoad&&=courierRoadAt(courier.x,courier.y);
  }
  return {side:courier.night?.side,sleeping:courier.night?.sleeping,onRoad};
})()`);
assert.equal(eastReturnNight.side, 'village', '阿运 uses the village home after crossing east of the river');
assert.equal(eastReturnNight.sleeping, true);
assert.equal(eastReturnNight.onRoad, true, 'The eastern night trip clears the homes and lamps');
run('farm.phase=.03;for(let i=0;i<220 && courier.night;i++)updateCourier(.05)');
assert.equal(run('courier.night'), null);
assert.deepEqual(Array.from(run('[courier.x,courier.y]')), [1785,800]);
assert.equal(run('courier.cargo.mushroom'), 2);
const interruptedRoutes = run(`(() => {
  farm.upgrades=5;farm.goatBarnOpen=true;syncRegressionInfrastructure();
  const plans=[
    {name:'outbound',leg:'outbound',variant:null,depots:[],route:COURIER_OUTBOUND,start:COURIER_HOME},
    {name:'empty base',leg:'return',variant:null,depots:[],route:courierReturnBase([]),start:COURIER_REST},
    {name:'full base',leg:'return',variant:null,depots:[...DEPOT_IDS],route:courierReturnBase(DEPOT_IDS),start:COURIER_REST},
    {name:'direct',leg:'return',variant:'direct',depots:[],route:COURIER_DIRECT_RETURN,start:courierReturnBase([]).at(-1)},
    {name:'forest',leg:'return',variant:'forest',depots:[...DEPOT_IDS],route:COURIER_FOREST_RETURN,start:courierReturnBase(DEPOT_IDS).at(-1)}
  ];
  let checked=0;
  for(const plan of plans) for(let i=0;i<plan.route.length;i++) {
    const from=i?plan.route[i-1]:plan.start,to=plan.route[i];
    const origin={x:(from.x+to.x)/2,y:(from.y+to.y)/2};
    courier={...resetCourier(),...origin,leg:plan.leg,stopIndex:i,
      routeVariant:plan.variant,plannedDepots:plan.depots,cargo:{eggs:3}};
    farm.phase=NIGHT_START+.01;
    for(let tick=0;tick<400 && !courier.night?.sleeping;tick++) {
      updateCourier(.05);
      if(!courierRoadAt(courier.x,courier.y,1)) return plan.name+' '+i+' left road at '+courier.x+','+courier.y;
    }
    if(!courier.night?.sleeping) return plan.name+' '+i+' did not reach home';
    farm.phase=.03;
    for(let tick=0;tick<400 && courier.night;tick++) {
      updateCourier(.05);
      if(!courierRoadAt(courier.x,courier.y,1)) return plan.name+' '+i+' left dawn road';
    }
    if(courier.night || Math.hypot(courier.x-origin.x,courier.y-origin.y)>.01
      || courier.stopIndex!==i || courier.cargo.eggs!==3) return plan.name+' '+i+' lost its journey';
    checked++;
  }
  return checked;
})()`);
assert.equal(interruptedRoutes, run('COURIER_OUTBOUND.length + courierReturnBase([]).length + courierReturnBase(DEPOT_IDS).length + COURIER_DIRECT_RETURN.length + COURIER_FOREST_RETURN.length'),
  `Every route segment can pause for sleep and resume: ${interruptedRoutes}`);
element('reset-button').listeners.click();
runRaw('replaceFarmState(regressionFarmFixture())');
const fixedForestTrip = run(`(() => {
  stockGood('forest','mushroom',1); farm.phase=.2;
  updateCourier(.05);
  const planned=[...courier.plannedDepots];
  farm.depots.forest={};
  for(let i=0;i<1000 && courier.leg!=='rest';i++) updateCourier(.05);
  farm.day++;farm.phase=.2;
  let forest=false;
  for(let i=0;i<2000 && courier.leg!=='market';i++) {
    updateCourier(.05);
    forest ||= courier.routeVariant==='forest';
  }
  return {planned,forest,leg:courier.leg};
})()`);
assert.equal(fixedForestTrip.planned.join(','), '', 'Market departure does not commit the forest loop');
assert.equal(fixedForestTrip.forest, false, 'A forest box emptied before return departure skips the detour');
assert.equal(fixedForestTrip.leg, 'market');
element('reset-button').listeners.click();
runRaw('replaceFarmState(regressionFarmFixture())');
const returnForestLock = run(`(() => {
  farm.phase=.2;updateCourier(.05);
  for(let i=0;i<1000&&courier.leg!=='rest';i++)updateCourier(.05);
  stockGood('forest','mushroom',1);
  farm.day++;farm.phase=.2;updateCourier(.05);
  const planned=courier.plannedDepots.includes('forest');
  farm.depots.forest={};
  const snapshot=JSON.parse(JSON.stringify(captureRuntimeState()));
  validateRuntimeSnapshot(snapshot);restoreRuntimeSnapshot(snapshot);
  let forest=false;
  for(let i=0;i<2000&&courier.leg!=='market';i++) {
    updateCourier(.05);forest ||= courier.routeVariant==='forest';
  }
  return planned&&forest&&courier.leg==='market';
})()`);
assert.ok(returnForestLock, 'Once the return morning commits the forest loop, emptied stock and a save do not change the route');
element('reset-button').listeners.click();
runRaw('replaceFarmState(regressionFarmFixture())');
const autonomousRun = run(`(() => {
  for (let i = 0; i < 4500 && farm.day < 4; i++) {
    const rate = farm.phase >= NIGHT_START ? 2.1 : 1;
    farm.phase += .05 * rate / DAY_SECONDS;
    if (farm.phase >= 1) nextDay();
    updateActors(.05 * rate);
  }
  return { day: farm.day, shipped: farm.shippedTotal, herbs: farm.herbTotal, coins: farm.coins };
})()`);
assert.ok(autonomousRun.day >= 4 && autonomousRun.shipped > 0 && autonomousRun.herbs >= 6
  && autonomousRun.coins >= 0, 'Several days of unattended play still harvest, transport and keep a valid economy');
element('reset-button').listeners.click();
runRaw('replaceFarmState(regressionFarmFixture())');
const festivalRun = run(`(() => {
  farm.day = 9; farm.phase = .2;
  farm.orders = [{ id: 70, crop: 'wheat', target: 3, progress: 0, due: 10, reward: 80, focus: true }];
  updateCourier(.05);
  const preFestivalLeg = courier.leg;
  farm.phase = .7;
  for (let i = 0; i < 100; i++) updateCourier(.05);
  const sleptInVillage = courier.night?.sleeping && courier.night.side === 'village';
  nextDay(); farm.phase = .2;
  for (let i = 0; i < 300; i++) updateActors(.05);
  const gathering = [courier, villageWalker, angler, orderKeeper, miner, ...workers]
    .every(actor => actor.festival?.stage === 'gather');
  const dutiesPaused = workers.every(worker => !worker.task);
  const savedClock = now, savedMotion = motionNow, savedPhase = farm.phase;
  const savedWorker = { x: workers[0].x, y: workers[0].y };
  const savedWalker = { x: villageWalker.x, y: villageWalker.y };
  const originalFillRect = ctx.fillRect;
  let festivalRects = [];
  ctx.fillRect = (x, y, width, height) => festivalRects.push([x, y, width, height]);
  farm.paused = true;
  now = 10;
  worker(workers[0]);
  const workerFirst = JSON.stringify(festivalRects);
  festivalRects = [];
  drawVillageWalker();
  const walkerFirst = JSON.stringify(festivalRects);
  festivalRects = [];
  now += .34;
  worker(workers[0]);
  const workerSecond = JSON.stringify(festivalRects);
  festivalRects = [];
  drawVillageWalker();
  const walkerSecond = JSON.stringify(festivalRects);
  // A calm pose can round to the same pixels in two adjacent samples; inspect a whole gesture cycle.
  let workerAnimated=workerFirst!==workerSecond,walkerAnimated=walkerFirst!==walkerSecond;
  for(let i=1;i<=16;i++){
    now=10+i*.23;festivalRects=[];worker(workers[0]);workerAnimated ||= JSON.stringify(festivalRects)!==workerFirst;
    festivalRects=[];drawVillageWalker();walkerAnimated ||= JSON.stringify(festivalRects)!==walkerFirst;
  }
  ctx.fillRect = originalFillRect;
  farm.paused = false;
  now = savedClock;
  const pausedCelebration = workerAnimated && walkerAnimated
    && motionNow === savedMotion && farm.phase === savedPhase
    && workers[0].x === savedWorker.x && workers[0].y === savedWorker.y
    && villageWalker.x === savedWalker.x && villageWalker.y === savedWalker.y;
  render();
  const snapshot = JSON.parse(JSON.stringify(captureRuntimeState()));
  validateRuntimeSnapshot(snapshot);
  const saved = JSON.parse(JSON.stringify({version:1,state:farm,runtime:snapshot}));
  const beforeAnglerX = angler.x;
  replaceFarmState(parseFarmSave(saved), saved.runtime);
  const restoredFestival = angler.x === beforeAnglerX
    && orderKeeper.festival?.stage === 'gather' && courier.festival?.stage === 'gather';
  farm.phase = .45;
  for (let i = 0; i < 300; i++) updateActors(.05);
  render();
  const result = { preFestivalLeg, sleptInVillage, due: farm.orders[0].due, gathering, dutiesPaused,
    pausedCelebration,
    restoredFestival,
    returned: [courier, villageWalker, angler, orderKeeper, miner, ...workers]
      .every(actor => actor.festival?.stage === 'home'),
    hiddenAtHome: !courierAt(courier.x,courier.y) && !villagerAt(villageWalker.x,villageWalker.y)
      && !anglerAt(angler.x,angler.y) && !orderKeeperAt(orderKeeper.x,orderKeeper.y),
    anglerAtHut: angler.x === ANGLER_HOME.x && angler.y === ANGLER_HOME.y,
    keeperAtRightHouse: orderKeeper.x === ORDER_KEEPER_HOME.x
      && landmarkAt(1900,740) === 'order-keeper-home',
    courierAtDoor: courier.x === COURIER_VILLAGE_DOOR.x && courier.y === COURIER_VILLAGE_DOOR.y,
    snapshotAngler: !!snapshot.angler?.festival };
  const homePositions = [courier, villageWalker, angler, orderKeeper, miner, ...workers]
    .map(actor => ({x:actor.x,y:actor.y}));
  nextDay(); updateActors(.05);
  result.dawnStayedHome = [courier, villageWalker, angler, orderKeeper, miner, ...workers]
    .every((actor,index) => actor.x === homePositions[index].x && actor.y === homePositions[index].y
      && festivalAtHome(actor));
  farm.phase=.03; updateActors(.05);
  const allActors=[courier,villageWalker,angler,orderKeeper,miner,...workers];
  result.noMorningJump=allActors.every((actor,index) =>
    Math.hypot(actor.x-homePositions[index].x,actor.y-homePositions[index].y) <= 12);
  result.leftFromHome = courier.y > COURIER_VILLAGE_DOOR.y
    && courier.y < COURIER_VILLAGE_DOOR.y + 9
    && angler.x < ANGLER_HOME.x && angler.x > ANGLER_HOME.x - 6
    && orderKeeper.y > ORDER_KEEPER_HOME.y && orderKeeper.y < ORDER_KEEPER_HOME.y + 6;
  const morningSave=JSON.parse(JSON.stringify({version:1,state:farm,runtime:captureRuntimeState()}));
  replaceFarmState(parseFarmSave(morningSave), morningSave.runtime);
  result.morningRestored = courier.festival?.stage==='morning'
    && angler.festival?.stage==='morning' && orderKeeper.festival?.stage==='morning';
  for(let i=0;i<220;i++) updateActors(.05);
  result.nextDayResumed = !courier.festival && !angler.festival && !orderKeeper.festival
    && angler.x === ANGLER_PIER.x && courier.x === COURIER_HOME.x
    && orderKeeper.x === MARKET_LAYOUT.notice.x + 63;
  return result;
})()`);
assert.equal(festivalRun.preFestivalLeg, 'market', 'The courier rests on the day before a celebration');
assert.ok(festivalRun.sleptInVillage, 'The courier sleeps in the village before the celebration');
assert.equal(festivalRun.due, 11, 'An existing order gains one day during a celebration');
assert.ok(festivalRun.gathering && festivalRun.dutiesPaused,
  'Every village character reaches the plaza and work stops');
assert.ok(festivalRun.pausedCelebration,
  'Paused celebrants keep moving in place while positions and farm time stay fixed');
assert.ok(festivalRun.returned && festivalRun.hiddenAtHome
  && festivalRun.snapshotAngler && festivalRun.restoredFestival,
  'Celebrants enter their homes and their routes survive a complete save round trip');
assert.ok(festivalRun.anglerAtHut && festivalRun.keeperAtRightHouse && festivalRun.courierAtDoor,
  'The angler, order keeper and courier return to their actual cottages');
assert.ok(festivalRun.dawnStayedHome && festivalRun.noMorningJump && festivalRun.leftFromHome
  && festivalRun.morningRestored && festivalRun.nextDayResumed,
  'The next day each villager leaves home visibly, with the morning trip surviving a save');
element('reset-button').listeners.click();
runRaw('replaceFarmState(regressionFarmFixture())');
const anglerCommute = run(`(() => {
  farm.day=12; farm.phase=NIGHT_START;
  updateVillageNeighbours(.05);
  const firstStep=distance(angler,ANGLER_PIER)>0 && distance(angler,ANGLER_PIER)<5
    && angler.routine?.stage==='toHome' && anglerAt(angler.x,angler.y);
  const tripSave=JSON.parse(JSON.stringify(captureRuntimeState()));
  validateRuntimeSnapshot(tripSave);
  restoreRuntimeSnapshot(tripSave);
  const restored=angler.routine?.stage==='toHome';
  for(let i=0;i<80;i++) updateVillageNeighbours(.05);
  const home=distance(angler,ANGLER_HOME)<2 && !anglerAt(angler.x,angler.y);
  farm.day=13; farm.phase=0; updateVillageNeighbours(.05);
  const stayed=distance(angler,ANGLER_HOME)<2 && !anglerAt(angler.x,angler.y);
  farm.phase=.03; updateVillageNeighbours(.05);
  const departed=distance(angler,ANGLER_HOME)>0 && distance(angler,ANGLER_HOME)<5
    && angler.routine?.stage==='toPier' && anglerAt(angler.x,angler.y);
  for(let i=0;i<80;i++) updateVillageNeighbours(.05);
  return {firstStep,restored,home,stayed,departed,pier:distance(angler,ANGLER_PIER)<2
    && !angler.routine};
})()`);
assert.ok(Object.values(anglerCommute).every(Boolean),
  'The angler walks between pier and hut on ordinary nights and mornings, including after a save');
element('reset-button').listeners.click();
runRaw('replaceFarmState(regressionFarmFixture())');
const orderKeeperCommute = run(`(() => {
  farm.day = 12; farm.phase = .03;
  orderKeeper = { ...resetOrderKeeper(), ...ORDER_KEEPER_HOME };
  const blocked = () => MARKET_LAYOUT.stalls.some(stall =>
    orderKeeper.x + 13 > stall.x && orderKeeper.x - 13 < stall.x + 118
    && orderKeeper.y + 23 > 844 && orderKeeper.y - 24 < 917)
    || (orderKeeper.x + 13 > MARKET_LAYOUT.notice.x
      && orderKeeper.x - 13 < MARKET_LAYOUT.notice.x + 45
      && orderKeeper.y + 23 > MARKET_LAYOUT.notice.y
      && orderKeeper.y - 24 < MARKET_LAYOUT.notice.y + 28)
    || distance(orderKeeper, MARKET_LAYOUT.fountain) < 52;
  let clear = true, continuous = true;
  const step = () => {
    const before = { x: orderKeeper.x, y: orderKeeper.y };
    updateVillageNeighbours(.05);
    clear &&= !blocked();
    continuous &&= distance(before, orderKeeper) <= (orderKeeper.gardenWork ? 7.75 : 5.5);
  };
  for (let i = 0; i < 30; i++) step();
  const midway = orderKeeper.routine?.stage === 'toNotice'
    && eastGardenKeeperActivity().includes('告示牌');
  const saved = JSON.parse(JSON.stringify(captureRuntimeState()));
  validateRuntimeSnapshot(saved);
  const position = { x: orderKeeper.x, y: orderKeeper.y };
  restoreRuntimeSnapshot(saved);
  const restored = orderKeeper.routine?.stage === 'toNotice'
    && distance(orderKeeper, position) === 0;
  for (let i = 0; i < 100; i++) step();
  const arrived = distance(orderKeeper, EAST_GARDEN_NOTICE) === 0 && !orderKeeper.routine;
  farm.phase = NIGHT_START;
  for (let i = 0; i < 130; i++) step();
  const home = distance(orderKeeper, ORDER_KEEPER_HOME) === 0 && !orderKeeperAt(orderKeeper.x, orderKeeper.y);
  farm.day = 13; farm.phase = 0; step();
  const dawn = distance(orderKeeper, ORDER_KEEPER_HOME) === 0;
  // Even a late departure must reach the notice board before starting garden work.
  farm.phase = .12;
  let gardenWaited = true;
  for (let i = 0; i < 130 && distance(orderKeeper, EAST_GARDEN_NOTICE) > 0; i++) {
    step(); gardenWaited &&= !orderKeeper.gardenWork;
  }
  const noticeBeforeGarden = distance(orderKeeper, EAST_GARDEN_NOTICE) === 0;
  step();
  const gardenStarted = orderKeeper.gardenWork?.stage === 'out';
  return { clear, continuous, midway, restored, arrived, home, dawn,
    gardenWaited, noticeBeforeGarden, gardenStarted };
})()`);
assert.ok(Object.values(orderKeeperCommute).every(Boolean),
  `A-Kui commutes around the market stalls, persists her trip and reaches the notice before garden work: ${JSON.stringify(orderKeeperCommute)}`);

element('reset-button').listeners.click();
runRaw('replaceFarmState(regressionFarmFixture())');
const restingCourier = run(`(() => {
  farm.day=10; farm.phase=.2; courier.leg='rest'; courier.journeyDay=9;
  courier.x=COURIER_REST.x; courier.y=COURIER_REST.y;
  for(let i=0;i<100;i++) updateCourier(.05);
  const resting=courier.night?.sleeping && !courier.festival.attending && courier.leg==='rest';
  farm.day=11; farm.phase=.03;
  for(let i=0;i<100;i++) updateCourier(.05);
  return {resting,resumed:courier.leg==='return'};
})()`);
assert.ok(restingCourier.resting && restingCourier.resumed,
  'A courier already on the farm rests through the celebration and resumes the route afterward');
element('reset-button').listeners.click();
runRaw('replaceFarmState(regressionFarmFixture())');
const pastureCelebration = run(`(() => {
  farm.upgrades=4; addPastureWorker(); farm.day=10; farm.phase=.2;
  for(let i=0;i<250;i++) updateActors(.05);
  const keeper=workers.find(worker=>worker.name==='阿牧');
  return {atPlaza:keeper.festival?.stage==='gather', path:keeper.festival?.out
    .some(point=>point.x===652&&point.y===PASTURE_WORKER_LAYOUT.home.y)};
})()`);
assert.ok(pastureCelebration.atPlaza && pastureCelebration.path,
  'The pasture keeper leaves his cottage via the western access to join the celebration');
element('reset-button').listeners.click();
runRaw('replaceFarmState(regressionFarmFixture())');
run("farm.upgrades=2;farm.honeyReady=true;farm.eggsReady=false;farm.fruitReady=false;cows.forEach(c=>c.milk=false);workers[0].task=null;workers[1].task=null;assignTask(workers[0])");
assert.equal(run('workers[0].task.type'), 'honey', 'A field worker collects the ready honey');
run('finishTask(workers[0].task,workers[0])');
assert.ok(run('farm.depots.farm.honey') >= 1, 'Honey is stored at the main farm');
run("farm.upgrades=4;farm.goatBarnOpen=true;farm.goatMilkReady=true;farm.woolReady=false;addPastureWorker();workers.find(w=>w.name==='阿牧').task=null;assignTask(workers.find(w=>w.name==='阿牧'))");
assert.equal(run("workers.find(w=>w.name==='阿牧').task.type"), 'goatMilk', 'The pasture keeper visits the goat barn');
run("finishTask(workers.find(w=>w.name==='阿牧').task,workers.find(w=>w.name==='阿牧'))");
assert.equal(run('farm.depots.pasture.goatMilk'), 1, 'Goat care produces a bottle for the pasture depot');
assert.ok(run(`(() => {
  const keeper=workers.find(w=>w.name==='阿牧');
  keeper.x=1090;keeper.y=918;keeper.task=null;keeper.route=[];
  farm.phase=.2;farm.woolReady=false;farm.goatMilkReady=false;
  let crossedBarn=false;
  for(let i=0;i<140;i++) {
    updateActors(.1);
    crossedBarn ||= inRect(keeper.x,keeper.y,GOAT_LAYOUT.barn.left,GOAT_LAYOUT.barn.top,
      GOAT_LAYOUT.barn.right,GOAT_LAYOUT.barn.bottom);
  }
  return !crossedBarn && distance(keeper,PASTURE_WORKER_LAYOUT.rest)<16;
})()`), 'The pasture keeper returns from the goat pen to the bench without crossing the barn');
assert.ok(run(`(() => {
  const saved=JSON.parse(JSON.stringify(captureRuntimeState()));
  const keeper=workers.find(w=>w.name==='阿牧'), restingX=keeper.x;
  keeper.x=1100;
  restoreRuntimeSnapshot(saved);
  return Math.abs(workers.find(w=>w.name==='阿牧').x-restingX)<1;
})()`), 'A full runtime archive restores the pasture keeper at the bench');
assert.ok(run(`(() => {
  farm.phase=.76;
  for(let i=0;i<150;i++) updateActors(.1);
  return distance(workers.find(w=>w.name==='阿牧'),PASTURE_WORKER_LAYOUT.home)<20;
})()`), 'The pasture keeper returns to his cottage at night');
element('reset-button').listeners.click();
runRaw('replaceFarmState(regressionFarmFixture())');
assert.equal(run('landmarkAt(1550,880)'), 'village', 'Market hint closes again after reset');
assert.equal(run('landmarkAt(800,1380)'), 'future-pasture', 'Sheep hint returns to its unopened state');

element('map-panel').getBoundingClientRect = () => ({ left: 0, top: 0, width: 1920, height: 1080 });
element('farm-map').getBoundingClientRect = () => element('map-panel').classList.contains('is-pure-mode')
  ? { left: 0, top: 0, width: 1920, height: 1080 }
  : { left: 0, top: 0, width: 1152, height: 816 };
element('pure-mode-toggle').click();
assert.equal(run('pureModeActive()'), true, 'The panorama button enters the fullscreen fallback');
assert.match(element('pure-mode-toggle').textContent, /退出纯享/);
assert.equal(run('H'), 816, 'Pure mode keeps its vertical world scale on a wide display');
assert.equal(run('W'), 1451, 'Pure mode widens the canvas to cover both sides of a 16:9 display');
assert.equal(element('farm-map').width, 1451, 'The canvas backing size follows the pure-mode viewport');
assert.equal(run('worldPadding().x'), 0, 'The full-size map has no side border');
const pureLeftWorld = run('screenToWorld(0,H/2).x');
assert.equal(pureLeftWorld, run('farm.view.x'), 'Full-screen pointer coordinates align with the map edge');
const purePointer = run('mousePosition({clientX:960,clientY:540})');
const pureCenter = run('screenToWorld(W/2,H/2)');
assert.ok(Math.abs(purePointer.x - pureCenter.x) < .01 && Math.abs(purePointer.y - pureCenter.y) < .01,
  'Full-screen pointer hit testing follows the expanded canvas');
assert.equal(run('farm.pureHints'), true, 'Full-screen hover hints start enabled');
const pureHintPoint=run('({x:(100-farm.view.x)*farm.view.zoom*1920/W,y:(400-farm.view.y)*farm.view.zoom*1080/H})');
element('farm-map').listeners.pointermove({clientX:pureHintPoint.x,clientY:pureHintPoint.y});
assert.equal(element('map-tooltip').hidden, false, 'The fullscreen map shows hover hints by default');
element('pure-hints-toggle').click();
assert.equal(run('farm.pureHints'), false);
element('farm-map').listeners.pointermove({clientX:pureHintPoint.x,clientY:pureHintPoint.y});
assert.equal(element('map-tooltip').hidden, true, 'The fullscreen hint switch hides hover text');
element('pure-hints-toggle').click();
element('farm-map').listeners.pointermove({clientX:pureHintPoint.x,clientY:pureHintPoint.y});
assert.equal(element('map-tooltip').hidden, false, 'Hover text returns when the switch is enabled');
run('setZoom(W / WORLD_W * .95)');
assert.ok(run('worldPadding().x') > 0, 'Side borders appear only after the map becomes narrower than the screen');
assert.ok(Math.abs(run('screenToWorld(worldPadding().x,H/2).x')) < .01,
  'The zoomed-out world begins immediately after its centered side border');
colors.length = 0;
run('render()');
assert.ok(colors.includes('#203328'), 'The empty area around a small map receives the dark border color');
run('setZoom(0)');
assert.equal(run('farm.view.zoom'), run('H / WORLD_H'), 'Wide fullscreen shrinks exactly until the whole map fits vertically');
assert.equal(element('zoom-out').disabled, true, 'The zoom-out control stops at the whole-map limit');
assert.equal(run('worldPadding().y'), 0, 'The fitted map touches the top and bottom edges');
assert.ok(run('worldPadding().x > 0 && farm.view.x === 0 && farm.view.y === 0'),
  'The complete map is centered horizontally with no hidden area');
run('setZoom(farm.view.zoom-.1)');
assert.equal(run('farm.view.zoom'), run('minimumZoom()'), 'Repeated zoom-out does not shrink past the exact fit');
assert.equal(Number(element('zoom-range').min), run('minimumZoom()'), 'The slider shares the fullscreen fit limit');
element('map-panel').getBoundingClientRect = () => ({ left: 0, top: 0, width: 900, height: 1600 });
run('resizeFarmViewport();setZoom(0)');
assert.equal(run('farm.view.zoom'), run('W / WORLD_W'), 'Portrait fullscreen fits the complete map horizontally');
assert.ok(run('Math.abs(worldPadding().x)<1e-9 && worldPadding().y>0'),
  'Portrait fit touches the left and right edges and centers vertically');
element('map-panel').getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, height: 1100 });
run('resizeFarmViewport();setZoom(minimumZoom())');
assert.equal(run('farm.view.zoom'), run('minimumZoom()'),
  'Selecting the exact fit does not round a fractional minimum back up');
element('map-panel').getBoundingClientRect = () => ({ left: 0, top: 0, width: 1152, height: 816 });
run('resizeFarmViewport();setZoom(0)');
element('pure-mode-toggle').click();
assert.equal(run('farm.view.zoom'), .7, 'Exiting fullscreen restores the normal minimum even when backing dimensions stay unchanged');
const fittedExitCenter = run('screenToWorld(W/2,H/2)');
assert.ok(Math.abs(fittedExitCenter.x-run('WORLD_W / 2'))<.01 && Math.abs(fittedExitCenter.y-960)<.01,
  'Leaving a fitted fullscreen map keeps the same world center');
element('map-panel').getBoundingClientRect = () => ({ left: 0, top: 0, width: 1920, height: 1080 });
element('pure-mode-toggle').click();
run('setZoom(.7)');
const liveViewForImage = run('farm.view');
const liveNowForImage = run('now');
const livePhaseForImage = run('farm.phase');
run("farm.phase=.75;farm.weatherFrom='rain';farm.weather='rain'");
exportPainted.length = 0;
exportColors.length = 0;
const fullImage = run('renderCompleteFarmCanvas()');
assert.equal(fullImage, getLatestImageCanvas());
assert.equal(fullImage.width, run('WORLD_W'));
assert.equal(fullImage.height, 1920);
assert.ok(exportPainted.some(([x, y]) => x > 1800 && y > 700), 'The image includes the unseen eastern village');
assert.ok(exportPainted.some(([x, y]) => x > 1900 && y > 1250), 'The image includes the unseen southern edge');
assert.ok(exportColors.includes('rgba(29,43,82,0.66)'), 'The image preserves the current nighttime light');
assert.ok(exportColors.includes('rgba(80,100,119,0.090)'), 'The image preserves the current rain');
assert.equal(run('farm.view'), liveViewForImage, 'Rendering the complete image keeps the live camera');
assert.equal(run('W'), 1451, 'Rendering the complete image keeps the live fullscreen canvas size');
assert.equal(run('now'), liveNowForImage, 'Rendering the complete image does not advance the simulation');
assert.equal(run('ctx === canvas.getContext("2d")'), true, 'Image rendering restores the visible canvas context');
run(`farm.phase=${livePhaseForImage};farm.weatherFrom='sunny';farm.weather='sunny'`);
assert.equal(typeof element('pure-map-export').listeners.click, 'function', 'The fullscreen image button is wired');
for (const handler of documentListeners.keydown) handler({ key: 'Escape', code: 'Escape', preventDefault() {} });
assert.equal(run('pureModeActive()'), false, 'Escape leaves the fullscreen fallback');
assert.equal(run('W'), 1152, 'Leaving pure mode restores the regular canvas width');
for (const handler of documentListeners.keydown) handler({ key: 'p', code: 'KeyP', repeat: false, preventDefault() {} });
assert.equal(run('pureModeActive()'), true, 'P enters the fullscreen panorama');
for (const handler of documentListeners.keydown) handler({ key: 'p', code: 'KeyP', repeat: false, preventDefault() {} });
assert.equal(run('pureModeActive()'), false, 'P exits the fullscreen panorama');
run('setZoom(1)');

assert.equal(run('validateRuntimeSnapshot(captureRuntimeState())'), true, 'The current moving world forms a valid snapshot');
run("farm.day=12;farm.phase=.34;farm.coins=777;farm.goatBarnOpen=true;farm.view.x=250;farm.plots[0].crop='pumpkin';farm.plots[0].age=1.5;farm.valleyHerbs[0].pickedAt=11;farm.valleyHerbs[0].readyAt=13;farm.herbTotal=4;farm.acornPickedTotal=2;farm.milkTotal=7;farm.depots.farm.wheat=3;farm.marketGoods={honey:2};farm.shippedTotal=7;farm.ledgerExpanded=true;cows[0].x=774;workers[0].x=540;courier.x=1180;courier.y=1206;courier.leg='return';courier.routeVariant=null;courier.plannedDepots=[...DEPOT_IDS];courier.journeyDay=11;courier.lastReturnDay=10;courier.stopIndex=7;courier.cargo={milk:2};meadowGoats[0].x=1080;now=123.4;motionNow=67.8;tool='plant';$('seed-select').value='corn'");
run('farm.upgrades=5;farm.development=makeLegacyVillageDevelopment(farm,captureRuntimeState())');
const archiveText = run('farmExportText()');
const archiveData = JSON.parse(archiveText);
const readableArchiveText = run('farmExportText(false)');
const readableArchiveData = JSON.parse(readableArchiveText);
assert.ok(!archiveText.includes('\n'), 'Default export is compact JSON');
assert.ok(readableArchiveText.includes('\n'), 'Readable export retains indentation and newlines');
assert.ok(archiveText.length < readableArchiveText.length, 'Compact formatting reduces the file size');
assert.deepEqual(archiveData.state, readableArchiveData.state, 'Formatting retains every persistent state field');
assert.deepEqual(archiveData.runtime, readableArchiveData.runtime, 'Formatting retains every motion snapshot field');
sandbox.readableArchiveText = readableArchiveText;
assert.equal(JSON.stringify(run('importFarmText(readableArchiveText)')),
  JSON.stringify(run('importFarmText(farmExportText())')), 'Both formats use the same complete-state import');
assert.equal(archiveData.format, 'moss-valley-farm');
assert.equal(archiveData.state.day, 12);
assert.equal(archiveData.state.plots[0].age, 1.5);
assert.equal(archiveData.state.valleyHerbs[0].readyAt, 13, 'Export retains an individual herb regrowth time');
assert.equal(archiveData.state.herbTotal, 4, 'Export retains the herb harvest tally');
assert.equal(archiveData.state.acornPickedTotal, 2, 'Export retains the acorn tally');
assert.equal(archiveData.state.milkTotal, 7, 'Export retains the lifetime milk tally');
assert.equal(archiveData.state.depots.farm.wheat, 3, 'Export retains goods awaiting collection');
assert.equal(archiveData.state.shippedTotal, 7, 'Export retains delivered goods');
assert.equal(archiveData.runtime.courier.cargo.milk, 2, 'Export retains goods already on the cart');
assert.equal(archiveData.runtime.courier.plannedDepots.length, run('DEPOT_IDS.length'), 'Export retains the departure-time route plan');
assert.equal(archiveData.state.ledgerExpanded, true, 'Export retains the ledger view');
assert.equal(archiveData.state.goatBarnOpen, true, 'Export retains the goat barn unlock');
assert.equal(archiveData.runtime.cows[0].x, 774);
assert.equal(archiveData.runtime.workers[0].x, 540);
assert.equal(archiveData.runtime.meadowGoats[0].x, 1080);
assert.equal(archiveData.runtime.valleyOtter.x, run('valleyOtter.x'));
assert.equal(archiveData.runtime.ridgeOwl.x, run('ridgeOwl.x'));
assert.equal(archiveData.runtime.ridgeOwl.patrolDay, run('ridgeOwl.patrolDay'), 'Export retains the owl patrol day');
assert.equal(archiveData.runtime.ridgeOwl.perchIndex, run('ridgeOwl.perchIndex'), 'Export retains the owl landing tree');
assert.equal(archiveData.runtime.now, 123.4);
assert.equal(archiveData.runtime.motionNow, 67.8, 'Export retains the travel clock');
assert.equal(archiveData.runtime.tool, 'plant');
element('export-zip').checked = false;
element('export-minify').checked = true;
element('export-farm').click();
assert.match(element('archive-status').textContent, /完整状态已导出（精简 JSON）/);
element('export-minify').checked = false;
element('export-farm').click();
assert.match(element('archive-status').textContent, /完整状态已导出（带缩进 JSON）/);
element('export-minify').checked = true;
element('export-zip').checked = true;
element('export-farm').click();
assert.match(downloads.at(-1).name, /苔谷农场-第12天\.zip$/, 'The ZIP export downloads a dated archive');
assert.equal(downloadBlobs.at(-1).type, 'application/zip');
assert.match(element('archive-status').textContent, /ZIP · 精简 JSON/);
const exportedZipBlob = downloadBlobs.at(-1);

sandbox.archiveText = archiveText;
const imported = run('importFarmText(archiveText)');
sandbox.importedArchive = imported;
run('replaceFarmState(newFarm());replaceFarmState(importedArchive.state,importedArchive.runtime)');
assert.equal(run('farm.day'), 12, 'Import restores the full farm day');
assert.equal(run('farm.coins'), 777, 'Import restores the economy');
assert.equal(run('farm.plots[0].age'), 1.5, 'Import restores crop growth');
assert.equal(run('farm.valleyHerbs[0].pickedAt'), 11, 'Import restores an individual herb bed');
assert.equal(run('farm.herbTotal'), 4, 'Import restores the herb harvest tally');
assert.equal(run('farm.acornPickedTotal'), 2, 'Import restores the acorn tally');
assert.equal(run('farm.milkTotal'), 7, 'Import restores the lifetime milk tally');
assert.equal(run('farm.depots.farm.wheat'), 3, 'Import restores goods in regional storage');
assert.equal(run('courier.cargo.milk'), 2, 'Import restores the moving cart cargo');
assert.equal(run('courier.stopIndex'), 7, 'Import resumes the route from its saved stop');
assert.equal(run('courier.leg'), 'return', 'Import resumes the second-day return leg');
assert.equal(run('courier.plannedDepots.length'), run('DEPOT_IDS.length'), 'Import preserves the route fixed at departure');
assert.equal(element('ledger-details').hidden, false, 'Import restores the expanded ledger');
assert.equal(run('farm.goatBarnOpen'), true, 'Import restores the goat barn unlock');
assert.equal(run('farm.view.x'), 250, 'Import restores the camera');
assert.equal(run('cows[0].x'), 774, 'Import restores animal positions');
assert.equal(run('workers[0].x'), 540, 'Import restores worker positions');
assert.equal(run('meadowGoats[0].x'), 1080, 'Import restores meadow life');
assert.equal(run('ridgeOwl.patrolDay'), archiveData.runtime.ridgeOwl.patrolDay, 'Import restores the owl patrol count');
assert.equal(run('ridgeOwl.perchIndex'), archiveData.runtime.ridgeOwl.perchIndex, 'Import restores the owl landing tree');
assert.equal(run('now'), 123.4, 'Import restores the animation clock');
assert.equal(run('motionNow'), 67.8, 'Import restores paused travel positions');
assert.equal(run('tool'), 'plant', 'Import restores the selected tool');
assert.equal(run("$('seed-select').value"), 'corn', 'Import restores the selected seed');
assert.equal(JSON.parse(getStoredSave()).runtime.cows[0].x, 774, 'Automatic browser saves retain moving actors too');
const invalidMotion = JSON.parse(archiveText);
invalidMotion.runtime.workers[0].x = null;
sandbox.invalidMotionText = JSON.stringify(invalidMotion);
assert.throws(() => run('importFarmText(invalidMotionText)'), /工人状态不正确/, 'Invalid motion data cannot replace the current world');
const invalidCargo = JSON.parse(archiveText);
invalidCargo.runtime.courier.cargo.milk = -1;
sandbox.invalidCargoText = JSON.stringify(invalidCargo);
assert.throws(() => run('importFarmText(invalidCargoText)'), /运货路线不正确/, 'A damaged delivery cart is rejected');
const invalidPlan = JSON.parse(archiveText);
invalidPlan.runtime.courier.plannedDepots = ['unknown-box'];
sandbox.invalidPlanText = JSON.stringify(invalidPlan);
assert.throws(() => run('importFarmText(invalidPlanText)'), /运货路线不正确/, 'Unknown stops cannot enter a saved route');
const invalidDepot = JSON.parse(archiveText);
invalidDepot.state.depots.farm.wheat = -2;
sandbox.invalidDepotText = JSON.stringify(invalidDepot);
assert.throws(() => run('importFarmText(invalidDepotText)'), /暂存货物不正确/, 'Damaged regional stock is rejected');
const invalidArchive = JSON.parse(archiveText);
invalidArchive.state.plots[0].crop = 'unknown-crop';
sandbox.invalidArchiveText = JSON.stringify(invalidArchive);
assert.throws(() => run('importFarmText(invalidArchiveText)'), /田地数据不正确/, 'Malformed imports are rejected before replacing the farm');
const displacedHerb = JSON.parse(archiveText);
displacedHerb.state.valleyHerbs[0].x += 100;
sandbox.displacedHerbText = JSON.stringify(displacedHerb);
assert.throws(() => run('importFarmText(displacedHerbText)'), /香草园数据不正确/, 'An invalid herb bed cannot move into the river through import');
const partialArchive = JSON.parse(archiveText);
delete partialArchive.runtime;
const partialArchiveText = JSON.stringify(partialArchive);
sandbox.partialArchiveText = partialArchiveText;
assert.throws(() => run('importFarmText(partialArchiveText)'), /完整状态存档/, 'Imports require a complete motion snapshot');
assert.equal(run('farm.day'), 12, 'A rejected import keeps the current farm');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const stylesheets = [...html.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)"/g)].map(match => match[1]);
const css = stylesheets.map(filename => fs.readFileSync(path.join(root, filename), 'utf8')).join('\n').replace(/\s*([{}:;])\s*/g, '$1');
const allScripts = fs.readdirSync(path.join(root, 'js'), { recursive: true })
  .filter(filename => filename.endsWith('.js')).map(filename => filename.replaceAll('\\', '/')).sort();
assert.equal(new Set(scripts).size, scripts.length, 'Every script is loaded exactly once');
assert.deepEqual([...scripts].sort(), allScripts, 'Every JS module has an entry in the page loader');
assert.deepEqual([...stylesheets].sort(), fs.readdirSync(path.join(root, 'css'))
  .filter(filename => filename.endsWith('.css')).map(filename => `css/${filename}`).sort(),
  'Every component stylesheet has an entry in the page loader');
assert.equal(new Set(stylesheets).size, stylesheets.length, 'Every stylesheet is loaded exactly once');
const moduleLoadsBefore = (first, second) => assert.ok(scripts.indexOf(first) < scripts.indexOf(second), `${first} loads before ${second}`);
moduleLoadsBefore('core/config.js', 'core/state.js');
moduleLoadsBefore('core/storage.js', 'core/state.js');
moduleLoadsBefore('core/economy.js', 'core/state.js');
moduleLoadsBefore('life/festival-life.js', 'life/angler-life.js');
moduleLoadsBefore('life/festival-life.js', 'life/order-keeper.js');
moduleLoadsBefore('life/farm-workers.js', 'core/runtime-snapshot.js');
moduleLoadsBefore('art/drawing-context.js', 'art/farm-art.js');
moduleLoadsBefore('ui/map-input.js', 'ui/app.js');
assert.equal(scripts.at(-1), 'ui/app.js', 'Bootstrap starts only after all modules and listeners are defined');
assert.equal(stylesheets.at(-1), 'css/responsive.css', 'Responsive overrides follow all component styles');
assert.match(html, /id="farm-map" width="1152" height="816"/);
assert.match(html, /id="mini-map" width="260" height="217"/);
assert.match(css, /\.map-wrap\{[^}]*aspect-ratio:24\/17/);
assert.match(css, /\.map-panel:is\(:fullscreen,\.is-pure-mode\) \.map-wrap\{[^}]*width:100vw;height:100vh/, 'Pure mode uses the full viewport');
assert.match(css, /#mini-map\{[^}]*aspect-ratio:260\/217/);
assert.match(css, /\.ledger-goods-item\{[^}]*grid-template-columns:max-content minmax\(0,1fr\)/,
  'Wrapped freight details align under the contents after each depot name');
assert.match(html, /id="pure-mode-toggle"/);
assert.match(html, /id="pure-hints-toggle"/);
assert.match(html, /id="export-farm"/);
assert.match(html, /id="export-minify" type="checkbox" checked/, 'The export control defaults to compact JSON');
assert.match(html, /id="export-zip" type="checkbox" checked/, 'The export control defaults to ZIP');
assert.ok(pageScripts.indexOf('../../libs/fflate@0.8.3/fflate.min.js') < pageScripts.indexOf('js/core/archive-codec.js'),
  'The local ZIP library loads before the archive codec');
assert.ok(fs.existsSync(path.resolve(root, '../../libs/fflate@0.8.3/fflate.min.js')), 'The offline ZIP bundle exists');
assert.match(html, /id="export-map-image"/);
assert.match(html, /id="pure-map-export"/);
assert.match(html, /id="import-farm-file"/);
assert.ok(!html.includes('id="next-day"'), 'There is no instant day skip control');
for (const asset of [...html.matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)"/g)].map(match => match[1])) {
  assert.ok(fs.existsSync(path.join(root, asset)), `${asset} exists`);
}
(async () => {
  const dayBeforeImage = run('farm.day');
  const viewBeforeImage = run('farm.view');
  await run('exportCompleteFarmImage()');
  assert.match(downloads.at(-1).name, /苔谷农场-第12天-.*-全图\.png/, 'Image export downloads a dated PNG');
  assert.match(element('archive-status').textContent, /2560 × 1920/, 'Image export reports the full resolution');
  assert.equal(run('farm.day'), dayBeforeImage, 'Saving an image does not change the farm day');
  assert.equal(run('farm.view'), viewBeforeImage, 'Saving an image does not change the camera');
  assert.equal(element('export-map-image').disabled, false, 'The image button is re-enabled after encoding');
  const input = element('import-farm-file');
  const importArchiveThroughPicker = input.listeners.change;
  run('replaceFarmState(newFarm())');
  input.files = [Object.assign(new Blob([archiveText]), { name: '农场.json' })];
  await input.listeners.change({ target: input });
  assert.equal(run('farm.day'), 12, 'The file picker imports the selected complete archive');
  assert.equal(run('workers[0].x'), 540, 'The file picker restores worker activity');
  assert.match(element('archive-status').textContent, /完整农场状态已导入/);
  input.files = [Object.assign(new Blob([partialArchiveText]), { name: '不完整.json' })];
  await input.listeners.change({ target: input });
  assert.match(element('archive-status').textContent, /完整状态存档/, 'The file picker reports an incomplete archive');
  assert.equal(run('farm.day'), 12, 'A failed file import leaves the current farm intact');
  // ZIP is detected from file content, so selecting a file requires no format switch.
  const zipBaseline = JSON.parse(run('farmExportText()'));
  for (const minify of [true, false]) {
    sandbox.zipMinify = minify;
    const download = run('createFarmArchiveDownload(farmExportText(zipMinify), "苔谷农场.json", true)');
    assert.equal(download.name, '苔谷农场.zip');
    const file = Object.assign(download.blob, { name: minify ? '苔谷农场.zip' : 'renamed.data' });
    sandbox.selectedArchiveFile = file;
    const restoredText = await run('readFarmArchiveFile(selectedArchiveFile)');
    const decoded = JSON.parse(restoredText);
    assert.deepEqual(decoded.state, zipBaseline.state, 'ZIP retains every farm state field');
    assert.deepEqual(decoded.runtime, zipBaseline.runtime, 'ZIP retains every actor and route field');
    run('replaceFarmState(newFarm())');
    input.files = [file];
    await input.listeners.change({ target: input });
    assert.equal(run('farm.day'), 12, 'ZIP upload restores the saved day');
    assert.equal(run('workers[0].x'), 540, 'ZIP upload restores moving characters');
    assert.equal(run('courier.cargo.milk'), 2, 'ZIP upload retains cargo on the cart');
    assert.match(element('archive-status').textContent, /完整农场状态已导入/);
    assert.equal(input.value, '', 'ZIP upload clears the picker for selecting the same file again');
  }
  sandbox.selectedArchiveFile = Object.assign(exportedZipBlob, { name: 'clicked-export.zip' });
  const clickedZipText = await run('readFarmArchiveFile(selectedArchiveFile)');
  assert.deepEqual(JSON.parse(clickedZipText).state, archiveData.state, 'The export button writes complete state into ZIP');
  const zipFixtures = [
    [new Blob(['broken ZIP']), /无法解压 ZIP/],
    [run('new Blob([fflate.zipSync({"note.txt":fflate.strToU8("not a farm archive")})])'), /没有 JSON 存档/],
    [run('new Blob([fflate.zipSync({"a.json":fflate.strToU8("{}"),"b.json":fflate.strToU8("{}")})])'), /多个 JSON/],
    [run('new Blob([fflate.zipSync({"large.json":fflate.strToU8(" ".repeat(FARM_ARCHIVE_MAX_BYTES + 1))})])'), /ZIP 内的存档超过 2 MB/],
    [run('new Blob([fflate.zipSync({"incomplete.json":fflate.strToU8("{}")})])'), /完整状态存档/],
    [new Blob([' '.repeat(2_000_001)]), /文件超过 2 MB/]
  ];
  const beforeRejectedZip = JSON.stringify(run('({state:farm,runtime:captureRuntimeState()})'));
  for (const [blob, message] of zipFixtures) {
    input.files = [Object.assign(blob, { name: 'invalid.zip' })];
    await input.listeners.change({ target: input });
    assert.match(element('archive-status').textContent, message);
    assert.equal(JSON.stringify(run('({state:farm,runtime:captureRuntimeState()})')), beforeRejectedZip,
      'Invalid ZIP never replaces the current farm or character state');
  }

  // The release ZIP is the source; HTTP and file:// loading must restore the same full snapshot.
  {
  // Release snapshots must bypass the earlier legacy-world scenario adapter, which
  // intentionally rewrites infrastructure dates to match each synthetic scenario.
  const run=runRaw;
  const releaseZip = fs.readFileSync(path.join(root, run('DEFAULT_FARM_SAVE.url')));
  assert.deepEqual(Buffer.from(run('DEFAULT_FARM_SAVE.base64'), 'base64'), releaseZip,
    'The local-page fallback matches the published ZIP byte for byte');
  const releaseArchive = JSON.parse(run('farmZipArchiveText(Uint8Array.from(atob(DEFAULT_FARM_SAVE.base64), c => c.charCodeAt(0)))'));
  assert.equal(releaseArchive.state.day, run('DEFAULT_FARM_SAVE.day'));
  sandbox.releaseSnapshot = JSON.parse(JSON.stringify(releaseArchive));
  releaseArchive.state = JSON.parse(run('JSON.stringify(parseFarmSave(releaseSnapshot))'));
  const beforeDefault = JSON.parse(run('farmExportText()'));
  const storedBeforeDefault = getStoredSave();
  const loadDefault = element('load-default-farm').listeners.click;
  function assertReleaseWorld(actual, message) {
    // Camera clamping can introduce a subpixel floating-point rounding difference.
    for (const axis of ['x', 'y']) assert.ok(Math.abs(actual.view[axis] - releaseArchive.state.view[axis]) < 1e-8);
    assert.equal(actual.view.zoom, releaseArchive.state.view.zoom);
    assert.deepEqual({ ...actual, view: releaseArchive.state.view }, releaseArchive.state, message);
  }
  try {
    sandbox.fetch = async url => {
      assert.equal(url, run('DEFAULT_FARM_SAVE.url'));
      assert.equal(element('load-default-farm').disabled, true, 'Repeated clicks are disabled while loading');
      return { ok: true, blob: async () => new Blob([releaseZip]) };
    };
    sandbox.confirm = () => false;
    await loadDefault();
    assert.match(element('archive-status').textContent, /已取消/);
    assert.deepEqual(JSON.parse(run('farmExportText()')).state, beforeDefault.state);
    assert.deepEqual(JSON.parse(run('farmExportText()')).runtime, beforeDefault.runtime);
    assert.equal(getStoredSave(), storedBeforeDefault, 'Cancel never overwrites the automatic save');

    sandbox.confirm = () => { throw new Error('Invalid archives must be rejected before confirmation'); };
    sandbox.fetch = async () => ({ ok: false });
    await loadDefault();
    assert.match(element('archive-status').textContent, /无法读取默认存档/);
    sandbox.fetch = async () => ({ ok: true, blob: async () => new Blob(['broken ZIP']) });
    await loadDefault();
    assert.ok(element('archive-status').classList.contains('error'));
    assert.deepEqual(JSON.parse(run('farmExportText()')).state, beforeDefault.state);
    assert.deepEqual(JSON.parse(run('farmExportText()')).runtime, beforeDefault.runtime);
    assert.equal(getStoredSave(), storedBeforeDefault, 'Read and validation failures preserve the automatic save');

    sandbox.confirm = () => true;
    for (const protocol of ['http:', 'file:']) {
      sandbox.location.protocol = protocol;
      sandbox.fetch = async () => {
        assert.notEqual(protocol, 'file:', 'Directly opened local pages do not use fetch');
        return { ok: true, blob: async () => new Blob([releaseZip]) };
      };
      await loadDefault();
      assert.ok(element('archive-status').textContent.includes(`已加载 v${run('DEFAULT_FARM_SAVE.release')} 默认农场`));
      assert.equal(element('load-default-farm').disabled, false);
      assertReleaseWorld(JSON.parse(run('farmExportText()')).state, `${protocol} loading retains all default farm fields`);
      const loadedReleaseRuntime=JSON.parse(run('farmExportText()')).runtime;
      assert.deepEqual(loadedReleaseRuntime,releaseArchive.runtime,
        `${protocol} loading retains every movement, cargo, animal and activity field`);
      assertReleaseWorld(JSON.parse(getStoredSave()).state, 'Loaded farm is saved immediately');
      assert.deepEqual(JSON.parse(getStoredSave()).runtime, loadedReleaseRuntime, 'The complete runtime is saved immediately');
      sandbox.releaseCachedText = getStoredSave();
      const cachedRelease = run('parseFarmSave(JSON.parse(releaseCachedText))');
      sandbox.cachedRelease = cachedRelease;
      run('replaceFarmState(cachedRelease, JSON.parse(releaseCachedText).runtime)');
      assert.deepEqual(JSON.parse(run('farmExportText()')).runtime, loadedReleaseRuntime,
        'The browser cache restores every runtime field');
      sandbox.restoreDefaultState = structuredClone(beforeDefault.state);
      sandbox.restoreDefaultRuntime = structuredClone(beforeDefault.runtime);
      run('replaceFarmState(restoreDefaultState, restoreDefaultRuntime)');
    }
  } finally {
    sandbox.confirm = () => true;
    sandbox.location.protocol = 'http:';
    sandbox.restoreDefaultState = structuredClone(beforeDefault.state);
    sandbox.restoreDefaultRuntime = structuredClone(beforeDefault.runtime);
    run('replaceFarmState(restoreDefaultState, restoreDefaultRuntime)');
    delete sandbox.fetch;
  }

  // Keep old-release migration coverage separate from whichever default release is selected.
  const legacyFolder=path.join(root,'saves/v1.0');
  const legacyZipNames=fs.readdirSync(legacyFolder).filter(name=>name.endsWith('.zip'));
  assert.equal(legacyZipNames.length,1);
  sandbox.legacyZipBytes=new Uint8Array(fs.readFileSync(path.join(legacyFolder,legacyZipNames[0])));
  const legacyArchive=JSON.parse(run('farmZipArchiveText(legacyZipBytes)'));
  sandbox.legacySnapshot=structuredClone(legacyArchive);
  run('replaceFarmState(parseFarmSave(legacySnapshot),legacySnapshot.runtime)');
  const {forestFox: restoredFox,...originalRuntime}=JSON.parse(run('farmExportText()')).runtime;
  const {acornDay: restoredAcornDay,...legacyKeeper}=originalRuntime.forestKeeper;
  assert.equal(restoredAcornDay,0,'The v1.0 keeper starts with no new acorn collection');
  originalRuntime.forestKeeper=legacyKeeper;
  assert.deepEqual(originalRuntime,legacyArchive.runtime,'v1.0 migration preserves all original runtime fields');
  const foxClock=legacyArchive.runtime.motionNow??legacyArchive.runtime.now;
  assert.equal(restoredFox.x,1190+Math.sin(foxClock*.34)*55,'v1.0 fox retains the original visible x');
  assert.equal(restoredFox.y,466+Math.sin(foxClock*.23)*24,'v1.0 fox retains the original visible y');
  sandbox.restoreDefaultState=structuredClone(beforeDefault.state);
  sandbox.restoreDefaultRuntime=structuredClone(beforeDefault.runtime);
  run('replaceFarmState(restoreDefaultState,restoreDefaultRuntime)');
  }

  const liveHover = run(`(() => {
    const originalState=JSON.parse(JSON.stringify(farm)),originalRuntime=JSON.parse(JSON.stringify(captureRuntimeState()));
    const originalBounds=canvas.getBoundingClientRect;
    try {
      replaceFarmState(newFarm());farm.paused=true;farm.view={x:0,y:0,zoom:1};tool='plant';
      canvas.getBoundingClientRect=()=>({left:0,top:0,width:W,height:H});
      const plot=farm.plots[0],x=(plot.x+.5)*T,y=(plot.y+.5)*T;
      Object.assign(plot,{crop:'wheat',age:0,watered:true,plantedAt:null});farm.phase=.1;
      canvas.listeners.pointermove({clientX:x,clientY:y});
      const before=tooltip.textContent;farm.phase=.7;
      // No additional pointer events: the render loop must refresh even while paused.
      tick(last+65);tick(last+65);
      const grows=hover?.plot===plot && tooltip.textContent!==before && /35%/.test(tooltip.textContent);
      plot.age=crops.wheat.days;updateUI();
      const matures=/可以收获/.test(tooltip.textContent);
      plot.watered=false;updateUI();
      const watered=/需要浇水/.test(tooltip.textContent);
      canvas.listeners.pointerleave();tick(last+65);tick(last+65);
      const leaves=tooltip.hidden && hover===null && mapHoverPointer===null;
      tool='inspect';farm.phase=.2;cows[0].x=750;cows[0].y=395;cows[1].x=880;cows[1].y=480;
      canvas.listeners.pointermove({clientX:750,clientY:395});
      const cowHit=hover?.target===cows[0];
      cows[0].x=830;cows[0].y=450;
      updateMapHover(.1);
      const moved=tooltip.hidden && hover===null;
      cows[1].x=750;cows[1].y=395;updateMapHover(.1);
      const noSwitch=tooltip.hidden;
      canvas.listeners.pointermove({clientX:750,clientY:395});
      const reselect=!tooltip.hidden && hover?.target===cows[1];
      // A different cow in the same spot must not keep the old cow's selected identity.
      cows[1].x=880;cows[1].y=480;cows[0].x=750;cows[0].y=395;updateMapHover(.1);
      const replaced=tooltip.hidden && hover===null;
      farm.forage=[{id:'hover-test',kind:'mushroom',x:1050,y:450}];
      canvas.listeners.pointermove({clientX:1050,clientY:450});
      const forageHit=hover?.target===farm.forage[0];
      collectForage(farm.forage[0]);
      const picked=tooltip.hidden && hover===null;
      tool='plant';farm.view={x:0,y:0,zoom:1};
      canvas.listeners.pointermove({clientX:x,clientY:y});
      panByScreen(-160,0);
      const pan=tooltip.hidden && hover===null;
      farm.view={x:0,y:0,zoom:1};canvas.listeners.pointermove({clientX:x,clientY:y});
      canvas.getBoundingClientRect=()=>({left:0,top:900,width:1152,height:816});
      updateMapHover(.1);
      const scroll=tooltip.hidden && mapHoverPointer===null;
      canvas.getBoundingClientRect=()=>({left:0,top:0,width:W,height:H});
      canvas.listeners.pointermove({clientX:x,clientY:y});canvas.listeners.pointercancel();
      const cancelled=tooltip.hidden && hover===null && mapHoverPointer===null;
      return {grows,matures,watered,leaves,cowHit,moved,noSwitch,reselect,replaced,forageHit,picked,pan,scroll,cancelled};
    } finally {canvas.getBoundingClientRect=originalBounds;replaceFarmState(originalState,originalRuntime);}
  })()`);
  assert.ok(Object.values(liveHover).every(Boolean),
    `悬停文字在鼠标静止时更新；对象离开、采摘、拖动视角、页面滚动和指针取消均清除提示：${JSON.stringify(liveHover)}`);
  const cachedSave = getStoredSave();
  const bootWithCache = (cache, write = () => {}) => {
    const freshSandbox = vm.createContext({
      document: sandbox.document,
      localStorage: { getItem: key => key === 'moss-valley-farm-v1' ? cache : null, setItem: write },
      performance: { now: () => 0 }, requestAnimationFrame() {},
      location: { protocol: 'http:' }, confirm: () => true,
      Math, console, Blob, URL: { createObjectURL: () => 'blob:smoke', revokeObjectURL() {} }, setTimeout: handler => handler()
    });
    for (const filename of pageScripts.filter(filename => filename !== 'js/ui/sidebar-layout.js')) {
      vm.runInContext(fs.readFileSync(path.resolve(root, filename), 'utf8'), freshSandbox, { filename });
    }
    return code => vm.runInContext(code, freshSandbox);
  };
  const reopened = bootWithCache(cachedSave);
  assert.equal(reopened('farm.day'), 12, 'Reload restores the browser-cached day');
  assert.equal(reopened('farm.coins'), 777, 'Reload restores the browser-cached economy');
  assert.equal(reopened('farm.goatBarnOpen'), true, 'Reload restores the goat barn unlock');
  assert.equal(reopened('farm.valleyHerbs[0].pickedAt'), 11, 'Reload restores herb growth');
  assert.equal(reopened('workers[0].x'), 540, 'Reload restores moving actors');
  const previousCache = JSON.parse(cachedSave);
  for (const key of ['depots', 'marketGoods', 'shippedTotal', 'goatMilkTotal', 'honeyReady', 'goatMilkReady']) delete previousCache.state[key];
  delete previousCache.runtime.courier;
  previousCache.runtime.workers = previousCache.runtime.workers.filter(worker => worker.name !== '阿栀' && worker.name !== '阿麦');
  const upgradedCache = bootWithCache(JSON.stringify(previousCache));
  assert.equal(upgradedCache('farm.day'), 12, 'A browser cache from before logistics keeps its farm progress');
  assert.equal(upgradedCache('workers.length'), upgradedCache('farm.upgrades >= 4 ? 6 : 5'),
    'New specialists join an existing cached farm when their areas are open');
  assert.equal(upgradedCache('DEPOT_IDS.reduce((sum,id)=>sum+depotCount(id),0)'), 0, 'Old cache starts with empty new depots');
  let blockedWrites = 0;
  const unreadable = bootWithCache('{bad json', () => { blockedWrites++; });
  assert.equal(unreadable('cacheLoadError'), true, 'Unreadable cache enters recovery mode');
  unreadable('save()');
  assert.equal(blockedWrites, 0, 'Automatic save does not overwrite an unreadable existing cache');
  assert.match(element('archive-status').textContent, /原数据已保留/, 'The page explains that the original cache remains available');
  unreadable('replaceFarmState(newFarm())');
  assert.equal(blockedWrites, 1, 'Explicit reset can replace the unreadable cache');
  assert.match(element('archive-status').textContent, /自动存档已恢复/, 'The recovery warning clears after an explicit reset');
  run('replaceFarmState(newFarm())');
  assert.equal(run('farm.nursery.level'), 0, 'The southwest nursery begins as an unbuilt meadow');
  assert.equal(run('depotAt(NURSERY_LAYOUT.depot.x,NURSERY_LAYOUT.depot.y)'), null,
    'The nursery box stays hidden until the first beds open');
  assert.equal(run('nurseryKeeperAt(nurseryKeeper.x,nurseryKeeper.y)'), false,
    '阿芽 stays inside her cottage before the beds appear');
  assert.match(run('describe(485,1400).text'), /阿芽的小屋/);
  const wetlandEcology = run(`(() => {
    farm.day=3;farm.phase=.22;farm.weather='sunny';farm.weatherFrom='sunny';
    const bird=wetlandWaterhenPosition();
    const birdHint=describe(bird.x,bird.y).text;
    const dragonflies=wetlandDragonfliesVisible();
    const plantHint=describe(106,1735).text;
    interactWetlandCreature({kind:'waterhen'});
    const stirred=farm.nursery.wildlifeStirUntil>motionNow;
    farm.weather='rain';farm.weatherFrom='rain';
    const rainy=wetlandDragonfliesVisible();
    farm.weather='sunny';farm.weatherFrom='sunny';farm.phase=.7;
    const fireflies=wetlandFirefliesVisible();
    farm.day=28;
    const winterFireflies=wetlandFirefliesVisible();
    return {birdHint,dragonflies,plantHint,stirred,rainy,fireflies,winterFireflies};
  })()`);
  assert.match(wetlandEcology.birdHint, /黑水鸡/);
  assert.match(wetlandEcology.plantHint, /香蒲/);
  assert.equal(run('landmarkAt(450,1778)'), 'nursery-wetland',
    'The expanded marsh has the wetland hint beyond its open water');
  assert.equal(run('landmarkAt(NURSERY_LAYOUT.rest.x,NURSERY_LAYOUT.rest.y)'), 'nursery',
    'The nursery bench stays hidden before any beds open');
  assert.ok(run('NURSERY_LAYOUT.rest.y + 16 < NURSERY_LAYOUT.paths.entry.y'),
    'The bench sits wholly north of the nursery lane');
  assert.equal(run('landmarkAt(NURSERY_LAYOUT.creekLookout.x,NURSERY_LAYOUT.creekLookout.y)'), 'wetland-lookout',
    'The lakeside birdwatch platform has its own hint before the nursery opens');
  assert.equal(run('landmarkAt(NURSERY_LAYOUT.creekBridge.x,NURSERY_LAYOUT.creekBridge.y)'), 'wetland-bridge',
    'The wooden footbridge is distinct from the water below it');
  assert.equal(run('landmarkAt(wetlandCreekCenter(1550),1550)'), 'wetland-creek',
    'The shallow stream connects the lake and marsh on the map');
  assert.ok(wetlandEcology.dragonflies && wetlandEcology.stirred && !wetlandEcology.rainy
    && wetlandEcology.fireflies && !wetlandEcology.winterFireflies,
  'Wetland insects respond to weather, daylight and seasons');
  assert.ok(JSON.parse(getStoredSave()).state.nursery.wildlifeStirUntil > 0,
    'The wetland interaction survives a complete save');
  run('replaceFarmState(newFarm())');
  const nurseryRun = run(`(() => {
    farm.shippedTotal=100;farm.phase=.2;updateNurseryMilestones(VILLAGE_WORK_DAY);
    const opened=farm.nursery.level===1 && nurseryActiveBeds()===4
      && depotAt(NURSERY_LAYOUT.depot.x,NURSERY_LAYOUT.depot.y)==='nursery';
    farm.nursery.beds[0].pickedAt=farm.day-3;
    farm.nursery.beds[0].readyAt=farm.day-.1;
    const picked=collectNurseryBed(0) && farm.depots.nursery.flowerBundle===1;
    farm.phase=.2;for(let i=0;i<150;i++)updateNurseryLife(.05);
    const walked=distance(nurseryKeeper,NURSERY_LAYOUT.home.door)>20;
    farm.nursery.wetness=.77;farm.nursery.frogJumpUntil=motionNow+2;
    const memory=JSON.parse(JSON.stringify({state:farm,runtime:captureRuntimeState()}));
    validateRuntimeSnapshot(memory.runtime);
    replaceFarmState(parseFarmSave({version:1,state:memory.state,runtime:memory.runtime}),memory.runtime);
    const restored=farm.nursery.level===1 && farm.depots.nursery.flowerBundle===1
      && nurseryKeeper.x===memory.runtime.nurseryKeeper.x
      && farm.nursery.wetness===.77 && farm.nursery.frogJumpUntil===memory.state.nursery.frogJumpUntil;
    farm.nursery.beds[1].pickedAt=farm.day-3;
    farm.nursery.beds[1].readyAt=farm.day-.1;
    for(let i=0;i<220 && !farm.depots.nursery.seedPacket;i++)updateNurseryLife(.05);
    const autonomous=farm.depots.nursery.seedPacket>=1 && farm.nursery.harvestTotal>=2;
    const herb=farm.valleyHerbs[0];herb.readyAt=farm.day-.1;
    const herbBoost=collectValleyHerb(herb) && herb.readyAt-herb.pickedAt<2;
    farm.shippedTotal=200;farm.phase=.2;updateNurseryMilestones(VILLAGE_WORK_DAY);
    const expanded=nurseryActiveBeds()===7;
    farm.day=3;farm.fruitReady=false;nextDay();
    const orchardBoost=farm.fruitReady;
    const stops=courierReturnBase(['lake','nursery','pasture']).filter(point=>point.depot)
      .map(point=>point.depot).join(',');
    render();drawMiniMap();
    return {opened,picked,walked,restored,autonomous,herbBoost,expanded,orchardBoost,stops};
  })()`);
  assert.ok(nurseryRun.opened && nurseryRun.picked && nurseryRun.walked && nurseryRun.restored
    && nurseryRun.autonomous && nurseryRun.herbBoost && nurseryRun.expanded && nurseryRun.orchardBoost,
    'Nursery restoration, individual harvest, 阿芽 movement and complete save round trip work together');
  assert.equal(nurseryRun.stops, 'lake,nursery,pasture',
    'The courier visits the lake box, then the wetland box, then the pasture box');
  const oldNursery = run(`(() => {
    const old = newFarm();
    old.day = 983; old.phase = .4; old.shippedTotal = 22272;
    old.nursery.level = 3; old.nursery.beds = old.nursery.beds.slice(0, 6);
    old.nursery.beds[0].pickedAt = 980; old.nursery.beds[0].readyAt = 985;
    const restored = parseFarmSave({version:1,state:old});
    return {day:restored.day,count:restored.nursery.beds.length,
      firstPicked:restored.nursery.beds[0].pickedAt,
      addedReady:restored.nursery.beds.slice(6).every(b=>b.builtAt!==null&&b.readyAt>983.4)};
  })()`);
  assert.ok(oldNursery.day===983 && oldNursery.count===10 && oldNursery.firstPicked===980
    && oldNursery.addedReady,
  'A six-bed day-983 archive retains its progress and gains the new nursery plots');
  const restRoutes = run(`(() => NURSERY_LAYOUT.beds.every(bed => {
    nurseryKeeper.x=bed.x;nurseryKeeper.y=bed.y;
    const route=nurseryKeeperPath('rest');
    return route.length<=4 && route.every(point=>point.x<354||point.y<1478)
      && route.at(-1).x===NURSERY_LAYOUT.rest.x
      && route.at(-1).y===NURSERY_LAYOUT.rest.y;
  }))()`);
  assert.ok(restRoutes, '阿芽 crosses the grass to the bench without going back to the entry road');
  const relocatedRest = run(`(() => {
    farm.shippedTotal=100;
    farm.day=3;farm.phase=.3;farm.nursery.level=1;
    for(const bed of farm.nursery.beds)bed.readyAt=nurseryClock()+5;
    nurseryKeeper=resetNurseryKeeper();
    Object.assign(nurseryKeeper,{x:368,y:1618,goal:'rest',path:[]});
    updateNurseryKeeper(.05);
    return landmarkAt(NURSERY_LAYOUT.rest.x,NURSERY_LAYOUT.rest.y)==='nursery-bench'
      && nurseryKeeper.path.at(-1)?.y===NURSERY_LAYOUT.rest.y;
  })()`);
  assert.ok(relocatedRest, 'An older saved idle position sends 阿芽 to the relocated bench');
  const nurseryChain = run(`(() => {
    replaceFarmState(newFarm());farm.day=3;farm.phase=.2;farm.nursery.level=3;
    for(const bed of farm.nursery.beds)bed.readyAt=nurseryClock()+5;
    for(const index of [0,1,2])farm.nursery.beds[index].readyAt=nurseryClock()-.1;
    Object.assign(nurseryKeeper,{...NURSERY_LAYOUT.beds[0],goal:'bed',bedIndex:0,path:[],action:0});
    updateNurseryKeeper(.6);
    const direct=nurseryKeeper.goal==='bed'&&nurseryKeeper.bedIndex===1
      && nurseryKeeper.path.at(-1).x===NURSERY_LAYOUT.beds[1].x
      && !nurseryKeeper.path.some(point=>distance(point,NURSERY_LAYOUT.rest)<3);
    const snapshot=JSON.parse(JSON.stringify(captureRuntimeState()));
    validateRuntimeSnapshot(snapshot);restoreRuntimeSnapshot(snapshot);
    const persisted=nurseryKeeper.bedIndex===1
      && JSON.stringify(nurseryKeeper.path)===JSON.stringify(snapshot.nurseryKeeper.path);
    let noEarlyRest=true;
    for(let i=0;i<300&&farm.nursery.harvestTotal<3;i++) {
      updateNurseryKeeper(.05);
      if(farm.nursery.harvestTotal<3&&nurseryKeeper.goal==='rest')noEarlyRest=false;
    }
    const restOnlyWhenEmpty=farm.nursery.harvestTotal===3&&nurseryKeeper.goal==='rest';
    farm.nursery.beds[3].readyAt=nurseryClock()-.1;
    updateNurseryKeeper(.05);
    const resumesImmediately=nurseryKeeper.goal==='bed'&&nurseryKeeper.bedIndex===3;
    const clearPaths=NURSERY_LAYOUT.beds.every((from,fromIndex)=>
      NURSERY_LAYOUT.beds.every((to,toIndex)=>{
        if(fromIndex===toIndex)return true;
        nurseryKeeper.x=from.x;nurseryKeeper.y=from.y;
        let previous=from;
        for(const stop of nurseryBetweenBeds(from,to)) {
          const length=distance(previous,stop),steps=Math.max(1,Math.ceil(length/2));
          for(let step=0;step<=steps;step++) {
            const x=previous.x+(stop.x-previous.x)*step/steps;
            const y=previous.y+(stop.y-previous.y)*step/steps;
            if(NURSERY_LAYOUT.beds.some((bed,index)=>index!==fromIndex&&index!==toIndex
              && Math.abs(x-bed.x)<24&&Math.abs(y-bed.y)<15))return false;
          }
          previous=stop;
        }
        return true;
      }));
    return {direct,persisted,noEarlyRest,restOnlyWhenEmpty,resumesImmediately,clearPaths};
  })()`);
  assert.ok(Object.values(nurseryChain).every(Boolean),
    `阿芽连续采收，所有苗床未成熟才休息，苗畦间路线和存档保持正确：${JSON.stringify(nurseryChain)}`);
  run('replaceFarmState(newFarm())');
  const nurseryFreight = run(`(() => {
    farm.nursery.level=1;farm.phase=.2;farm.upgrades=5;syncRegressionInfrastructure();
    stockGood('lake','carp');stockGood('nursery','flowerBundle');stockGood('pasture','wool');
    updateCourier(.05);
    stockGood('nursery','seedPacket');
    for(let i=0;i<1000 && courier.leg!=='rest';i++)updateCourier(.05);
    const order=[],oldCollect=collectDepot;
    collectDepot=id=>{order.push(id);oldCollect(id);};
    farm.day=2;farm.phase=.2;
    updateCourier(.05);
    const planned=[...courier.plannedDepots];
    try {
      for(let i=0;i<2000 && courier.leg!=='market';i++) {
        updateCourier(.05);
        if(!courierRoadAt(courier.x,courier.y))throw new Error('The nursery cart left the road');
      }
    } finally {collectDepot=oldCollect;}
    return {planned,order,leg:courier.leg,shipped:farm.shippedTotal};
  })()`);
  assert.equal(Array.from(nurseryFreight.order).join(','), 'lake,nursery,pasture',
    'The complete wetland freight trip follows the requested pickup sequence');
  assert.ok(nurseryFreight.planned.includes('nursery') && nurseryFreight.leg==='market'
    && nurseryFreight.shipped===4, 'New stock at a planned wetland stop is collected on arrival');
  run('replaceFarmState(newFarm())');
  const nurseryFestival = run(`(() => {
    farm.day=10;farm.phase=.2;nurseryKeeper=resetNurseryKeeper();
    for(let i=0;i<300;i++)updateNurseryKeeper(.05);
    const gathered=nurseryKeeper.festival?.stage==='gather';
    farm.phase=.45;for(let i=0;i<300;i++)updateNurseryKeeper(.05);
    return gathered && nurseryKeeper.festival?.stage==='home'
      && distance(nurseryKeeper,NURSERY_LAYOUT.home.door)<2;
  })()`);
  assert.ok(nurseryFestival, '阿芽 joins the celebration and returns to her own cottage');
  assert.ok(run(`(() => {
    const lane=MINE_LAYOUT.paths[0], turn=MINE_MARKET_ROUTE.find(stop=>stop.y===950 && stop.x>1950);
    const basket=MARKET_LAYOUT.garden.basket;
    return lane.x===turn.x-16 && lane.x===1972
      && turn.x-44>basket.x+17
      && RIVER_BRIDGES[2].eastRoad>=lane.x+lane.w;
  })()`), 'The shifted market road and the full cart width clear the village vegetable basket');
  assert.ok(run(`(() => {
    const base=JSON.parse(JSON.stringify(captureRuntimeState()));
    for(const [mode,index] of [['toMarket',4],['returnCart',2]]) {
      const route=(mode==='toMarket'?MINE_MARKET_ROUTE:MINE_MARKET_ROUTE.slice().reverse())
        .map(stop=>stop.x===1988?{x:1956,y:stop.y}:stop);
      const archived=JSON.parse(JSON.stringify(base));
      archived.miner={...resetMiner(),x:1956,y:1114,mode,route,routeIndex:index,cargo:{stone:1}};
      restoreRuntimeSnapshot(archived);
      if(miner.x!==1988 || miner.route.some(stop=>stop.x===1956)
        || !mineRoadAt(miner.x,miner.y)) return false;
    }
    return true;
  })()`), 'A saved in-progress delivery or return switches from the old market lane to the shifted lane');
  run('replaceFarmState(newFarm())');
  const mineRun = run(`(() => {
    const separation = MINE_LAYOUT.paths[0].x - MARKET_LAYOUT.garden.right >= 32
      && !MINE_LAYOUT.nodes.some(node => inRect(node.x,node.y,
        MINE_LAYOUT.home.left,MINE_LAYOUT.home.top,MINE_LAYOUT.home.right,MINE_LAYOUT.home.bottom));
    const mineral = MINE_LAYOUT.nodes[0];
    const picked = collectMineNode(0) && farm.mine.stock.stone === 1
      && mineNodeAt(mineral.x,mineral.y) === 0 && !mineNodeReady(0);
    farm.mine.stock.stone = 2;
    miner.nextDeliveryDay = 10;
    farm.day=10;farm.phase=.16;
    for(let i=0;i<220;i++)updateMineLife(.05);
    const gathered=miner.festival?.stage==='gather'
      && farm.mine.stock.stone===2 && miner.nextDeliveryDay===10;
    const festivalSave=JSON.parse(JSON.stringify(captureRuntimeState()));
    validateRuntimeSnapshot(festivalSave);
    restoreRuntimeSnapshot(festivalSave);
    farm.phase=.46;
    for(let i=0;i<260;i++)updateMineLife(.05);
    const slept=miner.festival?.stage==='home' && distance(miner,MINE_HOME)<2;
    farm.day=11;farm.phase=.2;
    let stayedOnRoad=true, pickedUpCart=false, startedAtHome=distance(miner,MINE_HOME)<2;
    for(let i=0;i<260 && farm.mine.deliveredTotal===0;i++) {
      updateMineLife(.05);
      pickedUpCart ||= miner.mode==='toMarket' && distance(miner,MINE_CART_BAY)<15;
      if(['toCart','toMarket'].includes(miner.mode) && !mineRoadAt(miner.x,miner.y,3)) stayedOnRoad=false;
    }
    const delivered=farm.mine.deliveredTotal===2 && farm.mine.incomeTotal===26
      && farm.mine.marketGoods.stone===2 && miner.nextDeliveryDay===15
      && farm.mine.stock.stone===0 && miner.mode==='returnCart';
    const tripSave=JSON.parse(JSON.stringify(captureRuntimeState()));
    validateRuntimeSnapshot(tripSave);
    const savedFarm=JSON.parse(JSON.stringify(farm));
    replaceFarmState(parseFarmSave({version:1,state:savedFarm}),tripSave);
    const restored=miner.mode==='returnCart' && farm.mine.deliveredTotal===2
      && farm.mine.marketGoods.stone===2 && miner.nextDeliveryDay===15;
    farm.phase=.2;
    let cartParked=false, teaRest=false, teaHome=false, neverMined=true, teaSeconds=0;
    for(let i=0;i<650 && miner.mode!=='homeRest';i++) {
      updateMineLife(.05);
      cartParked ||= miner.mode==='toTea' && distance(miner,MINE_CART_BAY)<15;
      teaRest ||= miner.mode==='teaRest' && distance(miner,MINE_TEA_SEAT)<2;
      if(miner.mode==='teaRest') teaSeconds+=.05;
      teaHome ||= miner.mode==='teaHome';
      if (['returnCart','toTea','teaHome'].includes(miner.mode)
        && !mineRoadAt(miner.x,miner.y,4)) stayedOnRoad=false;
      if (['toNode','mining'].includes(miner.mode)) neverMined=false;
    }
    return {separation,picked,gathered,slept,startedAtHome,stayedOnRoad,delivered,restored,
      pickedUpCart,cartParked,teaRest,teaHome,neverMined,longTea:teaSeconds>=7,
      returned:miner.mode==='homeRest'&&distance(miner,MINE_HOME)<2&&!minerAt(MINE_HOME.x,MINE_HOME.y),
      rightStall:landmarkAt(1840,880)==='mine-market-stall',
      mineHome:landmarkAt(MINE_HOME.x,MINE_HOME.y+24)==='mine-home',
      cartBay:landmarkAt(MINE_CART_BAY.x,MINE_CART_BAY.y)==='mine-cart-bay'};
  })()`);
  assert.ok(Object.values(mineRun).every(Boolean),
    `The miner delivers, returns the cart, rests at tea, then crosses the new bridge without mining: ${JSON.stringify(mineRun)}`);
  run('replaceFarmState(newFarm())');
  const mineTimedDay = run(`(() => {
    farm.day=4;farm.phase=.045;farm.mine.stock.stone=2;miner.nextDeliveryDay=4;
    let oldBridge=false,newBridge=false,tea=false,mining=false;
    for(let i=0;i<800 && farm.phase<NIGHT_START;i++) {
      farm.phase+=.05/DAY_SECONDS;
      updateMineLife(.05);
      if(miner.mode==='toTea' && Math.abs(miner.x-1300)<5 && Math.abs(miner.y-1206)<2) oldBridge=true;
      if(miner.mode==='teaHome' && Math.abs(miner.x-1320)<5 && Math.abs(miner.y-1698)<2) newBridge=true;
      if(miner.mode==='teaRest') tea=true;
      if(['toNode','mining'].includes(miner.mode)) mining=true;
    }
    const homeBeforeNight=miner.mode==='homeRest'&&distance(miner,MINE_HOME)<2;
    farm.day=5;farm.phase=.046;updateMineLife(.05);
    return {oldBridge,newBridge,tea,noMining:!mining,homeBeforeNight,
      resumesNextDay:miner.mode==='toNode'};
  })()`);
  assert.ok(Object.values(mineTimedDay).every(Boolean),
    `The actual day clock leaves time for tea and both bridges before night: ${JSON.stringify(mineTimedDay)}`);
  run('replaceFarmState(newFarm())');
  const emptyMineDueDay = run(`(() => {
    farm.day=4;farm.phase=.1;miner.nextDeliveryDay=4;
    for(let i=0;i<300;i++)updateMineLife(.05);
    return miner.workedDay===4 && miner.deliveryDay!==4 && farm.mine.deliveredTotal===0;
  })()`);
  assert.ok(emptyMineDueDay, 'When no ore is ready to ship at departure, mining never turns into a same-day delivery');
  run('replaceFarmState(newFarm())');
  const emptyMineMorning = run(`(() => {
    farm.day=3;farm.phase=.02;
    for(const node of farm.mine.nodes)node.readyAt=mineClock()+2;
    updateMineLife(.05);
    const waitsForMorning=miner.mode==='home';
    farm.phase=.046;updateMineLife(.05);
    const leavesForRest=miner.mode==='returnRest'
      && miner.route.at(-1).x===MINE_REST.x&&miner.route.at(-1).y===MINE_REST.y;
    for(let i=0;i<20;i++)updateMineLife(.05);
    const snapshot=JSON.parse(JSON.stringify(captureRuntimeState()));
    validateRuntimeSnapshot(snapshot);restoreRuntimeSnapshot(snapshot);
    for(let i=0;i<100&&miner.mode!=='rest';i++)updateMineLife(.05);
    const reachedRest=miner.mode==='rest'&&distance(miner,MINE_REST)<2;
    farm.mine.nodes[2].readyAt=mineClock();updateMineLife(.05);
    const resumesMining=miner.mode==='toNode'&&miner.targetNode===2
      && distance(miner.route[0],MINE_REST)<1;
    return waitsForMorning&&leavesForRest&&reachedRest&&resumesMining;
  })()`);
  assert.ok(emptyMineMorning, 'On an empty mining morning 阿矿 walks to the rail rest, survives a save, and resumes when ore becomes ready');
  run('replaceFarmState(newFarm())');
  const mineWork = run(`(() => {
    farm.phase=.2;
    const first=MINE_LAYOUT.nodes[0], second=MINE_LAYOUT.nodes[1];
    Object.assign(miner,{x:first.x,y:first.y,mode:'mining',targetNode:0,action:0,
      route:MINE_WORK_ROUTE(0),routeIndex:MINE_WORK_ROUTE(0).length});
    updateMineLife(.7);
    const direct=miner.mode==='toNode' && miner.targetNode===1
      && miner.route[0].x===first.x && miner.route[1].x===1828
      && miner.route.at(-1).x===second.x;
    for(let i=2;i<MINE_LAYOUT.nodes.length;i++)farm.mine.nodes[i].readyAt=100;
    Object.assign(miner,{x:second.x,y:second.y,mode:'mining',targetNode:1,action:0,
      route:MINE_WORK_ROUTE(1),routeIndex:MINE_WORK_ROUTE(1).length});
    updateMineLife(.7);
    const restedOnlyWhenEmpty=miner.mode==='returnRest'
      && miner.route.at(-1).x===MINE_REST.x && miner.route.at(-1).y===MINE_REST.y;
    const snapshot=JSON.parse(JSON.stringify(captureRuntimeState()));
    validateRuntimeSnapshot(snapshot);restoreRuntimeSnapshot(snapshot);
    for(let i=0;i<180 && miner.mode!=='rest';i++)updateMineLife(.05);
    const atRailRest=miner.mode==='rest'&&distance(miner,MINE_REST)<2;
    farm.phase=NIGHT_START+.02;
    for(let i=0;i<180 && miner.mode!=='home';i++)updateMineLife(.05);
    const homeAtNight=miner.mode==='home'&&distance(miner,MINE_HOME)<2;
    const spurs=[...MINE_LAYOUT.nodes.map(node=>node.y),MINE_LAYOUT.entranceTurn.y,MINE_REST.y].sort((a,b)=>a-b);
    const railsSeparated=spurs.every((y,index)=>index===0||y-spurs[index-1]>=38)
      && MINE_LAYOUT.entrance.x>1828 && MINE_REST.x<1828;
    const eastDoor=MINE_HOME.x>MINE_LAYOUT.home.right
      && mineRoadAt(MINE_HOME.x,MINE_HOME.y)
      && landmarkAt(MINE_REST.x,MINE_REST.y-22)==='mine-rest';
    const node=MINE_LAYOUT.nodes[3];
    Object.assign(miner,{x:node.x,y:node.y,mode:'toNode',
      route:MINE_NODE_TO_NODE(2,3),routeIndex:4});
    const nightRoute=minerReturnRoute();
    const nightUsesRail=nightRoute[0].x===1828 && nightRoute[0].y===node.y
      && nightRoute[1].x===1828 && nightRoute.at(-1).x===MINE_HOME.x;
    return {direct,restedOnlyWhenEmpty,atRailRest,homeAtNight,railsSeparated,nightUsesRail,eastDoor};
  })()`);
  assert.ok(Object.values(mineWork).every(Boolean),
    `阿矿走向下一处可采矿脉，全部采完才去轨旁休息，夜里回东门小屋：${JSON.stringify(mineWork)}`);
  const caveBranch = run(`(() => {
    const cave=MINE_LAYOUT.entrance,turn=MINE_LAYOUT.entranceTurn;
    const rightBranches=[...MINE_LAYOUT.nodes.filter(node=>node.x>1828),turn].sort((a,b)=>a.y-b.y);
    const third=rightBranches[2]===turn&&turn.x===cave.x&&turn.x>1828&&cave.y<turn.y;
    const oldBranch=MINE_LAYOUT.nodes.some(node=>node.y===1590&&node.kind==='quartz');
    const clear=MINE_LAYOUT.nodes.every(node=>node.x+25<cave.x-43
      || node.x-25>cave.x+43||node.y+18<cave.y-62||node.y-25>cave.y+12);
    const hints=landmarkAt(cave.x,cave.y-25)==='mine-entrance'
      && mineNodeAt(1908,1590)===3;
    drawMineScenery();drawMiniMap();
    return third&&oldBranch&&clear&&hints&&cave.x+47<=WORLD_W;
  })()`);
  assert.ok(caveBranch, 'The third right branch turns north into the cave, leaving a separate clickable quartz vein on the old branch');

  run('replaceFarmState(newFarm())');
  const communityRoutines = run(`(() => {
    const originalState = JSON.parse(JSON.stringify(farm));
    const originalRuntime = JSON.parse(JSON.stringify(captureRuntimeState()));
    try {
      replaceFarmState(newFarm());
      const gatheringDay = Array.from({length:32},(_,i)=>i+1).find(day=>!isFestivalDay(day)&&hash(day,967)<.5);
      const strollingDay = Array.from({length:32},(_,i)=>i+1).find(day=>!isFestivalDay(day)&&hash(day,967)>=.5);
      farm.day = gatheringDay; farm.phase = .14; farm.paused = false;
      const mushrooms = [[1060,340],[1090,455],[1150,520],[1210,580],[1950,570]].map(([x,y],i)=>({id:'ranger-'+i,x,y,kind:'mushroom'}));
      farm.forage = [...mushrooms,{id:'untouched-berry',x:1070,y:520,kind:'berry'},
        {id:'untouched-acorn',x:1170,y:525,kind:'acorn'}];
      forestKeeper = resetForestKeeper();
      updateForestKeeper(.05);
      const decision = forestKeeper.day===gatheringDay && forestKeeper.choice==='gather';
      let pathSafe = true, savedPicking = false, chained = false;
      for(let i=0;i<700;i++) {
        const priorMode=forestKeeper.mode, priorPicked=forestKeeper.picked;
        updateForestKeeper(.05);
        pathSafe &&= forestGroundClear(forestKeeper.x,forestKeeper.y);
        if(priorMode==='picking' && forestKeeper.picked===priorPicked+1 && forestKeeper.picked<3)
          chained ||= forestKeeper.mode==='toMushroom';
        if(forestKeeper.mode==='picking' && forestKeeper.action>.3 && !savedPicking) {
          const snapshot=JSON.parse(JSON.stringify(captureRuntimeState()));
          const before=JSON.stringify(snapshot.forestKeeper);
          validateRuntimeSnapshot(snapshot);restoreRuntimeSnapshot(snapshot);
          savedPicking = JSON.stringify(forestKeeper)===before;
        }
      }
      const quota = forestKeeper.picked===3 && farm.mushroomPickedTotal===3
        && depotCount('forest')===3 && farm.forage.filter(s=>s.kind==='mushroom').length===2
        && farm.forage.some(s=>s.id==='untouched-berry') && farm.forage.some(s=>s.id==='untouched-acorn');
      const dryBridgeRoute=forestWalkingRoute(FOREST_HOME,{x:1810,y:514});
      const bridge=dryBridgeRoute.length>0 && dryBridgeRoute.some(p=>p.x>=1247 && p.x<=1363 && p.y>=299 && p.y<=316)
        && dryBridgeRoute.slice(1).every((p,i)=>forestSegmentClear(dryBridgeRoute[i],p));
      farm.phase=NIGHT_START+.03;
      for(let i=0;i<800 && forestKeeper.mode!=='home';i++) updateForestKeeper(.05);
      const goesHome=distance(forestKeeper,FOREST_HOME)<2 && !forestKeeperVisible();
      updateForestKeeper(.05);validateRuntimeSnapshot(JSON.parse(JSON.stringify(captureRuntimeState())));
      farm.day=strollingDay; farm.phase=.08;
      updateForestKeeper(.05);
      const newChoice=forestKeeper.choice==='stroll' && forestKeeper.picked===0 && forestKeeper.day===strollingDay;
      const saved=JSON.parse(JSON.stringify(captureRuntimeState()));
      restoreRuntimeSnapshot(saved);updateForestKeeper(.05);
      const noReroll=forestKeeper.choice==='stroll';
      const beforeWildlife=farm.mushroomPickedTotal;
      Object.assign(forestKeeper,{x:1072,y:447,mode:'watching',wait:4});
      squirrel.x=1050;squirrel.y=420;squirrel.wait=0;squirrel.excited=0;
      visitForestAnimals();
      const interaction=squirrel.wait>0 && squirrel.excited>0 && farm.mushroomPickedTotal===beforeWildlife;
      const frozen=JSON.stringify(forestKeeper);farm.paused=true;updateForestKeeper(3);
      const pause=JSON.stringify(forestKeeper)===frozen;
      farm.paused=false;farm.day=10;farm.phase=.05;forestKeeper=resetForestKeeper();
      for(let i=0;i<400;i++)updateForestKeeper(.05);
      const festival=forestKeeper.day===0 && forestKeeper.choice===null
        && forestKeeper.festival.stage==='gather';
      validateRuntimeSnapshot(JSON.parse(JSON.stringify(captureRuntimeState())));
      farm.phase=.46;for(let i=0;i<400;i++)updateForestKeeper(.05);
      const festivalHome=forestKeeper.festival.stage==='home' && !forestKeeperVisible();
      farm.day=11;farm.phase=0;updateForestKeeper(.05);
      const startsAtHome=distance(forestKeeper,FOREST_HOME)<2 && forestKeeper.day===0;
      farm.phase=.03;updateForestKeeper(.05);
      const nextMorning=forestKeeper.day===11 && forestKeeper.choice!=null && distance(forestKeeper,FOREST_HOME)<2;
      const invalid=JSON.parse(JSON.stringify(captureRuntimeState()));invalid.forestKeeper.picked=4;
      let rejected=false;try{validateRuntimeSnapshot(invalid);}catch{rejected=true;}
      return {decision,pathSafe,savedPicking,chained,quota,bridge,goesHome,newChoice,noReroll,interaction,pause,
        festival,festivalHome,startsAtHome,nextMorning,rejected};
    } finally { replaceFarmState(originalState, originalRuntime); }
  })()`);
  assert.ok(Object.values(communityRoutines).every(Boolean),
    `阿森按日选择、连续采菇、走干地与北桥、互动、暂停、赴会返家及完整恢复：${JSON.stringify(communityRoutines)}`);
  const automaticFishing = run(`(() => {
    const originalState = JSON.parse(JSON.stringify(farm)), originalRuntime=JSON.parse(JSON.stringify(captureRuntimeState()));
    try {
      replaceFarmState(newFarm());farm.paused=false;farm.phase=.14;
      angler=resetAngler();angler.fishing={day:1,quota:2,caught:0,targetId:null,action:0};
      const first=JSON.parse(JSON.stringify(farm.fishSpots[0]));
      updateAnglerFishing(.5);
      const progress=angler.fishing.action===.5 && angler.fishing.targetId!=null;
      const snapshot=JSON.parse(JSON.stringify(captureRuntimeState()));restoreRuntimeSnapshot(snapshot);
      const resumed=angler.fishing.action===.5;
      farm.paused=true;updateAnglerFishing(3);const paused=angler.fishing.action===.5;
      farm.paused=false;for(let i=0;i<60;i++)updateAnglerFishing(.05);
      const firstCatch=angler.fishing.caught===1 && farm.fishTotal===1 && depotCount('lake')===1;
      for(let i=0;i<100;i++)updateAnglerFishing(.05);
      const spaced=angler.fishing.caught===1;
      farm.phase=.35;for(let i=0;i<100;i++)updateAnglerFishing(.05);
      const second=angler.fishing.caught===2 && farm.fishTotal===2 && depotCount('lake')===2;
      farm.phase=.5;for(let i=0;i<100;i++)updateAnglerFishing(.05);
      const quota=farm.fishTotal===2 && farm.carpTotal+farm.goldFishTotal===2;
      farm.day=10;farm.phase=.14;const before=farm.fishTotal;
      updateAnglerFishing(5);const festival=farm.fishTotal===before && angler.fishing.day===1;
      farm.day=11;farm.phase=.14;farm.fishSpawnDay=0;spawnFishForDay();angler=resetAngler();
      updateAnglerFishing(.3);const target=farm.fishSpots.find(fish=>fish.id===angler.fishing.targetId);
      catchFish(target);for(let i=0;i<80;i++)updateAnglerFishing(.05);
      const contested=farm.fishTotal===4 && angler.fishing.caught===1 && !farm.fishSpots.some(fish=>fish.id===target.id);
      farm.phase=NIGHT_START+.01;updateAnglerFishing(5);const night=farm.fishTotal===4;
      const bad=JSON.parse(JSON.stringify(captureRuntimeState()));bad.angler.fishing.caught=3;
      let rejects=false;try{validateRuntimeSnapshot(bad);}catch{rejects=true;}
      return {progress,resumed,paused,firstCatch,spaced,second,quota,festival,contested,night,rejects};
    } finally { replaceFarmState(originalState,originalRuntime); }
  })()`);
  assert.ok(Object.values(automaticFishing).every(Boolean),
    `阿蓼使用实际鱼点，分时限量钓鱼、暂停与存档续钓，玩家可先钓走鱼点：${JSON.stringify(automaticFishing)}`);

  const dailyForestCycle = run(`(() => {
    const originalState=JSON.parse(JSON.stringify(farm)),originalRuntime=JSON.parse(JSON.stringify(captureRuntimeState()));
    try {
      replaceFarmState(newFarm());farm.paused=false;
      let dry=true,home=true,decisions=true,saved=true;
      for(let day=1;day<=32;day++) {
        farm.day=day;spawnForageForDay();spawnFishForDay();
        const previousDay=forestKeeper.day;
        for(let step=0;step<720;step++) {
          farm.phase=step/720;
          updateForestKeeper(.1);updateVillageNeighbours(.1);updateAnglerFishing(.1);
          updateWildlife(.1);updateRidgeLife(.1);
          if(!isFestivalDay())dry &&= forestGroundClear(forestKeeper.x,forestKeeper.y);
          if(step%180===0)validateRuntimeSnapshot(JSON.parse(JSON.stringify(captureRuntimeState())));
        }
        home &&= distance(forestKeeper,FOREST_HOME)<2 && distance(angler,ANGLER_HOME)<2;
        decisions &&= isFestivalDay()?forestKeeper.day===previousDay:forestKeeper.day===day;
        saved &&= forestKeeper.picked<=3 && (!angler.fishing || angler.fishing.caught<=angler.fishing.quota);
      }
      return {dry,home,decisions,saved};
    } finally {replaceFarmState(originalState,originalRuntime);}
  })()`);
  assert.ok(Object.values(dailyForestCycle).every(Boolean),
    `32 天真实生成的采集点和鱼点、所有季节与三次欢庆日都有干地路线、夜晚归家和有效存档：${JSON.stringify(dailyForestCycle)}`);
  const communityUI = run(`(() => {
    const originalState=JSON.parse(JSON.stringify(farm)),originalRuntime=JSON.parse(JSON.stringify(captureRuntimeState()));
    try {
      replaceFarmState(newFarm());
      courier.leg='outbound';const pending=courierPlanText().includes('返程出发时规划');
      courier.leg='return';courier.plannedDepots=['farm','lake','nursery','forest'];courier.stopIndex=0;
      const plan=courierPlanText(), fixed=plan.includes('主场货箱 → 西湖鱼箱 → 湿地苗圃货箱 → 森林采集箱');
      courier.stopIndex=2;const next=courierPlanText().startsWith('下一站：西湖鱼箱') && courierPlanText().includes('✓ 主场货箱');
      courier.routeVariant='forest';courier.stopIndex=2;
      const delivered=courierPlanText().startsWith('下一站：村口集市');
      farm.events=[];
      for(let i=0;i<12;i++)record('日记测试 '+i);
      const today=farm.events.length===12 && $('event-list').children.length===12 && farm.events[0].text==='日记测试 11';
      const children=$('event-list').children;updateUI();updateUI();const stable=children===$('event-list').children;
      const parsed=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});const stored=parsed.events.length===12;
      const createElement=document.createElement;
      let anchored=false;
      try {
        document.createElement=function(tag) {
          const item=createElement(tag);
          if(tag==='li')Object.defineProperties(item,{
            offsetTop:{get(){return ($('event-list').children||[]).indexOf(item)*45+3;}},
            offsetHeight:{get(){return 33;}}
          });
          return item;
        };
        journalSignature='';updateJournalUI();$('event-list').scrollTop=100;
        const anchor=journalRenderedEvents[2];record('新消息出现在列表顶部');
        anchored=$('event-list').scrollTop===145 && journalRenderedEvents[3]===anchor;
      } finally {document.createElement=createElement;}

      const themes=[];for(const day of [40,10,20,30]) {
        farm.day=day;farm.phase=.2;themes.push(festivalTheme().action);
        drawCentralPlaza();worker({x:878,y:846,dir:1,walk:0,shirt:'#8b9670',hat:'#b4865d',festival:{stage:'gather'}});
      }
      const seasons=new Set(themes).size===4;
      farm.paused=true;farm.day=30;
      const actor={x:878},poseA=festivalGesture(actor);now+=.4;const poseB=festivalGesture(actor);
      const idle=poseA.bounce!==poseB.bounce;
      return {pending,fixed,next,delivered,today,stable,stored,anchored,seasons,idle};
    } finally {replaceFarmState(originalState,originalRuntime);}
  })()`);
  assert.ok(Object.values(communityUI).every(Boolean),
    `返程文字计划、当天完整日记、稳定列表和四季欢庆动作：${JSON.stringify(communityUI)}`);

  const celebrationChecks = run(`(() => {
    const originalState=JSON.parse(JSON.stringify(farm)), originalRuntime=JSON.parse(JSON.stringify(captureRuntimeState()));
    try {
      const samples=[0,120,300,301,500,5000,50000,1000000].map(coins=>festivalBudgetFor(coins));
      const setup=newFarm();setup.day=9;setup.phase=.4;setup.coins=100000;setup.upgrades=5;setup.goatBarnOpen=true;
      replaceFarmState(setup);nextDay();
      const charged=farm.coins===99000 && farm.celebration.budget===1000 && farm.celebration.level===3
        && farm.celebration.spentTotal===1000 && farm.celebration.count===1;
      farm.coins+=75;prepareFestival();
      const once=farm.coins===99075 && farm.celebration.openingCoins===100000;
      farm.phase=.18;
      for(let i=0;i<320;i++)updateActors(.05);
      const arrived=festivalParticipants().every(actor=>actor.festival?.stage==='gather');
      const kinds=new Set();let maxWalking=0,clear=true,minDistance=Infinity;
      for(let i=0;i<460;i++){
        farm.phase=i<200?.26:.36;updateActors(.05);
        const actors=festivalParticipants();
        maxWalking=Math.max(maxWalking,actors.filter(actor=>actor.festival.activity?.route.length).length);
        for(const actor of actors){
          clear &&=festivalWalkable(actor);
          if(actor.festival.activity && !actor.festival.activity.route.length)kinds.add(actor.festival.activity.kind);
        }
        for(let a=0;a<actors.length;a++)for(let b=a+1;b<actors.length;b++)minDistance=Math.min(minDistance,distance(actors[a],actors[b]));
      }
      farm.phase=.28;
      const snapshot=JSON.parse(JSON.stringify({version:1,state:farm,runtime:captureRuntimeState()}));
      const motion=JSON.stringify(snapshot.runtime),coins=farm.coins;
      replaceFarmState(parseFarmSave(snapshot),snapshot.runtime);
      const restored=JSON.stringify(captureRuntimeState())===motion && farm.coins===coins && farm.celebration.count===1;
      const actor=workers[0],position=JSON.stringify({x:actor.x,y:actor.y,activity:actor.festival.activity});
      farm.paused=true;updateFestivalActivity(actor,2,0);
      const paused=JSON.stringify({x:actor.x,y:actor.y,activity:actor.festival.activity})===position;
      farm.paused=false;
      const malformed=JSON.parse(JSON.stringify(snapshot));malformed.state.celebration.budget++;
      let rejectedBudget=false,rejectedActivity=false;
      try{parseFarmSave(malformed);}catch(_){rejectedBudget=true;}
      const invalid=JSON.parse(JSON.stringify(captureRuntimeState()));invalid.workers[0].festival.activity.index=1000;
      try{validateRuntimeSnapshot(invalid);}catch(_){rejectedActivity=true;}
      // Preview starts on a settled rich celebration without touching browser storage.
      const preview=JSON.parse(JSON.stringify({version:1,state:farm,runtime:captureRuntimeState()}));
      preview.state.paused=true;preview.state.view={x:575,y:405,zoom:1.05};
      const depot=DEPOT_SITES.forest;
      const depotClear=!riverAt(depot.x-23,depot.y+16,4) && !riverAt(depot.x+25,depot.y+16,4)
        && depot.x-23>1252 && depot.y+16<604;
      const oldWellClear=landmarkAt(935,881)==='central-plaza';
      farm.phase=.45;for(let i=0;i<450;i++)updateActors(.05);
      const returned=festivalParticipants().every(actor=>actor.festival.stage==='home');
      return {samples,charged,once,arrived,maxWalking,clear,minDistance,kinds:[...kinds],restored,paused,
        rejectedBudget,rejectedActivity,depotClear,oldWellClear,returned,preview};
    } finally {replaceFarmState(originalState,originalRuntime);}
  })()`);
  assert.deepEqual(Array.from(celebrationChecks.samples),[0,0,0,1,5,50,500,10000]);
  for(const key of ['charged','once','arrived','clear','restored','paused','rejectedBudget','rejectedActivity','depotClear','oldWellClear','returned'])
    assert.ok(celebrationChecks[key],`Celebration ${key}: ${JSON.stringify({...celebrationChecks,preview:undefined})}`);
  assert.ok(celebrationChecks.maxWalking>0 && celebrationChecks.maxWalking<=4,'At most four residents walk inside the plaza at once');
  assert.ok(celebrationChecks.minDistance>=24.9,'Moving celebrants keep clear of one another');
  assert.ok(celebrationChecks.kinds.includes('rest') && celebrationChecks.kinds.includes('perform')
    && celebrationChecks.kinds.includes('snack') && celebrationChecks.kinds.includes('dance'),'Celebrants use seating, refreshments and performances');
  if(process.env.FARM_PREVIEW_OUT)fs.writeFileSync(process.env.FARM_PREVIEW_OUT,JSON.stringify(celebrationChecks.preview));

  const plazaLifeChecks = run(`(() => {
    const originalState=JSON.parse(JSON.stringify(farm)), originalRuntime=JSON.parse(JSON.stringify(captureRuntimeState()));
    try {
      const state=newFarm();state.day=13;state.phase=.16;state.weather='sunny';state.weatherFrom='sunny';
      replaceFarmState(state);
      const house=PLAZA_PET_LAYOUT.house;
      const placement=house.top>17*T+28 && house.bottom<CENTRAL_PLAZA.top
        && !courierRoadAt((house.left+house.right)/2,house.bottom);
      const modes=new Set(),birdModes=new Set();let clear=true;
      const before=JSON.stringify({coins:farm.coins,depots:farm.depots,orders:farm.orders});
      for(let i=0;i<900;i++) {
        updatePlazaLife(.05);
        for(const cat of plazaCats) {
          modes.add(cat.mode);
          clear &&= cat.path.every(point=>point.y<632 || plazaPetWalkable(point));
          // Sample each remaining path segment, not only its endpoints.
          const points=[cat,...cat.path];
          for(let j=1;j<points.length;j++) {
            const a=points[j-1],b=points[j],steps=Math.max(1,Math.ceil(distance(a,b)/3));
            for(let n=0;n<=steps;n++) {
              const point={x:a.x+(b.x-a.x)*n/steps,y:a.y+(b.y-a.y)*n/steps};
              clear &&=point.y<632 || plazaPetWalkable(point);
            }
          }
        }
        plazaSparrows.forEach(bird=>birdModes.add(bird.mode));
        if(i%90===0)validateRuntimeSnapshot(JSON.parse(JSON.stringify(captureRuntimeState())));
      }
      const active=plazaCats.every(plazaCatVisible) && plazaSparrows.filter(plazaSparrowVisible).length>=3;
      const independent=JSON.stringify({coins:farm.coins,depots:farm.depots,orders:farm.orders})===before;
      const checkpoint=JSON.parse(JSON.stringify(captureRuntimeState()));
      const saved=JSON.stringify(checkpoint);
      restoreRuntimeSnapshot(checkpoint);
      const restored=JSON.stringify(captureRuntimeState())===saved;
      farm.paused=true;
      const frozen=JSON.stringify({cats:plazaCats,birds:plazaSparrows});updatePlazaLife(2);
      const paused=JSON.stringify({cats:plazaCats,birds:plazaSparrows})===frozen;
      farm.paused=false;
      const bird=plazaSparrows[0],site=PLAZA_PET_LAYOUT.birdSites[0];
      Object.assign(bird,{...site,tx:site.x,ty:site.y,mode:'peck',site:0,returning:false,wait:2,lift:0});
      Object.assign(plazaCats[0],{x:site.x+40,y:site.y,tx:site.x+40,ty:site.y,mode:'watch',path:[],wait:2});
      updatePlazaSparrows(.01);
      const catAvoidance=bird.mode==='fly' && bird.site>=0 && PLAZA_PET_LAYOUT.birdSites[bird.site].kind!=='ground';
      plazaCats[0].x=750;plazaCats[0].y=648;
      Object.assign(bird,{x:site.x,y:site.y,tx:site.x,ty:site.y,mode:'peck',site:0,returning:false,wait:2,lift:0});
      workers[0].x=site.x+40;workers[0].y=site.y;
      updatePlazaSparrows(.01);
      const humanAvoidance=bird.mode==='fly' && bird.site>=0 && PLAZA_PET_LAYOUT.birdSites[bird.site].kind!=='ground';
      workers[0].x=567;workers[0].y=285;
      const hint=describe(plazaCats[0].x,plazaCats[0].y).text.includes('橘白猫');
      greetPlazaCat(plazaCats[0]);
      const greeting=plazaCats[0].purr>0 && farm.events[0].text.includes('橘子');
      farm.weather='rain';
      for(let i=0;i<450;i++)updatePlazaLife(.1);
      const rain=plazaCats.every(cat=>cat.mode==='home') && plazaSparrows.every(bird=>bird.mode==='away');
      const rainPosition=JSON.stringify(plazaCats.map(cat=>[cat.x,cat.y]));
      for(let i=0;i<60;i++)updatePlazaLife(.1);
      const stay=JSON.stringify(plazaCats.map(cat=>[cat.x,cat.y]))===rainPosition;
      const houseHint=describe((house.left+house.right)/2,house.bottom-12).text.includes('避雨');
      farm.weather='sunny';
      for(let i=0;i<100;i++)updatePlazaLife(.1);
      farm.phase=NIGHT_START;
      for(let i=0;i<450;i++)updatePlazaLife(.1);
      const night=plazaCats.every(cat=>cat.mode==='home') && plazaSparrows.every(bird=>bird.mode==='away');
      farm.day=20;farm.phase=.16;
      for(let i=0;i<220;i++)updatePlazaLife(.1);
      const celebration=plazaSparrows.filter(plazaSparrowVisible).every(bird=>bird.site<0
        || PLAZA_PET_LAYOUT.birdSites[bird.site].kind!=='ground');
      const snapshot=JSON.parse(JSON.stringify(captureRuntimeState()));
      const malformedCat=JSON.parse(JSON.stringify(snapshot));malformedCat.plazaCats[0].path=[{x:NaN,y:0}];
      const malformedBird=JSON.parse(JSON.stringify(snapshot));malformedBird.plazaSparrows[0].site=999;
      let rejectedCat=false,rejectedBird=false;
      try{validateRuntimeSnapshot(malformedCat);}catch(_){rejectedCat=true;}
      try{validateRuntimeSnapshot(malformedBird);}catch(_){rejectedBird=true;}
      const previous=JSON.parse(JSON.stringify(snapshot));delete previous.plazaCats;delete previous.plazaSparrows;
      restoreRuntimeSnapshot(previous);
      const added=plazaCats.length===2 && plazaCats.every(cat=>cat.mode==='home') && plazaSparrows.length===5;
      farm.day=13;farm.phase=.16;farm.weather='sunny';farm.weatherFrom='sunny';
      for(let i=0;i<120;i++)updatePlazaLife(.1);
      farm.view={x:560,y:475,zoom:1.2};farm.paused=true;
      const preview={state:JSON.parse(JSON.stringify(farm)),runtime:JSON.parse(JSON.stringify(captureRuntimeState()))};
      render();
      return {placement,clear,active,independent,restored,paused,catAvoidance,humanAvoidance,hint,greeting,
        rain,stay,houseHint,night,celebration,rejectedCat,rejectedBird,added,modes:[...modes],birdModes:[...birdModes],preview};
    } finally {replaceFarmState(originalState,originalRuntime);}
  })()`);
  for(const key of ['placement','clear','active','independent','restored','paused','catAvoidance','humanAvoidance',
    'hint','greeting','rain','stay','houseHint','night','celebration','rejectedCat','rejectedBird','added'])
    assert.ok(plazaLifeChecks[key],`Plaza life ${key}: ${JSON.stringify({...plazaLifeChecks,preview:undefined})}`);
  assert.ok(plazaLifeChecks.modes.includes('move') && plazaLifeChecks.modes.some(mode=>['sleep','groom','stretch','watch'].includes(mode)),
    'Cats combine walks with stationary daily actions');
  assert.ok(plazaLifeChecks.birdModes.includes('fly') && plazaLifeChecks.birdModes.includes('peck'),
    'Sparrows fly between perches and pecking spots');
  if(process.env.PLAZA_PREVIEW_OUT)fs.writeFileSync(process.env.PLAZA_PREVIEW_OUT,JSON.stringify(plazaLifeChecks.preview));

  // Optional local archive verification; user files are never bundled into the repository.
  if (process.argv[2]) {
    const fixtureText = fs.readFileSync(path.resolve(process.argv[2]), 'utf8').replace(/^\uFEFF/, '');
    sandbox.fixtureText = fixtureText;
    const source = run('importFarmText(fixtureText)');
    const expectedState = JSON.parse(JSON.stringify(source.state));
    const expectedRuntime = JSON.parse(JSON.stringify(source.runtime));
    const fixtureDownload = run('createFarmArchiveDownload(fixtureText, `苔谷农场-第${JSON.parse(fixtureText).state.day}天.json`, true)');
    const fixtureFile = Object.assign(fixtureDownload.blob, { name: fixtureDownload.name });
    input.files = [fixtureFile];
    await importArchiveThroughPicker({ target: input });
    assert.match(element('archive-status').textContent, /完整农场状态已导入/);
    assert.deepEqual(JSON.parse(run('JSON.stringify(farm)')), expectedState, 'The supplied archive retains all world fields through ZIP import');
    assert.deepEqual(JSON.parse(run('JSON.stringify(captureRuntimeState())')), expectedRuntime,
      'The supplied archive retains all motion, work, festival and route fields through ZIP import');
    assert.deepEqual(JSON.parse(run('farmExportText()')).state, expectedState, 'Re-export retains the supplied farm state');
    if (process.argv[3]) fs.writeFileSync(path.resolve(process.argv[3]), Buffer.from(await fixtureFile.arrayBuffer()));
    console.log(`Supplied day ${expectedState.day} archive verified: ${Buffer.byteLength(fixtureText)} JSON bytes -> ${fixtureFile.size} ZIP bytes.`);
  }

  require('./town-checks.cjs')(run, assert);
  require('./town-postcard-checks.cjs')(run, assert);
  require('./town-projects-checks.cjs')(run, assert);
  require('./town-care-checks.cjs')(run, assert);
  require('./town-development-checks.cjs')(run, assert);
  require('./town-garden-checks.cjs')(run, assert);
  require('./town-social-checks.cjs')(run, assert);
  require('./town-tea-checks.cjs')(run, assert);
  require('./town-lantern-checks.cjs')(run, assert);
  require('./town-firefly-checks.cjs')(run, assert);
  require('./town-curio-checks.cjs')(run, assert);
  require('./town-dog-checks.cjs')(run, assert);
  require('./town-dog-stretch-checks.cjs')(run, assert);
  require('./town-rest-checks.cjs')(run, assert);
  require('./town-tea-party-checks.cjs')(run, assert);
  require('./town-cat-play-checks.cjs')(run, assert);
  require('./town-flower-care-checks.cjs')(run, assert);
  require('./town-east-layout-checks.cjs')(run, assert);
  require('./town-donkey-visit-checks.cjs')(run, assert);
  require('./town-birdbath-checks.cjs')(run, assert);
  require('./town-hearth-checks.cjs')(run, assert);
  require('./town-butterfly-checks.cjs')(run, assert);
  require('./town-fodder-checks.cjs')(run, assert);
require('./town-donkey-water-checks.cjs')(run, assert);
  require('./town-rain-gear-checks.cjs')(run, assert);
  require('./town-sketch-checks.cjs')(run, assert);
  require('./plaza-cat-company-checks.cjs')(run, assert);
  require('./plaza-eaves-checks.cjs')(run, assert);
require('./squirrel-meal-checks.cjs')(run, assert);
require('./forest-fox-checks.cjs')(run, assert);
require('./turtle-bask-checks.cjs')(run, assert);
require('./lake-duck-visit-checks.cjs')(run, assert);
require('./town-cat-water-checks.cjs')(run, assert);
require('./wetland-frog-song-checks.cjs')(run, assert);
require('./town-donkey-bond-checks.cjs')(run, assert);
require('./town-music-checks.cjs')(run, assert);
require('./town-chime-checks.cjs')(run, assert);
require('./town-porch-light-checks.cjs')(run, assert);
require('./town-snack-checks.cjs')(run, assert);
require('./heron-fishing-checks.cjs')(run, assert);
require('./town-child-snack-checks.cjs')(run, assert);
require('./town-bird-meal-checks.cjs')(run, assert);
require('./east-expansion-checks.cjs')(run, assert);
require('./east-keeper-checks.cjs')(run, assert);
require('./forest-acorn-checks.cjs')(run, assert);
require('./town-special-offer-checks.cjs')(run, assert);
  require('./cow-grazing-checks.cjs')(run, assert);
  require('./chicken-meal-checks.cjs')(run, assert);
  require('./town-boat-checks.cjs')(run, assert);
require('./bee-forager-checks.cjs')(run, assert);
require('./town-courier-meal-checks.cjs')(run, assert);
require('./east-shore-checks.cjs')(run, assert);
require('./east-duck-company-checks.cjs')(run, assert);
require('./east-canopy-checks.cjs')(run, assert);
  console.log('Farm smoke test passed: world rules, fullscreen, full-map PNG, save export/import, camera and economy.');
})().catch(error => { console.error(error); process.exitCode = 1; });
