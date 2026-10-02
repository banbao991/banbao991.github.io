'use strict';
// Ground surfaces first; all scenery and actors then share the same contact-depth queue.
function farmSceneItems() {
  return collectSceneItems(() => {
    paths(); drawRegionPaths(); drawSouthernLakePierDeck(); drawField(); drawDepots();
    farm.forage.forEach(drawForage);
    orchard(); marketStall(); fences(); coop(); house(); barn(); greenhouse(); extras();
    drawRegionScenery(); drawEastGardenFrontRow();
    drawPondDuck(); drawRegionAnimals(); drawValleyLife(); drawNurseryLife(); drawWetlandLife();
    drawMarketGoods(); drawMineMarketDisplay();

    for (const c of chickens) scenePart(`chicken:${c.x}:${c.y}`, actorDepth(c, 15), () => chicken(c), 10);
    for (const c of cows) scenePart(`cow:${c.x}:${c.y}`, actorDepth(c, 25), () => cow(c), 10);
    scenePart('courier', actorDepth(courier, 24), drawCourier, 10);
    for (const w of workers) {
      if (festivalAtHome(w) || farm.phase >= NIGHT_START && distance(w, workerHome(w)) <= 20) continue;
      if (w.name === '阿栀' && farm.phase < NIGHT_START && !w.task
        && distance(w, VALLEY_WORKER_LAYOUT.chair) <= 16) {
        scenePart('worker:阿栀', VALLEY_WORKER_LAYOUT.chair.y + 16, drawValleyRestingWorker, 10);
      } else if (w.name === '阿牧' && farm.phase < NIGHT_START && !w.task
        && distance(w, PASTURE_WORKER_LAYOUT.rest) <= 16) {
        scenePart('worker:阿牧', PASTURE_WORKER_LAYOUT.rest.y + 15, drawPastureRestingWorker, 10);
      } else scenePart(`worker:${w.name}`, actorDepth(w), () => worker(w), 10);
    }
    if (!festivalAtHome(angler)
      && ((isFestivalDay() && (farm.phase < NIGHT_START || distance(angler, ANGLER_HOME) > 12))
        || angler.festival?.stage === 'morning' || !!angler.routine)) {
      scenePart('angler-walking', actorDepth(angler),
        () => worker({ ...angler, shirt: '#668e83', hat: '#aa7754' }), 10);
    }
    if (!festivalAtHome(orderKeeper) && !(farm.phase >= NIGHT_START && distance(orderKeeper, ORDER_KEEPER_HOME) < 12)) {
      scenePart('order-keeper', actorDepth(orderKeeper), () => worker({ ...orderKeeper, walk: orderKeeper.step,
        gardenTending: orderKeeper.gardenWork?.stage === 'beds' && orderKeeper.gardenWork.action > 0,
        shirt: '#c88762', hat: '#87634b' }), 10);
    }
    if (!festivalAtHome(villageWalker) && !(farm.phase >= NIGHT_START && villageWalkerAtHome()))
      scenePart('village-walker', actorDepth(villageWalker, 22), drawVillageWalker, 10);
    if (nurseryKeeperAt(nurseryKeeper.x, nurseryKeeper.y))
      scenePart('nursery-keeper', actorDepth(nurseryKeeper),
        () => worker({ ...nurseryKeeper, shirt: '#9d8eab', hat: '#d6b879' }), 10);
    if (!festivalAtHome(miner) && miner.mode !== 'homeRest'
      && !(farm.phase >= NIGHT_START && miner.mode === 'home' && distance(miner, MINE_HOME) < 14))
      scenePart('miner', actorDepth(miner), drawMiner, 10);
    if (forestKeeperVisible()) scenePart('forest-keeper', actorDepth(forestKeeper), drawForestKeeper, 10);
    if (farm.upgrades >= 4) for (const s of sheep)
      scenePart(`sheep:${s.x}:${s.y}`, actorDepth(s, 18), () => drawSheep(s), 10);
    if (farm.goatBarnOpen) for (const goat of meadowGoats)
      scenePart(`goat:${goat.name}`, actorDepth(goat, 16), () => drawGoat(goat), 10);

    scenePart('cow-fence-front', 17*T + 28, drawCowFenceFront, 20);
    if (farm.upgrades >= 4) scenePart('sheep-fence-front', SHEEP_LAYOUT.pen.bottom, drawSheepFenceFront, 20);
    if (farm.goatBarnOpen) scenePart('goat-fence-front', GOAT_LAYOUT.pen.bottom + 3, drawGoatFenceFront, 20);
    sceneQueue.push(...plazaSceneItems(), ...plazaLifeSceneItems());
    const perch = RIDGE_OWL_PERCHES[ridgeOwl.perchIndex] || RIDGE_OWL_HOME;
    scenePart('ridge-owl', ridgeOwl.flying ? ridgeOwl.y : perch.baseY + 9,
      drawRidgeOwl, 30, ridgeOwl.flying ? 1 : 0);
    scenePart('plaza-flying-sparrows', 0, drawPlazaFlyingSparrows, 0, 1);
  });
}

function render() {
  sceneSeason = seasonTransition();
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#203328'; ctx.fillRect(0, 0, W, H);
  ctx.save();
  try {
    const padding = worldPadding();
    ctx.setTransform(farm.view.zoom, 0, 0, farm.view.zoom,
      padding.x - farm.view.x*farm.view.zoom, padding.y - farm.view.y*farm.view.zoom);
    grass(); drawRegionGround(); drawPond();
    drawSceneItems(farmSceneItems());
    weatherAndLight();
  } finally { ctx.restore(); }
}
