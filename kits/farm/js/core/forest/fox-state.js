'use strict';
// The old motion-clock location is retained only when restoring a save without this actor.
function makeForestFox(clock=0){return {x:1190+Math.sin(clock*.34)*55,y:466+Math.sin(clock*.23)*24,
 mode:'idle',route:[],index:0,wait:0,step:0,dir:1,day:0,goalNumber:0,napDecided:false,napDone:false,
 napsTotal:0,observedDay:0,waveUntil:0};}
function validateForestFox(actor){
 const integer=n=>Number.isSafeInteger(n)&&n>=0,point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)
  &&p.x>=-100&&p.x<=WORLD_W+100&&p.y>=-100&&p.y<=WORLD_H+100;
 if(!point(actor)||!['idle','walk','sniff','nap','return','home'].includes(actor.mode)
  ||!Array.isArray(actor.route)||actor.route.length>160||!actor.route.every(point)
  ||!integer(actor.index)||actor.index>actor.route.length
  ||!Number.isFinite(actor.wait)||actor.wait<0||actor.wait>4.8
  ||!Number.isFinite(actor.step)||actor.step<0||![-1,1].includes(actor.dir)
  ||![actor.day,actor.goalNumber,actor.napsTotal,actor.observedDay].every(integer)
  ||typeof actor.napDecided!=='boolean'||typeof actor.napDone!=='boolean'
  ||actor.napDone&&!actor.napDecided
  ||actor.mode==='nap'&&(!actor.napDecided||actor.napDone||actor.wait<=0)
  ||!Number.isFinite(actor.waveUntil)||actor.waveUntil<0)
  throw new Error('存档里的林间狐狸状态不正确。');
}
