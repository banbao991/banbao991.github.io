'use strict';
// The existing third-stage dish holds water; original cats remain in runtime.
function makeTownCatWater(day=1){return {ready:false,water:0,agedAt:day,day:0,decided:[false,false],active:-1,stage:'idle',wait:0,drinks:0};}
function validateTownCatWater(town,day){
 if(!Object.hasOwn(town,'catWater'))town.catWater=makeTownCatWater(day);
 const bowl=town.catWater,number=n=>Number.isFinite(n)&&n>=0,integer=n=>Number.isSafeInteger(n)&&n>=0;
 if(!bowl||typeof bowl.ready!=='boolean'||!number(bowl.water)||bowl.water>1
  ||!number(bowl.agedAt)||bowl.agedAt>day+1||!integer(bowl.day)||bowl.day>day
  ||!Array.isArray(bowl.decided)||bowl.decided.length!==2||bowl.decided.some(v=>typeof v!=='boolean')
  ||![-1,0,1].includes(bowl.active)||!['idle','out','drink'].includes(bowl.stage)
  ||!number(bowl.wait)||bowl.wait>(bowl.stage==='out'?12:2.6)||!integer(bowl.drinks)
  ||(bowl.stage==='idle'?(bowl.active!==-1||bowl.wait!==0):(!bowl.ready||bowl.active<0||!bowl.decided[bowl.active])))
  throw new Error('存档里的猫咪浅水碗状态不正确。');
}
