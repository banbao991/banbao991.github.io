'use strict';
function makeTownChildSnack(){return {decidedDay:0,taken:0,finished:0,meal:null};}
function validateTownChildSnack(town,day){
 if(!Object.hasOwn(town,'childSnack'))town.childSnack=makeTownChildSnack();
 const s=town.childSnack,integer=n=>Number.isSafeInteger(n)&&n>=0;
 if(!s||!['decidedDay','taken','finished'].every(k=>integer(s[k]))||s.decidedDay>day||s.finished>s.taken)
  throw new Error('存档里的驿屋茶点记录不正确。');
 const m=s.meal;
 if(m!==null&&(!m||!integer(m.day)||m.day<1||m.day!==s.decidedDay||![0,1,2,3].includes(m.theme)
  ||!Number.isFinite(m.elapsed)||m.elapsed<0||m.elapsed>=2.4||s.taken<=s.finished))
  throw new Error('存档里的阿宁茶点进度不正确。');
}
