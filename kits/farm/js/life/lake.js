'use strict';
// The southern lake has daily fishing spots and independently moving ducks.
const LAKE_X = 242, LAKE_Y = 865 + SOUTH_LAKE_SHIFT_Y, LAKE_RX = 146, LAKE_RY = 95;
let lakeDucks = [];
let lakeRipples = [];

function lakeDepth(x, y) {
  return ((x - LAKE_X) / LAKE_RX) ** 2 + ((y - LAKE_Y) / LAKE_RY) ** 2;
}
function lakeAt(x, y) { return inRasterLake(x, y, 86, 782 + SOUTH_LAKE_SHIFT_Y, 406, 974 + SOUTH_LAKE_SHIFT_Y, lakeDepth, 1.06); }
function dockAt(x, y) { return x >= 348 && x <= 454 && y >= 829 + SOUTH_LAKE_SHIFT_Y && y <= 889 + SOUTH_LAKE_SHIFT_Y; }
function spawnFishForDay() {
  if (farm.fishSpawnDay === farm.day) return;
  const count = 3 + Math.floor(hash(farm.day, 210) * 2);
  const sites = [];
  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 16; attempt++) {
      const angle = hash(farm.day, i * 17 + attempt, 211) * Math.PI * 2;
      const radius = .17 + hash(i * 17 + attempt, farm.day, 212) * .53;
      const x = Math.round(LAKE_X + Math.cos(angle) * LAKE_RX * radius);
      const y = Math.round(LAKE_Y + Math.sin(angle) * LAKE_RY * radius);
      if (x > 342 || sites.some(site => Math.hypot(site.x - x, site.y - y) < 43)) continue;
      sites.push({ id: `${farm.day}-${i}`, x, y, kind: hash(farm.day, i, 213) > .84 ? 'gold' : 'carp' });
      break;
    }
  }
  farm.fishSpots = sites;
  farm.fishSpawnDay = farm.day;
}
function fishSpotAt(x, y) {
  if(!villageSiteOpen('lake'))return null;
  return farm.fishSpots.find(site => Math.hypot(site.x - x, site.y - y) < 19) || null;
}
function fishName(site) { return site.kind === 'gold' ? '金鳞鱼' : '湖鲤'; }
function catchFish(site, fisher = '') {
  if(!villageSiteOpen('lake'))return false;
  const index = farm.fishSpots.findIndex(fish => fish.id === site.id);
  if (index < 0) return false;
  farm.fishSpots.splice(index, 1);
  farm.fishTotal++;
  if (site.kind === 'gold') farm.goldFishTotal++;
  else farm.carpTotal++;
  stockGood('lake', site.kind, 1);
  lakeRipples.push({ x: site.x, y: site.y, age: 0 });
  record(`${fisher}从西湖钓到一尾${fishName(site)}，放进西湖鱼箱。`);
  save();
  return true;
}
function chooseDuckTarget(duck) {
  if (farm.phase >= NIGHT_START) {
    duck.tx = duck.color === 'cream' ? 151 : 317;
    duck.ty = (duck.color === 'cream' ? 824 : 913) + SOUTH_LAKE_SHIFT_Y;
    return;
  }
  const angle = rand(0, Math.PI * 2), radius = rand(.12, .66);
  duck.tx = LAKE_X + Math.cos(angle) * LAKE_RX * radius;
  duck.ty = LAKE_Y + Math.sin(angle) * LAKE_RY * radius;
}
function resetLake() {
  lakeDucks = [
    { x: 186, y: 841 + SOUTH_LAKE_SHIFT_Y, tx: 215, ty: 856 + SOUTH_LAKE_SHIFT_Y, wait: 0, step: 0, dir: 1, color: 'cream' },
    { x: 297, y: 893 + SOUTH_LAKE_SHIFT_Y, tx: 278, ty: 882 + SOUTH_LAKE_SHIFT_Y, wait: .5, step: 1, dir: -1, color: 'brown' }
  ];
  lakeRipples = [];
}
function duckAt(x, y) {
  return lakeDucks.find(duck => Math.hypot(duck.x - x, duck.y - y) < 23) || null;
}
function greetDuck(duck) {
  const visiting=stopLakeDuckVisit();
  if(!visiting){duck.wait = 0;chooseDuckTarget(duck);}
  duck.step += 2;
  lakeRipples.push({ x: duck.x, y: duck.y, age: 0 });
  record('水鸭嘎嘎叫了两声，划开一串细小的波纹。');
  save();
}
function updateLake(dt) {
  if(farm.paused)return;
  updateLakeDuckVisitPlan(dt);
  for (const duck of lakeDucks) {
    duck.step += dt * 4;
    if(updateLakeDuckVisitDuck(duck,dt))continue;
    duck.wait -= dt;
    if (farm.phase >= NIGHT_START && (duck.tx !== (duck.color === 'cream' ? 151 : 317) || duck.ty !== (duck.color === 'cream' ? 824 : 913) + SOUTH_LAKE_SHIFT_Y)) chooseDuckTarget(duck);
    const dx = duck.tx - duck.x, dy = duck.ty - duck.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 5) {
      if (duck.wait <= 0) { chooseDuckTarget(duck); duck.wait = rand(1, 3); }
    } else if (duck.wait <= 0) {
      const travel = Math.min(distance, dt * (farm.phase >= NIGHT_START ? 9 : weatherVisual().rain > .72 ? 13 : 18));
      duck.x += dx / distance * travel;
      duck.y += dy / distance * travel;
      duck.dir = dx < 0 ? -1 : 1;
    }
  }
  lakeRipples = lakeRipples.filter(ripple => (ripple.age += dt) < 1.25);
}
resetLake();
spawnFishForDay();
