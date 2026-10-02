'use strict';
// Quiet daily visitors use the plaza without changing production or festival attendance.
let plazaCats, plazaSparrows;

function createPlazaCats() {
  return ['橘子', '墨点'].map((name, index) => ({ name, coat: index ? 'cow' : 'ginger',
    ...PLAZA_PET_LAYOUT.house.doors[index], tx: PLAZA_PET_LAYOUT.house.doors[index].x,
    ty: PLAZA_PET_LAYOUT.house.doors[index].y, mode: 'home', path: [],
    wait: index * 1.6, action: 0, step: 0, dir: index ? -1 : 1, purr: 0 }));
}
function createPlazaSparrows() {
  return Array.from({ length: 5 }, (_, index) => ({ x: 724 + index * 19, y: 576,
    tx: 724 + index * 19, ty: 576, mode: 'away', site: -1, returning: false,
    wait: index * .55, step: 0, dir: 1, lift: 0, flightLength: 0 }));
}
function resetPlazaLife() { plazaCats = createPlazaCats(); plazaSparrows = createPlazaSparrows(); }
function plazaCatVisible(cat) { return cat.mode !== 'home'; }
function plazaSparrowVisible(bird) { return bird.mode !== 'away'; }
function plazaCatAt(x, y) {
  return plazaCats.find(cat => plazaCatVisible(cat) && Math.abs(x - cat.x) < 24
    && y >= cat.y - 21 && y <= cat.y + 12) || null;
}
function plazaSparrowAt(x, y) {
  return plazaSparrows.find(bird => plazaSparrowVisible(bird) && Math.abs(x - bird.x) < 15
    && Math.abs(y - (bird.y - bird.lift - 6)) < 14) || null;
}
function plazaCatHint(cat) {
  const actions = { home: '在猫屋里休息', return: '正回猫屋', move: '在广场散步',
    sleep: '蜷着身子晒太阳', groom: '正在洗脸', stretch: '伸了个懒腰', watch: '坐着看麻雀' };
  return `${cat.name} · ${cat.coat === 'ginger' ? '橘白猫' : '奶牛猫'} · ${actions[cat.mode]} · 点击摸摸它`;
}
function plazaSparrowHint(bird) {
  return `广场麻雀 · ${{ fly: '正在短距离飞行', hop: '轻轻跳跃', peck: '在空地啄食',
    preen: '正在整理羽毛', perch: '停在高处歇脚' }[bird.mode]} · 点击看它展翅`;
}
function plazaCatHouseHint() {
  const indoors = plazaCats.filter(cat => !plazaCatVisible(cat)).map(cat => cat.name);
  return `广场猫屋 · 橘白猫橘子与奶牛猫墨点的家 · ${indoors.length
    ? `${indoors.join('、')}在屋里${farm.weather === 'rain' ? '避雨' : '休息'}` : '两只猫都在外面活动'} · 雨天不出门，夜里回家`;
}

