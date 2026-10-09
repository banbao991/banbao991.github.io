'use strict';
// Moving characters and animation clocks travel with both JSON archives and automatic saves.
function captureRuntimeState() {
  return {
    now, motionNow, tool, seed: Object.hasOwn(crops, $('seed-select').value) ? $('seed-select').value : 'wheat',
    cows, chickens, sheep, workers, courier, villageWalker, angler, orderKeeper, nurseryKeeper, miner, forestKeeper,
    squirrel, forestFox, meadowGoats, lakeDucks, lakeRipples,
    valleyOtter, valleyTurtle, valleyHeron, valleyShoal, valleyRipples,
    ridgeDeer, ridgeHare, ridgeOwl, plazaCats, plazaSparrows
  };
}
function validateRuntimeSnapshot(runtime) {
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const point = actor => actor && typeof actor === 'object' && finite(actor.x) && finite(actor.y)
    && actor.x >= -100 && actor.x <= WORLD_W + 100 && actor.y >= -100 && actor.y <= WORLD_H + 100;
  const moving = actor => point(actor) && finite(actor.tx) && finite(actor.ty)
    && finite(actor.wait) && finite(actor.step);
  const festivalVisit = actor => actor.festival == null || (
    Number.isInteger(actor.festival.day) && actor.festival.day >= 1
    && typeof actor.festival.attending === 'boolean'
    && (actor.festival.stage == null || ['out', 'gather', 'back', 'home', 'morning'].includes(actor.festival.stage))
    && (actor.festival.out == null || (Array.isArray(actor.festival.out)
      && actor.festival.out.length <= 12 && actor.festival.out.every(point)))
    && (actor.festival.back == null || (Array.isArray(actor.festival.back)
      && actor.festival.back.length <= 64 && actor.festival.back.every(point)))
    && (actor.festival.morning == null || (Array.isArray(actor.festival.morning)
      && actor.festival.morning.length <= 12 && actor.festival.morning.every(point)))
    && (actor.festival.stage !== 'morning' || (Array.isArray(actor.festival.morning)
      && actor.festival.morning.length > 0))
    && (actor.festival.index == null || (Number.isInteger(actor.festival.index)
      && actor.festival.index >= 0 && actor.festival.index <= 64))
    && (actor.festival.activity == null || (
      ['snack', 'chat', 'watch', 'rest', 'dance', 'perform'].includes(actor.festival.activity.kind)
      && (actor.festival.activity.spot === null || (Number.isInteger(actor.festival.activity.spot)
        && actor.festival.activity.spot >= 0 && actor.festival.activity.spot < FESTIVAL_SPOTS.length))
      && Array.isArray(actor.festival.activity.route) && actor.festival.activity.route.length <= 64
      && actor.festival.activity.route.every(point)
      && Number.isInteger(actor.festival.activity.index) && actor.festival.activity.index >= 0
      && actor.festival.activity.index <= actor.festival.activity.route.length
      && finite(actor.festival.activity.wait) && actor.festival.activity.wait >= 0 && actor.festival.activity.wait <= 10
      && finite(actor.festival.activity.blocked) && actor.festival.activity.blocked >= 0 && actor.festival.activity.blocked <= 2
      && Number.isSafeInteger(actor.festival.activity.cycle) && actor.festival.activity.cycle >= 0)));
  if (!runtime || typeof runtime !== 'object' || !finite(runtime.now) || runtime.now < 0
    || (runtime.motionNow != null && (!finite(runtime.motionNow) || runtime.motionNow < 0))
    || !['inspect', 'plant', 'water'].includes(runtime.tool)
    || (runtime.seed != null && !Object.hasOwn(crops, runtime.seed))) throw new Error('存档里的动态状态不正确。');
  for (const [name, length] of [['cows', 2], ['chickens', 3], ['sheep', 2], ['meadowGoats', 2], ['lakeDucks', 2]]) {
    if (!Array.isArray(runtime[name]) || runtime[name].length !== length || runtime[name].some(actor => !moving(actor))) {
      throw new Error('存档里的动物状态不正确。');
    }
  }
  if (runtime.cows.some(cow => cow.grazing !== undefined && (!cow.grazing
    || !Number.isSafeInteger(cow.grazing.day) || cow.grazing.day < 1
    || !Number.isSafeInteger(cow.grazing.total) || cow.grazing.total < 0
    || !finite(cow.grazing.duration) || cow.grazing.duration < 0 || cow.grazing.duration > 4.4
    || !finite(cow.grazing.elapsed) || cow.grazing.elapsed < 0 || cow.grazing.elapsed > cow.grazing.duration)))
    throw new Error('存档里的牛牛吃草状态不正确。');
  if (!Array.isArray(runtime.workers) || runtime.workers.length < 2 || runtime.workers.length > 6
    || runtime.workers.some(worker => !point(worker) || !finite(worker.speed) || worker.speed <= 0
      || !finite(worker.walk) || !finite(worker.action) || typeof worker.name !== 'string'
      || (worker.waveUntil != null && (!finite(worker.waveUntil) || worker.waveUntil < 0))
      || (worker.route != null && (!Array.isArray(worker.route) || worker.route.length > 20 || worker.route.some(stop => !point(stop))))
      || !festivalVisit(worker)
      || (worker.task != null && (!['eggs', 'fruit', 'honey', 'wool', 'milk', 'goatMilk', 'herb', 'harvest', 'plant', 'water'].includes(worker.task.type)
        || !Number.isInteger(worker.task.index) || worker.task.index < 0)))) throw new Error('存档里的工人状态不正确。');
  if (runtime.courier != null) {
    const carrier = runtime.courier;
    const planned = carrier.plannedDepots;
    const validPlan = planned == null || (Array.isArray(planned)
      && planned.length <= DEPOT_IDS.length && new Set(planned).size === planned.length
      && planned.every(id => DEPOT_IDS.includes(id)));
    const legacy = carrier.leg == null && Number.isInteger(carrier.tourDay)
      && carrier.tourDay >= 0 && typeof carrier.active === 'boolean';
    const routeLimit = carrier.leg === 'outbound' ? COURIER_OUTBOUND.length
      : carrier.routeVariant === 'forest' ? COURIER_FOREST_RETURN.length
        : carrier.routeVariant === 'direct' ? COURIER_DIRECT_RETURN.length
          : courierReturnBase(Array.isArray(planned) ? planned : DEPOT_IDS).length;
    const current = ['market', 'outbound', 'rest', 'return'].includes(carrier.leg)
      && [null, 'direct', 'forest'].includes(carrier.routeVariant)
      && validPlan && (carrier.routeVariant !== 'forest' || planned == null || planned.includes('forest'))
      && Number.isInteger(carrier.journeyDay) && carrier.journeyDay >= 0
      && Number.isInteger(carrier.lastReturnDay) && carrier.lastReturnDay >= 0
      && carrier.stopIndex <= routeLimit;
    const night = carrier.night;
    const validNight = night == null || (['farm', 'village'].includes(night.side)
      && Array.isArray(night.path) && night.path.length >= 2 && night.path.length <= 50
      && night.path.every(point) && Number.isInteger(night.index)
      && night.index >= 0 && night.index <= night.path.length
      && typeof night.sleeping === 'boolean' && typeof night.waking === 'boolean');
    if (!point(carrier) || !Number.isInteger(carrier.stopIndex) || carrier.stopIndex < 0 || carrier.stopIndex > 64
      || (!legacy && !current) || !validNight || !finite(carrier.step) || !finite(carrier.wait)
      || !festivalVisit(carrier)
      || !carrier.cargo || typeof carrier.cargo !== 'object' || Array.isArray(carrier.cargo)
      || Object.entries(carrier.cargo).some(([good, count]) => !GOOD_IDS.includes(good)
        || !Number.isInteger(count) || count < 0 || count > 100000)) throw new Error('存档里的运货路线不正确。');
  }
  if (runtime.villageWalker != null && (!point(runtime.villageWalker)
    || !finite(runtime.villageWalker.step) || runtime.villageWalker.step < 0
    || (runtime.villageWalker.waveUntil != null && (!finite(runtime.villageWalker.waveUntil)
      || runtime.villageWalker.waveUntil < 0))
    || ![-1, 1].includes(runtime.villageWalker.dir)
    || !festivalVisit(runtime.villageWalker))) throw new Error('存档里的村口居民状态不正确。');
  for (const name of ['angler', 'orderKeeper']) if (runtime[name] != null
    && (!point(runtime[name]) || !finite(runtime[name].step) || !festivalVisit(runtime[name])
      || (name === 'orderKeeper' && runtime[name].facing != null
        && !['up', 'down'].includes(runtime[name].facing))
      || (runtime[name].routine != null
        && (!(name === 'angler' ? ['toHome', 'toPier'] : ['toHome', 'toNotice'])
          .includes(runtime[name].routine.stage)
          || !Number.isInteger(runtime[name].routine.index)
          || runtime[name].routine.index < 0 || runtime[name].routine.index >= 3))))
    throw new Error('存档里的村民状态不正确。');
  if(runtime.angler?.waveUntil!=null&&(!finite(runtime.angler.waveUntil)||runtime.angler.waveUntil<0))throw new Error('存档里的阿蓼问候状态不正确。');
  if(runtime.angler?.duckVisit!=null)validateLakeDuckVisit(runtime.angler.duckVisit);
  const fishing = runtime.angler?.fishing;
  if (fishing != null && (!Number.isInteger(fishing.day) || fishing.day < 1
    || ![1, 2].includes(fishing.quota) || !Number.isInteger(fishing.caught)
    || fishing.caught < 0 || fishing.caught > fishing.quota
    || (fishing.targetId != null && (typeof fishing.targetId !== 'string' || fishing.targetId.length > 100))
    || !finite(fishing.action) || fishing.action < 0 || fishing.action > 2.4))
    throw new Error('存档里的阿蓼垂钓进度不正确。');
  const keeper = runtime.forestKeeper;
  if (keeper != null && (!point(keeper) || !festivalVisit(keeper)
    || !Number.isInteger(keeper.day) || keeper.day < 0
    || ![null, 'gather', 'stroll'].includes(keeper.choice)
    || !Number.isInteger(keeper.picked) || keeper.picked < 0 || keeper.picked > 3
    || (keeper.acornDay !== undefined && (!Number.isSafeInteger(keeper.acornDay)
      || keeper.acornDay < 0 || keeper.acornDay > keeper.day))
    || !['home', 'idle', 'toHome', 'toMushroom', 'picking', 'toWatch', 'watching'].includes(keeper.mode)
    || !Array.isArray(keeper.route) || keeper.route.length > 128 || keeper.route.some(stop => !point(stop))
    || !Number.isInteger(keeper.routeIndex) || keeper.routeIndex < 0 || keeper.routeIndex > keeper.route.length
    || (['toHome', 'toMushroom', 'toWatch'].includes(keeper.mode) && !keeper.route.length)
    || (keeper.targetId != null && (typeof keeper.targetId !== 'string' || keeper.targetId.length > 100))
    || (['toMushroom', 'picking'].includes(keeper.mode) && keeper.targetId == null)
    || !finite(keeper.action) || keeper.action < 0 || keeper.action > 1.2
    || !finite(keeper.wait) || keeper.wait < 0 || keeper.wait > 4
    || (keeper.scanWait != null && (!finite(keeper.scanWait) || keeper.scanWait < 0 || keeper.scanWait > 1.5))
    || !Number.isSafeInteger(keeper.watchIndex) || keeper.watchIndex < 0
    || ![-1, 1].includes(keeper.dir) || !finite(keeper.step) || !finite(keeper.walk)
    || !finite(keeper.waveUntil) || keeper.waveUntil < 0))
    throw new Error('存档里的阿森巡林与采菇进度不正确。');
  const gardenWork = runtime.orderKeeper?.gardenWork;
  if (gardenWork != null && (!Number.isInteger(gardenWork.day) || gardenWork.day < 1
    || !['out', 'beds', 'back', 'done'].includes(gardenWork.stage)
    || !Number.isInteger(gardenWork.routeIndex) || gardenWork.routeIndex < 0 || gardenWork.routeIndex > 4
    || !Array.isArray(gardenWork.targets) || gardenWork.targets.length > 5
    || gardenWork.targets.some(index => !Number.isInteger(index) || index < 0 || index >= EAST_GARDEN_BED_COUNT)
    || new Set(gardenWork.targets).size !== gardenWork.targets.length
    || !Number.isInteger(gardenWork.targetIndex) || gardenWork.targetIndex < 0
    || gardenWork.targetIndex > gardenWork.targets.length
    || !finite(gardenWork.action) || gardenWork.action < 0 || gardenWork.action > 1))
    throw new Error('存档里的阿葵菜圃路线不正确。');
  if (runtime.nurseryKeeper != null && (!point(runtime.nurseryKeeper)
    || !finite(runtime.nurseryKeeper.step) || !finite(runtime.nurseryKeeper.walk)
    || !finite(runtime.nurseryKeeper.action)
    || ![null, 'home', 'bed', 'rest', 'restore'].includes(runtime.nurseryKeeper.goal)
    || (runtime.nurseryKeeper.bedIndex != null && (!Number.isInteger(runtime.nurseryKeeper.bedIndex)
      || runtime.nurseryKeeper.bedIndex < 0 || runtime.nurseryKeeper.bedIndex >= NURSERY_LAYOUT.beds.length))
    || !Array.isArray(runtime.nurseryKeeper.path) || runtime.nurseryKeeper.path.length > 12
    || runtime.nurseryKeeper.path.some(stop => !point(stop))
    || !festivalVisit(runtime.nurseryKeeper))) throw new Error('存档里的苗圃村民状态不正确。');
  if (runtime.miner != null) {
    const miner = runtime.miner;
    const validCargo = miner.cargo && typeof miner.cargo === 'object' && !Array.isArray(miner.cargo)
      && Object.entries(miner.cargo).every(([kind, count]) => Object.hasOwn(MINE_ORES, kind)
        && Number.isInteger(count) && count >= 0 && count <= 1000000);
    if (!point(miner) || !finite(miner.speed) || miner.speed <= 0 || !finite(miner.step)
      || !finite(miner.walk) || !finite(miner.action) || miner.action < 0
      || !['home', 'homeRest', 'rest', 'toNode', 'mining', 'toCart', 'toMarket', 'returnCart', 'toTea', 'teaRest',
        'teaHome', 'returnRest', 'returnHome', 'returnWithCargo'].includes(miner.mode)
      || !Array.isArray(miner.route) || miner.route.length > 12 || miner.route.some(stop => !point(stop))
      || (['toNode', 'toCart', 'toMarket', 'returnCart', 'toTea', 'teaHome',
        'returnRest', 'returnHome', 'returnWithCargo'].includes(miner.mode)
        && !miner.route.length)
      || !Number.isInteger(miner.routeIndex) || miner.routeIndex < 0
      || miner.routeIndex > miner.route.length
      || (miner.targetNode != null && (!Number.isInteger(miner.targetNode)
        || miner.targetNode < 0 || miner.targetNode >= MINE_LAYOUT.nodes.length))
      || (['toNode', 'mining'].includes(miner.mode) && miner.targetNode == null)
      || !Number.isInteger(miner.nextDeliveryDay) || miner.nextDeliveryDay < 1
      || (miner.deliveryDay != null && (!Number.isInteger(miner.deliveryDay) || miner.deliveryDay < 0))
      || (miner.workedDay != null && (!Number.isInteger(miner.workedDay) || miner.workedDay < 0))
      || !validCargo || !festivalVisit(miner)) throw new Error('存档里的阿矿路线不正确。');
  }
  for (const name of ['squirrel', 'valleyOtter', 'valleyTurtle', 'valleyHeron', 'valleyShoal',
    'ridgeDeer', 'ridgeHare', 'ridgeOwl']) {
    if (!moving(runtime[name])) throw new Error('存档里的野生动物状态不正确。');
  }
  if(runtime.forestFox!=null)validateForestFox(runtime.forestFox);
  if(runtime.valleyTurtle.bask!=null)validateTurtleBask(runtime.valleyTurtle.bask);
  if(runtime.valleyHeron.fishing!=null)validateHeronFishing(runtime.valleyHeron.fishing);
  for (const name of ['lakeRipples', 'valleyRipples']) {
    if (!Array.isArray(runtime[name]) || runtime[name].length > 100
      || runtime[name].some(ripple => !point(ripple) || !finite(ripple.age))) throw new Error('存档里的水面动画不正确。');
  }
  if (runtime.plazaCats != null && (!Array.isArray(runtime.plazaCats) || runtime.plazaCats.length !== 2
    || runtime.plazaCats.some((cat, index) => !moving(cat)
      || cat.name !== ['橘子', '墨点'][index] || cat.coat !== ['ginger', 'cow'][index]
      || !['home', 'return', 'move', 'sleep', 'groom', 'stretch', 'watch', 'play', 'company', 'drink'].includes(cat.mode)
      || !Array.isArray(cat.path) || cat.path.length > 128 || cat.path.some(stop => !point(stop))
      || (['return', 'move'].includes(cat.mode) && !cat.path.length)
      || cat.wait < 0 || cat.wait > 20 || !finite(cat.action) || cat.action < 0
      || !finite(cat.purr) || cat.purr < 0 || cat.purr > 3 || ![-1, 1].includes(cat.dir))))
    throw new Error('存档里的广场猫咪状态不正确。');
  if (runtime.plazaSparrows != null && (!Array.isArray(runtime.plazaSparrows) || runtime.plazaSparrows.length !== 5
    || runtime.plazaSparrows.some(bird => !moving(bird)
      || !['away', 'fly', 'hop', 'peck', 'preen', 'perch'].includes(bird.mode)
      || !Number.isInteger(bird.site) || bird.site < -1 || bird.site >= PLAZA_PET_LAYOUT.birdSites.length
      || (bird.site < 0 && !['away', 'fly'].includes(bird.mode))
      || typeof bird.returning !== 'boolean' || bird.wait < 0 || bird.wait > 15
      || !finite(bird.lift) || bird.lift < 0 || bird.lift > 31
      || !finite(bird.flightLength) || bird.flightLength < 0 || bird.flightLength > 5000
      || ![-1, 1].includes(bird.dir)))) throw new Error('存档里的广场麻雀状态不正确。');
  return true;
}
function restoreRuntimeSnapshot(runtime) {
  validateRuntimeSnapshot(runtime);
  now = runtime.now;
  motionNow = runtime.motionNow ?? runtime.now;
  tool = runtime.tool;
  $('seed-select').value = runtime.seed || 'wheat';
  cows = runtime.cows;
  chickens = runtime.chickens;
  sheep = runtime.sheep;
  workers = runtime.workers;
  addSouthWorker();
  addValleyWorker();
  addFarmWorker();
  addPastureWorker();
  for (const worker of workers) {
    const type = worker.task?.type;
    if (type && !workerCanDoTask(worker, type)) {
      worker.task = null; worker.route = []; worker.action = 0;
    }
  }
  const valleyWorker = workers.find(worker => worker.name === '阿栀');
  if (valleyWorker && !valleyWorker.task && Math.hypot(valleyWorker.x - 715, valleyWorker.y - 1122) < 16) {
    valleyWorker.x = VALLEY_WORKER_LAYOUT.home.x;
    valleyWorker.y = VALLEY_WORKER_LAYOUT.home.y;
    valleyWorker.route = [];
  }
  courier = runtime.courier?.leg ? runtime.courier : resetCourier();
  villageWalker = { ...resetVillageWalker(), ...runtime.villageWalker };
  angler = { ...resetAngler(), ...runtime.angler };
  orderKeeper = { ...resetOrderKeeper(), ...runtime.orderKeeper };
  forestKeeper = { ...resetForestKeeper(), ...runtime.forestKeeper };
  nurseryKeeper = { ...resetNurseryKeeper(), ...runtime.nurseryKeeper };
  miner = runtime.miner ? { ...resetMiner(), ...runtime.miner } : resetMiner();
  alignMinerMarketRoad();
  if (runtime.courier && !runtime.courier.leg) courier.cargo = runtime.courier.cargo;
  if (!Array.isArray(courier.plannedDepots)) {
    courier.plannedDepots = courier.leg === 'return' ? [...DEPOT_IDS] : [];
  }
  squirrel = runtime.squirrel;
  forestFox = runtime.forestFox || makeForestFox(motionNow);
  meadowGoats = runtime.meadowGoats;
  lakeDucks = runtime.lakeDucks;
  lakeRipples = runtime.lakeRipples;
  valleyOtter = runtime.valleyOtter;
  valleyTurtle = runtime.valleyTurtle;
  valleyHeron = runtime.valleyHeron;
  valleyShoal = runtime.valleyShoal;
  valleyRipples = runtime.valleyRipples;
  ridgeDeer = runtime.ridgeDeer;
  ridgeHare = runtime.ridgeHare;
  ridgeOwl = runtime.ridgeOwl;
  refreshRidgeOwlRoute();
  plazaCats = runtime.plazaCats || createPlazaCats();
  plazaSparrows = runtime.plazaSparrows || createPlazaSparrows();
}
