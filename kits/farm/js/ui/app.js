'use strict';
// Application bootstrap, cache motion restoration and the animation clock.
function tick(stamp){
  // A frame queued before a confirmation dialog may precede the reset clock.
  // Never run the world, actors or autosave backwards; keep the latest baseline.
  const dt=Math.max(0,Math.min(.065,(stamp-last)/1000));last=Math.max(last,stamp);now+=dt;
  if(!farm.paused){
    motionNow+=dt;
    const nightRate=farm.phase>=NIGHT_START?2.1:1;
    farm.phase+=dt*farm.speed*nightRate/DAY_SECONDS;
    if(farm.phase>=NIGHT_START&&!farm.nightLogged){farm.nightLogged=true;record('天色渐暗，工人收工回家，动物们慢慢归巢。');}
    if(farm.phase>=1)nextDay();
    updateActors(dt*farm.speed*nightRate);
    saveElapsed+=dt;
    if(saveElapsed>4){save();saveElapsed=0;}
    if(Math.floor(stamp/200)!==Math.floor((stamp-dt*1000)/200))updateUI();
  }
  updateMapHover(dt);
  updateVillageResidentPortraits();
  render();requestAnimationFrame(tick);
}

if (location.protocol === 'file:') $('rules-link').href = '/kits/markdown/?file=kits/farm/doc/世界与玩法.md';
if (loadedRuntime) {
  try { restoreRuntimeSnapshot(loadedRuntime); }
  catch (_) { /* Older or damaged motion data falls back to fresh character routines. */ }
}
prepareFestival();
syncToolUI();
updateUI();
if (isFestivalDay()) save();
requestAnimationFrame(tick);