function plazaPetWalkable(point) {
  const s = CENTRAL_PLAZA;
  if (!centralPlazaAt(point.x, point.y) || point.x < s.left + 15
    || point.x > plazaRightAt(point.y) - 16 || point.y < s.top + 8 || point.y > s.bottom - 16) return false;
  if (inRect(point.x, point.y, s.stage.x - 82, s.stage.y - 82, s.stage.x + 82, s.stage.y + 39)
    || distance(point, s.well) < 46) return false;
  if (s.flowers.some(([x, y]) => Math.hypot(point.x - x, point.y - y) < 36)
    || s.shrubs.some(([x, y]) => Math.hypot(point.x - x, point.y - y) < 27)) return false;
  if (s.benches.some(bench => Math.abs(point.x - bench.x) < 37
    && point.y > bench.y - 40 && point.y < bench.y + 15)) return false;
  return !isFestivalDay() || (!s.tables.some(table => Math.abs(point.x - table.x) < 43
    && Math.abs(point.y - table.y) < 42) && !s.poles.some(pole => distance(point, pole) < 21));
}
function plazaPetPath(from, target) {
  const step = 16, left = 688, top = 632, columns = 31, rows = 21;
  const nodes = new Map();
  for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
    const point = { x: left + col * step, y: top + row * step };
    if (plazaPetWalkable(point)) nodes.set(row * columns + col, point);
  }
  const nearest = point => [...nodes.keys()].reduce((best, key) =>
    distance(nodes.get(key), point) < distance(nodes.get(best), point) ? key : best);
  const start = nearest(from), end = nearest(target), queue = [start], previous = new Map([[start, null]]);
  for (let index = 0; index < queue.length && !previous.has(end); index++) {
    const key = queue[index];
    for (const next of [key - columns, key + columns,
      ...(key % columns ? [key - 1] : []), ...(key % columns < columns - 1 ? [key + 1] : [])]) {
      if (nodes.has(next) && !previous.has(next)) { previous.set(next, key); queue.push(next); }
    }
  }
  if (!previous.has(end)) return [];
  const path = [];
  for (let key = end; key !== null; key = previous.get(key)) path.unshift({ ...nodes.get(key) });
  // Ground destinations use the nearest clear cell; only the two home doors sit outside the grid.
  if (PLAZA_PET_LAYOUT.house.doors.some(door => door.x === target.x && door.y === target.y)) path.push({ ...target });
  return path;
}
function setPlazaCatGoal(cat, point, mode = 'move') {
  const path = plazaPetPath(cat, point);
  if (!path.length) return false;
  cat.path = path; cat.mode = mode; cat.action = 0;
  const end = path.at(-1); cat.tx = end.x; cat.ty = end.y;
  return true;
}
function movePlazaPet(actor, point, dt, speed) {
  const dx = point.x - actor.x, dy = point.y - actor.y, length = Math.hypot(dx, dy);
  const travel = Math.min(length, speed * dt);
  if (length > 0) {
    actor.x += dx / length * travel; actor.y += dy / length * travel;
    if (Math.abs(dx) > .5) actor.dir = dx < 0 ? -1 : 1;
    actor.step += dt * 9;
  }
  return length <= travel + .01;
}
function choosePlazaCatWalk(cat) {
  const options = PLAZA_PET_LAYOUT.restSpots.filter(point => plazaPetWalkable(point)
    && distance(cat, point) > 45 && plazaCats.every(other => other === cat
      || Math.hypot(point.x - other.tx, point.y - other.ty) > 42));
  if (!options.length) return;
  setPlazaCatGoal(cat, options[Math.floor(Math.random() * options.length)]);
}
function plazaNeighbours() {
  return festivalParticipants().filter(actor => !festivalAtHome(actor)
    && actor.x >= CENTRAL_PLAZA.left - 30 && actor.x <= CENTRAL_PLAZA.right + 30
    && actor.y >= CENTRAL_PLAZA.top - 20 && actor.y <= CENTRAL_PLAZA.bottom + 20);
}
function updatePlazaCats(dt) {
  const shelter = farm.weather === 'rain' || farm.phase >= NIGHT_START || farm.phase < .04;
  for (const [index, cat] of plazaCats.entries()) {
    cat.purr = Math.max(0, cat.purr - dt);
    if (shelter && !['home', 'return'].includes(cat.mode))
      setPlazaCatGoal(cat, PLAZA_PET_LAYOUT.house.doors[index], 'return');
    if (cat.mode === 'home') {
      if (!shelter && (cat.wait = Math.max(0, cat.wait - dt)) <= 0) choosePlazaCatWalk(cat);
      continue;
    }
    if (cat.mode === 'move' || cat.mode === 'return') {
      const point = cat.path[0];
      if (point && movePlazaPet(cat, point, dt, cat.mode === 'return' ? 78 : 42)) cat.path.shift();
      if (cat.path.length) continue;
      if (cat.mode === 'return') { cat.mode = 'home'; cat.wait = 1 + index; continue; }
      const bird = plazaSparrows.find(item => plazaSparrowVisible(item) && distance(cat, item) < 150);
      cat.mode = bird && Math.random() < .35 ? 'watch' : ['sleep', 'groom', 'stretch'][Math.floor(Math.random() * 3)];
      cat.wait = cat.mode === 'stretch' ? 1.8 : rand(3.5, 7); cat.action = 0;
      if (bird) cat.dir = bird.x < cat.x ? -1 : 1;
    } else {
      cat.action += dt; cat.wait = Math.max(0, cat.wait - dt);
      if (cat.wait <= 0 || plazaNeighbours().some(actor => distance(actor, cat) < 30)) choosePlazaCatWalk(cat);
    }
  }
}

