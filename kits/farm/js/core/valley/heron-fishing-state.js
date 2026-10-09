'use strict';
// This small plan belongs to the existing heron and travels with its runtime snapshot.
function makeHeronFishing(){return {day:0,decided:false,chosen:false,done:false,stage:'idle',spot:null,wait:0,bend:0,tried:false,total:0};}
function validateHeronFishing(p){
 const integer=n=>Number.isSafeInteger(n)&&n>=0,finite=n=>Number.isFinite(n);
 const area=VALLEY_HERON_FISHING.area;
 if(!p||!integer(p.day)||!integer(p.total)||!['decided','chosen','done','tried'].every(k=>typeof p[k]==='boolean')
  ||!['idle','approach','watch','dip','return'].includes(p.stage)||!finite(p.wait)||p.wait<0||p.wait>6
  ||!finite(p.bend)||p.bend<0||p.bend>1||p.chosen&&!p.decided
  ||p.stage==='idle'&&(p.spot!==null||p.bend!==0)
  ||p.stage!=='idle'&&(!p.decided||!p.chosen||!p.spot||!finite(p.spot.x)||!finite(p.spot.y)
    ||p.spot.x<area.left||p.spot.x>area.right||p.spot.y<area.top||p.spot.y>area.bottom)
  ||p.stage==='dip'&&(!p.done||p.wait>1.4))throw new Error('存档里的苍鹭浅滩试探进度不正确。');
}
