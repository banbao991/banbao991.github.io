'use strict';
// Herb terraces near the windmill, with a tea stop in the expanded southeast valley.
function drawValleyHerb(herb) {
  const growth = valleyHerbProgress(herb);
  const winter = sceneSeason.winter;
  const x = herb.x, y = herb.y;
  if (growth < .12) {
    rect(x - 2, y - 2, 5, 4, '#6c9254');
    return;
  }
  const height = Math.round(5 + growth * 14);
  const stem = blendHex('#608d56', '#9aaea3', winter);
  const leaf = blendHex(herb.kind === 'mint' ? '#70a675' : '#80a461', '#b9c8b8', winter);
  rect(x - 2, y - height, 4, height + 1, stem);
  for (let i = 0; i < (growth > .55 ? 3 : 2); i++) {
    const yy = y - 6 - i * 5;
    rect(x - 10 + i % 2, yy, 9, 4, leaf);
    rect(x + 2, yy - 2, 9, 4, leaf);
  }
  if (growth > .75) {
    const bloom = herb.kind === 'lavender' ? '#a88aaf' : herb.kind === 'thyme' ? '#e7c0a0' : '#e6e6c6';
    for (const [dx, dy] of [[-3, -height - 3], [3, -height + 1], [-1, -height + 4]]) rect(x + dx, y + dy, 5, 4, blendHex(bloom, '#eef0e4', winter));
  }
}
function drawValleyGardenScenery() {
  const winter = sceneSeason.winter;
  // Six separate stone-edged beds leave the meadow visible between them.
  for (let i = 0; i < VALLEY_GARDEN_LAYOUT.spots.length; i++) {
    const spot = VALLEY_GARDEN_LAYOUT.spots[i];
    const x = spot.x - 20, y = spot.y - 14;
    rect(x - 2, y + 2, 44, 28, '#b6ab85');
    rect(x, y, 40, 26, '#9a7655');
    rect(x + 3, y + 3, 34, 20, '#7e624a');
    for (let j = 0; j < 3; j++) rect(x + 3 + j * 12, y + 24, 10, 3, '#d5c9a5');
  }
  rect(1005, 1112, 164, 4, '#a9b591');
  rect(1012, 1113, 151, 2, '#79aaa0');
  for (const herb of farm.valleyHerbs) drawValleyHerb(herb);
  drawValleyRockingChair();
  // Tool rack and rain barrel are tucked beside the last bed.
  scenePart('herb-tools', 1144, () => {
    rect(1171, 1084, 4, 49, '#846448'); rect(1169, 1084, 12, 4, '#b8905f');
    rect(1175, 1107, 4, 19, '#d7bc82'); rect(1167, 1110, 9, 4, '#d7bc82');
    rect(1166, 1119, 16, 25, '#8a6149'); rect(1164, 1117, 20, 5, '#b98e61');
    rect(1168, 1121, 12, 4, '#77a9a2');
  });
  // The scenic pair moved south as one composition.
  const scenicShiftY = VALLEY_GARDEN_LAYOUT.teaHouse.top - 1255;
  // Low flower banks guide the eye toward the tea house and the lookout.
  for (const [x, y, seed] of [[790, 1287, 1], [1014, 1280, 2], [1038, 1311, 3], [1065, 1272, 4], [1087, 1319, 5]]) {
    scenePart(`tea-flower:${seed}`, y + scenicShiftY + 20, () => {
      ctx.save(); ctx.translate(0, scenicShiftY);
      for (let i = 0; i < 4; i++) {
        const fx = x + hash(seed, i, 310) * 21, fy = y + hash(i, seed, 311) * 12;
        rect(fx, fy + 1, 3, 8, '#688e5d');
        circle(fx + 2, fy, 3, blendHex(i % 2 ? '#e9b47d' : '#f1d6ad', '#ecf0e5', winter));
      }
      ctx.restore();
    });
  }
  // Timber tea pavilion with an open front and a gently steaming kettle.
  scenePart('tea-house', 1326 + scenicShiftY, () => {
    ctx.save(); ctx.translate(0, scenicShiftY);
    rect(810, 1302, 108, 24, '#9d805e');
    for (let x = 811; x < 918; x += 19) rect(x, 1304, 16, 20, '#c3a277');
    rect(817, 1274, 7, 33, '#795d45'); rect(907, 1274, 7, 33, '#795d45');
    rect(806, 1271, 116, 10, '#775442');
    rect(817, 1263, 95, 12, '#ad7653');
    rect(834, 1255, 61, 10, '#c18a61');
    rect(839, 1260, 52, 3, '#e0aa78');
    rect(842, 1300, 51, 5, '#78583f'); rect(846, 1305, 5, 14, '#78583f'); rect(885, 1305, 5, 14, '#78583f');
    rect(860, 1293, 16, 8, '#aa7455'); rect(864, 1289, 9, 5, '#d5b080');
    rect(876, 1295, 5, 4, '#dfc69b');
    rect(885, 1287, 5, 11, '#97774e'); circle(887, 1287, 4, '#f0d08b');
    if (farm.phase < NIGHT_START) for (let i = 0; i < 3; i++) {
      circle(867 + Math.sin(now * 1.4 + i) * 4 + i * 5, 1283 - i * 9 - (now * 3 % 7), 3 + i, '#f4ead7aa');
    }
    ctx.restore();
  });
  // A boardwalk and seat face the river, with room before the curved bank.
  scenePart('valley-lookout', 1316 + scenicShiftY, () => {
    ctx.save(); ctx.translate(0, scenicShiftY);
    rect(1100, 1288, 128, 28, '#86684e');
    for (let x = 1104; x < 1225; x += 17) rect(x, 1291, 14, 21, '#c29b6b');
    for (const x of [1105, 1155, 1205, 1223]) { rect(x, 1258, 5, 31, '#785a43'); rect(x - 2, 1255, 9, 5, '#a68058'); }
    rect(1105, 1268, 122, 5, '#bd9564');
    rect(1147, 1281, 48, 5, '#796049'); rect(1150, 1276, 44, 5, '#ab8058');
    rect(1152, 1286, 5, 16, '#796049'); rect(1187, 1286, 5, 16, '#796049');
    rect(1114, 1276, 5, 14, '#876547'); circle(1116, 1275, 4, '#f1ce86');
    ctx.restore();
  });
  // A little tea table and chair sit beside the pavilion's open eastern side.
  scenePart('tea-table', 1808, () => {
    rect(978, 1784, 38, 8, '#835d43');
    rect(981, 1792, 5, 16, '#73543e'); rect(1007, 1792, 5, 16, '#73543e');
    rect(985, 1775, 14, 10, '#bb8b60'); rect(988, 1771, 8, 5, '#e1bb84');
    rect(1002, 1780, 8, 4, '#f0d6a6');
  });
  scenePart('tea-chair', 1821, () => {
    rect(947, 1800, 22, 5, '#9c7651');
    rect(950, 1805, 4, 16, '#76583f'); rect(964, 1805, 4, 16, '#76583f');
  });
  // Butterflies by day, fireflies around the lower meadow after dusk.
  scenePart('valley-garden-air', 0, () => {
    if (winter < .7 && weatherVisual().rain < .7 && farm.phase < NIGHT_START) {
      for (const [bx, by, seed] of [[1042, 1067, 1], [1138, 1066, 2], [1063, 1763, 3]]) {
        const x = bx + Math.sin(motionNow * 1.6 + seed) * 9, y = by + Math.cos(motionNow * 2 + seed) * 5;
        const wing = pausePulse(seed,4)*2;
        rect(x - 7, y + wing, 5, 3, '#ebd5a7'); rect(x + 3, y - wing, 5, 3, '#ebd5a7'); rect(x, y + 1, 2, 5, '#746449');
      }
    }
  }, 0, 1);
}
function drawValleyGardenNight(night) {
  for (const [x, y] of [[887, 1799], [1116, 1787]]) {
    circle(x, y, 23, `rgba(255,203,118,${(night * .17).toFixed(3)})`);
    circle(x, y, 5, `rgba(255,225,153,${(night * .83).toFixed(3)})`);
  }
  for (let i = 0; i < 9; i++) {
    const x = 972 + hash(i, 9, 315) * 221 + Math.sin(motionNow * .8 + i) * 5;
    const y = 1756 + hash(i, 8, 316) * 79 + Math.cos(motionNow * 1.1 + i) * 4;
    circle(x, y, 2, `rgba(250,225,144,${(night * (.37 + Math.sin(now * 2 + i) * .2)).toFixed(2)})`);
  }
}

