'use strict';
// Grain is optional care; taking a portion and finishing it are separate facts.
function makeTownHenMeal() {
  return {day:0,chosen:false,stage:'idle',active:-1,elapsed:0,taken:false,served:0,finished:0};
}
function validateTownHenMeal(town,day) {
  if(!Object.hasOwn(town,'henMeal'))town.henMeal=makeTownHenMeal();
  if(town.inventory&&!Object.hasOwn(town.inventory,'henGrain'))town.inventory.henGrain=0;
  const m=town.henMeal,integer=n=>Number.isSafeInteger(n)&&n>=0;
  if(!m || !integer(m.day) || m.day>day || !['chosen','taken'].every(k=>typeof m[k]==='boolean')
    || !['idle','approach','eat','done'].includes(m.stage) || ![-1,0,1,2].includes(m.active)
    || !Number.isFinite(m.elapsed) || m.elapsed<0 || m.elapsed>3.2
    || !integer(m.served) || !integer(m.finished) || m.finished>m.served
    || ['approach','eat'].includes(m.stage) && (!m.chosen || m.day<1 || m.active<0)
    || ['idle','done'].includes(m.stage) && m.active!==-1
    || m.stage==='approach' && (m.taken || m.elapsed!==0)
    || m.stage==='eat' && (!m.taken || m.served<1)
    || m.taken && (!m.chosen || m.day<1 || m.served<1)
    || !m.taken && m.elapsed!==0 || m.chosen && m.day<1)
    throw new Error('存档里的鸡群谷粒状态不正确。');
}
