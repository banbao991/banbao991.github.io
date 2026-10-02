'use strict';
// The goats use the open paddock in daylight and return to their shelter at night or in heavy rain.
let meadowGoats = [];

function resetMeadowLife() {
  meadowGoats = [
    { name: '糯米', x: 1040, y: 1453, tx: 1114, ty: 1470, wait: 0, step: 0, dir: 1, excited: 0, coat: '#f2e6cd' },
    { name: '栗子', x: 1137, y: 1471, tx: 1060, ty: 1447, wait: .8, step: 0, dir: -1, excited: 0, coat: '#cfaa79' }
  ];
}
function goatAt(x, y) {
  if (!farm.goatBarnOpen) return null;
  return meadowGoats.find(goat => Math.abs(goat.x - x) < 24 && y >= goat.y - 31 && y <= goat.y + 14) || null;
}
function goatPastureTarget(goat) {
  goat.tx = rand(GOAT_LAYOUT.pen.left + 35, GOAT_LAYOUT.pen.right - 35);
  goat.ty = rand(GOAT_LAYOUT.pen.top + 40, GOAT_LAYOUT.pen.bottom - 21);
}
function greetGoat(goat) {
  goat.excited = 2;
  goat.wait = 0;
  goatPastureTarget(goat);
  record(`${goat.name}咩咩叫了一声，轻快地跳向另一簇草。`);
}
function updateMeadowLife(dt) {
  if (!farm.goatBarnOpen) return;
  const shelter = farm.phase >= NIGHT_START || weatherVisual().rain > .72;
  for (let i = 0; i < meadowGoats.length; i++) {
    const goat = meadowGoats[i];
    goat.step += dt * (goat.excited > 0 ? 12 : 5);
    goat.excited = Math.max(0, goat.excited - dt);
    if (shelter) {
      goat.tx = GOAT_LAYOUT.homes[i].x;
      goat.ty = GOAT_LAYOUT.homes[i].y;
    } else if (goat.wait > 0) goat.wait -= dt;
    const dx = goat.tx - goat.x, dy = goat.ty - goat.y, distance = Math.hypot(dx, dy);
    if (distance > 2) {
      const speed = shelter ? 25 : goat.excited > 0 ? 43 : 18;
      const step = Math.min(distance, speed * dt);
      goat.x += dx / distance * step;
      goat.y += dy / distance * step;
      if (Math.abs(dx) > 1) goat.dir = dx < 0 ? -1 : 1;
    } else if (!shelter && goat.wait <= 0) {
      goat.wait = rand(.5, 2.4);
      goatPastureTarget(goat);
    }
  }
}
resetMeadowLife();
