module.exports = function checkWorldReset(run, assert, element) {
  // Exercise the actual toolbar listener, including a queued pre-dialog frame.
  run(`replaceFarmState(newFarm());
    Object.assign(workers[0], {walk:80, step:12, waveUntil:500,
      festival:{day:10,attending:true,stage:'home',index:0}});
    Object.assign(workers[1], {walk:60, waveUntil:700});`);
  element('reset-button').click();
  assert.equal(run('farm.day'), 1);
  assert.equal(run('farm.coins'), 120);
  assert.equal(run('workers.every(w => !w.festival && !w.waveUntil && w.walk === 0 && !w.task)'), true,
    'New workers must not inherit old festival or greeting actions');
  run('last=10000;now=2;motionNow=2;saveElapsed=0;tick(1000)');
  assert.equal(run('farm.phase'), .08, 'A queued frame cannot turn time backwards after reset');
  assert.equal(run('now'), 2);
  assert.equal(run('motionNow'), 2);
  assert.equal(run('saveElapsed'), 0);
  assert.equal(run('last'), 10000, 'Keep the reset baseline until a fresh frame arrives');
  run('tick(10016)');
  assert.equal(run('last'), 10016);
  assert.ok(run('farm.phase > .08 && farm.phase < .081'));
  assert.ok(run('now > 2 && motionNow > 2'));
  run('parseFarmSave(JSON.parse(farmExportText()))');
  const restored = run(`(() => {
    farm.paused=true;const a=importFarmText(farmExportText());
    const before=JSON.stringify({state:a.state,runtime:a.runtime});
    replaceFarmState(a.state,a.runtime);
    const same=before===JSON.stringify({state:farm,runtime:captureRuntimeState()});
    last=20000;const display=now,world=motionNow,phase=farm.phase;tick(15000);
    return same && now===display && motionNow===world && farm.phase===phase;
  })()`);
  assert.equal(restored, true, 'Complete imports and paused stale frames retain valid saved state');
  element('reset-button').click();
};
