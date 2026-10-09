'use strict';
// Six individual herbs keep the windmill's terraces productive through the seasons.
const VALLEY_HERB_TYPES = {
  lavender: { name: '薰衣草', value: 22 },
  mint: { name: '薄荷', value: 18 },
  thyme: { name: '百里香', value: 16 }
};
function ensureValleyHerbs() {
  if (Array.isArray(farm.valleyHerbs) && farm.valleyHerbs.length === VALLEY_GARDEN_LAYOUT.spots.length) return;
  farm.valleyHerbs = VALLEY_GARDEN_LAYOUT.spots.map(spot => ({ ...spot, pickedAt: -1, readyAt: 1 }));
  farm.herbTotal ??= 0;
}
function valleyHerbProgress(herb) {
  return clamp((farm.day + farm.phase - herb.pickedAt) / Math.max(.01, herb.readyAt - herb.pickedAt), 0, 1);
}
function valleyHerbAt(x, y) {
  if(!villageSiteOpen('herbs'))return null;
  return farm.valleyHerbs.find(herb => Math.abs(herb.x - x) < 18 && Math.abs(herb.y - y) < 17) || null;
}
function collectValleyHerb(herb, workerName = null) {
  if(!villageSiteOpen('herbs'))return false;
  const kind = VALLEY_HERB_TYPES[herb.kind];
  if (valleyHerbProgress(herb) < 1) {
    record(`${kind.name}还在生长，过些时候再来看看。`);
    return false;
  }
  const today = farm.day + farm.phase;
  herb.pickedAt = today;
  herb.readyAt = today + (seasonTransition().winter > .65 ? 3 : weatherVisual().rain > .65 ? 1.5 : 2)
    * (farm.nursery.level >= 1 ? .9 : 1);
  farm.herbTotal++;
  stockGood('valley', herb.kind, 1);
  record(`${workerName || '你'}从山谷香草梯田采下一株${kind.name}，放进山谷货箱。`);
  save();
  return true;
}
function valleyWorkerNightWaypoint(worker) {
  const layout = VALLEY_WORKER_LAYOUT;
  if (worker.x > 990 || (worker.x > 770 && worker.y < 1206)) return layout.gardenPath;
  if (worker.x > 725 && worker.y >= 1206) return layout.doorPath;
  return layout.home;
}
function valleyWorkerRestWaypoint(worker) {
  const layout = VALLEY_WORKER_LAYOUT;
  if (worker.x < 760 && worker.y < 1190) return layout.doorPath;
  // Leave the southern corridor before turning north. Once northbound, the
  // chair route must not switch back to the corridor near y=1160.
  if (worker.x < 945 && worker.y > 1160) return layout.gardenPath;
  return layout.chair;
}
ensureValleyHerbs();
