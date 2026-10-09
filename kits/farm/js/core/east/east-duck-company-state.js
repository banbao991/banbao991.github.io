'use strict';
function makeEastDuckCompany(){return {day:0,chosen:false,started:false,remaining:0,count:0,lastDay:0};}
function validateEastDuckCompany(shore,day){
 if(!Object.hasOwn(shore,'company'))shore.company=makeEastDuckCompany();
 const c=shore.company,count=v=>Number.isSafeInteger(v)&&v>=0;
 if(!c||!count(c.day)||c.day>day||!count(c.count)||!count(c.lastDay)||c.lastDay>c.day||c.count>c.lastDay
  ||(!c.count&&c.lastDay!==0)||typeof c.chosen!=='boolean'||typeof c.started!=='boolean'
  ||!Number.isFinite(c.remaining)||c.remaining<0||c.remaining>2.4||c.started&&!c.chosen
  ||!c.day&&(c.chosen||c.started||c.remaining>0)
  ||c.remaining>0&&(!c.started||c.lastDay===c.day||shore.ducks.some(b=>b.mode!=='rest'||b.goal!=='water'||b.wait<c.remaining)
   ||distance(shore.ducks[0],shore.ducks[1])<30||distance(shore.ducks[0],shore.ducks[1])>70))
  throw new Error('存档里的鸳鸯相伴进度不正确。');
}
