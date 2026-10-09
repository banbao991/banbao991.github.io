'use strict';
// East-bank vegetable beds, separate pantry and garden tending tasks for 阿葵.
// The village pantry is local to the east bank; none of its vegetables enter farm freight.
function eastGardenClock() { return farm.day + farm.phase; }
function eastGardenProgress(index) {
  const bed = farm.eastGarden.beds[index];
  return clamp((eastGardenClock() - bed.plantedAt) / (bed.readyAt - bed.plantedAt), 0, 1);
}
function eastGardenBedPoint(index) {
  return { x: MARKET_LAYOUT.garden.left + index % 14 * 30 + 12,
    y: MARKET_LAYOUT.garden.top + Math.floor(index / 14) * MARKET_LAYOUT.garden.rowSpacing + 12 };
}
function eastGardenBedAt(x, y) {
  for (let index = 0; index < EAST_GARDEN_BED_COUNT; index++) {
    const point = eastGardenBedPoint(index);
    if (x >= point.x - 12 && x < point.x + 12 && y >= point.y - 12 && y < point.y + 12) return index;
  }
  return -1;
}
function eastGardenBasketCount() {
  return Object.values(farm.eastGarden.basket).reduce((total, count) => total + count, 0);
}
function eastGardenBasketAt(x, y) {
  const basket = MARKET_LAYOUT.garden.basket;
  return Math.abs(x - basket.x) < 21 && Math.abs(y - basket.y) < 19;
}
function eastGardenBasketText() {
  return Object.entries(farm.eastGarden.basket).filter(([, count]) => count > 0)
    .map(([kind, count]) => `${EAST_GARDEN_CROPS[kind].name} ${count}`).join('、') || '等候阿葵带来新鲜蔬菜';
}
function advanceEastGardenDay() {
  const garden = farm.eastGarden;
  const feast = isFestivalDay();
  let portions = feast ? 12 : 3 + farm.day % 2;
  let served = 0;
  const kinds = Object.keys(EAST_GARDEN_CROPS);
  while (portions-- > 0) {
    const kind = kinds[(farm.day + served) % kinds.length];
    const available = garden.basket[kind] ? kind : kinds.find(name => garden.basket[name] > 0);
    if (!available) break;
    garden.basket[available]--;
    served++;
  }
  garden.servedTotal += served;
  garden.festivalDay = feast ? farm.day : 0;
  garden.festivalServed = feast ? served : 0;
  if (farm.weather === 'rain') for (const bed of garden.beds) {
    bed.wateredDay = farm.day;
    if (bed.readyAt > eastGardenClock()) bed.readyAt = Math.max(eastGardenClock() + .05, bed.readyAt - .18);
  }
  if (feast && served) record(`村口菜篮取出 ${served} 份时蔬，阿葵把它们带到广场分享。`);
}
function eastGardenWorkTargets() {
  const ripe = farm.eastGarden.beds.map((bed, index) => ({ index, bed }))
    .filter(({ bed }) => eastGardenBasketCount() < 32
      && bed.readyAt <= eastGardenClock() && bed.tendedDay !== farm.day)
    .sort((a, b) => a.bed.readyAt - b.bed.readyAt).slice(0, 4).map(({ index }) => index);
  const growing = farm.eastGarden.beds.map((bed, index) => ({ index, bed }))
    .filter(({ index, bed }) => bed.readyAt > eastGardenClock() && bed.wateredDay !== farm.day && !ripe.includes(index))
    .sort((a, b) => hash(a.index, farm.day, 813) - hash(b.index, farm.day, 813))
    .slice(0, Math.max(0, 5 - ripe.length)).map(({ index }) => index);
  return [...ripe, ...growing];
}
function tendEastGardenBed(index) {
  const bed = farm.eastGarden.beds[index];
  if (bed.readyAt <= eastGardenClock()) {
    if (eastGardenBasketCount() >= 32) { bed.tendedDay = farm.day; return; }
    farm.eastGarden.basket[bed.kind]++;
    farm.eastGarden.harvestTotal++;
    const kind = eastGardenCropFor(index, farm.day);
    bed.kind = kind;
    bed.plantedAt = eastGardenClock();
    bed.readyAt = bed.plantedAt + EAST_GARDEN_CROPS[kind].days * (seasonIndex() === 3 ? 1.25 : 1);
  } else bed.readyAt = Math.max(eastGardenClock() + .05, bed.readyAt - .17);
  bed.wateredDay = farm.day;
  bed.tendedDay = farm.day;
}
const EAST_GARDEN_NOTICE = { x: MARKET_LAYOUT.notice.x + 63, y: MARKET_LAYOUT.notice.y + 4 };
const EAST_GARDEN_OUT = [
  { x: EAST_GARDEN_NOTICE.x, y: 950 }, { x: 1460, y: 950 }, { ...MARKET_LAYOUT.garden.entrance }
];
const EAST_GARDEN_BACK = [
  { ...MARKET_LAYOUT.garden.entrance }, { x: 1460, y: 950 },
  { x: EAST_GARDEN_NOTICE.x, y: 950 }, EAST_GARDEN_NOTICE
];
function updateEastGardenKeeper(dt) {
  let work = orderKeeper.gardenWork;
  if (!work || work.day !== farm.day) {
    if (farm.phase < .09 || farm.phase >= .30 || farm.phase >= NIGHT_START
      || orderKeeper.routine || distance(orderKeeper, EAST_GARDEN_NOTICE) >= 2) return false;
    work = { day: farm.day, stage: 'out', routeIndex: 0,
      targets: eastGardenWorkTargets(), targetIndex: 0, action: 0 };
    if (!work.targets.length) work.stage = 'done';
    orderKeeper.gardenWork = work;
  }
  if (work.stage === 'done') { orderKeeper.facing = 'down'; return false; }
  if (farm.phase >= .43 && work.stage !== 'back') { work.stage = 'back'; work.routeIndex = 0; }
  if (work.stage === 'out') {
    orderKeeper.facing = 'down';
    if (moveOrderKeeperTo(EAST_GARDEN_OUT[work.routeIndex], dt)) {
      work.routeIndex++;
      if (work.routeIndex === EAST_GARDEN_OUT.length) work.stage = 'beds';
    }
  } else if (work.stage === 'beds') {
    const target = work.targets[work.targetIndex];
    if (target == null) { work.stage = 'back'; work.routeIndex = 0; }
    else {
      const arrived = moveOrderKeeperTo({ x: eastGardenBedPoint(target).x,
        y: MARKET_LAYOUT.garden.entrance.y }, dt);
      orderKeeper.facing = arrived && target < 14 ? 'up' : 'down';
      if (arrived) {
        work.action += dt;
        if (work.action >= .48) {
          tendEastGardenBed(target);
          work.action = 0;
          work.targetIndex++;
        }
      }
    }
  } else if (work.stage === 'back') {
    orderKeeper.facing = 'down';
    if (moveOrderKeeperTo(EAST_GARDEN_BACK[work.routeIndex], dt)) {
      work.routeIndex++;
      if (work.routeIndex === EAST_GARDEN_BACK.length) work.stage = 'done';
    }
  }
  return true;
}
function eastGardenKeeperActivity() {
  const teaParty=townTeaPartyGuestActivity();
  if(teaParty)return teaParty;
  if (orderKeeper.routine) return orderKeeper.routine.stage === 'toHome'
    ? '沿集市北侧回小屋休息' : '沿集市北侧走向告示牌';
  const work = orderKeeper.gardenWork;
  if (!work || work.day !== farm.day || work.stage === 'done')
    return farm.phase >= NIGHT_START ? '正回小屋休息' : '在村口整理订单';
  return work.stage === 'out' ? '正去东岸菜圃' : work.stage === 'back' ? '正从菜圃回村口'
    : '在东岸菜圃浇水、采菜';
}
