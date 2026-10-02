'use strict';
// Plaza furniture shares anchors with hit testing and joins the actors' depth order.
function drawPlazaStage() {
  const { x, y } = CENTRAL_PLAZA.stage;
  rect(x - 70, y - 12, 140, 34, '#937453');
  for (let tx = x - 64; tx < x + 68; tx += 17) rect(tx, y - 8, 14, 25, '#c5a277');
  for (const tx of [x - 68, x + 64]) {
    rect(tx, y - 49, 6, 40, '#795b43'); rect(tx - 3, y - 53, 12, 5, '#e4bd80');
  }
  rect(x - 75, y - 58, 150, 9, '#ad7755'); rect(x - 52, y - 68, 104, 11, '#c58d60');
  rect(x - 14, y - 25, 28, 15, '#e5c58e');
  if (isFestivalDay() && currentFestivalLevel() >= 2) {
    rect(x - 28, y - 6, 12, 13, '#956447'); circle(x - 22, y - 7, 8, '#ead1a2');
    rect(x + 25, y - 21, 3, 23, '#75624c'); rect(x + 28, y - 22, 12, 3, '#75624c');
    circle(x + 22, y + 3, 5, '#75624c');
  }
}
function drawPlazaWell() {
  const { x, y } = CENTRAL_PLAZA.well;
  circle(x, y, 31, '#9d8362'); circle(x, y - 3, 23, '#79aaa5'); circle(x, y - 3, 15, '#aed0bd');
  rect(x - 33, y + 17, 66, 7, '#d4b98a');
}
function drawPlazaBench(bench) {
  const { x, y } = bench;
  rect(x - 21, y - 15, 43, 7, '#765840'); rect(x - 19, y - 23, 39, 8, '#b98f60');
  rect(x - 18, y - 8, 5, 10, '#765840'); rect(x + 14, y - 8, 5, 10, '#765840');
}
function drawFestivalPole(pole) {
  const { x, y } = pole;
  rect(x - 8, y + 2, 19, 5, '#536c4b55'); rect(x - 3, y - 102, 7, 108, '#8b6749');
  rect(x - 1, y - 98, 2, 102, '#c09b6a'); rect(x - 6, y - 105, 13, 6, '#ddbb83');
  if (currentFestivalLevel() >= 3) {
    rect(x - 7, y - 84, 15, 18, '#a5784e'); rect(x - 4, y - 81, 9, 11, '#f1cb82');
    circle(x, y - 76, 18, '#ffd59120');
  }
}
function drawFestivalCanopy() {
  if (!isFestivalDay()) return;
  const [left, right] = CENTRAL_PLAZA.poles, theme = festivalTheme();
  const ropeY = x => left.y - 101 + Math.sin((x - left.x) / (right.x - left.x) * Math.PI) * 22;
  for (let x = left.x; x < right.x; x += 7) rect(x, ropeY(x), Math.min(8, right.x - x), 2, '#d9c69c');
  for (let x = left.x + 18, i = 0; x < right.x - 12; x += 29, i++) {
    const y = ropeY(x);
    rect(x, y + 2, 10, 9, theme.colors[i % 3]); rect(x + 2, y + 11, 6, 3, theme.colors[i % 3]);
    if (currentFestivalLevel() >= 3) {
      circle(x + 17, y + 6, 3, '#efcb86');
      if (farm.phase > .4) circle(x + 17, y + 6, 11, '#ffd38b22');
    }
  }
}
function plazaSceneItems() {
  const s = CENTRAL_PLAZA, winter = sceneSeason.winter;
  const items = [{ id: 'plaza-stage', y: s.stage.y + 22, draw: drawPlazaStage },
    { id: 'plaza-well', y: s.well.y + 31, draw: drawPlazaWell }];
  for (const bench of s.benches) items.push({ id: `plaza-bench:${bench.x}`, y: bench.y - 15, draw: () => drawPlazaBench(bench) });
  for (const [x, y] of s.flowers) items.push({ id: `plaza-flower:${x}`, y: y + 17, draw: () => {
    rect(x - 22, y + 8, 44, 9, '#9f7957'); rect(x - 17, y - 5, 34, 15, '#cda878');
    for (let i = 0; i < 3; i++) circle(x - 13 + i * 13, y - 7, 5,
      blendHex(i === 1 ? '#e6b576' : '#e9d39e', '#e8e9d7', winter));
  }});
  for (const [x, y] of s.shrubs) items.push({ id: `plaza-shrub:${x}`, y: y + 7, draw: () => {
    rect(x - 8, y + 2, 18, 5, '#896b4e'); circle(x, y - 2, 11, blendHex('#9bb972', '#c9d7c6', winter));
    circle(x - 4, y - 5, 3, '#ead8a5');
  }});
  if (isFestivalDay()) {
    items.push({ id: 'festival-canopy', y: Math.max(...s.poles.map(pole => pole.y)) + 6, draw: drawFestivalCanopy });
    for (const pole of s.poles) items.push({ id: `festival-pole:${pole.x}`, y: pole.y + 6, order: 1, draw: () => drawFestivalPole(pole) });
    for (const table of s.tables) items.push({ id: `festival-table:${table.x}`, y: table.y + 19, draw: () => drawFestivalTable(table) });
  }
  return items;
}
function drawCentralPlaza() {
  drawSceneItems(plazaSceneItems());
}
