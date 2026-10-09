'use strict';
function makeTownDonkeyWater(day=1){return {ready:false,water:0,agedAt:day,day:0,decided:[false,false],active:-1,departing:-1,stage:'idle',wait:0,drinks:0};}
function validateTownDonkeyWater(town,day){
 if(!Object.hasOwn(town,'donkeyWater'))town.donkeyWater=makeTownDonkeyWater(day);
 const b=town.donkeyWater,integer=n=>Number.isSafeInteger(n)&&n>=0,id=n=>n===-1||integer(n)&&n<town.donkeys.length;
 const fail=()=>{throw new Error('存档里的小驴水槽状态不正确。');};
 if(!b||typeof b.ready!=='boolean'||!Number.isFinite(b.water)||b.water<0||b.water>1
  ||!Number.isFinite(b.agedAt)||b.agedAt<1||b.agedAt>day+1||!integer(b.day)||b.day>day||!integer(b.drinks)||b.drinks>day*2
  ||!Array.isArray(b.decided)||b.decided.length!==2||b.decided.some(v=>typeof v!=='boolean')
  ||!id(b.active)||!id(b.departing)||b.active>=0&&b.departing>=0||!['idle','out','drink'].includes(b.stage)
  ||!Number.isFinite(b.wait)||b.wait<0||b.wait>15||b.stage==='drink'&&b.wait>2.8
  ||b.stage==='idle'&&(b.active!==-1||b.wait!==0)||b.stage!=='idle'&&(b.active<0||!b.ready||!b.day||!b.decided[b.active])
  ||b.ready&&town.improvements.donkeyInn.level<2||!b.ready&&(b.water||b.drinks||b.active>=0||b.departing>=0)
  ||town.donkeys.some((a,i)=>a.target==='water'&&i!==b.active))fail();
 if(b.active>=0){const a=town.donkeys[b.active];
  if(!townDonkeyWaterPointClear(a)||a.route.some(p=>!townDonkeyWaterPointClear(p)))fail();
  if(a.target!=='water'||b.stage==='out'&&a.mode!=='walk'||b.stage==='drink'&&(a.mode!=='rest'||distance(a,TOWN_LAYOUT.donkeyWater.stand)>.01))fail();
 }
}
