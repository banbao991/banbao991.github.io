'use strict';
// Persistent farm defaults and live simulation clocks. Load only after config, storage and economy.
function eastGardenCropFor(index, day) {
  const choices = EAST_GARDEN_ROTATION[Math.floor((day - 1) / 8) % 4];
  return choices[Math.floor(hash(index + 81, day, 811) * choices.length)];
}

function makeEastGardenState(day = 1, phase = .08) {
  return { beds: Array.from({ length: EAST_GARDEN_BED_COUNT }, (_, index) => {
    const kind = eastGardenCropFor(index, day);
    const plantedAt = day + phase - hash(index, day, 812) * EAST_GARDEN_CROPS[kind].days;
    return { kind, plantedAt, readyAt: plantedAt + EAST_GARDEN_CROPS[kind].days,
      wateredDay: day - 1, tendedDay: day - 1 };
  }), basket: Object.fromEntries(Object.keys(EAST_GARDEN_CROPS).map(kind => [kind, 0])),
  harvestTotal: 0, servedTotal: 0, festivalDay: 0, festivalServed: 0 };
}

function makeMineState(day = 1) {
  return { nodes: MINE_LAYOUT.nodes.map((_, index) => ({ readyAt: day + (index % 3) * .07 })),
    stock: { stone: 0, copper: 0, quartz: 0 }, marketGoods: {},
    minedTotal: 0, deliveredTotal: 0, incomeTotal: 0, lastDeliveryDay: 0 };
}

function nurseryLevelForShipments(total) { return NURSERY_THRESHOLDS.filter(limit => total >= limit).length; }

function makeNurseryState(shippedTotal = 0, day = 1) {
  const level = nurseryLevelForShipments(shippedTotal);
  return { level, openedAt: level ? day : null, wetness: .46, harvestTotal: 0,
    frogJumpUntil: 0, wildlifeStirUntil: 0, beds: NURSERY_LAYOUT.beds.map((_, index) => ({
      builtAt: level ? day - 3 : null,
      pickedAt: day - (level ? 3 : 0), readyAt: level ? day - .1 : day + 1 + index * .12
    })) };
}

function fieldCells(bounds) {
  const cells = [];
  for (let y = bounds.top; y <= bounds.bottom; y++) for (let x = bounds.left; x <= bounds.right; x++) cells.push({ x, y });
  return cells;
}

function roadsideExpansionPlot(plot) {
  return (plot.x >= 8 && plot.x <= 18 && plot.y >= 10 && plot.y <= 17 && (plot.x === 18 || plot.y === 17))
    || (plot.x >= 10 && plot.x <= 17 && plot.y >= 19 && plot.y <= 23 && plot.y === 19);
}

function trimRoadsidePlots(state) {
  const removed = state.plots.filter(roadsideExpansionPlot);
  state.plots = state.plots.filter(plot => !roadsideExpansionPlot(plot));
  for (const plot of removed) {
    if (!plot.crop) continue;
    const sameField = candidate => plot.y >= 19 ? candidate.y >= 20 : candidate.y <= 16;
    const free = state.plots.find(candidate => sameField(candidate) && !candidate.crop);
    if (free) {
      free.crop = plot.crop;
      free.age = plot.age;
      free.watered = plot.watered;
      if (plot.plantedAt != null) free.plantedAt = plot.plantedAt;
    } else if (crops[plot.crop]) state.coins += crops[plot.crop].value;
  }
  state.fieldLayoutVersion = 2;
}

function newFarm() {
  const plots = [];
  const types = ['wheat', 'wheat', 'carrot', 'strawberry', 'carrot', 'pumpkin', 'corn'];
  for (let y = 10; y <= 15; y++) for (let x = 8; x <= 14; x++) {
    const crop = types[Math.floor(hash(x, y, 9) * types.length)];
    plots.push({ x, y, crop, age: Math.floor(hash(x, y, 11) * (crops[crop].days + 1)), watered: hash(x, y, 12) > .28 });
  }
  return {
    day: 1, phase: .08, speed: 1, paused: false, pureHints: true, weather: 'sunny', weatherFrom: 'sunny', coins: 120,
    harvested: 0, milkToday: 0, eggsToday: 0, milkTotal: 0, eggTotal: 0, honeyTotal: 0, fruitTotal: 0,
    eggsReady: true, fruitReady: false, honeyReady: false, goatMilkReady: false, nightLogged: false,
    milked: [false, false], upgrades: 0, cowLove: 0, chickenLove: 0,
    orders: [makeOrder(1, 0), makeOrder(1, 1), makeOrder(1, 2)], nextOrderId: 3, plots,
    view: { x: 0, y: 0, zoom: 1 }, forage: [], forageSpawnDay: 0,
    forageTotal: 0, berries: 0, berryPickedTotal: 0, mushroomPickedTotal: 0, acornPickedTotal: 0,
    squirrelTrust: 0, woolReady: false, woolTotal: 0,
    fishSpots: [], fishSpawnDay: 0, fishTotal: 0, carpTotal: 0, goldFishTotal: 0, valleyHerbs: [], herbTotal: 0,
    depots: emptyDepots(), marketGoods: {}, shippedTotal: 0, goatMilkTotal: 0, ledgerExpanded: false,
    nursery: makeNurseryState(), eastGarden: makeEastGardenState(), mine: makeMineState(), celebration: makeFestivalState(),
    goatBarnOpen: false,
    southFieldVersion: 3, fieldLayoutVersion: 2, lakeLayoutVersion: 2, mapLayoutVersion: 2,
    events: [{ day: 1, time: '06:00', text: '苔谷农场醒来了，新的故事开始了。' }, { day: 1, time: '06:00', text: '农场伙伴们已经在田间忙碌起来。' }]
  };
}

let farm = loadFarm();

let now = 0;
let motionNow = 0;
let last = performance.now();
let saveElapsed = 0;
