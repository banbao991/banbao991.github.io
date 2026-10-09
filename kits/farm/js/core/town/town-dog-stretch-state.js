'use strict';
function makeTownDogStretch(){return {day:0,decided:false,chosen:false,started:false,remaining:0,total:0,lastDay:0};}
function validateTownDogStretch(town,day){
 if(!Object.hasOwn(town,'dogStretch'))town.dogStretch=makeTownDogStretch();
 const s=town.dogStretch,d=town.dog,integer=n=>Number.isSafeInteger(n)&&n>=0;
 if(!s||!integer(s.day)||s.day>day||!integer(s.total)||s.total>day||!integer(s.lastDay)||s.lastDay>day
  ||!['decided','chosen','started'].every(k=>typeof s[k]==='boolean')
  ||!Number.isFinite(s.remaining)||s.remaining<0||s.remaining>1.8
  ||s.chosen&&!s.decided||s.started&&(!s.chosen||!s.day)
  ||s.total===0&&s.lastDay!==0||s.total>0&&s.lastDay===0
  ||s.remaining>0&&(!s.started||!d.present||d.mode!=='rest'||d.target!=='yard'||d.wait+1e-8<s.remaining
   ||!inRect(d.x,d.y,TOWN_LAYOUT.dogYard.left,TOWN_LAYOUT.dogYard.top,TOWN_LAYOUT.dogYard.right,TOWN_LAYOUT.dogYard.bottom)))
  throw new Error('存档里的豆豆伸懒腰状态不正确。');
}
