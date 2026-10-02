'use strict';
// Northeastern forest details and three independently animated animal sprites.
function drawRidgeScenery() {
  const winter = sceneSeason.winter;
  // A soft clover clearing lies north of the eastern bridge.
  for (const [x, y, seed] of [[1405, 210, 1], [1469, 247, 2], [1517, 224, 3], [1588, 246, 4], [1441, 537, 5], [1531, 519, 6]]) {
    scenePart(`ridge-clover:${seed}`, y + 9, () => {
      ctx.save(); ctx.translate(RIDGE_SHIFT, 0);
      rect(x - 10, y + 2, 28, 3, '#749663');
      for (let i = 0; i < 4; i++) {
        const dx = hash(seed, i, 241) * 23 - 8, dy = hash(i, seed, 242) * 8 - 6;
        rect(x + dx, y + dy, 3, 7, '#6c9656');
        rect(x + dx - 4, y + dy - 3, 10, 4, blendHex('#a7c27b', '#d9e2d1', winter));
        if (i === 1 && winter < .55) rect(x + dx, y + dy - 6, 3, 3, '#f5d2a0');
      }
      ctx.restore();
    });
  }
  // Thickets give the hare cover without covering the eastern road.
  for (const [x, y] of [[1406, 471], [1607, 488], [1455, 549]]) {
    scenePart(`ridge-thicket:${x}:${y}`, y + 12, () => {
      ctx.save(); ctx.translate(RIDGE_SHIFT, 0);
      rect(x - 23, y + 7, 50, 5, '#5c805b');
      for (const [dx, dy, radius] of [[-12, -2, 12], [2, -11, 15], [17, -1, 11]]) {
        circle(x + dx, y + dy, radius, blendHex('#5f915e', '#a8c3b4', winter));
        rect(x + dx - 6, y + dy - 7, 9, 4, blendHex('#81ad70', '#d1ded0', winter));
      }
      ctx.restore();
    });
  }
  // A visible branch anchors the owl's daytime perch in the northern pines.
  const branchX = RIDGE_OWL_HOME.x - RIDGE_SHIFT - 15, branchY = RIDGE_OWL_HOME.y + 4;
  scenePart('owl-home-branch', RIDGE_OWL_HOME.baseY, () => {
    ctx.save(); ctx.translate(RIDGE_SHIFT, 0);
    rect(branchX, branchY, 43, 5, '#694f3b');
    rect(branchX + 5, branchY - 3, 37, 4, '#927050');
    rect(branchX + 31, branchY - 15, 5, 15, '#76583f');
    rect(branchX - 1, branchY + 1, 5, 11, '#76583f');
    ctx.restore();
  });
  for (const [x, y] of [[1431, 367], [1510, 352], [1608, 334]]) {
    scenePart(`ridge-stone:${x}:${y}`, y + 6, () => {
      ctx.save(); ctx.translate(RIDGE_SHIFT, 0);
      rect(x - 6, y + 3, 17, 3, '#6c8b70');
      rect(x - 4, y - 2, 13, 6, '#b4b49c');
      rect(x, y - 5, 7, 4, '#d1c9a9');
      ctx.restore();
    });
  }
  RIDGE_OWL_PERCHES.slice(1).forEach(drawRidgePerchTree);
}
function drawRidgePerchTree(perch) {
  if (sceneQueue) return scenePart(`perch-tree:${perch.kind}`, perch.baseY + 8, () => drawRidgePerchTree(perch));
  const { x, y, baseY, kind } = perch, winter = sceneSeason.winter;
  rect(x - 19, baseY + 3, 39, 5, '#38584455');
  if (kind === 'birch') {
    rect(x - 6, y - 54, 13, baseY - y + 58, '#e6dcc0');
    for (let i = 0; i < 6; i++) rect(x - 6 + i % 2 * 8, y - 35 + i * 13, 5, 3, '#866d56');
    for (const [dx, dy, radius] of [[-23, -66, 23], [1, -85, 29], [25, -63, 22]]) {
      circle(x + dx, y + dy, radius, blendHex('#94b267', '#cbd7c7', winter));
      rect(x + dx - 9, y + dy - 9, 17, 4, blendHex('#b8ca82', '#e7ede2', winter));
    }
  } else if (kind === 'maple') {
    rect(x - 8, y - 42, 17, baseY - y + 45, '#765641');
    rect(x - 25, y - 21, 31, 7, '#765641');
    for (const [dx, dy, radius] of [[-27, -58, 27], [0, -84, 33], [30, -57, 25]]) {
      circle(x + dx, y + dy, radius, blendHex('#c97f51', '#c9d3c9', winter));
      circle(x + dx - 5, y + dy - 8, radius * .45, blendHex('#e8ad6b', '#e5eae3', winter));
    }
  } else if (kind === 'spruce') {
    rect(x - 6, y - 36, 13, baseY - y + 40, '#6d5144');
    for (const [top, width, height] of [[y - 111, 36, 36], [y - 82, 52, 40], [y - 50, 68, 44]]) {
      rect(x - width / 2, top + 7, width, height - 7, blendHex('#2c5268', '#8da9b2', winter));
      rect(x - width / 2 + 6, top, width - 12, 16, blendHex('#467b94', '#c5d6d8', winter));
      rect(x - width / 2 + 9, top + 5, width - 18, 5, blendHex('#8bb6c1', '#edf2ed', winter));
    }
  } else if (kind === 'elm') {
    rect(x - 7, y - 34, 15, baseY - y + 38, '#765c43');
    rect(x - 24, y - 16, 25, 7, '#765c43');
    rect(x + 2, y - 28, 22, 7, '#765c43');
    const outline = blendHex(blendHex('#4b7151', '#786b49', sceneSeason.autumn), '#8aa69b', winter);
    const leaves = blendHex(blendHex('#b7c782', '#c9ac70', sceneSeason.autumn), '#c9d9cd', winter);
    const highlights = blendHex(blendHex('#d8dfa2', '#ebcc87', sceneSeason.autumn), '#eef2e9', winter);
    for (const [dx, dy, radius] of [[-22, -43, 22], [3, -73, 27], [27, -47, 20]]) {
      circle(x + dx, y + dy, radius + 3, outline);
      circle(x + dx, y + dy - 2, radius - 2, leaves);
      rect(x + dx - 9, y + dy - 10, 17, 5, highlights);
    }
  }
  // The owl's feet meet a branch at the same coordinate used by its route.
  rect(x - 19, y + 6, 40, 6, '#71543d');
  rect(x - 12, y + 6, 32, 2, '#ac8058');
}
function drawRidgeDeer() {
  if (sceneQueue) return scenePart('ridge-deer', ridgeDeer.y + 14, () => drawRidgeDeer());
  const d = ridgeDeer, x = d.x, y = d.y;
  const headDrop = (d.grazing ? 9 : 0) + pausePulse(d.x,1.5)*2;
  const hoof = d.startled > 0 ? Math.abs(Math.sin(d.step)) * 5 : Math.abs(Math.sin(d.step)) * 2;
  rect(x - 26, y + 10, 58, 4, '#52724f66');
  rect(x - 18, y - 5 - hoof, 6, 19 + hoof, '#775540');
  rect(x - 2, y - 5 + hoof, 6, 19 - hoof, '#775540');
  rect(x + 11, y - 6 - hoof, 6, 20 + hoof, '#775540');
  rect(x - 25, y - 27, 45, 25, '#b7794f');
  rect(x - 19, y - 31, 31, 16, '#c58b5c');
  rect(x - 23, y - 14, 38, 8, '#dfb68b');
  rect(x - d.dir * 29, y - 26, 11, 8, '#e4c59e');
  for (const [dx, dy] of [[-14, -23], [-3, -25], [8, -21], [-10, -17], [3, -16]]) rect(x + dx, y + dy, 4, 3, '#f2d8ac');
  rect(x + d.dir * 13 - 5, y - 38 + headDrop, 13, 24, '#ad714d');
  rect(x + d.dir * 23 - 4, y - 45 + headDrop, 17, 17, '#c28b5e');
  rect(x + d.dir * 34 - 4, y - 34 + headDrop, 10, 7, '#ddbb92');
  rect(x + d.dir * 23 - 11, y - 49 + headDrop, 7, 11, '#a76d4b');
  rect(x + d.dir * 32 - 2, y - 50 + headDrop, 7, 11, '#a76d4b');
  rect(x + d.dir * 29, y - 42 + headDrop, 3, 3, '#382f2c');
  rect(x + d.dir * 39, y - 32 + headDrop, 3, 3, '#594039');
}
function drawRidgeHare() {
  if (sceneQueue) return scenePart('ridge-hare', ridgeHare.y + 14, () => drawRidgeHare());
  const h = ridgeHare, moving = h.wait <= 0 && Math.hypot(h.tx - h.x, h.ty - h.y) > 4;
  const jump = moving && !h.hidden ? Math.abs(Math.sin(h.step)) * (h.startled > 0 ? 10 : 6) : 0;
  const x = h.x, y = h.y - jump, ear = (h.hidden ? 9 : 19) + pausePulse(h.x,3)*2;
  rect(x - 20, h.y + 10, 42, 4, '#4e705466');
  rect(x - 13, y - 4, 29, 15, '#a78564');
  rect(x - 11, y - 7, 21, 13, '#b59670');
  rect(x - h.dir * 13, y - 4, 8, 8, '#e4d8b9');
  rect(x + h.dir * 11 - 5, y - 15, 15, 18, '#b4936d');
  rect(x + h.dir * 9 - 6, y - 14 - ear, 6, ear + 4, '#96765d');
  rect(x + h.dir * 16 - 5, y - 12 - ear, 6, ear + 3, '#b4936d');
  if (!h.hidden) {
    rect(x + h.dir * 10 - 4, y - 10 - ear, 2, ear - 2, '#d3aa9d');
    rect(x + h.dir * 17 - 3, y - 8 - ear, 2, ear - 4, '#d3aa9d');
  }
  rect(x + h.dir * 15, y - 10, 3, 3, '#352f2e');
  rect(x - 7, y + 8, 9, 5, '#80624e');
  rect(x + 8, y + 7, 9, 5, '#80624e');
}
function drawRidgeOwl() {
  const o = ridgeOwl, x = o.x, y = o.y + (o.flying ? Math.sin(o.step * .5) * 2 : 0);
  if (o.flying) {
    const lift = Math.abs(Math.sin(farm.paused ? now * 4 : o.step)) * 10;
    rect(x - 33, y - 23 - lift, 24, 10, '#8f725b');
    rect(x + 9, y - 23 - lift, 25, 10, '#8f725b');
    rect(x - 29, y - 19 - lift, 17, 5, '#c1a27e');
    rect(x + 14, y - 19 - lift, 17, 5, '#c1a27e');
  } else {
    rect(x - 13, y - 21, 7, 18, '#8c7158');
    rect(x + 7, y - 21, 7, 18, '#8c7158');
  }
  rect(x - 13, y - 25, 27, 29, '#785f4c');
  rect(x - 10, y - 28, 21, 26, '#a88768');
  rect(x - 9, y - 30, 19, 8, '#745d49');
  rect(x - 11, y - 34, 8, 9, '#745d49'); rect(x + 4, y - 34, 8, 9, '#745d49');
  rect(x - 8, y - 22, 8, 9, '#ecd4a4'); rect(x + 2, y - 22, 8, 9, '#ecd4a4');
  rect(x - 5, y - 19, 3, 4, '#39362f'); rect(x + 5, y - 19, 3, 4, '#39362f');
  if (pausePulse(x,1.8) > .96) { rect(x - 5, y - 17, 3, 2, '#745d49'); rect(x + 5, y - 17, 3, 2, '#745d49'); }
  rect(x - 1, y - 12, 4, 6, '#dbab65');
  rect(x - 8, y - 2, 5, 9, '#b4916c'); rect(x + 4, y - 2, 5, 9, '#b4916c');
  rect(x - 8, y + 5, 7, 2, '#775643'); rect(x + 3, y + 5, 7, 2, '#775643');
}
function drawRidgeLife() {
  drawRidgeDeer(); drawRidgeHare();
  scenePart('ridge-air', 0, () => {
    if (sceneSeason.winter < .65 && weatherVisual().rain < .7 && farm.phase < NIGHT_START) {
      for (const [baseX, baseY, seed] of [[1414, 176, 1], [1520, 257, 2], [1473, 416, 3]]) {
        const x = baseX + RIDGE_SHIFT + Math.sin(motionNow * 1.1 + seed) * 11, y = baseY + Math.cos(motionNow * 1.6 + seed) * 6;
        rect(x - 6, y, 5, 2, '#f5e5bb'); rect(x + 3, y, 5, 2, '#f5e5bb');
        rect(x, y - 2, 3, 7, '#9aa46c');
        if (farm.paused) rect(x - 7, y + pausePulse(seed,4)*2, 6, 1, '#f8e9ca');
      }
    }
  }, 0, 1);
}
