'use strict';
// Umbrellas follow their owners. They never change routes, work speed or weather.
const TOWN_RAIN_PALETTES = [
  {name:'苔绿与麦黄',merchant:'#789c92',child:'#deb96d'},
  {name:'陶红与溪蓝',merchant:'#be8e77',child:'#87a8ac'},
  {name:'栗棕与雾紫',merchant:'#a28e70',child:'#af9bae'}
];
function townRainGearOutside(owner) {
  if (!farm.town.merchantUnlocked || !farm.town.inventory.rainGear) return false;
  if (owner==='merchant') {
    const actor=farm.town.traveller;
    return townTravellerVisible() && !['rest','work','flowers'].includes(actor.mode)
      && distance(actor,TOWN_LAYOUT.home.door)>14;
  }
  return villagerAt(villageWalker.x,villageWalker.y) && !villageWalkerAtHome();
}
function updateTownRainGear(dt) {
  if (farm.paused) return;
  const rain=smoothRange(.1,.5,weatherVisual().rain),gear=farm.town.rainGear;
  for (const owner of ['merchant','child']) {
    const target=townRainGearOutside(owner)?rain:0;
    gear[owner]=clamp(gear[owner]+clamp(target-gear[owner],-dt*.8,dt*.8),0,1);
  }
}
function townRainCanopy(owner) {
  const opening=townRainGearOutside(owner)?farm.town.rainGear[owner]:0;
  if (opening<.02) return null;
  const child=owner==='child',actor=child?villageWalker:farm.town.traveller;
  const x=Math.round(actor.x)-(child?8:10),y=Math.round(actor.y)-(child?30:36);
  const radius=Math.max(2,Math.round((child?19:25)*opening)),height=Math.round(8*opening)+2;
  return {owner,actor,x,y,opening,radius,height,left:x-radius-2,right:x+radius+2,top:y-height-2,bottom:y+4};
}
function townRainCanopyAt(x,y) {
  return ['merchant','child'].map(townRainCanopy).filter(Boolean)
    .sort((a,b)=>b.actor.y-a.actor.y).find(c=>c.opening>.25 && inRect(x,y,c.left,c.top,c.right,c.bottom));
}
function townRainHook() {
  const cart=townCartPosition(),offset=TOWN_LAYOUT.rainHookOffset;
  return {x:cart.x+offset.x,y:cart.y+offset.y};
}
function townRainHookAt(x,y) {
  if (!farm.town.inventory.rainGear || farm.town.traveller.mode==='away') return false;
  const hook=townRainHook();return inRect(x,y,hook.x-6,hook.y-12,hook.x+12,hook.y+14);
}
function townChangeRainPalette() {
  if (!farm.town.inventory.rainGear) return false;
  farm.town.rainGear.palette=(farm.town.rainGear.palette+1)%TOWN_RAIN_PALETTES.length;
  townNote(`共用布伞换成${TOWN_RAIN_PALETTES[farm.town.rainGear.palette].name}配色。`);
  updateUI();save();return true;
}
function townRainGearDescription() {
  if (!farm.town.inventory.rainGear) return '阿棠在日子宽裕时可能带两把共用布伞；买下后他和阿宁雨中出行时会撑伞。';
  const owners=[['merchant','阿棠'],['child','阿宁']].filter(([key])=>townRainCanopy(key))
    .map(([,name])=>name).join('、');
  return `共用布伞 · ${TOWN_RAIN_PALETTES[farm.town.rainGear.palette].name} · ${owners?owners+'正在撑伞':'收好等下一阵雨'} · 换配色免费`;
}
