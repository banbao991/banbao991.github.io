'use strict';
// Weather creates modest upkeep work; deferred care never destroys a paid facility.
function updateTownCare() {
  if (farm.paused) return;
  const weather = weatherVisual();
  for (const built of Object.values(farm.town.improvements)) {
    const days = Math.max(0, farm.day - built.agedAt);
    if (built.level && days) built.wear = Math.min(1, built.wear + days
      * (.012 + weather.rain * .015 + weather.snow * .01));
    built.agedAt = farm.day;
  }
}
function townCarePrice(id) { return Math.round(TOWN_PROJECTS[id].price * .18 * farm.town.improvements[id].level); }
function townCareDescription(id) {
  const wear = farm.town.improvements[id].wear;
  return wear >= .75 ? '想请人仔细整理' : wear >= .5 ? '到了养护的时候' : wear >= .25 ? '可以顺手照料' : '刚整理过，还很整洁';
}
function townCanCare(id, automatic = false) {
  return Object.hasOwn(TOWN_PROJECTS,id) && !farm.town.construction && townShopOpen()
    && farm.town.improvements[id].level > 0
    && farm.town.improvements[id].wear >= (automatic ? .5 : .25)
    && townCanSpend(townCarePrice(id),automatic);
}
function townCommissionCare(id, automatic = false) {
  if (!townCanCare(id,automatic)) return false;
  const cost = townCarePrice(id), built = farm.town.improvements[id];
  if (!townSpend(cost,'care',automatic)) return false;
  if (automatic) farm.town.autoCareStreak = Math.min(2, farm.town.autoCareStreak + 1);
  farm.town.construction = { kind:'care',id,level:built.level,cost,progress:0,startedAt:farm.day+farm.phase };
  farm.town.traveller.commissioned = true;
  townNote(`${automatic ? '小镇委托' : '你请'}阿棠照料${TOWN_PROJECTS[id].name}，付了 ${cost} 金养护费。`,true);
  updateUI();save();return true;
}
function townCareCandidates(urgent = false) {
  return Object.keys(TOWN_PROJECTS).filter(id=>townCanCare(id,true)
    && (!urgent || farm.town.improvements[id].wear >= .85))
    .sort((a,b)=>farm.town.improvements[b].wear-farm.town.improvements[a].wear);
}
