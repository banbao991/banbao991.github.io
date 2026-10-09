'use strict';
// Only the short wet-weather rest needs state; the original frog stays unique.
function makeWetlandFrogSong(day=1){return {day,decided:false,stage:'idle',elapsed:0,position:null,sessions:0};}
function validateWetlandFrogSong(nursery,day){
 if(!Object.hasOwn(nursery,'frogSong'))return;
 const s=nursery.frogSong,point=s?.position,validPoint=point&&Number.isFinite(point.x)
  &&Math.abs(point.x-NURSERY_FROG_HOME.x)<=NURSERY_FROG_HOME.range+.001&&point.y===NURSERY_FROG_HOME.y;
 if(!s||!Number.isSafeInteger(s.day)||s.day<1||s.day>day||typeof s.decided!=='boolean'
  ||!['idle','call','back'].includes(s.stage)||!Number.isFinite(s.elapsed)||s.elapsed<0||s.elapsed>4.2
  ||!Number.isSafeInteger(s.sessions)||s.sessions<0||(s.stage==='back'&&s.elapsed!==0)
  ||(s.stage==='idle'?(point!==null||s.elapsed!==0):(!validPoint||!s.decided)))
  throw new Error('存档里的湿地青蛙鸣叫状态不正确。');
}
