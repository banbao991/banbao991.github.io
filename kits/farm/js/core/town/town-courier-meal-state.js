'use strict';
function makeTownCourierMeal() {
  return {day:0,decided:false,chosen:false,stage:'idle',elapsed:0,theme:0,price:0,bought:0,finished:0,spent:0};
}
function validateTownCourierMeal(town,day) {
  if(!Object.hasOwn(town,'courierMeal'))town.courierMeal=makeTownCourierMeal();
  const m=town.courierMeal,integer=n=>Number.isSafeInteger(n)&&n>=0;
  if(!m || !['day','bought','finished','spent'].every(k=>integer(m[k])) || m.day>day
    || typeof m.decided!=='boolean' || typeof m.chosen!=='boolean'
    || !['idle','eating','done'].includes(m.stage) || ![0,1,2,3].includes(m.theme)
    || !Number.isFinite(m.elapsed) || m.elapsed<0 || m.elapsed>2.8
    || ![0,12,24,36].includes(m.price) || m.finished>m.bought
    || m.spent<m.bought*12 || m.spent>m.bought*36 || m.spent>town.spending?.goods
    || m.chosen && (!m.decided || m.day<1 || !m.price || !m.bought || m.spent<m.price)
    || !m.chosen && (m.price!==0 || m.elapsed!==0 || m.stage!=='idle')
    || m.stage==='eating' && (!m.chosen || m.elapsed>=2.8 || m.finished>=m.bought))
    throw new Error('存档里的阿运赶集点心状态不正确。');
}
