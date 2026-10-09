'use strict';
// One small saved plan belongs to the existing turtle, not a second animal.
function makeTurtleBask(){return {day:0,decided:false,stage:'idle',wait:0,total:0};}
function validateTurtleBask(plan){
 const integer=n=>Number.isSafeInteger(n)&&n>=0;
 if(!plan||![plan.day,plan.total].every(integer)||typeof plan.decided!=='boolean'
  ||!['idle','approach','climb','bask','descend','swimBack'].includes(plan.stage)
  ||!Number.isFinite(plan.wait)||plan.wait<0||plan.wait>5.2
  ||plan.stage==='bask'&&plan.wait<=0)
  throw new Error('存档里的乌龟晒背进度不正确。');
}
