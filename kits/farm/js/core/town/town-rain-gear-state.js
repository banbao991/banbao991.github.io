'use strict';
function makeTownRainGear() { return { merchant:0, child:0, palette:0 }; }
function validateTownRainGear(town) {
  if (!Object.hasOwn(town,'rainGear')) town.rainGear = makeTownRainGear();
  if (town.inventory && !Object.hasOwn(town.inventory,'rainGear')) town.inventory.rainGear = 0;
  const gear = town.rainGear;
  if (!gear || !['merchant','child'].every(key => Number.isFinite(gear[key]) && gear[key]>=0 && gear[key]<=1)
    || !Number.isInteger(gear.palette) || gear.palette<0 || gear.palette>2)
    throw new Error('存档里的共用雨具状态不正确。');
}
