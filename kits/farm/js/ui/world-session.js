'use strict';
// Replace or restore the live farm, reset actor routines and synchronize the interface.
function replaceFarmState(nextFarm, runtime = null) {
  if (runtime) validateRuntimeSnapshot(runtime);
  const recoveringCache = cacheLoadError;
  farm = nextFarm;
  if (!runtime) motionNow = 0;
  cacheLoadError = false;
  ensureValleyHerbs();
  spawnForageForDay(); resetWildlife(); resetForestFox(); spawnFishForDay(); resetLake(); resetValleyLife(); resetRidgeLife(); resetMeadowLife();
  // Fresh actors must not retain old festival routes, waves or movement clocks.
  // Complete imports restore their own runtime below after these defaults.
  workers = createFarmWorkers();
  addSouthWorker(); addValleyWorker(); addFarmWorker(); addPastureWorker(); courier = resetCourier();
  villageWalker = resetVillageWalker(); angler = resetAngler(); orderKeeper = resetOrderKeeper(); forestKeeper = resetForestKeeper();
  nurseryKeeper = resetNurseryKeeper();
  resetPlazaLife();
  miner = resetMiner();
  cows.forEach((c, i) => { c.x = i ? 844 : 753; c.y = i ? 466 : 392; c.tx = c.x; c.ty = c.y; c.milk = !farm.milked[i]; c.wait = 0; delete c.grazing; });
  chickens.forEach((c, i) => { c.x = 193 + i * 21; c.y = 71; c.tx = c.x; c.ty = c.y; c.wait = 0; });
  sheep.forEach((s, i) => { s.x = i ? 867 : 766; s.y = i ? 1490 : 1447; s.tx = s.x; s.ty = s.y; s.wait = 0; });
  tool = 'inspect'; $('seed-select').value = 'wheat';
  if (runtime) restoreRuntimeSnapshot(runtime);
  prepareFestival();
  syncToolUI();
  clearMapHover(true); drag = null; miniDragging = false;
  saveElapsed = 0; last = performance.now();
  clampCamera(); updateUI(); if(typeof syncPureMode==='function')syncPureMode(); save();
  if (recoveringCache) setArchiveStatus('浏览器自动存档已恢复。');
}
