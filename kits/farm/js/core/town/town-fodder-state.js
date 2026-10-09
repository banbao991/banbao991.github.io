'use strict';
function makeTownFodder(){return {day:0,chosen:false,queue:[],active:-1,departing:-1,eating:false,wait:0,served:0};}
function validateTownFodder(town,day){
  if(!Object.hasOwn(town,'fodder'))town.fodder=makeTownFodder();
  if(town.inventory&&!Object.hasOwn(town.inventory,'fodder'))town.inventory.fodder=0;
  if(town.fodder&&!Object.hasOwn(town.fodder,'departing'))town.fodder.departing=-1;
  const meal=town.fodder,integer=n=>Number.isSafeInteger(n)&&n>=0;
  const id=n=>integer(n)&&n<town.donkeys.length;
  if(!meal||!integer(meal.day)||meal.day>day||typeof meal.chosen!=='boolean'||typeof meal.eating!=='boolean'
    ||!integer(meal.served)||!Array.isArray(meal.queue)||meal.queue.length>2||!meal.queue.every(id)
    ||new Set(meal.queue).size!==meal.queue.length||!(meal.active===-1||id(meal.active))
    ||!(meal.departing===-1||id(meal.departing))||meal.departing>=0&&meal.active>=0
    ||meal.queue.includes(meal.departing)||meal.queue.includes(meal.active)||!Number.isFinite(meal.wait)||meal.wait<0||meal.wait>3.5
    ||(meal.queue.length||meal.active>=0||meal.departing>=0)&&!meal.chosen||meal.eating&&meal.active<0
    ||town.donkeys.some((animal,id)=>animal.target==='fodder'&&meal.active!==id)
    ||meal.active<0&&meal.wait!==0||meal.eating&&town.donkeys[meal.active].target!=='fodder')
    throw new Error('存档里的小驴牧草状态不正确。');
}
