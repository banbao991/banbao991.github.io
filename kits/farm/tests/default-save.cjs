const assert = require('node:assert/strict');
const {run,element,sandbox,fs,path,root,getStoredSave} = require('./harness.cjs');

(async()=>{
  const bytes=fs.readFileSync(path.join(root,run('DEFAULT_FARM_SAVE.url')));
  assert.deepEqual(bytes,Buffer.from(run('DEFAULT_FARM_SAVE.base64'),'base64'));
  const source=JSON.parse(run('farmZipArchiveText(Uint8Array.from(atob(DEFAULT_FARM_SAVE.base64),c=>c.charCodeAt(0)))'));
  assert.equal(source.state.day,run('DEFAULT_FARM_SAVE.day'));
  assert.match(element('load-default-farm').textContent,new RegExp('v'+run('DEFAULT_FARM_SAVE.release')));
  assert.match(element('default-save-note').textContent,new RegExp(String(source.state.day)));
  const before=run('farmExportText()'),cached=getStoredSave();
  const click=element('load-default-farm').listeners.click;
  sandbox.fetch=async url=>{assert.equal(url,run('DEFAULT_FARM_SAVE.url'));return {ok:true,blob:async()=>new Blob([bytes])};};
  sandbox.confirm=()=>false;
  await click();
  assert.deepEqual(JSON.parse(run('farmExportText()')).state,JSON.parse(before).state);
  assert.deepEqual(JSON.parse(run('farmExportText()')).runtime,JSON.parse(before).runtime);
  assert.equal(getStoredSave(),cached);
  sandbox.confirm=()=>{throw new Error('Bad archives must fail before confirmation.');};
  sandbox.fetch=async()=>({ok:true,blob:async()=>new Blob(['broken ZIP'])});
  await click();assert.equal(element('archive-status').classList.contains('error'),true);
  assert.deepEqual(JSON.parse(run('farmExportText()')).state,JSON.parse(before).state);
  sandbox.confirm=()=>true;
  for(const protocol of ['http:','file:']){
    sandbox.location.protocol=protocol;
    sandbox.fetch=async url=>{assert.equal(protocol,'http:');assert.equal(url,run('DEFAULT_FARM_SAVE.url'));return {ok:true,blob:async()=>new Blob([bytes])};};
    await click();
    assert.equal(element('archive-status').classList.contains('error'),false);
    const restored=JSON.parse(run('farmExportText()'));
    for(const axis of ['x','y'])assert.ok(Math.abs(restored.state.view[axis]-source.state.view[axis])<1e-8);
    assert.deepEqual({...restored.state,view:source.state.view},source.state);
    assert.deepEqual(restored.runtime,source.runtime);
    assert.equal(run('parseFarmSave(JSON.parse(farmExportText())).development.completedCount'),12);
    assert.equal(run('Object.values(farm.town.improvements).every(v=>v.level===3)'),true);
    assert.equal(run('farm.nursery.level'),3);
    assert.equal(run('farm.paused'),true);
    assert.equal(JSON.parse(getStoredSave()).state.day,source.state.day);
    run('farm.paused=false;for(let i=0;i<40;i++){now+=.05;motionNow+=.05;farm.phase+=.05/DAY_SECONDS;updateActors(.05);}parseFarmSave(JSON.parse(farmExportText()));validateRuntimeSnapshot(captureRuntimeState());');
  }
  console.log(`Default v${run('DEFAULT_FARM_SAVE.release')} passed: matching ZIP/fallback, metadata, cancel, invalid file, HTTP/file loading, full restoration, cache and resumed simulation.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
