'use strict';
// A daily choice is made only on working mornings. Routes stay on dry, unobstructed ground.
const FOREST_HOME = { x: 1136, y: 264 };
const FOREST_WATCH_SPOTS = [{ x: 1072, y: 447 }, { x: 1710, y: 254 },
  { x: 1810, y: 514 }, { x: 1200, y: 535 }, EAST_WOODS.watch];
function resetForestKeeper() {
  return { ...FOREST_HOME, day: 0, choice: null, picked: 0, acornDay: 0, mode: 'home',
    route: [], routeIndex: 0, targetId: null, action: 0, wait: 0, scanWait: 0, watchIndex: 0,
    dir: -1, step: 0, walk: 0, waveUntil: 0, festival: null };
}
let forestKeeper = resetForestKeeper();
function forestGroundClear(x, y) {
  if (x < 952 || x > EAST_WOODS.area.right || y < 48 || y > 648) return false;
  if(x>2016&&(y>EAST_WOODS.area.bottom||EAST_WOODS.trees.some(t=>distance({x,y},{x:t.x,y:t.y+10})<EAST_WOODS.rootRadius)))return false;
  if (riverAt(x, y, 10) && !RIVER_BRIDGES.some(b => b.y === 291
    && x >= b.west - 18 && x <= b.east + 18 && y >= b.y + 8 && y <= b.y + b.height - 8)) return false;
  if (inRect(x, y, 1011, 99, 1198, 261) || inRect(x, y, 932, 130, 1020, 230)) return false;
  if (FOREST_TREE_SITES.some(([tx, ty]) => Math.abs(x - tx) < 17 && y > ty && y < ty + 36)) return false;
  return !RIDGE_OWL_PERCHES.slice(1).some(tree => Math.abs(x - tree.x) < 18
    && y > tree.y - ({ birch: 54, maple: 42, spruce: 36, elm: 34 }[tree.kind] || 34) - 8
    && y < tree.baseY + 12);
}
function forestSegmentClear(a, b) {
  const steps = Math.max(1, Math.ceil(distance(a, b) / 4));
  for (let i = 1; i <= steps; i++)
    if (!forestGroundClear(a.x + (b.x - a.x) * i / steps, a.y + (b.y - a.y) * i / steps)) return false;
  return true;
}
function forestWalkingRoute(from, to, reach = 10) {
  // Breadth-first search on a 16px grid; cardinal edges cannot cut tree trunks or riverbanks.
  const grid = 16, key = (x, y) => `${x},${y}`;
  const start = { x: Math.round(from.x / grid) * grid, y: Math.round(from.y / grid) * grid };
  if (!forestSegmentClear(from, start)) return [];
  const queue = [start], previous = new Map([[key(start.x, start.y), null]]);
  let end = null;
  for (let index = 0; index < queue.length; index++) {
    const point = queue[index];
    if (distance(point, to) <= reach) { end = point; break; }
    for (const [dx, dy] of [[0, 16], [16, 0], [0, -16], [-16, 0]]) {
      const next = { x: point.x + dx, y: point.y + dy }, id = key(next.x, next.y);
      if (previous.has(id) || !forestGroundClear(next.x, next.y) || !forestSegmentClear(point, next)) continue;
      previous.set(id, point); queue.push(next);
    }
  }
  if (!end) return [];
  const route = [];
  for (let point = end; point; point = previous.get(key(point.x, point.y))) route.unshift(point);
  // Keep turns, rather than storing every grid cell in a full snapshot.
  const turns = route.filter((point, index) => !index || index === route.length - 1
    || (point.x - route[index - 1].x) !== (route[index + 1].x - point.x)
    || (point.y - route[index - 1].y) !== (route[index + 1].y - point.y));
  if (reach <= 10 && forestSegmentClear(end, to)) turns.push({ ...to });
  return turns;
}
function setForestGoal(mode, destination, reach = 10) {
  const route = forestWalkingRoute(forestKeeper, destination, reach);
  if (!route.length) return false;
  Object.assign(forestKeeper, { mode, route, routeIndex: 0, action: 0, wait: 0 });
  return true;
}
function moveForestKeeper(dt) {
  const actor = forestKeeper, target = actor.route[actor.routeIndex];
  if (!target) return true;
  const dx = target.x - actor.x, dy = target.y - actor.y, length = Math.hypot(dx, dy);
  const travel = Math.min(length, dt * 112);
  if (length > 0) {
    actor.x += dx / length * travel; actor.y += dy / length * travel;
    if (Math.abs(dx) > .5) actor.dir = dx < 0 ? -1 : 1;
    actor.step += dt * 12; actor.walk += dt * 12;
  }
  if (length <= travel + .1) { actor.x = target.x; actor.y = target.y; actor.routeIndex++; }
  return actor.routeIndex >= actor.route.length;
}
function chooseForestMushroom() {
  const actor = forestKeeper;
  if (actor.choice !== 'gather' || actor.picked >= 3 || actor.scanWait > 0) return false;
  const sites = farm.forage.filter(site => site.kind === 'mushroom' && site.x >= 952 && site.y <= 648)
    .sort((a, b) => distance(actor, a) - distance(actor, b));
  for (const site of sites) if (setForestGoal('toMushroom', site, 22)) {
    actor.targetId = site.id; return true;
  }
  actor.targetId = null;
  actor.scanWait = 1.5;
  return false;
}
function visitForestAnimals() {
  const actor = forestKeeper;
  const neighbours = [squirrel, ridgeDeer, ridgeHare].filter(animal => distance(actor, animal) < 100);
  for (const animal of neighbours) {
    animal.dir = actor.x < animal.x ? -1 : 1;
    animal.wait = Math.max(animal.wait, 1.8);
    if (animal === squirrel) animal.excited = 2;
    if (animal === ridgeDeer) animal.grazing = false;
  }
  if(forestFoxVisible()&&distance(actor,forestFox)<80){forestFox.waveUntil=now+2.3;
    if(['sniff','nap'].includes(forestFox.mode))forestFox.dir=actor.x<forestFox.x?-1:1;}
  actor.waveUntil = now + 2.3;
  visitEastPheasants(actor);
}
function updateForestKeeper(dt) {
  if(farm.paused||!villageResidentWorking('阿森'))return;
  if (farm.paused) return;
  const actor = forestKeeper;
  if (isFestivalDay()) {
    actor.targetId = null; actor.route = []; actor.routeIndex = 0; actor.action = 0; actor.mode = 'idle';
    updateFestivalActor(actor, dt, FOREST_HOME, 11, 'forest');
    return;
  }
  if (farm.phase < .02) return;
  actor.festival = null;
  actor.scanWait = Math.max(0, actor.scanWait - dt);
  if (farm.phase >= NIGHT_START) {
    if (distance(actor, FOREST_HOME) < 2) { actor.mode = 'home'; actor.route = []; actor.routeIndex = 0; return; }
    if (actor.mode !== 'toHome') { actor.targetId = null; setForestGoal('toHome', FOREST_HOME); }
    if (moveForestKeeper(dt)) actor.mode = 'home';
    return;
  }
  if (actor.day !== farm.day) {
    Object.assign(actor, { day: farm.day, choice: hash(farm.day, 967) < .5 ? 'gather' : 'stroll',
      picked: 0, mode: 'idle', route: [], routeIndex: 0, action: 0, wait: 0, scanWait: 0,
      targetId: null, watchIndex: Math.floor(hash(farm.day, 968) * FOREST_WATCH_SPOTS.length) });
    record(actor.choice === 'gather' ? '阿森背上小篮，今天去森林找蘑菇。' : '阿森今天巡林，去看看松鼠、小鹿、野兔和东缘山雉。');
    save();
  }
  if (actor.mode === 'toMushroom' || actor.mode === 'picking') {
    const site = farm.forage.find(item => item.id === actor.targetId && ['mushroom', 'acorn'].includes(item.kind));
    if (!site) { actor.targetId = null; actor.mode = 'idle'; actor.route = []; actor.routeIndex = 0; }
    else if (actor.mode === 'toMushroom') {
      if (moveForestKeeper(dt)) { actor.mode = 'picking'; actor.action = 0; }
      return;
    } else {
      actor.action += dt;
      if (actor.action >= 1.2) {
        if (site.kind === 'acorn') actor.acornDay = farm.day;
        else actor.picked++;
        actor.targetId = null; actor.action = 0; actor.mode = 'idle';
        collectForage(site, '阿森');
        chooseForestMushroom();
      }
      return;
    }
  }
  if (actor.mode === 'toWatch') {
    if (moveForestKeeper(dt)) { actor.mode = 'watching'; actor.wait = 4; visitForestAnimals(); }
    return;
  }
  // A newly available mushroom interrupts a stroll or its pause, without a trip home.
  if (chooseForestMushroom()) return;
  if (actor.mode === 'watching') {
    visitEastPheasants(actor);
    if ((actor.wait = Math.max(0, actor.wait - dt)) > 0) return;
  }
  if (chooseForestAcorn()) return;
  const spot = FOREST_WATCH_SPOTS[actor.watchIndex++ % FOREST_WATCH_SPOTS.length];
  setForestGoal('toWatch', spot);
}
function forestKeeperVisible() {
  if(!villageResidentWorking('阿森'))return false;
  return !festivalAtHome(forestKeeper) && !(forestKeeper.mode === 'home' && distance(forestKeeper, FOREST_HOME) < 2);
}
function forestKeeperAt(x, y) {
  return forestKeeperVisible() && Math.abs(x - forestKeeper.x) <= 16
    && y >= forestKeeper.y - 28 && y <= forestKeeper.y + 24;
}
function forestKeeperActivity() {
  if(!isFestivalDay()&&!forestKeeper.festival){
    const target = farm.forage.find(site => site.id === forestKeeper.targetId);
    if (target?.kind === 'acorn') {
      if (forestKeeper.mode === 'toMushroom') return '去拾栎树下的橡果';
      if (forestKeeper.mode === 'picking') return '正在拾橡果';
    }
    if(forestKeeper.mode==='watching'&&distance(forestKeeper,EAST_WOODS.watch)<12)return '停下观察东缘山雉';
    if(forestKeeper.mode==='toWatch'&&distance(forestKeeper.route.at(-1)||forestKeeper,EAST_WOODS.watch)<12)return '去东缘林地巡游';
  }
  return festivalActivity(forestKeeper) || ({ home: '在林间木屋休息', toHome: '正回林间木屋',
    toMushroom: '去下一朵蘑菇旁', picking: '正在采蘑菇', toWatch: '在林间巡游',
    watching: '停下观察林间动物', idle: '准备出门' }[forestKeeper.mode]);
}
