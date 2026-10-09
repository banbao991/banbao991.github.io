'use strict';
function makeTownSnacks(){return {stock:[],carried:[],pantry:[],decidedTrip:0,taken:0,finished:0,meal:null};}
function validateTownSnacks(town,day){
 if(town.inventory&&!Object.hasOwn(town.inventory,'snackBox'))town.inventory.snackBox=0;
 if(!Object.hasOwn(town,'snacks'))town.snacks=makeTownSnacks();
 const snack=town.snacks,integer=n=>Number.isSafeInteger(n)&&n>=0;
 const themes=(list,max)=>Array.isArray(list)&&list.length<=max&&list.every(n=>[0,1,2,3].includes(n));
 if(!snack||!themes(snack.stock,8)||snack.stock.length!==town.inventory?.snackBox||!themes(snack.carried,2)||!themes(snack.pantry,4)
  ||!['decidedTrip','taken','finished'].every(k=>integer(snack[k]))||snack.decidedTrip>day||snack.finished>snack.taken)
  throw new Error('存档里的南谷茶点库存不正确。');
 const meal=snack.meal;
 if(meal!==null&&(!meal||!integer(meal.trip)||meal.trip<1||meal.trip!==snack.decidedTrip||![0,1,2,3].includes(meal.theme)
  ||!Number.isFinite(meal.elapsed)||meal.elapsed<0||meal.elapsed>=2.4||snack.taken<=snack.finished))
  throw new Error('存档里的南谷茶点品尝进度不正确。');
}
