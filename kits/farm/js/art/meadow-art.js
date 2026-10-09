'use strict';
// A timber goat shelter, fenced pasture and two hand-drawn moving goats.
function drawMeadowScenery() {
  const barn = GOAT_LAYOUT.barn, pen = GOAT_LAYOUT.pen;
  const winter = sceneSeason.winter;
  if (villageSiteOpen('sheep')) {
    const { x, y } = PASTURE_WORKER_LAYOUT.rest;
    scenePart('pasture-bench', y + 14, () => {
      rect(x - 18, y + 2, 36, 5, '#765940');
      rect(x - 20, y - 4, 40, 7, '#c99c69');
      rect(x - 17, y - 12, 5, 12, '#8a6546');
      rect(x + 12, y - 12, 5, 12, '#8a6546');
      rect(x - 14, y + 6, 5, 8, '#765940');
      rect(x + 9, y + 6, 5, 8, '#765940');
    });
  }
  if (!farm.goatBarnOpen) {
    if(farm.development)return;
    if (!villageSiteOpen('sheep')) return;
    // The building site appears only after the sheep pasture opens.
    for (const x of [pen.left + 7, pen.right - 7]) for (const y of [pen.top + 9, pen.bottom - 12]) {
      scenePart(`goat-site-post:${x}:${y}`, y + 18, () => {
        rect(x - 3, y, 6, 18, '#987655');
      });
    }
    scenePart('goat-building-site', barn.top + 70, () => {
      rect(barn.left + 13, barn.top + 61, 108, 9, '#aa8359');
      rect(barn.left + 20, barn.top + 54, 92, 7, '#c39a66');
      rect(barn.left + 31, barn.top + 47, 66, 7, '#d6b27d');
      rect(barn.left + 98, barn.top + 34, 5, 32, '#806248');
      rect(barn.left + 90, barn.top + 24, 22, 18, '#d7bd89');
      rect(barn.left + 94, barn.top + 29, 14, 3, '#a37454');
    });
    return;
  }
  // Back and front boundaries sort separately, with the barn forming part of the back boundary.
  const rail = blendHex('#c39b68', '#d4c5a4', winter);
  scenePart('goat-rail-back', pen.top + 24, () => {
    // The back boundary meets the barn walls; no rail crosses its doorway.
    rect(pen.left, pen.top + 8, barn.left - pen.left, 5, rail);
    rect(barn.right, pen.top + 8, pen.right - barn.right, 5, rail);
  });
  for (let x = pen.left; x <= pen.right; x += 24) {
    if (x >= barn.left - 3 && x <= barn.right + 3) continue;
    scenePart(`goat-post-back:${x}`, pen.top + 24, () => {
      rect(x - 3, pen.top, 7, 24, '#8a6849');
      rect(x - 1, pen.top + 2, 3, 3, '#d9b680');
    });
  }
  for (let y = pen.top + 26; y < pen.bottom - 15; y += 25) {
    scenePart(`goat-fence-side:${y}`, y + 23, () => {
      for (const x of [pen.left, pen.right]) rect(x - 3, y, 7, 23, '#8a6849');
      rect(pen.left, y + 5, 9, 5, rail);
      rect(pen.right - 7, y + 5, 9, 5, rail);
    });
  }
  // Raised roof, plank walls, hay loft, lit window and one dark doorway.
  scenePart('goat-barn', barn.bottom + 1, () => {
    rect(barn.left + 7, barn.top + 40, 124, 55, '#8a6548');
    rect(barn.left + 11, barn.top + 43, 117, 50, '#d9b889');
    for (let y = barn.top + 53; y < barn.bottom - 3; y += 13) rect(barn.left + 12, y, 115, 3, '#c59f70');
    rect(barn.left, barn.top + 29, 138, 18, '#805740');
    rect(barn.left + 12, barn.top + 13, 115, 20, '#a97550');
    rect(barn.left + 28, barn.top, 82, 19, '#bf8961');
    rect(barn.left + 32, barn.top + 6, 74, 4, '#dfaa72');
    rect(barn.left + 52, barn.top + 39, 18, 19, windowColor('#78a5a1'));
    rect(barn.left + 60, barn.top + 39, 2, 19, '#e2c59a');
    rect(barn.left + 52, barn.top + 47, 18, 2, '#e2c59a');
    rect(barn.left + 92, barn.top + 52, 27, 43, '#674a39');
    rect(barn.left + 96, barn.top + 56, 19, 39, '#856246');
    rect(barn.left + 99, barn.top + 63, 4, 25, '#a77b54');
    rect(barn.left, barn.bottom - 6, 140, 7, '#8e6d4d');
    // Bell, trough, salt stone and small flower tufts make this a lived-in paddock.
    rect(barn.left + 19, barn.top + 51, 3, 14, '#684d3e');
    rect(barn.left + 14, barn.top + 63, 13, 7, '#e1b96e');
    rect(barn.left + 19, barn.top + 71, 4, 3, '#8b6047');
  });
  scenePart('goat-trough', pen.bottom - 32, () => {
    rect(pen.left + 11, pen.bottom - 40, 26, 8, '#856649');
    rect(pen.left + 14, pen.bottom - 43, 20, 5, '#b8c2a2');
  });
  scenePart('goat-salt', pen.bottom - 37, () => {
    rect(pen.right - 26, pen.bottom - 49, 19, 12, '#ccac70');
    rect(pen.right - 29, pen.bottom - 52, 23, 5, '#e0c386');
  });
  for (const [x, y] of [[pen.left + 21, pen.top + 34], [pen.right - 20, pen.top + 47],
    [pen.left + 46, pen.bottom - 17], [pen.right - 48, pen.bottom - 17]]) {
    scenePart(`goat-flower:${x}:${y}`, y + 9, () => {
      rect(x, y, 3, 9, '#688e58'); rect(x - 3, y + 2, 4, 3, '#83a765');
      circle(x + 2, y - 2, 3, blendHex('#f4d298', '#f1f3e7', winter));
    });
  }
}
function drawGoatFenceFront() {
  if (!farm.goatBarnOpen) return;
  const pen = GOAT_LAYOUT.pen;
  const rail = blendHex('#c39b68', '#d4c5a4', sceneSeason.winter);
  rect(pen.left, pen.bottom - 10, pen.right - pen.left, 5, rail);
  for (let x = pen.left; x <= pen.right; x += 24) rect(x - 3, pen.bottom - 21, 7, 24, '#8a6849');
}
function drawPastureRestingWorker() {
  const worker = workers.find(w => w.name === '阿牧');
  const { x, y } = PASTURE_WORKER_LAYOUT.rest;
  if (!worker || farm.phase >= NIGHT_START || worker.task || distance(worker, { x, y }) > 16) return;
  const sway = Math.sin(motionNow * 1.8) * 1.2 + pausePulse(x, 1.7);
  rect(x - 8 + sway, y - 12, 16, 16, worker.shirt);
  rect(x - 4 + sway, y - 10, 8, 3, '#d7b992');
  rect(x - 7 + sway, y - 27, 14, 16, '#e8bc94');
  rect(x - 7 + sway, y - 25, 2, 10, '#745841');
  rect(x + 5 + sway, y - 25, 2, 10, '#745841');
  rect(x - 11 + sway, y - 30, 22, 6, worker.hat);
  rect(x - 12 + sway, y - 25, 24, 3, '#b28d5f');
  rect(x - 4 + sway, y - 19, 2, 2, '#4a473c');
  rect(x + 2 + sway, y - 19, 2, 2, '#4a473c');
  rect(x - 1 + sway, y - 15, 3, 2, '#b9806a');
  rect(x - 13 + sway, y - 8, 5, 11, '#dfb28b');
  rect(x + 8 + sway, y - (now < (worker.waveUntil || 0) ? 18 : 8), 5, 11, '#dfb28b');
  rect(x - 8 + sway, y + 2, 16, 4, '#4c5c5c');
  rect(x - 7 + sway, y + 5, 6, 7, '#4c5c5c');
  rect(x + 1 + sway, y + 5, 6, 7, '#4c5c5c');
  rect(x - 9 + sway, y + 10, 8, 3, '#604a39');
  rect(x + 1 + sway, y + 10, 8, 3, '#604a39');
}
function drawMeadowLife() {
  if (!farm.goatBarnOpen) return;
  for (const goat of meadowGoats) drawGoat(goat);
}
function drawGoat(goat) {
  const hop = goat.excited > 0 ? Math.abs(Math.sin(goat.step)) * 5 : 0;
  const x = goat.x, y = goat.y - hop, d = goat.dir;
  const shade = goat.name === '糯米' ? '#d5c5a9' : '#af835d';
  rect(x - 17, goat.y + 10, 36, 4, '#526c5066');
  rect(x - 15, y - 12, 27, 21, shade);
  rect(x - 13, y - 14, 26, 19, goat.coat);
  rect(x - 16, y - 8, 5, 8, goat.coat);
  rect(x - 11, y + 5, 5, 11, '#715846');
  rect(x + 5, y + 5, 5, 11, '#715846');
  rect(x + d * 10 - 7, y - 24, 16, 18, shade);
  rect(x + d * 11 - 6, y - 23, 15, 17, goat.coat);
  rect(x + d * 18 - 5, y - 16, 10, 7, '#e4c7aa');
  rect(x + d * 12, y - 20, 3, 3, '#413d36');
  rect(x + d * 18, y - 13, 2, 2, '#6f5041');
  rect(x + d * 5 - 3, y - 30 + pausePulse(x,2.5)*2, 4, 10, '#bb9a73');
  rect(x + d * 13 - 3, y - 29 + pausePulse(x + 2,2.5)*2, 4, 9, '#bb9a73');
  rect(x + d * 14 - 3, y - 8, 5, 5, shade);
  if (goat.excited > 0) {
    rect(x - 2, y - 40, 4, 4, '#e2a979');
    rect(x + 5, y - 35, 3, 3, '#f2d8a4');
  }
}
