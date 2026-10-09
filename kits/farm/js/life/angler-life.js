'use strict';
// 阿蓼: state, daily commutes, celebration attendance, fishing, visibility and hit testing.
const ANGLER_PIER = { x: 408, y: 849 + SOUTH_LAKE_SHIFT_Y };
const ANGLER_HOME = { x: 515, y: 902 + SOUTH_LAKE_SHIFT_Y };

function resetAngler() { return { ...ANGLER_PIER, dir: -1, step: 0, walk: 0, festival: null, routine: null, fishing: null }; }

let angler = resetAngler();
const ANGLER_MORNING_ROUTE = [
  { x: 445, y: ANGLER_HOME.y }, { x: 445, y: ANGLER_PIER.y }, ANGLER_PIER
];
const ANGLER_EVENING_ROUTE = [
  { x: 445, y: ANGLER_PIER.y }, { x: 445, y: ANGLER_HOME.y }, ANGLER_HOME
];

function updateOrdinaryAngler(dt) {
  const evening = farm.phase >= NIGHT_START;
  const destination = evening ? ANGLER_HOME : ANGLER_PIER;
  if (distance(angler, destination) < 2) { angler.routine = null; return; }
  if (!evening && farm.phase < .02) return;
  const stage = evening ? 'toHome' : 'toPier';
  if (!angler.routine || angler.routine.stage !== stage) angler.routine = { stage, index: 0 };
  const route = evening ? ANGLER_EVENING_ROUTE : ANGLER_MORNING_ROUTE;
  const target = route[angler.routine.index];
  const dx = target.x - angler.x, dy = target.y - angler.y, length = Math.hypot(dx, dy);
  const step = Math.min(length, 90 * dt);
  if (length > 0) {
    angler.x += dx / length * step; angler.y += dy / length * step;
    if (Math.abs(dx) > .5) angler.dir = dx < 0 ? -1 : 1;
    angler.step += dt * 12; angler.walk += dt * 12;
  }
  if (length <= step + 1) {
    angler.x = target.x; angler.y = target.y;
    if (++angler.routine.index >= route.length) angler.routine = null;
  }
}

function updateAngler(dt) {
  if(farm.paused||!villageResidentWorking('阿蓼'))return;
  if (isFestivalDay()) {
    angler.routine = null;
    if (!angler.festival) { angler.x = ANGLER_HOME.x; angler.y = ANGLER_HOME.y; }
    updateFestivalActor(angler, dt, ANGLER_HOME, 6, 'lake');
  } else if (!festivalMorning(angler, dt, ANGLER_MORNING_ROUTE, 90)) {
    angler.festival = null;
    updateOrdinaryAngler(dt);
  }
}

function updateAnglerFishing(dt) {
  if(farm.paused||!villageResidentWorking('阿蓼'))return;
  if (farm.paused || isFestivalDay() || farm.phase < .02 || farm.phase >= NIGHT_START
    || angler.festival || angler.routine || distance(angler, ANGLER_PIER) >= 2) return;
  if (angler.fishing?.day !== farm.day) {
    angler.fishing = { day: farm.day, quota: 1 + Math.floor(hash(farm.day, 965) * 2),
      caught: 0, targetId: null, action: 0 };
  }
  const fishing = angler.fishing;
  if (fishing.caught >= fishing.quota || farm.phase < .12 + fishing.caught * .22) return;
  let site = farm.fishSpots.find(fish => fish.id === fishing.targetId);
  if (!site) {
    fishing.action = 0;
    site = [...farm.fishSpots].sort((a, b) => distance(a, ANGLER_PIER) - distance(b, ANGLER_PIER))[0];
    fishing.targetId = site?.id ?? null;
  }
  if (!site) return;
  fishing.action += dt;
  if (fishing.action < 2.4) return;
  fishing.caught++;
  fishing.action = 0;
  fishing.targetId = null;
  catchFish(site, '阿蓼');
}

function anglerActivity() {
  const festival = festivalActivity(angler);
  if (festival) return festival;
  if (angler.routine?.stage === 'toPier') return '正从小屋走向栈桥';
  if (angler.routine?.stage === 'toHome') return '正从栈桥回小屋';
  if (distance(angler, ANGLER_HOME) < 2) return '在钓鱼小屋休息';
  if (farm.phase >= NIGHT_START) return '准备回钓鱼小屋';
  const fishing = angler.fishing?.day === farm.day ? angler.fishing : null;
  if(lakeDuckVisitHello())return '收竿后向栈桥旁的水鸭挥手';
  if (fishing?.targetId) return '正在等鱼儿上钩';
  if (fishing && fishing.caught >= fishing.quota) return '今日收竿，在栈桥上看湖景';
  if (!farm.fishSpots.length) return '鱼点暂空，在栈桥歇脚';
  return '在栈桥上垂钓';
}

function anglerPosition() {
  const bob = !angler.festival && farm.phase < NIGHT_START
    && distance(angler, ANGLER_PIER) < 2 ? Math.sin(motionNow * 1.3) * 1.5 : 0;
  return { x: angler.x, y: angler.y + bob };
}

function anglerAt(x, y) {
  if(!villageResidentWorking('阿蓼'))return false;
  if (festivalAtHome(angler)) return false;
  const travelling = !!angler.routine || angler.festival?.stage === 'morning';
  const visible = isFestivalDay()
    ? farm.phase < NIGHT_START || distance(angler, ANGLER_HOME) > 12
    : travelling || (farm.phase < NIGHT_START && distance(angler, ANGLER_PIER) < 2);
  if (!visible) return false;
  const position = anglerPosition();
  return x >= position.x - 11 && x <= position.x + 15
    && y >= position.y - 28 && y <= position.y + 22;
}