function sparrowSiteAvailable(bird, index) {
  const site = PLAZA_PET_LAYOUT.birdSites[index];
  if (site.kind === 'pole' && !isFestivalDay()) return false;
  if (plazaSparrows.some(other => other !== bird && other.site === index && plazaSparrowVisible(other))) return false;
  if (site.kind !== 'ground') return true;
  return plazaPetWalkable(site) && [...plazaCats.filter(plazaCatVisible), ...plazaNeighbours()]
    .every(actor => distance(actor, site) > 65);
}
function flyPlazaSparrow(bird, siteIndex = -1) {
  const target = siteIndex >= 0 ? PLAZA_PET_LAYOUT.birdSites[siteIndex]
    : { x: 724 + plazaSparrows.indexOf(bird) * 19, y: 576 };
  bird.site = siteIndex; bird.returning = siteIndex < 0; bird.mode = 'fly';
  bird.tx = target.x; bird.ty = target.y; bird.flightLength = Math.max(1, distance(bird, target));
  bird.lift = 0;
}
function chooseSparrowSite(bird, highOnly = false) {
  const choices = PLAZA_PET_LAYOUT.birdSites.map((site, index) => ({ site, index }))
    .filter(({ site, index }) => index !== bird.site && sparrowSiteAvailable(bird, index)
      && (!highOnly || site.kind !== 'ground'));
  if (!choices.length) { flyPlazaSparrow(bird); return; }
  const choice = choices[Math.floor(Math.random() * choices.length)];
  flyPlazaSparrow(bird, choice.index);
}
function updatePlazaSparrows(dt) {
  const visit = farm.phase >= .07 && farm.phase < .49 && farm.weather !== 'rain'
    && (farm.phase - .07) % .15 < .115;
  const count = 3 + Math.floor(hash(farm.day, Math.floor(farm.phase / .15), 617) * 3);
  for (const [index, bird] of plazaSparrows.entries()) {
    const wanted = visit && index < count;
    if (!wanted && bird.mode !== 'away' && !bird.returning) flyPlazaSparrow(bird);
    if (bird.mode === 'away') {
      bird.wait = Math.max(0, bird.wait - dt);
      if (wanted && bird.wait <= 0) chooseSparrowSite(bird, isFestivalDay());
      continue;
    }
    if (bird.mode === 'fly' || bird.mode === 'hop') {
      const arrived = movePlazaPet(bird, { x: bird.tx, y: bird.ty }, dt, bird.mode === 'hop' ? 30 : 135);
      const progress = 1 - Math.min(1, Math.hypot(bird.tx - bird.x, bird.ty - bird.y) / bird.flightLength);
      bird.lift = Math.sin(progress * Math.PI) * (bird.mode === 'hop' ? 6 : 30);
      if (!arrived) continue;
      bird.x = bird.tx; bird.y = bird.ty; bird.lift = 0;
      if (bird.returning) { bird.mode = 'away'; bird.site = -1; bird.wait = .4 + index * .4; continue; }
      bird.mode = PLAZA_PET_LAYOUT.birdSites[bird.site].kind === 'ground' ? 'peck' : 'perch';
      bird.wait = rand(1.5, 4);
      continue;
    }
    const currentSite = PLAZA_PET_LAYOUT.birdSites[bird.site];
    if (currentSite?.kind === 'pole' && !isFestivalDay()) { chooseSparrowSite(bird); continue; }
    const ground = currentSite?.kind === 'ground';
    if (ground && [...plazaCats.filter(plazaCatVisible), ...plazaNeighbours()].some(actor => distance(actor, bird) < 60)) {
      chooseSparrowSite(bird, true); continue;
    }
    bird.wait = Math.max(0, bird.wait - dt); bird.step += dt * 4;
    if (bird.wait > 0) continue;
    if (ground && bird.mode === 'peck' && Math.random() < .45) {
      const next = { x: bird.x + rand(-10, 10), y: bird.y + rand(-7, 7) };
      if (plazaPetWalkable(next)) {
        bird.mode = 'hop'; bird.tx = next.x; bird.ty = next.y;
        bird.flightLength = Math.max(1, distance(bird, next)); continue;
      }
    }
    if (bird.mode !== 'preen' && Math.random() < .3) { bird.mode = 'preen'; bird.wait = 1.8; }
    else chooseSparrowSite(bird, isFestivalDay());
  }
}
function updatePlazaLife(dt) {
  if (farm.paused) return;
  updatePlazaCats(dt); updatePlazaSparrows(dt);
}
function greetPlazaCat(cat) {
  cat.purr = 2.5;
  if (!['move', 'return'].includes(cat.mode)) { cat.mode = 'stretch'; cat.wait = 2; }
  record(`${cat.name}轻轻喵了一声，抬头蹭蹭你的手。`); save();
}
function greetPlazaSparrow(bird) {
  if (bird.mode !== 'fly') chooseSparrowSite(bird, true);
  record('小麻雀扑棱着翅膀，换了个落脚的地方。'); save();
}
resetPlazaLife();
