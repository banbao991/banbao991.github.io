'use strict';
function makeTownHearth(){return {day:0,chosen:false,active:false,glow:0,nights:0};}
function validateTownHearth(town,day){
  if(!Object.hasOwn(town,'hearth'))town.hearth=makeTownHearth();
  if(town.inventory&&!Object.hasOwn(town.inventory,'firewood'))town.inventory.firewood=0;
  const hearth=town.hearth,integer=n=>Number.isSafeInteger(n)&&n>=0;
  if(!hearth||!integer(hearth.day)||hearth.day>day||!integer(hearth.nights)
    ||typeof hearth.chosen!=='boolean'||typeof hearth.active!=='boolean'
    ||!Number.isFinite(hearth.glow)||hearth.glow<0||hearth.glow>1
    ||hearth.active&&(!hearth.chosen||hearth.day<1))throw new Error('存档里的驿屋炉火状态不正确。');
}
