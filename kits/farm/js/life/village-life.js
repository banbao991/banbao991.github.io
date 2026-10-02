'use strict';
// 阿宁 strolls between her own doorway and 阿运's, in front of both homes.
const VILLAGE_STROLL_SPEED = 52;
const VILLAGE_HOME_SPEED = 44;
function resetVillageWalker() {
  return { x: VILLAGE_WALKER_LAYOUT.home.x, y: VILLAGE_WALKER_LAYOUT.home.y,
    dir: -1, step: 0, waveUntil: 0 };
}
let villageWalker = resetVillageWalker();
function villagerPosition() { return { x: villageWalker.x, y: villageWalker.y }; }
function villageWalkerAtHome() {
  const { home } = VILLAGE_WALKER_LAYOUT;
  return villageWalker.x === home.x && villageWalker.y === home.y;
}
function villagerAt(x, y) {
  if (festivalAtHome(villageWalker)) return false;
  if (farm.phase >= NIGHT_START && villageWalkerAtHome()) return false;
  return x >= villageWalker.x - 13 && x <= villageWalker.x + 13
    && y >= villageWalker.y - 22 && y <= villageWalker.y + 20;
}
function updateVillageWalker(dt) {
  const { home, promenade } = VILLAGE_WALKER_LAYOUT;
  if (isFestivalDay()) { updateFestivalActor(villageWalker, dt, home, 7, 'village'); return; }
  if (festivalAtHome(villageWalker) && farm.phase < .02) return;
  if (villageWalker.festival) villageWalker.festival = null;
  const night = farm.phase >= NIGHT_START;
  let target;
  if (night) {
    target = Math.abs(villageWalker.x - home.x) > 2
      ? Math.abs(villageWalker.y - promenade.y) > 1
        ? { x: villageWalker.x, y: promenade.y }
        : { x: home.x, y: promenade.y }
      : home;
  } else if (villageWalker.y < promenade.y - 5) {
    target = { x: home.x, y: promenade.y };
  } else {
    if (villageWalker.x <= promenade.left + 1) villageWalker.dir = 1;
    else if (villageWalker.x >= promenade.right - 1) villageWalker.dir = -1;
    target = { x: villageWalker.dir < 0 ? promenade.left : promenade.right, y: promenade.y };
  }
  const dx = target.x - villageWalker.x, dy = target.y - villageWalker.y;
  const distance = Math.hypot(dx, dy), travel = Math.min((night ? VILLAGE_HOME_SPEED : VILLAGE_STROLL_SPEED) * dt, distance);
  if (distance <= 1) { villageWalker.x = target.x; villageWalker.y = target.y; return; }
  villageWalker.x += dx / distance * travel;
  villageWalker.y += dy / distance * travel;
  if (Math.abs(dx) > .5) villageWalker.dir = dx < 0 ? -1 : 1;
  villageWalker.step += dt * 12;
}
