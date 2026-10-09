'use strict';
function makeBeeForager() {
  return {day:0,decided:false,chosen:false,stage:'idle',target:-1,x:HIVE_SITES[0].x,y:HIVE_SITES[0].y-9,
    elapsed:0,cycle:null,duration:0,helped:0,observedTrip:false,visits:0,observed:0,
    cycles:VALLEY_GARDEN_LAYOUT.spots.map(()=>null)};
}
function validateBeeForager(state) {
  if(!Object.hasOwn(state,'beeForager'))state.beeForager=makeBeeForager();
  const b=state.beeForager,finite=n=>Number.isFinite(n),integer=n=>Number.isSafeInteger(n)&&n>=0;
  if(!b || !integer(b.day) || b.day>state.day || !['decided','chosen','observedTrip'].every(k=>typeof b[k]==='boolean')
    || !['idle','out','sip','back'].includes(b.stage) || !Number.isInteger(b.target) || b.target< -1 || b.target>=6
    || !finite(b.x) || !finite(b.y) || b.x<0 || b.x>WORLD_W || b.y<0 || b.y>WORLD_H
    || !finite(b.elapsed) || b.elapsed<0 || b.elapsed>1.8 || !finite(b.duration) || b.duration<0 || b.duration>4
    || !finite(b.helped) || b.helped<0 || b.helped>b.duration*.04+.00001
    || b.cycle!==null && (!finite(b.cycle) || b.cycle< -1 || b.cycle>state.day+state.phase)
    || !integer(b.visits) || !integer(b.observed) || b.observed>b.visits
    || !Array.isArray(b.cycles) || b.cycles.length!==6
    || b.cycles.some(c=>c!==null && (!finite(c) || c< -1 || c>state.day+state.phase))
    || b.chosen && (!b.decided || b.day<1 || b.target<0 || b.cycle===null || b.duration<=0)
    || ['out','sip','back'].includes(b.stage) && !b.chosen
    || b.stage==='sip' && b.cycles[b.target]!==b.cycle)
    throw new Error('存档里的蜜蜂访花状态不正确。');
}
