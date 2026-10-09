'use strict';
function makeSquirrelMeal(){return {day:0,decided:false,eaten:false,wait:0,berry:null,total:0};}
function validateSquirrelMeal(town,day){
  if(!Object.hasOwn(town,'squirrelMeal'))town.squirrelMeal=makeSquirrelMeal();
  const m=town.squirrelMeal,integer=n=>Number.isSafeInteger(n)&&n>=0;
  if(!m||!integer(m.day)||m.day>day||typeof m.decided!=='boolean'||typeof m.eaten!=='boolean'
    ||!integer(m.total)||m.total>day||!Number.isFinite(m.wait)||m.wait<0||m.wait>2.8
    ||m.eaten&&(!m.decided||m.day<1||m.total<1)
    ||m.wait>0&&(!m.eaten||!m.berry)
    ||m.wait===0&&m.berry!==null
    ||m.berry&&(!Number.isFinite(m.berry.x)||!Number.isFinite(m.berry.y)
      ||m.berry.x<=960||m.berry.x>=1280||m.berry.y<0||m.berry.y>WORLD_H))
    throw new Error('存档里的松鼠采食状态不正确。');
}
