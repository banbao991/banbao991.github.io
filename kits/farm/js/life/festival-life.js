'use strict';
// Shared seasonal celebration themes, meeting routes and attendance lifecycle.
function isFestivalDay(day = farm.day) {
  // A square finished during the day opens its celebrations from a later dawn.
  const plaza=farm.development?.projects.plaza;
  return day%10===0&&villageSiteOpen('plaza')&&(!plaza||plaza.completedAt<=day);
}

const FESTIVAL_SLOTS = [
  { x: 824, y: 810 }, { x: 880, y: 810 }, { x: 996, y: 810 },
  { x: 1052, y: 810 }, { x: 820, y: 862 }, { x: 1092, y: 864 },
  { x: 836, y: 934 }, { x: 1052, y: 932 }, { x: 936, y: 794 },
  { x: 940, y: 938 }, { x: 884, y: 890 }, { x: 996, y: 890 },
  { x: 944, y: 878 }, { x: 900, y: 938 }, { x: 770, y: 862 }, { x: 1130, y: 862 }
];
const FESTIVAL_THEMES = [
  { name: '春花集', detail: '花环与花苗交换', action: 'flowers', colors: ['#cc9090', '#e7c88b', '#97b179'] },
  { name: '夏日小乐会', detail: '果盘、点心与手鼓', action: 'music', colors: ['#d48664', '#e4bc6c', '#93b49a'] },
  { name: '秋收分享会', detail: '南瓜与丰收篮', action: 'harvest', colors: ['#c08049', '#d7ab58', '#a09a65'] },
  { name: '冬日暖茶会', detail: '热茶与暖灯', action: 'tea', colors: ['#bd7b62', '#dbbd81', '#9eb8ad'] }
];
function festivalTheme() { return FESTIVAL_THEMES[seasonIndex()]; }
const FESTIVAL_START = { x: 935, y: 974 };
const FESTIVAL_EAST = { x: 1190, y: 870 };

function festivalRoute(home, side, slot) {
  if(side==='construction')return [{...home},...(villageWalkingPath(home,FESTIVAL_EAST)||[]),{...slot}];
  const village = side === 'village';
  const lake = side === 'lake';
  const south = side === 'south';
  const pasture = side === 'pasture';
  const nursery = side === 'nursery';
  const mine = side === 'mine';
  const route = side === 'forest'
    ? [{ x: home.x, y: 307 }, { x: 1228, y: 307 }, { x: 1228, y: 870 }, FESTIVAL_EAST]
    : village
    ? [{ x: home.x, y: 812 }, { x: 1490, y: 812 }, { x: 1490, y: 950 },
      { x: 1460, y: 1021 }, { x: 1228, y: 1021 },
      { x: 1228, y: 870 }, FESTIVAL_EAST]
    : lake
      ? [{ x: home.x, y: 1019 }, { x: 620, y: 1019 },
        { x: 935, y: 1021 }, FESTIVAL_START]
      : pasture
        ? [{ x: 652, y: home.y }, { x: 620, y: home.y }, { x: 620, y: 1021 },
          { x: 935, y: 1021 }, FESTIVAL_START]
      : nursery
        ? [{ x: home.x, y: NURSERY_LAYOUT.aisle.y },
          { x: NURSERY_LAYOUT.roadStop.x, y: NURSERY_LAYOUT.aisle.y },
          { ...NURSERY_LAYOUT.roadStop }, { x: 620, y: 1021 },
          { x: 935, y: 1021 }, FESTIVAL_START]
      : mine
        ? [{ x: 1828, y: home.y },
          { ...MINE_LAYOUT.gate }, { x: 1228, y: 1206 },
          { x: 1228, y: 1021 }, { x: 935, y: 1021 }, FESTIVAL_START]
      : south
        ? [{ x: 620, y: home.y }, { x: 620, y: 1021 },
          { x: 935, y: 1021 }, FESTIVAL_START]
        : [{ x: home.x, y: 272 }, { x: 620, y: 272 },
          { x: 620, y: 592 }, { x: 620, y: 1021 },
          { x: 935, y: 1021 }, FESTIVAL_START];
  return [{ ...home }, ...route, { ...slot }];
}

function festivalMove(actor, route, dt, speed = 185) {
  const target = route[actor.festival.index];
  if (!target) return true;
  const dx = target.x - actor.x, dy = target.y - actor.y, distance = Math.hypot(dx, dy);
  const travel = Math.min(distance, speed * dt);
  if (distance > 0) {
    actor.x += dx / distance * travel;
    actor.y += dy / distance * travel;
    if (Math.abs(dx) > .5) actor.dir = dx < 0 ? -1 : 1;
    actor.step = (actor.step || 0) + dt * 12;
    if (actor.walk != null) actor.walk += dt * 12;
  }
  if (distance <= travel + 1) {
    actor.x = target.x; actor.y = target.y;
    actor.festival.index++;
  }
  return actor.festival.index >= route.length;
}

function updateFestivalActor(actor, dt, home, slotIndex, side = 'north') {
  if (!actor.festival || actor.festival.day !== farm.day || !actor.festival.out) {
    const out = festivalRoute(home, side, FESTIVAL_SLOTS[slotIndex]);
    if (farm.phase >= .44) {
      actor.x = home.x; actor.y = home.y;
      actor.festival = { day: farm.day, attending: true, out, index: 0, stage: 'home' };
      return;
    }
    actor.festival = { day: farm.day, attending: true, out, index: 1, stage: 'out' };
  }
  const visit = actor.festival;
  if (visit.stage === 'home') return;
  if (farm.phase >= .44 && visit.stage !== 'back') {
    visit.stage = 'back';
    visit.index = 0;
    const entry = visit.out.at(-2);
    const exit = festivalPlazaPath(actor, entry);
    visit.activity = null;
    visit.back = [...exit, ...visit.out.slice(0, -1).reverse(), { ...home }];
  }
  if (visit.stage === 'back' && festivalMove(actor, visit.back, dt)) visit.stage = 'home';
  else if (visit.stage === 'out' && festivalMove(actor, visit.out, dt)) visit.stage = 'gather';
  else if (visit.stage === 'gather') updateFestivalActivity(actor, dt, slotIndex);
}

function festivalMorning(actor, dt, route, speed) {
  const visit = actor.festival;
  if (!visit || visit.day !== farm.day - 1 || !['home', 'morning'].includes(visit.stage)) return false;
  if (visit.stage === 'home') {
    if (farm.phase < .02) return true;
    visit.stage = 'morning';
    visit.index = 0;
    visit.morning = route;
  }
  if (festivalMove(actor, visit.morning, dt, speed)) actor.festival = null;
  return true;
}

function festivalActivity(actor) {
  if (actor.festival?.stage === 'morning') return '正从家里出门';
  return actor.festival?.day === farm.day && isFestivalDay()
    ? actor.festival.stage === 'gather' ? festivalResidentActivity(actor) : actor.festival.stage === 'back' ? '从广场回家'
      : actor.festival.stage === 'home' ? '在家休息' : '正赶往广场'
    : null;
}

function festivalAtHome(actor) {
  const visit = actor.festival;
  return visit?.stage === 'home' && (visit.day === farm.day && isFestivalDay()
    || visit.day === farm.day - 1);
}
