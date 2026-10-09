module.exports = function checkForestAcorns(run, assert) {
  const result = run(`(() => {
    const originalState = JSON.parse(JSON.stringify(farm)), originalRuntime = captureRuntimeState();
    const result = {};
    const roundTrip = () => {
      const before = farmExportText(), loaded = importFarmText(before);
      return JSON.stringify(loaded.state) === JSON.stringify(farm)
        && JSON.stringify(loaded.runtime) === JSON.stringify(captureRuntimeState());
    };
    try {
      replaceFarmState(newFarm());
      const days = [], counts = { autumn: 0, other: 0 };
      let safe = true, deterministic = true, duplicateFree = true;
      for (let day = 1; day <= 320; day++) {
        farm.day = day; farm.phase = 0; farm.forageSpawnDay = 0;
        spawnForageForDay();
        const sites = JSON.stringify(farm.forage), nuts = farm.forage.filter(s => s.id === day + '-oak-acorn');
        safe &&= nuts.length <= 1 && nuts.every(s => forestGroundClear(s.x, s.y)
          && !riverAt(s.x, s.y, 18) && !courierRoadAt(s.x, s.y, 18)
          && EAST_WOODS.trees.some(t => t.kind === 'oak' && distance(s, {x:t.x,y:t.y+10}) <= 63));
        if (nuts.length) { days.push(day); counts[seasonTransition().autumn > .8 ? 'autumn' : 'other']++; }
        spawnForageForDay(); duplicateFree &&= JSON.stringify(farm.forage) === sites;
        farm.forageSpawnDay = 0; spawnForageForDay(); deterministic &&= JSON.stringify(farm.forage) === sites;
      }
      result.spawn = safe && deterministic && duplicateFree && days.length > 0;
      // There are roughly three times as many non-autumn days in this run.
      result.seasonal = counts.autumn > counts.other;
      farm.day = 16; farm.phase = .02; const early = forestAcornFallChance();
      farm.phase = .08; result.continuous = forestAcornFallChance() >= early
        && forestAcornFallChance() - early < .03;
      const chosen = days.find(day => !isFestivalDay(day));
      const prepare = () => {
        replaceFarmState(newFarm()); farm.day = chosen; farm.phase = .2;
        farm.weather = farm.weatherFrom = 'sunny'; farm.forageSpawnDay = 0; spawnForageForDay();
        forestKeeper = {...resetForestKeeper(), ...EAST_WOODS.watch, day:chosen,
          choice:'stroll', mode:'watching', wait:0};
      };
      prepare(); let site = farm.forage.find(s => s.id === chosen + '-oak-acorn');
      // Use the closest patrol stop, preserving a real walk from dry ground.
      if (distance(forestKeeper, site) >= 440) Object.assign(forestKeeper, FOREST_WATCH_SPOTS[2]);
      const beforeCoins = farm.coins, beforeMushrooms = farm.mushroomPickedTotal;
      result.started = chooseForestAcorn() && forestKeeperActivity().includes('橡果')
        && forestKeeper.picked === 0 && farm.acornPickedTotal === 0;
      let savedPicking = false, safeRoute = true;
      for (let i = 0; i < 500 && farm.acornPickedTotal === 0; i++) {
        updateForestKeeper(.05); safeRoute &&= forestGroundClear(forestKeeper.x, forestKeeper.y);
        if (forestKeeper.mode === 'picking' && forestKeeper.action > .2) {
          savedPicking ||= roundTrip();
          const snap = captureRuntimeState(); restoreRuntimeSnapshot(snap);
        }
      }
      result.collected = safeRoute && savedPicking && farm.acornPickedTotal === 1
        && forestKeeper.acornDay === chosen && forestKeeper.picked === 0
        && farm.mushroomPickedTotal === beforeMushrooms && farm.coins === beforeCoins
        && farm.depots.forest.acorn === 1 && !farm.forage.some(s => s.id === site.id);
      result.once = !chooseForestAcorn() && roundTrip();
      prepare(); site = farm.forage.find(s => s.id === chosen + '-oak-acorn');
      if (distance(forestKeeper, site) >= 440) Object.assign(forestKeeper, FOREST_WATCH_SPOTS[2]);
      chooseForestAcorn(); collectForage(site);
      updateForestKeeper(.05);
      result.playerFirst = farm.acornPickedTotal === 1 && farm.depots.forest.acorn === 1
        && forestKeeper.acornDay === 0 && forestKeeper.mode !== 'picking';
      prepare(); const frozen = JSON.stringify(forestKeeper); farm.paused = true;
      updateForestKeeper(2); result.pause = JSON.stringify(forestKeeper) === frozen && !chooseForestAcorn();
      farm.paused = false; farm.weather = farm.weatherFrom = 'rain'; result.rain = !chooseForestAcorn();
      farm.weather = farm.weatherFrom = 'sunny'; farm.phase = NIGHT_START;
      result.night = !chooseForestAcorn();
      for (let i = 0; i < 1200 && forestKeeper.mode !== 'home'; i++) updateForestKeeper(.05);
      result.home = !forestKeeperVisible() && distance(forestKeeper, FOREST_HOME) < 2;
      prepare(); farm.day = 10; result.festival = !chooseForestAcorn(); updateForestKeeper(.05);
      result.festival &&= forestKeeper.festival?.day === 10;
      const old = JSON.parse(farmExportText()); delete old.runtime.forestKeeper.acornDay;
      const loaded = importFarmText(JSON.stringify(old)); replaceFarmState(loaded.state, loaded.runtime);
      result.legacy = forestKeeper.acornDay === 0;
      result.invalid = true;
      for (const bad of [-1, 1.5, null, '1', forestKeeper.day + 1]) {
        const snapshot = captureRuntimeState(); snapshot.forestKeeper.acornDay = bad;
        try { validateRuntimeSnapshot(snapshot); result.invalid = false; } catch (_) {}
      }
      return { ...result, counts };
    } finally { replaceFarmState(originalState, originalRuntime); }
  })()`);
  for (const [name, passed] of Object.entries(result)) if (name !== 'counts')
    assert.ok(passed, 'Forest acorn check: ' + name + ' ' + JSON.stringify(result));
  console.log('Forest acorn checks passed: seasonal fall, actual gathering, player race, saves, pause, weather, festivals and home.');
};
