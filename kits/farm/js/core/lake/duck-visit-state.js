'use strict';
function makeLakeDuckVisit(){return {day:0,decided:false,stage:'idle',duck:-1,origin:null,wait:0,total:0};}
function validateLakeDuckVisit(plan){
 const integer=n=>Number.isSafeInteger(n)&&n>=0,point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)
  &&p.x>=0&&p.x<=WORLD_W&&p.y>=0&&p.y<=WORLD_H;
 if(!plan||![plan.day,plan.total].every(integer)||typeof plan.decided!=='boolean'
  ||!['idle','out','hello','back'].includes(plan.stage)||![-1,0,1].includes(plan.duck)
  ||!Number.isFinite(plan.wait)||plan.wait<0||plan.wait>2.8
  ||plan.stage==='idle'&&(plan.duck!==-1||plan.origin!==null)
  ||plan.stage!=='idle'&&(plan.duck<0||!point(plan.origin))
  ||plan.stage==='hello'&&plan.wait<=0)
  throw new Error('存档里的栈桥水鸭问候进度不正确。');
}
