'use strict';
// 阿葵: state, daily commutes, celebration attendance and interaction. Garden tasks live in east-garden.js.
const ORDER_KEEPER_HOME = { x: MARKET_LAYOUT.homes[2].x + 83, y: MARKET_LAYOUT.homes[2].y + 122 };

function resetOrderKeeper() { return { x: MARKET_LAYOUT.notice.x + 63, y: MARKET_LAYOUT.notice.y + 4,
  dir: -1, step: 0, walk: 0, festival: null, routine: null, waveUntil: 0, gardenWork: null, facing: 'down' }; }
let orderKeeper = resetOrderKeeper();
// Keep both commutes north of the market awnings, then use the gap beside the notice board.
const ORDER_KEEPER_MORNING_ROUTE = [
  { x: ORDER_KEEPER_HOME.x, y: 812 }, { x: EAST_GARDEN_NOTICE.x, y: 812 },
  EAST_GARDEN_NOTICE
];
const ORDER_KEEPER_EVENING_ROUTE = [
  ORDER_KEEPER_MORNING_ROUTE[1], ORDER_KEEPER_MORNING_ROUTE[0], ORDER_KEEPER_HOME
];

function updateOrdinaryOrderKeeper(dt) {
  const evening = farm.phase >= NIGHT_START;
  const destination = evening ? ORDER_KEEPER_HOME : EAST_GARDEN_NOTICE;
  orderKeeper.facing = 'down';
  if (distance(orderKeeper, destination) < 2) { orderKeeper.routine = null; return; }
  if (!evening && farm.phase < .02) return;
  const stage = evening ? 'toHome' : 'toNotice';
  if (!orderKeeper.routine || orderKeeper.routine.stage !== stage)
    orderKeeper.routine = { stage, index: 0 };
  const route = evening ? ORDER_KEEPER_EVENING_ROUTE : ORDER_KEEPER_MORNING_ROUTE;
  if (moveOrderKeeperTo(route[orderKeeper.routine.index], dt, 90)
    && ++orderKeeper.routine.index >= route.length) orderKeeper.routine = null;
}

function orderKeeperAt(x, y) {
  return !festivalAtHome(orderKeeper)
    && !(farm.phase >= NIGHT_START && Math.hypot(orderKeeper.x - ORDER_KEEPER_HOME.x,
    orderKeeper.y - ORDER_KEEPER_HOME.y) < 12)
    && Math.abs(x - orderKeeper.x) <= 14 && Math.abs(y - orderKeeper.y) <= 24;
}

function moveOrderKeeperTo(point, dt, speed = 135) {
  const dx = point.x - orderKeeper.x, dy = point.y - orderKeeper.y;
  const distance = Math.hypot(dx, dy), step = Math.min(distance, speed * dt);
  if (distance > 1) {
    orderKeeper.x += dx / distance * step;
    orderKeeper.y += dy / distance * step;
    if (Math.abs(dx) > 1) orderKeeper.dir = dx < 0 ? -1 : 1;
    orderKeeper.step += dt * 11;
  }
  if (distance <= step + 1) { orderKeeper.x = point.x; orderKeeper.y = point.y; return true; }
  return false;
}

function updateOrderKeeper(dt) {
  if (isFestivalDay()) {
    orderKeeper.routine = null;
    if (!orderKeeper.festival) { orderKeeper.x = ORDER_KEEPER_HOME.x; orderKeeper.y = ORDER_KEEPER_HOME.y; }
    orderKeeper.facing = 'down';
    updateFestivalActor(orderKeeper, dt, ORDER_KEEPER_HOME, 8, 'village');
  } else if (!festivalMorning(orderKeeper, dt, ORDER_KEEPER_MORNING_ROUTE, 100)) {
    orderKeeper.festival = null;
    if (!updateEastGardenKeeper(dt)) updateOrdinaryOrderKeeper(dt);
  }
}
