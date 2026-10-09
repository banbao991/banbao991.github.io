'use strict';
function makeTownChimes(count=0){return {pieces:Array.from({length:Number.isInteger(count)&&count>=0&&count<=3?count:0},(_,i)=>({palette:i,installedAt:0,touchedUntil:0,noticedDay:0}))};}
function validateTownChimes(town,day){
 if(!Object.hasOwn(town,'chimes'))town.chimes=makeTownChimes(town.inventory?.windchime);
 const pieces=town.chimes?.pieces;
 if(!Array.isArray(pieces)||pieces.length!==town.inventory?.windchime||pieces.length>3
  ||pieces.some(piece=>!piece||![0,1,2].includes(piece.palette)
   ||!Number.isFinite(piece.installedAt)||piece.installedAt<0||piece.installedAt>day+1
   ||!Number.isFinite(piece.touchedUntil)||piece.touchedUntil<0||piece.touchedUntil>Number.MAX_SAFE_INTEGER
   ||!Number.isSafeInteger(piece.noticedDay)||piece.noticedDay<0||piece.noticedDay>day))
  throw new Error('存档里的手作风铃状态不正确。');
}
