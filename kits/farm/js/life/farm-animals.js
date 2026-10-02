'use strict';
// Main farm livestock state and daily movement, independent of painting.
let cows = [
  { x: 753, y: 392, tx: 760, ty: 393, dir: 1, step: 0, wait: 0, milk: !farm.milked[0], name: '奶糖' },
  { x: 844, y: 466, tx: 835, ty: 455, dir: -1, step: 0, wait: 0, milk: !farm.milked[1], name: '团子' }
];
let chickens = [
  { x: 193, y: 71, tx: 193, ty: 71, step: 0, wait: 0, color: '#f1e8cb' },
  { x: 219, y: 57, tx: 219, ty: 57, step: 0, wait: 0, color: '#d8ab75' },
  { x: 235, y: 82, tx: 235, ty: 82, step: 0, wait: 0, color: '#faf1d9' }
];
let sheep = [
  { x: 766, y: 1447, tx: 770, ty: 1450, step: 0, wait: 0 },
  { x: 867, y: 1490, tx: 865, ty: 1488, step: 0, wait: 0 }
];

function updateFarmAnimals(dt) {
  const sleeping = farm.phase >= NIGHT_START;
  cows.forEach(c => {
    c.wait -= dt;
    if (sleeping) { c.tx = c.name === '奶糖' ? 742 : 800; c.ty = c.name === '奶糖' ? 331 : 336; c.wait = 2; }
    else if (c.wait <= 0 || distance(c, { x: c.tx, y: c.ty }) < 5) {
      c.tx = rand(720, 890); c.ty = rand(318, 506); c.wait = rand(3.5, 7);
    }
    const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy);
    if (d > 4) { c.x += dx / d * dt * 20; c.y += dy / d * dt * 20; c.dir = dx < 0 ? -1 : 1; c.step += dt * 5; }
  });
  chickens.forEach((c, i) => {
    c.wait -= dt;
    if (sleeping) { c.tx = 173 + i * 8; c.ty = 78; c.wait = 2; }
    else if (c.wait <= 0 || distance(c, { x: c.tx, y: c.ty }) < 4) {
      c.tx = rand(184, 239); c.ty = rand(51, 89); c.wait = rand(1.1, 3.5);
    }
    const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy);
    if (d > 2) { c.x += dx / d * dt * 15; c.y += dy / d * dt * 15; c.step += dt * 11; }
  });
  if (farm.upgrades >= 4) sheep.forEach((s, i) => {
    s.wait -= dt;
    if (sleeping) { s.tx = SHEEP_LAYOUT.pen.left + 70 + i * 34; s.ty = SHEEP_LAYOUT.pen.top + 56; s.wait = 2; }
    else if (s.wait <= 0 || distance(s, { x: s.tx, y: s.ty }) < 5) {
      s.tx = rand(SHEEP_LAYOUT.pen.left + 31, SHEEP_LAYOUT.pen.right - 43);
      s.ty = rand(SHEEP_LAYOUT.pen.top + 47, SHEEP_LAYOUT.pen.bottom - 63); s.wait = rand(3, 7);
    }
    const dx = s.tx - s.x, dy = s.ty - s.y, d = Math.hypot(dx, dy);
    if (d > 4) { s.x += dx / d * dt * 17; s.y += dy / d * dt * 17; s.step += dt * 6; }
  });
}

function pondDuckPosition(){return {x:150+Math.sin(motionNow*.45)*26,y:157+Math.sin(motionNow*.8)*4};}

function pondDuckAt(x,y){const duck=pondDuckPosition();return x>=duck.x-9&&x<=duck.x+15&&y>=duck.y-3&&y<=duck.y+14;}

function cowAt(x,y){return cows.find(c=>Math.abs(c.x-x)<37&&Math.abs(c.y-y)<35)||null;}

function sheepAt(x,y){return farm.upgrades>=4?sheep.find(s=>Math.abs(s.x-x)<30&&Math.abs(s.y-y)<28)||null:null;}
