'use strict';
function drawEastGardenPlant(kind, x, y, progress) {
  const crop = EAST_GARDEN_CROPS[kind];
  const winter = sceneSeason.winter;
  const leaf = blendHex('#6f9b58', '#9aae8f', winter * .55);
  const leafLight = blendHex('#99bf70', '#c0cfae', winter * .55);
  if (progress < .09) {
    rect(x - 2, y - 2, 4, 3, '#d7b278');
    return;
  }
  const height = 4 + Math.round(progress * 12);
  rect(x - 1, y - height, 3, height, '#5b8250');
  const spread = 2 + Math.round(progress * 5);
  rect(x - spread - 2, y - height + 3, spread + 2, 4, leaf);
  rect(x + 1, y - height + 1, spread + 2, 4, leafLight);
  if (progress < .43) return;
  rect(x - spread - 3, y - height + 7, spread + 2, 3, leafLight);
  rect(x + 1, y - height + 6, spread + 3, 3, leaf);
  if (progress < .72) return;
  const color = blendHex(crop.color, '#c8d2ba', winter * .36);
  if (kind === 'greens' || kind === 'cabbage') {
    const radius = kind === 'cabbage' ? 5 : 4;
    circle(x, y - 5, radius, color);
    rect(x - 2, y - 7, 4, 2, '#d2df9c');
  } else if (kind === 'radish') {
    circle(x, y - 3, 4, color);
    rect(x, y, 2, 4, '#eadbc0');
  } else if (kind === 'beans') {
    rect(x - 6, y - height + 9, 3, 6, color);
    rect(x + 5, y - height + 4, 3, 7, color);
  } else if (kind === 'tomato') {
    circle(x - 5, y - height + 10, 4, color);
    circle(x + 6, y - height + 7, 4, color);
  } else {
    circle(x, y - 4, 5, color);
    rect(x - 1, y - 10, 3, 3, '#719058');
  }
}
function drawEastGardenCrate(x, y, basket) {
  if (sceneQueue) return scenePart('east-garden-basket', y + 13, () => drawEastGardenCrate(x,y,basket));
  rect(x - 17, y - 2, 34, 15, '#704f38');
  rect(x - 15, y, 30, 10, '#bd8f61');
  rect(x - 12, y + 2, 24, 3, '#d4ad77');
  rect(x - 17, y + 8, 34, 4, '#8a6246');
  const contents = Object.entries(basket).flatMap(([kind, count]) => Array(Math.min(5, count)).fill(kind)).slice(0, 5);
  for (let index = 0; index < contents.length; index++) {
    const kind = contents[index];
    circle(x - 11 + index * 6, y - 5 - (index % 2) * 2, 4, EAST_GARDEN_CROPS[kind].color);
    rect(x - 12 + index * 6, y - 11 - (index % 2) * 2, 3, 3, '#6d9959');
  }
}
function drawEastGardenRow(row) {
  const garden = MARKET_LAYOUT.garden;
  for (let index = row * 14; index < (row + 1) * 14; index++) {
    const bed = farm.eastGarden.beds[index];
    const x = garden.left + index % 14 * 30;
    const y = garden.top + row * garden.rowSpacing;
    rect(x, y + 3, 24, 23, '#735b43');
    rect(x + 2, y + 3, 20, 18, '#9a7651');
    rect(x + 4, y + 6, 16, 12, '#af865b');
    scenePart(`east-garden-plant:${index}`, y + 20, () => {
      drawEastGardenPlant(bed.kind, x + 12, y + 20, eastGardenProgress(index));
    });
    if (bed.wateredDay === farm.day || weatherVisual().rain > .4)
      rect(x + 3, y + 20, 5, 2, '#91b9b1');
  }
}
function drawEastGarden() {
  const garden = MARKET_LAYOUT.garden;
  drawEastGardenRow(0);
  // Small garden sign and the household basket sit beyond the bed rows.
  scenePart('east-garden-sign', garden.top + 30, () => {
    rect(garden.left - 50, garden.top + 4, 4, 26, '#785b40');
    rect(garden.left - 60, garden.top - 3, 22, 13, '#c9a873');
    rect(garden.left - 55, garden.top + 1, 12, 3, '#6c8d5c');
  });
  drawEastGardenCrate(garden.basket.x, garden.basket.y, farm.eastGarden.basket);
}
function drawEastGardenFrontRow() { drawEastGardenRow(1); }
