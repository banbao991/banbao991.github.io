'use strict';
// JSON validation and browser autosave. Runtime snapshots keep their existing format.
function parseFarmSave(saved) {
  if (!saved || saved.version !== 1 || (saved.format && saved.format !== 'moss-valley-farm')
    || !saved.state || typeof saved.state !== 'object') throw new Error('这不是苔谷农场的存档文件。');
  const state = saved.state;
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  if (!Number.isInteger(state.day) || state.day < 1 || state.day > 1000000
    || !finite(state.phase) || state.phase < 0 || state.phase > 1
    || !finite(state.coins) || state.coins < 0
    || !Number.isInteger(state.upgrades) || state.upgrades < 0 || state.upgrades > 5
    || !['sunny', 'cloud', 'rain', 'snow'].includes(state.weather)
    || (state.pureHints != null && typeof state.pureHints !== 'boolean')
    || !Array.isArray(state.plots) || state.plots.length > 500) throw new Error('存档内容不完整或已损坏。');
  const locations = new Set();
  for (const plot of state.plots) {
    if (!plot || !Number.isInteger(plot.x) || !Number.isInteger(plot.y)
      || plot.x < 0 || plot.x >= WORLD_W / T || plot.y < 0 || plot.y >= WORLD_H / T
      || (plot.crop != null && !Object.hasOwn(crops, plot.crop))
      || !finite(plot.age) || plot.age < 0 || plot.age > 100
      || (plot.plantedAt != null && (!finite(plot.plantedAt) || plot.plantedAt < 0 || plot.plantedAt > 1))) {
      throw new Error('存档里的田地数据不正确。');
    }
    const key = `${plot.x},${plot.y}`;
    if (locations.has(key)) throw new Error('存档里有重复的田地。');
    locations.add(key);
  }
  if (!Array.isArray(state.orders) && state.order) {
    state.orders = [{ ...state.order, id: 1 }];
    state.nextOrderId = 1;
  }
  if (state.orders != null && (!Array.isArray(state.orders) || state.orders.length > 12
    || state.orders.some(order => !order || !Number.isInteger(order.id) || order.id < 1
      || !Object.hasOwn(crops, order.crop) || !Number.isInteger(order.target) || order.target < 1
      || !Number.isInteger(order.progress) || order.progress < 0 || order.progress >= order.target
      || !Number.isInteger(order.due) || order.due < 1 || !finite(order.reward) || order.reward < 0
      || (order.focus != null && typeof order.focus !== 'boolean'))
    || new Set(state.orders.map(order => order.id)).size !== state.orders.length))
    throw new Error('存档里的订单数据不正确。');
  delete state.order;
  state.orders ??= [makeOrder(state.day, 0), makeOrder(state.day, 1), makeOrder(state.day, 2)];
  state.nextOrderId = Math.max(Number.isInteger(state.nextOrderId) ? state.nextOrderId : 0,
    ...state.orders.map(order => order.id));
  const validSite = (site, kinds) => site && typeof site.id === 'string'
    && finite(site.x) && finite(site.y) && site.x >= 0 && site.x <= WORLD_W
    && site.y >= 0 && site.y <= WORLD_H && kinds.includes(site.kind);
  if (state.forage != null && (!Array.isArray(state.forage) || state.forage.length > 100
    || state.forage.some(site => !validSite(site, ['berry', 'mushroom', 'acorn'])))) throw new Error('存档里的采集点数据不正确。');
  if (state.fishSpots != null && (!Array.isArray(state.fishSpots) || state.fishSpots.length > 100
    || state.fishSpots.some(site => !validSite(site, ['carp', 'gold'])))) throw new Error('存档里的鱼点数据不正确。');
  if (state.valleyHerbs != null && (!Array.isArray(state.valleyHerbs)
    || ![0, VALLEY_GARDEN_LAYOUT.spots.length].includes(state.valleyHerbs.length)
    || state.valleyHerbs.some((herb, index) => !herb || !finite(herb.x) || !finite(herb.y)
      || herb.x !== VALLEY_GARDEN_LAYOUT.spots[index].x || herb.y !== VALLEY_GARDEN_LAYOUT.spots[index].y
      || herb.kind !== VALLEY_GARDEN_LAYOUT.spots[index].kind
      || !finite(herb.pickedAt) || !finite(herb.readyAt) || herb.readyAt <= herb.pickedAt))) throw new Error('存档里的香草园数据不正确。');
  if (state.depots && typeof state.depots === 'object' && !Array.isArray(state.depots)) state.depots.nursery ??= {};
  if (state.depots != null && (typeof state.depots !== 'object' || Array.isArray(state.depots) || DEPOT_IDS.some(id =>
    !state.depots[id] || typeof state.depots[id] !== 'object' || Array.isArray(state.depots[id]) || Object.entries(state.depots[id]).some(([good, count]) =>
      !GOOD_IDS.includes(good) || !Number.isInteger(count) || count < 0 || count > 100000)))) {
    throw new Error('存档里的暂存货物不正确。');
  }
  if (state.marketGoods != null && (typeof state.marketGoods !== 'object' || Array.isArray(state.marketGoods) || Object.entries(state.marketGoods).some(([good, count]) =>
    !GOOD_IDS.includes(good) || !Number.isInteger(count) || count < 0 || count > 100000))) throw new Error('存档里的集市货物不正确。');
  if (state.view != null && (!finite(state.view.x) || !finite(state.view.y)
    || !finite(state.view.zoom) || state.view.zoom <= 0)) throw new Error('存档里的视角数据不正确。');
  state.events = (Array.isArray(state.events) ? state.events : [])
    .filter(e => e && e.day === state.day && typeof e.text === 'string')
    .map(e => ({ day: e.day, time: e.time, text: e.text.replace('undefined', '团子') }));
  delete state.ledgerHistoryPartial;
  for (const key of ['harvested', 'milkToday', 'eggsToday', 'milkTotal', 'eggTotal', 'honeyTotal', 'fruitTotal', 'cowLove', 'chickenLove',
    'forageSpawnDay', 'forageTotal', 'berries', 'berryPickedTotal', 'mushroomPickedTotal', 'acornPickedTotal',
    'squirrelTrust', 'woolTotal', 'fishSpawnDay', 'fishTotal', 'carpTotal', 'goldFishTotal', 'herbTotal', 'shippedTotal', 'goatMilkTotal']) {
    if (!finite(state[key]) || state[key] < 0) state[key] = 0;
  }
  state.celebration ??= makeFestivalState();
  const celebration = state.celebration;
  if (!celebration || typeof celebration !== 'object' || Array.isArray(celebration)
    || !Number.isInteger(celebration.day) || celebration.day < 0 || celebration.day > state.day
    || (celebration.day !== 0 && celebration.day % 10 !== 0)
    || !finite(celebration.openingCoins) || celebration.openingCoins < 0
    || !Number.isSafeInteger(celebration.budget) || celebration.budget < 0
    || celebration.budget !== festivalBudgetFor(celebration.openingCoins)
    || celebration.level !== festivalLevelFor(celebration.budget)
    || !finite(celebration.spentTotal) || celebration.spentTotal < celebration.budget
    || !Number.isInteger(celebration.count) || celebration.count < 0
    || celebration.count > Math.floor(state.day / 10)
    || (celebration.day > 0 && celebration.count < 1)) throw new Error('存档里的欢庆预算不正确。');
  state.nursery ??= makeNurseryState(state.shippedTotal, state.day);
  state.eastGarden ??= makeEastGardenState(state.day, state.phase);
  state.mine ??= makeMineState(state.day);
  const mine = state.mine;
  const validOreCounts = (goods, full = false) => goods && typeof goods === 'object' && !Array.isArray(goods)
    && Object.keys(goods).every(kind => Object.hasOwn(MINE_ORES, kind))
    && (!full || Object.keys(MINE_ORES).every(kind => Object.hasOwn(goods, kind)))
    && Object.values(goods).every(count => Number.isInteger(count) && count >= 0 && count <= 1000000);
  if (!mine || !Array.isArray(mine.nodes) || mine.nodes.length !== MINE_LAYOUT.nodes.length
    || mine.nodes.some(node => !node || !finite(node.readyAt) || node.readyAt < 0)
    || !validOreCounts(mine.stock, true) || !validOreCounts(mine.marketGoods)
    || !Number.isInteger(mine.minedTotal) || mine.minedTotal < 0
    || !Number.isInteger(mine.deliveredTotal) || mine.deliveredTotal < 0
    || !Number.isInteger(mine.incomeTotal) || mine.incomeTotal < 0
    || !Number.isInteger(mine.lastDeliveryDay) || mine.lastDeliveryDay < 0
    || mine.lastDeliveryDay > state.day) throw new Error('存档里的矿区状态不正确。');
  const garden = state.eastGarden;
  if (!garden || !Array.isArray(garden.beds) || garden.beds.length !== EAST_GARDEN_BED_COUNT
    || garden.beds.some(bed => !bed || !Object.hasOwn(EAST_GARDEN_CROPS, bed.kind)
      || !finite(bed.plantedAt) || !finite(bed.readyAt) || bed.readyAt <= bed.plantedAt
      || !Number.isInteger(bed.wateredDay) || bed.wateredDay < 0 || bed.wateredDay > state.day
      || !Number.isInteger(bed.tendedDay) || bed.tendedDay < 0 || bed.tendedDay > state.day)
    || !garden.basket || typeof garden.basket !== 'object' || Array.isArray(garden.basket)
    || Object.keys(garden.basket).some(kind => !Object.hasOwn(EAST_GARDEN_CROPS, kind))
    || Object.values(garden.basket).some(count => !Number.isInteger(count) || count < 0 || count > 1000)
    || !Number.isInteger(garden.harvestTotal) || garden.harvestTotal < 0
    || !Number.isInteger(garden.servedTotal) || garden.servedTotal < 0
    || !Number.isInteger(garden.festivalDay) || garden.festivalDay < 0 || garden.festivalDay > state.day
    || !Number.isInteger(garden.festivalServed) || garden.festivalServed < 0)
    throw new Error('存档里的东岸菜圃状态不正确。');
  const nursery = state.nursery;
  if (nursery) nursery.wildlifeStirUntil ??= 0;
  // Six-bed archives keep their worked plots; newly opened plots start their own cycle.
  if (nursery && Array.isArray(nursery.beds) && nursery.beds.length === 6
    && NURSERY_LAYOUT.beds.length === 10 && Number.isInteger(nursery.level)
    && nursery.level >= 0 && nursery.level < NURSERY_BEDS_BY_LEVEL.length) {
    const clock = state.day + state.phase;
    const oldActive = nursery.level * 2;
    for (let index = 6; index < NURSERY_LAYOUT.beds.length; index++)
      nursery.beds.push({ builtAt: null, pickedAt: clock, readyAt: clock + 1.5 + index * .08 });
    for (let index = oldActive; index < NURSERY_BEDS_BY_LEVEL[nursery.level]; index++)
      nursery.beds[index] = { builtAt: clock - .35, pickedAt: clock,
        readyAt: clock + 1.2 + (index % 3) * .18 };
  }
  if (!nursery || !Number.isInteger(nursery.level) || nursery.level < 0 || nursery.level > 3
    || (nursery.openedAt != null && (!finite(nursery.openedAt) || nursery.openedAt < 0))
    || !finite(nursery.wetness) || nursery.wetness < 0 || nursery.wetness > 1
    || !Number.isInteger(nursery.harvestTotal) || nursery.harvestTotal < 0
    || !finite(nursery.frogJumpUntil) || nursery.frogJumpUntil < 0
    || !finite(nursery.wildlifeStirUntil) || nursery.wildlifeStirUntil < 0
    || !Array.isArray(nursery.beds) || nursery.beds.length !== NURSERY_LAYOUT.beds.length
    || nursery.beds.some(bed => !bed || (bed.builtAt != null && !finite(bed.builtAt))
      || !finite(bed.pickedAt) || !finite(bed.readyAt)
      || bed.readyAt <= bed.pickedAt)) throw new Error('存档里的湿地苗圃状态不正确。');
  validateWetlandFrogSong(nursery,state.day);
  state.ledgerExpanded = !!state.ledgerExpanded;
  state.pureHints ??= true;
  state.eggsReady ??= true;
  state.fruitReady ??= false;
  state.honeyReady ??= false;
  state.goatMilkReady ??= false;
  state.depots ??= emptyDepots();
  state.marketGoods ??= {};
  state.weatherFrom = ['sunny', 'cloud', 'rain', 'snow'].includes(state.weatherFrom) ? state.weatherFrom : state.weather;
  state.milked = Array.isArray(state.milked) && state.milked.length === 2 ? state.milked.map(Boolean) : [false, false];
  state.nightLogged ??= false;
  state.view ??= { x: 0, y: 0, zoom: 1 };
  state.forage ??= [];
  state.woolReady ??= false;
  state.fishSpots ??= [];
  if ((state.lakeLayoutVersion || 1) < 2) {
    for (const site of state.fishSpots) site.y += SOUTH_LAKE_SHIFT_Y;
    if (saved.runtime) {
      for (const duck of saved.runtime.lakeDucks || []) {
        duck.y += SOUTH_LAKE_SHIFT_Y;
        duck.ty += SOUTH_LAKE_SHIFT_Y;
      }
      for (const ripple of saved.runtime.lakeRipples || []) ripple.y += SOUTH_LAKE_SHIFT_Y;
    }
    state.lakeLayoutVersion = 2;
  }
  state.valleyHerbs ??= [];
  state.goatBarnOpen = typeof state.goatBarnOpen === 'boolean' ? state.goatBarnOpen : state.upgrades >= 5;
  state.speed = [1, 2, 4].includes(state.speed) ? state.speed : 1;
  state.paused = !!state.paused;
  if ((state.southFieldVersion || 1) < 2) {
    // Preserve crops in older saves while moving the lake-facing field inland.
    for (const plot of state.plots) {
      if (plot.x >= 8 && plot.x <= 15 && plot.y >= 21 && plot.y <= 24) {
        plot.x += 2;
        plot.y -= 2;
      }
    }
    state.southFieldVersion = 2;
  }
  if ((state.fieldLayoutVersion || 1) < 2) trimRoadsidePlots(state);
  if ((state.southFieldVersion || 1) < 3) {
    // Append the added row/column so active tasks keep their original plot indices.
    if (state.upgrades >= 4) {
      const occupied = new Set(state.plots.map(plot => `${plot.x},${plot.y}`));
      for (const { x, y } of fieldCells(FIELD_EXPANSIONS.south)) {
        if (!occupied.has(`${x},${y}`)) state.plots.push({ x, y, crop: null, age: 0, watered: false });
      }
    }
    state.southFieldVersion = 3;
  }
  if ((state.mapLayoutVersion || 1) < 2) {
    // Keep the economy intact while relocating live actors from the former paddock.
    for (const [i, animal] of (saved.runtime?.sheep || []).entries()) {
      animal.x = SHEEP_LAYOUT.pen.left + (i ? 164 : 62);
      animal.y = SHEEP_LAYOUT.pen.top + (i ? 130 : 87);
      animal.tx = animal.x; animal.ty = animal.y;
    }
    for (const [i, animal] of (saved.runtime?.meadowGoats || []).entries()) {
      animal.x = GOAT_LAYOUT.pen.left + (i ? 147 : 50);
      animal.y = GOAT_LAYOUT.pen.top + (i ? 91 : 59);
      animal.tx = animal.x; animal.ty = animal.y;
    }
    for (const worker of saved.runtime?.workers || []) if (worker.name === '阿牧') {
      Object.assign(worker, { x: PASTURE_WORKER_LAYOUT.home.x, y: PASTURE_WORKER_LAYOUT.home.y,
        task: null, route: [], action: 0 });
    }
    // A courier mid-trip starts the next return from his farm cottage with a fresh route.
    if (saved.runtime?.courier) {
      const carrier = saved.runtime.courier;
      if (carrier.leg === 'return') Object.assign(carrier, { x: COURIER_COTTAGE.x + 34, y: COURIER_COTTAGE.y - 15,
        stopIndex: 0, routeVariant: null, night: null });
      else carrier.night = null;
    }
    state.mapLayoutVersion = 2;
  }
  state.town ??= makeTownState(state.day);
  validateTownState(state.town, state.day);
  validateEastWoods(state);
  validateEastCanopy(state);
  validateEastShore(state);
  validateBeeForager(state);
  migrateFarmSave(saved);
  validateVillageDevelopment(state.development,state);
  return state;
}
let loadedRuntime = null;
let cacheLoadError = false;
function loadFarm() {
  let raw;
  try { raw = localStorage.getItem(SAVE_KEY); }
  catch (_) { return newFarm(); }
  if (raw == null) return newFarm();
  try {
    const saved = JSON.parse(raw);
    const state = parseFarmSave(saved);
    loadedRuntime = saved.runtime || null;
    return state;
  }
  catch (_) {
    cacheLoadError = true;
    return newFarm();
  }
}

function save() {
  if (cacheLoadError) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, state: farm, runtime: captureRuntimeState() })); }
  catch (_) { /* Playable without storage. */ }
}
