'use strict';
// Pair plans are bounded; the cats' actual positions and paths stay in runtime.
function makePlazaCatCompany() { return {day:0,decided:false,chosen:false,flipped:false,stage:'idle',spot:-1,wait:0,sessions:0}; }
function plazaCatCompanyTargets(spot=farm.town.catCompany.spot,flipped=farm.town.catCompany.flipped) {
  const center=PLAZA_PET_LAYOUT.restSpots[spot];
  return center ? (flipped?[28,-28]:[-28,28]).map(offset=>({x:center.x+offset,y:center.y})) : [];
}
function validatePlazaCatCompany(town,day) {
  if(!Object.hasOwn(town,'catCompany'))town.catCompany=makePlazaCatCompany();
  const plan=town.catCompany;
  if(!plan||!Number.isSafeInteger(plan.day)||plan.day<0||plan.day>day
    ||!['decided','chosen','flipped'].every(key=>typeof plan[key]==='boolean')
    ||!['idle','out','groom','nap','done'].includes(plan.stage)
    ||!Number.isInteger(plan.spot)||plan.spot< -1||plan.spot>=PLAZA_PET_LAYOUT.restSpots.length
    ||!Number.isFinite(plan.wait)||plan.wait<0||plan.wait>14
    ||!Number.isSafeInteger(plan.sessions)||plan.sessions<0||plan.sessions>day
    ||plan.chosen&&(!plan.decided||plan.day<1||plan.spot<0)
    ||!plan.chosen&&(plan.spot!==-1||!['idle','done'].includes(plan.stage))
    ||!plan.decided&&(plan.chosen||plan.stage!=='idle')
    ||['out','groom','nap'].includes(plan.stage)&&!plan.chosen)
    throw new Error('存档里的猫咪作伴计划不正确。');
}
