'use strict';
// Purchased wall lights are separate from the celebration's flying paper lanterns.
function makeTownPorchLights(count=0){return {pieces:Array.from({length:Number.isInteger(count)&&count>=0&&count<=3?count:0},()=>({installedAt:0,from:1,level:1,changedAt:0,noticedDay:0}))};}
function validateTownPorchLights(town,day){
 if(!Object.hasOwn(town,'porchLights'))town.porchLights=makeTownPorchLights(town.inventory?.lantern);
 const pieces=town.porchLights?.pieces;
 if(!Array.isArray(pieces)||pieces.length!==town.inventory?.lantern||pieces.length>3
  ||pieces.some(piece=>!piece||!Number.isFinite(piece.installedAt)||piece.installedAt<0||piece.installedAt>day+1
   ||!Number.isFinite(piece.from)||piece.from<.5||piece.from>1||![.5,1].includes(piece.level)
   ||!Number.isFinite(piece.changedAt)||piece.changedAt<0||piece.changedAt>Number.MAX_SAFE_INTEGER
   ||!Number.isSafeInteger(piece.noticedDay)||piece.noticedDay<0||piece.noticedDay>day))
  throw new Error('存档里的檐下暖光纸灯状态不正确。');
}
