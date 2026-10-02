'use strict';
// Forest forage, squirrels and foxes: state, movement, interaction and hit testing.
// Daily wild food and the squirrel's independent route through the forest.
const forageZones = [
  [992, 348, 1248, 602], [1665, 350, 2005, 604],
  [1674, 74, 1990, 247], [998, 504, 1238, 614],
  [354, 1074, 579, 1245]
];
const squirrelPerches = [
  { x: 1022, y: 400 }, { x: 1126, y: 401 }, { x: 1244, y: 450 },
  { x: 1085, y: 545 }, { x: 1190, y: 518 }, { x: 1218, y: 361 }
];
let squirrel = { x: 1050, y: 420, tx: 1130, ty: 415, wait: 0, step: 0, moving: true, dir: 1, excited: 0 };

function spawnForageForDay() {
  if (farm.forageSpawnDay === farm.day) return;
  const count = 7 + Math.floor(hash(farm.day, 87) * 4);
  const sites = [];
  for (let i = 0; i < count; i++) {
    const zone = forageZones[(i + farm.day) % forageZones.length];
    for (let attempt = 0; attempt < 24; attempt++) {
      const seed = i * 11 + attempt;
      const x = Math.round(zone[0] + hash(farm.day, seed, 88) * (zone[2] - zone[0]));
      const y = Math.round(zone[1] + hash(seed, farm.day, 89) * (zone[3] - zone[1]));
      if ((x > 1202 && x < 1268 && y > 300 && y < 1232)
        || (x > 397 && x < 524 && y > 1214)
        || riverAt(x, y, 18) || bridgeAt(x, y) || courierRoadAt(x, y, 18) || ridgeForageClear(x, y)) continue;
      if (sites.some(site => Math.hypot(site.x - x, site.y - y) < 48)) continue;
      const kind = i === 0 ? 'berry' : i === 1 ? 'mushroom' : hash(farm.day, i, 90) > .48 ? 'berry' : 'mushroom';
      sites.push({ id: `${farm.day}-${i}`, x, y, kind });
      break;
    }
  }
  farm.forage = sites;
  farm.forageSpawnDay = farm.day;
}
function forageAt(x, y) {
  return farm.forage.find(site => Math.hypot(site.x - x, site.y - y) < 23) || null;
}
function forageName(site) {
  return site.kind === 'berry' ? '野莓' : site.kind === 'acorn' ? '橡果' : '蘑菇';
}
function collectForage(site, collector = '') {
  const index = farm.forage.findIndex(item => item.id === site.id);
  if (index < 0) return false;
  farm.forage.splice(index, 1);
  farm.forageTotal++;
  if (site.kind === 'berry') {
    farm.berries++;
    farm.berryPickedTotal++;
    record('采下一簇野莓，果篮里多了 1 份。可以拿去喂森林松鼠。');
  } else {
    if (site.kind === 'acorn') farm.acornPickedTotal++;
    else farm.mushroomPickedTotal++;
    stockGood('forest', site.kind, 1);
    record(`${collector}采到${forageName(site)}，放进森林采集箱。`);
  }
  save();
  return true;
}
function squirrelAt(x, y) {
  return !(farm.phase >= NIGHT_START && Math.hypot(squirrel.x - 1126, squirrel.y - 401) < 10)
    && Math.hypot(squirrel.x - x, squirrel.y - y) < 25;
}
function chooseSquirrelTarget() {
  const berries = farm.forage.filter(site => site.kind === 'berry' && site.x > 960 && site.x < 1280);
  const target = berries.length && Math.random() < .58
    ? berries[Math.floor(Math.random() * berries.length)]
    : squirrelPerches[Math.floor(Math.random() * squirrelPerches.length)];
  squirrel.tx = target.x + (target.kind ? -12 : 0);
  squirrel.ty = target.y + (target.kind ? -8 : 0);
}
function updateWildlife(dt) {
  squirrel.excited = Math.max(0, squirrel.excited - dt);
  const sheltering = farm.phase >= NIGHT_START || weatherVisual().rain > .72;
  if (sheltering) { squirrel.tx = 1126; squirrel.ty = 401; squirrel.wait = 0; }
  else if (squirrel.wait > 0) squirrel.wait -= dt;
  else if (Math.hypot(squirrel.tx - squirrel.x, squirrel.ty - squirrel.y) < 9) {
    squirrel.wait = .5 + Math.random() * 1.2;
    chooseSquirrelTarget();
  }
  const dx = squirrel.tx - squirrel.x, dy = squirrel.ty - squirrel.y, distanceToTarget = Math.hypot(dx, dy);
  squirrel.moving = distanceToTarget > 5 && squirrel.wait <= 0;
  if (squirrel.moving) {
    const travel = Math.min(distanceToTarget, dt * (squirrel.excited > 0 ? 112 : 74));
    squirrel.x += dx / distanceToTarget * travel;
    squirrel.y += dy / distanceToTarget * travel;
    squirrel.dir = dx < 0 ? -1 : 1;
    squirrel.step += dt * 15;
  }
}
function feedSquirrel() {
  squirrel.excited = 2.8;
  squirrel.wait = 0;
  if (farm.berries < 1) {
    chooseSquirrelTarget();
    record('你向松鼠挥了挥手。它轻快地跳向另一棵树；采些野莓就能和它交朋友。');
    return;
  }
  farm.berries--;
  farm.squirrelTrust++;
  if (farm.squirrelTrust % 3 === 0) {
    const x = clamp(Math.round(squirrel.x + 31), 985, 1627);
    const y = clamp(Math.round(squirrel.y + 18), 337, 610);
    farm.forage.push({ id: `${farm.day}-gift-${farm.squirrelTrust}`, x, y, kind: 'acorn' });
    record('松鼠收下野莓，带你找到一枚闪亮的橡果！点击橡果可以采集。');
  } else record(`松鼠开心地抱着野莓跳了起来。亲近度 ${farm.squirrelTrust}。`);
  chooseSquirrelTarget();
  save();
}
function resetWildlife() {
  squirrel = { x: 1050, y: 420, tx: 1130, ty: 415, wait: 0, step: 0, moving: true, dir: 1, excited: 0 };
}
spawnForageForDay();

function foxPosition() { return { x: 1190 + Math.sin(motionNow * .34) * 55, y: 466 + Math.sin(motionNow * .23) * 24 }; }

function foxAt(x, y) {
  const fox = foxPosition();
  return farm.phase < NIGHT_START && x >= fox.x - 33 && x <= fox.x + 28 && y >= fox.y - 20 && y <= fox.y + 15;
}
