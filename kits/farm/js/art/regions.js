'use strict';
// Region scenery composition, southern valley decorations and shared night lights.
function tinyPine(x, y) {
  if (sceneQueue) return scenePart(`pine:${x}:${y}`, y + 27, () => tinyPine(x,y));
  rect(x - 3, y + 8, 8, 19, '#765b43');
  rect(x - 16, y - 7, 34, 25, '#416f57');
  rect(x - 13, y - 23, 28, 24, '#4b815f');
  rect(x - 9, y - 37, 19, 23, '#60976a');
  rect(x - 4, y - 32, 4, 17, '#9cba79');
}

function drawSouthernValley() {
  // A second lakeside grove and community garden fill the newly visible valley.
  for (const [x, y, seed] of valleyTrees) tree(x, y, seed);
  for (let i = 0; i < 8; i++) {
    const x = 408 + (i % 4) * 34, y = 1244 + Math.floor(i / 4) * 42;
    scenePart(`valley-flower:${i}`, y + 10, () => {
      rect(x - 9, y + 4, 23, 6, '#775f44'); rect(x - 5, y - 16, 3, 21, '#698d58');
      circle(x - 3, y - 18, 7, i % 2 ? '#e4bd70' : '#dca884');
    });
  }
  drawEastGarden();
  // The mill's blades turn while the farm runs; its warm windows join the night lights.
  scenePart('valley-windmill', 1185, () => {
    rect(796, 1081, 70, 104, '#dcc496');
    rect(786, 1060, 90, 28, '#b27654'); rect(801, 1046, 58, 20, '#c58b60');
    rect(805, 1117, 17, 22, windowColor('#709b9a')); rect(837, 1144, 20, 41, '#765a42');
    ctx.save(); ctx.translate(832, 1087); ctx.rotate(now * .38);
    for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); rect(-5, -58, 10, 52, '#dfd2a9'); rect(-9, -53, 18, 7, '#f2dfb9'); }
    circle(0, 0, 8, '#896447'); ctx.restore();
  });
  drawValleyWorkerHome();
  scenePart('valley-sign', 1162, () => {
    rect(153, 1124, 6, 38, '#806047'); rect(155, 1126, 37, 5, '#b88958');
  });
  scenePart('valley-posts', 1328, () => {
    for (let i = 0; i < 4; i++) { rect(88 + i * 37, 1303, 6, 25, '#806047'); rect(80 + i * 37, 1300, 23, 6, '#d0ae78'); }
  });
}

function drawRegionScenery() {
  regionTrees.forEach(([x, y], i) => i % 3 ? tinyPine(x, y) : tree(x, y, i + 60));
  // Forester's cabin is present from the start and serves as a visual destination.
  scenePart('forest-cabin', 257, () => {
    rect(1034, 164, 141, 93, '#d4b88a'); rect(1021, 151, 167, 28, '#795840');
    rect(1034, 132, 139, 26, '#a46f50'); rect(1068, 194, 30, 28, windowColor('#7c9c99'));
    rect(1121, 195, 30, 62, '#66503e'); rect(1125, 198, 21, 53, '#997451');
    rect(1160, 109, 17, 38, '#92775d');
  });
  for (const [x, y] of [[112, 686], [184, 700], [258, 699], [285, 727], [666, 680], [664, 734]]) {
    scenePart(`road-flower:${x}:${y}`, y + 28, () => {
      rect(x, y, 4, 28, '#66864d'); circle(x + 2, y - 4, 8, '#e8c580');
    });
  }
  if (farm.upgrades >= 4) drawSheepPen();
  else scenePart('sheep-site', 1412, () => { rect(758, 1389, 160, 23, '#a98561'); rect(773, 1369, 130, 24, '#bd9c6c'); });
  drawVillage();
  drawCarrierCottage();
  drawSouthernValley();
  drawValleyGardenScenery();
  drawSouthernLakeScenery();
  drawValleyScenery();
  drawMineScenery();
  drawNurseryScenery();
  drawRidgeScenery();
  drawMeadowScenery();
}

function drawRegionAnimals() {
  // Forest wildlife and the village walker continue their small routines independently.
  drawSouthernLakeLife();
  drawRidgeLife();
  if (farm.phase < NIGHT_START) {
  const { x: foxX, y: foxY } = foxPosition();
  scenePart('fox', foxY + 13, () => {
    rect(foxX - 21, foxY + 9, 40, 4, '#3d614e77');
    rect(foxX - 10, foxY - 9, 23, 19, '#c97f52');
    rect(foxX + 9, foxY - 16, 17, 17, '#d58e5a');
    rect(foxX + 7, foxY - 19, 5, 8, '#8b5b42'); rect(foxX + 20, foxY - 19, 5, 8, '#8b5b42');
    rect(foxX + 21, foxY - 7, 3, 3, '#473e37');
    rect(foxX - 27, foxY - 4 + pausePulse(foxX,2.3)*2, 19, 9, '#b47751'); rect(foxX - 32, foxY - 6 + pausePulse(foxX,2.3)*2, 9, 9, '#f4debb');
  });
  }
  drawSquirrel();
}

function drawRegionNight(night) {
  drawValleyGardenNight(night);
  drawMineNight(night);
  const home = VALLEY_WORKER_LAYOUT.home;
  for (const windowX of [home.left + 23, home.left + 68]) {
    drawLightGlow(windowX, home.top + 65, 24, night * 0.42);
  }
  for (const [x, y] of [[401, 829 + SOUTH_LAKE_SHIFT_Y], [1083, 208], [810, 1126], ...MARKET_LAYOUT.lamps.map(lamp => [lamp.x, lamp.y - 3])]) {
    drawLightGlow(x, y, 21, night * .36);
  }
  for (const home of MARKET_LAYOUT.homes) {
    const x = home.x + 31, y = home.y + 79;
    drawLightGlow(x, y, 27, night * 0.48);
  }
  if (farm.goatBarnOpen) {
    drawLightGlow(GOAT_LAYOUT.barn.left + 61, GOAT_LAYOUT.barn.top + 52, 25, night * 0.39);
  }
  for (const x of [CENTRAL_PLAZA.stage.x - 68, CENTRAL_PLAZA.stage.x + 68]) {
    drawLightGlow(x, CENTRAL_PLAZA.stage.y - 52, 26, night * 0.39);
  }
}