function drawValleyRockingChair() {
  if (sceneQueue) return scenePart('valley-rocking-chair', VALLEY_WORKER_LAYOUT.chair.y + 15, () => drawValleyRockingChair());
  const { x, y } = VALLEY_WORKER_LAYOUT.chair;
  rect(x - 29, y + 11, 60, 4, '#6a513f');
  rect(x - 25, y + 7, 52, 4, '#a0734e');
  rect(x - 20, y - 22, 7, 33, '#8e6144');
  rect(x - 18, y - 25, 29, 6, '#bd8d5d');
  rect(x - 13, y - 16, 29, 6, '#c79a68');
  rect(x - 13, y - 8, 31, 6, '#9c704f');
  rect(x - 12, y - 2, 35, 6, '#bb8c5f');
  rect(x + 16, y - 4, 5, 17, '#795b43');
}

function drawValleyWorkerHome() {
  if (sceneQueue) return scenePart('valley-worker-home', VALLEY_WORKER_LAYOUT.home.top + 114, () => drawValleyWorkerHome());
  const { left: x, top: y } = VALLEY_WORKER_LAYOUT.home;
  rect(x + 5, y + 105, 77, 5, '#745e49');
  rect(x + 6, y + 36, 75, 70, '#b98560');
  rect(x + 10, y + 40, 67, 65, '#d5ae7b');
  rect(x - 2, y + 32, 91, 13, '#815b48');
  rect(x + 4, y + 24, 79, 12, '#a86d50');
  rect(x + 13, y + 14, 61, 14, '#bc8059');
  rect(x + 23, y + 7, 43, 11, '#d39a67');
  rect(x + 12, y + 55, 21, 20, '#775d47');
  rect(x + 15, y + 58, 15, 14, windowColor('#90b6a8'));
  rect(x + 59, y + 55, 18, 20, '#775d47');
  rect(x + 62, y + 58, 12, 14, windowColor('#90b6a8'));
  rect(x + 33, y + 66, 23, 40, '#6f503d');
  rect(x + 36, y + 70, 17, 36, '#9b7451');
  circle(x + 49, y + 91, 2, '#f3d99e');
  rect(x + 27, y + 109, 39, 5, '#b8976d');
}

function drawValleyRestingWorker() {
  const worker = workers.find(w => w.name === '阿栀');
  const { x, y } = VALLEY_WORKER_LAYOUT.chair;
  if (!worker || farm.phase >= NIGHT_START || worker.task || distance(worker, { x, y }) > 16) return;
  const sway = Math.sin(motionNow * 1.5) * 1.5;
  rect(x - 13 + sway, y - 8, 24, 14, worker.shirt);
  rect(x + 3 + sway, y + 3, 18, 5, '#594f4a');
  rect(x - 17 + sway, y + 3, 18, 5, '#594f4a');
  rect(x - 19 + sway, y - 21, 14, 13, '#e9bd94');
  rect(x - 20 + sway, y - 25, 17, 6, worker.hat);
  if (pausePulse(x, 2.8) > .05) rect(x - 15 + sway, y - 13, 5, 2, '#806a55');
  if (farm.phase > .28 && pausePulse(x, 3.2) > .05) rect(x + 20, y - 36, 3, 3, '#eee2c5');
}
