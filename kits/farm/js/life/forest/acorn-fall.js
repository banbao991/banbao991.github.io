'use strict';
// One seasonal fall per daily forage batch; the saved forage array owns the acorn.
function forestAcornFallChance() {
  const season = seasonTransition();
  return .08 * (1 - season.winter) + .57 * season.autumn;
}
function spawnForestAcorn(sites) {
  if (hash(farm.day, 1271) >= forestAcornFallChance()) return;
  const trees = EAST_WOODS.trees.filter(tree => tree.kind === 'oak');
  const tree = trees[Math.floor(hash(farm.day, 1272) * trees.length)];
  if (!tree) return;
  for (let attempt = 0; attempt < 12; attempt++) {
    const angle = (.15 + hash(farm.day, attempt, 1273) * .7) * Math.PI;
    const radius = 38 + hash(farm.day, attempt, 1274) * 24;
    const point = { x: Math.round(tree.x + Math.cos(angle) * radius),
      y: Math.round(tree.y + 10 + Math.sin(angle) * radius) };
    if (!inRect(point.x, point.y, EAST_WOODS.area.left + 24, EAST_WOODS.area.top + 24,
      EAST_WOODS.area.right - 24, EAST_WOODS.area.bottom - 24)
      || riverAt(point.x, point.y, 18) || bridgeAt(point.x, point.y)
      || courierRoadAt(point.x, point.y, 18)
      || EAST_WOODS.trees.some(other => distance(point, { x: other.x, y: other.y + 10 }) < 30)
      || sites.some(site => distance(point, site) < 48)) continue;
    sites.push({ id: `${farm.day}-oak-acorn`, ...point, kind: 'acorn' });
    return;
  }
}
function chooseForestAcorn() {
  const actor = forestKeeper;
  if (farm.paused || isFestivalDay() || actor.acornDay === farm.day || farm.phase >= .46 || weatherVisual().rain >= .45
    || weatherVisual().snow >= .25 || !['idle', 'watching'].includes(actor.mode)) return false;
  const site = farm.forage.find(item => item.id === `${farm.day}-oak-acorn`
    && item.kind === 'acorn' && distance(actor, item) < 440);
  if (!site || !setForestGoal('toMushroom', site, 22)) return false;
  actor.targetId = site.id;
  return true;
}
