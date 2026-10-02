'use strict';
// The southwest wetland restores its old seed beds as village deliveries grow.
function resetNurseryKeeper() {
  return { ...NURSERY_LAYOUT.home.door, dir: -1, step: 0, walk: 0,
    path: [], goal: null, bedIndex: null, action: 0, festival: null, waveUntil: 0 };
}
let nurseryKeeper = resetNurseryKeeper();
function nurseryClock() { return farm.day + farm.phase; }
function nurseryActiveBeds() { return NURSERY_BEDS_BY_LEVEL[farm.nursery.level]; }
function nurseryBedProgress(index) {
  const bed = farm.nursery.beds[index];
  return clamp((nurseryClock() - bed.pickedAt) / Math.max(.01, bed.readyAt - bed.pickedAt), 0, 1);
}
function nurseryBedAt(x, y) {
  return NURSERY_LAYOUT.beds.findIndex((bed, index) => index < nurseryActiveBeds()
    && Math.abs(x - bed.x) < 24 && Math.abs(y - bed.y) < 20);
}
function nurseryGrowthDays() {
  const season = seasonTransition();
  return (season.winter > .7 ? 3.25 : weatherVisual().rain > .6 ? 1.55 : 2.15)
    * (farm.nursery.level >= 3 ? .88 : 1);
}
function collectNurseryBed(index, name = null) {
  if (index < 0 || index >= nurseryActiveBeds() || nurseryBedProgress(index) < 1) return false;
  const bed = farm.nursery.beds[index], kind = NURSERY_LAYOUT.beds[index].kind;
  bed.pickedAt = nurseryClock();
  bed.readyAt = bed.pickedAt + nurseryGrowthDays();
  farm.nursery.harvestTotal++;
  stockGood('nursery', kind);
  record(`${name || '你'}从湿地苗圃收好一份${GOOD_NAMES[kind]}，放进路边货箱。`);
  save();
  return true;
}
function updateNurseryMilestones() {
  const nursery = farm.nursery, level = nurseryLevelForShipments(farm.shippedTotal);
  if (level <= nursery.level) return;
  const oldCount = nurseryActiveBeds();
  nursery.level = level;
  nursery.openedAt ??= nurseryClock();
  for (let index = oldCount; index < nurseryActiveBeds(); index++) {
    nursery.beds[index].builtAt = nurseryClock();
    nursery.beds[index].pickedAt = nurseryClock();
    nursery.beds[index].readyAt = nurseryClock() + nurseryGrowthDays() * .66 + (index % 2) * .22;
  }
  record(level === 1 ? '村口送来修缮木料，阿芽的小屋旁修好了第一批旧苗床。'
    : `湿地苗圃修复到第 ${level} 阶段，又添了 ${nurseryActiveBeds() - oldCount} 畦苗床。`);
}
function nurseryFrogPosition() {
  const leap = Math.max(0, farm.nursery.frogJumpUntil - motionNow);
  return { x: 99 + Math.sin(motionNow * .36) * 12,
    y: 1786 - (leap > 0 ? Math.sin((2 - leap) * Math.PI * 2) ** 2 * 13 : 0) };
}
function nurseryFrogAt(x, y) {
  if (seasonTransition().winter > .7) return false;
  const frog = nurseryFrogPosition();
  return Math.abs(x - frog.x) < 16 && Math.abs(y - frog.y) < 14;
}
function nurseryKeeperAt(x, y) {
  if (festivalAtHome(nurseryKeeper)) return false;
  if (farm.nursery.level === 0 && !isFestivalDay()) return false;
  if (farm.phase >= NIGHT_START && distance(nurseryKeeper, NURSERY_LAYOUT.home.door) < 3) return false;
  return Math.abs(x - nurseryKeeper.x) < 15 && y >= nurseryKeeper.y - 27 && y <= nurseryKeeper.y + 22;
}
function nurseryKeeperActivity() {
  const festival = festivalActivity(nurseryKeeper);
  if (festival) return festival;
  const atHome = distance(nurseryKeeper, NURSERY_LAYOUT.home.door) < 3;
  if (atHome && (!farm.nursery.level || !nurseryKeeper.goal || nurseryKeeper.goal === 'home'))
    return '在湿地小屋休息';
  if (nurseryKeeper.goal === 'home') return '正回湿地小屋';
  if (nurseryKeeper.goal === 'bed') return nurseryKeeper.path.length
    ? '正去下一畦苗床' : '正在采收苗床';
  if (nurseryKeeper.goal === 'rest') return nurseryKeeper.path.length
    ? '正去长椅歇脚' : '在长椅上休息';
  return '准备照料苗床';
}
function nurseryKeeperPath(goal, bedIndex = null) {
  const home = NURSERY_LAYOUT.home.door, aisle = NURSERY_LAYOUT.aisle;
  const entry = nurseryKeeper.x > 410 ? [{ x: home.x, y: aisle.y }]
    : nurseryKeeper.y > aisle.y + 3 ? [{ x: nurseryKeeper.x, y: aisle.y }] : [];
  if (goal === 'home') return [...entry, aisle, { x: home.x, y: aisle.y }, home];
  if (goal === 'rest') {
    const nearbyBed = NURSERY_LAYOUT.beds.find(bed => distance(nurseryKeeper, bed) < 22);
    if (!nearbyBed) return [{ ...NURSERY_LAYOUT.rest }];
    const laneX = nurseryBedLaneX(nearbyBed);
    return nearbyBed.x >= 280
      ? [{ x: laneX, y: nurseryKeeper.y }, { x: laneX, y: NURSERY_LAYOUT.rest.y }, { ...NURSERY_LAYOUT.rest }]
      : [{ x: laneX, y: nurseryKeeper.y }, { x: laneX, y: 1420 },
        { x: NURSERY_LAYOUT.rest.x, y: 1420 }, { ...NURSERY_LAYOUT.rest }];
  }
  const bed = NURSERY_LAYOUT.beds[bedIndex];
  const nearbyBed = NURSERY_LAYOUT.beds.find(spot => distance(nurseryKeeper, spot) < 22);
  if (nearbyBed) return nurseryBetweenBeds(nearbyBed, bed);
  const laneX = nurseryBedLaneX(bed);
  return [...entry, aisle,
    { x: laneX, y: aisle.y }, { x: laneX, y: bed.y }, { x: bed.x, y: bed.y }];
}
function nextNurseryBed() {
  let next = -1, nearest = Infinity;
  for (let index = 0; index < nurseryActiveBeds(); index++) {
    if (nurseryBedProgress(index) < 1) continue;
    const length = distance(nurseryKeeper, NURSERY_LAYOUT.beds[index]);
    if (length < nearest) { next = index; nearest = length; }
  }
  return next;
}
function nurseryBedLaneX(bed) { return NURSERY_LAYOUT.bedWalkways.columns.find(x => x > bed.x); }
function nurseryBetweenBeds(from, to) {
  const fromLane = nurseryBedLaneX(from), toLane = nurseryBedLaneX(to);
  const path = [{ x: fromLane, y: nurseryKeeper.y }];
  if (fromLane !== toLane) {
    // Cross between rows, then approach the next bed along its side lane.
    const crossings = NURSERY_LAYOUT.bedWalkways.rows;
    const crossing = crossings.reduce((best, y) =>
      Math.abs(nurseryKeeper.y - y) + Math.abs(to.y - y)
        < Math.abs(nurseryKeeper.y - best) + Math.abs(to.y - best) ? y : best);
    path.push({ x: fromLane, y: crossing }, { x: toLane, y: crossing });
  }
  path.push({ x: toLane, y: to.y }, { x: to.x, y: to.y });
  return path;
}
function planNurseryTask() {
  const index = nextNurseryBed();
  nurseryKeeper.bedIndex = index >= 0 ? index : null;
  nurseryKeeper.goal = index >= 0 ? 'bed' : 'rest';
  nurseryKeeper.path = nurseryKeeperPath(nurseryKeeper.goal, nurseryKeeper.bedIndex);
  nurseryKeeper.action = 0;
}
function nurseryKeeperMove(dt) {
  const target = nurseryKeeper.path[0];
  if (!target) return true;
  const dx = target.x - nurseryKeeper.x, dy = target.y - nurseryKeeper.y;
  const length = Math.hypot(dx, dy), step = Math.min(length, 78 * dt);
  if (length > 0) {
    nurseryKeeper.x += dx / length * step; nurseryKeeper.y += dy / length * step;
    if (Math.abs(dx) > .5) nurseryKeeper.dir = dx < 0 ? -1 : 1;
    nurseryKeeper.step += dt * 11; nurseryKeeper.walk += dt * 11;
  }
  if (length <= step + .5) {
    nurseryKeeper.x = target.x; nurseryKeeper.y = target.y;
    nurseryKeeper.path.shift();
  }
  return nurseryKeeper.path.length === 0;
}
function updateNurseryKeeper(dt) {
  const keeper = nurseryKeeper;
  if (isFestivalDay()) {
    keeper.path = []; keeper.goal = null; keeper.bedIndex = null; keeper.action = 0;
    updateFestivalActor(keeper, dt, NURSERY_LAYOUT.home.door, 9, 'nursery');
    return;
  }
  if (festivalAtHome(keeper) && farm.phase < .02) return;
  if (keeper.festival) keeper.festival = null;
  if (!farm.nursery.level) return;
  if (farm.phase >= NIGHT_START) {
    if (keeper.goal !== 'home') {
      keeper.path = nurseryKeeperPath('home'); keeper.goal = 'home'; keeper.action = 0;
    }
    if (nurseryKeeperMove(dt)) keeper.goal = 'home';
    return;
  }
  if (farm.phase < .02 && distance(keeper, NURSERY_LAYOUT.home.door) < 3) return;
  if (!keeper.goal || keeper.goal === 'home' || (keeper.goal === 'rest' && nextNurseryBed() >= 0))
    planNurseryTask();
  if (keeper.goal === 'rest' && distance(keeper.path.at(-1) || keeper, NURSERY_LAYOUT.rest) > 3)
    keeper.path = nurseryKeeperPath('rest');
  if (!nurseryKeeperMove(dt)) return;
  if (keeper.goal === 'bed') {
    keeper.action += dt;
    if (keeper.action >= .55) {
      collectNurseryBed(keeper.bedIndex, '阿芽');
      planNurseryTask();
    }
  } else if (keeper.goal === 'rest') {
    keeper.action += dt;
    if (keeper.action >= 1.5) {
      keeper.action = 0;
      if (farm.nursery.beds.some((_, i) => i < nurseryActiveBeds() && nurseryBedProgress(i) >= 1)) keeper.goal = null;
    }
  }
}
function updateNurseryLife(dt) {
  const target = farm.weather === 'rain' ? .9 : farm.weather === 'snow' ? .74
    : farm.weather === 'cloud' ? .55 : .32;
  farm.nursery.wetness = clamp(farm.nursery.wetness + (target - farm.nursery.wetness) * Math.min(1, dt * .075), 0, 1);
  updateNurseryKeeper(dt);
}
