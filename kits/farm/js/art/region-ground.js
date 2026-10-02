'use strict';
// Continuous region terrain, water masks, paths and bridge decks.
const GROUND_STEP = 16;

function smoothRange(start, end, value) {
  const t = clamp((value - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
}
function terrainNoise(x, y, scale, seed) {
  const gx = Math.floor(x / scale), gy = Math.floor(y / scale);
  const fx = smoothRange(0, 1, x / scale - gx), fy = smoothRange(0, 1, y / scale - gy);
  const top = hash(gx, gy, seed) * (1 - fx) + hash(gx + 1, gy, seed) * fx;
  const bottom = hash(gx, gy + 1, seed) * (1 - fx) + hash(gx + 1, gy + 1, seed) * fx;
  return top * (1 - fy) + bottom * fy;
}
const groundColumns = Math.ceil(WORLD_W / GROUND_STEP);
const groundRows = Math.ceil(WORLD_H / GROUND_STEP);
const groundCells = Array.from({ length: groundColumns * groundRows }, (_, index) => {
  const x = (index % groundColumns) * GROUND_STEP;
  const y = Math.floor(index / groundColumns) * GROUND_STEP;
  const wobble = (terrainNoise(x, y, 144, 101) - .5) * 105;
  const wobbleSouth = (terrainNoise(x, y, 168, 102) - .5) * 95;
  const wobbleLow = (terrainNoise(x, y, 186, 104) - .5) * 80;
  return {
    x, y,
    east: smoothRange(907 + wobble, 1013 + wobble, x),
    village: smoothRange(riverCenterAt(y) + 34, riverCenterAt(y) + 130, x),
    south: smoothRange(587 + wobbleSouth, 693 + wobbleSouth, y),
    low: smoothRange(994 + wobbleLow, 1100 + wobbleLow, y),
    tone: terrainNoise(x, y, 100, 105) * .78 + hash(x, y, 106) * .08
  };
});
function colorChannels(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}
function groundChannel(cell, channel, colors) {
  const [grass, grass2, forest, meadow, village, valley, villageEdge] = colors;
  const base = grass[channel] + (grass2[channel] - grass[channel]) * cell.tone;
  const upper = base + (forest[channel] - base) * cell.east;
  const lower = meadow[channel] + (village[channel] - meadow[channel]) * cell.village;
  const near = upper + (lower - upper) * cell.south;
  const far = valley[channel] + (villageEdge[channel] - valley[channel]) * cell.village;
  return clamp(Math.round(near + (far - near) * cell.low + (cell.tone - .42) * 8), 0, 255);
}
function lakePixel(x, y, colors) {
  const d = lakeDepth(x, y);
  if (d < 1.06) rect(x, y, 8, 8, d > .84 ? colors[0] : d > .66 ? colors[1] : colors[2]);
  if (d < .62 && hash(x, y, 45) > .83) rect(x + 1, y + 2, 5, 2, colors[3]);
}
function drawRegionGround() {
  const season = sceneSeason.palette, winter = sceneSeason.winter;
  const colors = [season.grass, season.grass2,
    blendHex('#759965', '#b7cbc1', winter), blendHex('#a4b97c', '#c6d6cb', winter),
    blendHex('#aaa371', '#bdc6aa', winter), blendHex('#88a66f', '#b8cbbf', winter),
    blendHex('#93aa72', '#bcccb9', winter)].map(colorChannels);
  const left = Math.max(0, Math.floor(farm.view.x / GROUND_STEP) - 1);
  const top = Math.max(0, Math.floor(farm.view.y / GROUND_STEP) - 1);
  const right = Math.min(groundColumns, Math.ceil((farm.view.x + W / farm.view.zoom) / GROUND_STEP) + 1);
  const bottom = Math.min(groundRows, Math.ceil((farm.view.y + H / farm.view.zoom) / GROUND_STEP) + 1);
  for (let gy = top; gy < bottom; gy++) for (let gx = left; gx < right; gx++) {
    const cell = groundCells[gy * groundColumns + gx];
    ctx.fillStyle = `rgb(${groundChannel(cell, 0, colors)},${groundChannel(cell, 1, colors)},${groundChannel(cell, 2, colors)})`;
    ctx.fillRect(cell.x, cell.y, GROUND_STEP, GROUND_STEP);
  }
  terrainDetails();
  drawMineGround();
  drawVillageGround();
  const lakeColors = [
    blendHex('#b2bc8e', '#c7d0c5', winter),
    blendHex('#79afa8', '#a9c9c5', winter),
    blendHex('#639ba6', '#93b9bd', winter),
    blendHex('#aad0c2', '#d9e5dc', winter)
  ];
  for (let y = 782 + SOUTH_LAKE_SHIFT_Y; y < 970 + SOUTH_LAKE_SHIFT_Y; y += 8) for (let x = 86; x < 400; x += 8) lakePixel(x, y, lakeColors);
  for (let y = 1152; y < 1298; y += 8) for (let x = 70; x < 325; x += 8) {
    const d = valleyLakeDepth(x, y);
    if (d < 1.07) rect(x, y, 8, 8, d > .79 ? '#afbc91' : d > .65 ? '#7aaea5' : '#679ba3');
    if (d < .62 && hash(x, y, 49) > .85) rect(x + 2, y + 3, 5, 2, '#acd3c4');
  }
  drawWetlandCreek();
  drawNurseryGround();
  for (let y = 0; y < WORLD_H; y += 8) {
    const center = riverCenterAt(y);
    rect(center - 36, y, 74, 8, '#819d87');
    rect(center - 28, y, 58, 8, '#64a2aa');
  }
  drawRiverCurrent();
  // Small flower glades that do not require any image downloads.
  for (let i = 0; i < 330; i++) {
    const x = i < 115 ? 970 + hash(i, 70) * (WORLD_W - 990) : hash(i, 71) * 955;
    const y = i < 115 ? hash(i, 72) * 625 : 660 + hash(i, 73) * (WORLD_H - 670);
    if ((x > 1060 && x < 1240 && y > 105 && y < 300) || riverAt(x, y, 6) || (x < 420 && y > 775)) continue;
    rect(x, y, 3, 3, i % 3 ? '#e9c887' : '#f2dbbd');
    rect(x + 4, y + 2, 2, 3, '#6b9358');
  }
}
function drawRegionPaths() {
  // Each road is one continuous ribbon; dithered edges merge into the grass.
  const horizontal = (x1, x2, y, height) => {
    rect(x1, y, x2 - x1, height, '#d0b586');
    for (let x = x1; x < x2; x += 8) {
      const rough = Math.round(hash(x, y, 90) * 4);
      rect(x, y - 3 - rough, 8, 3 + rough, 'rgba(208,181,134,0.52)');
      rect(x, y + height, 8, 3 + rough, 'rgba(208,181,134,0.48)');
      if (hash(x, y, 91) > .7) rect(x + 2, y + 8, 3, 2, '#ead3a3');
    }
  };
  const vertical = (x, y1, y2, width) => {
    rect(x, y1, width, y2 - y1, '#d0b586');
    for (let y = y1; y < y2; y += 8) {
      const rough = Math.round(hash(x, y, 92) * 4);
      rect(x - 3 - rough, y, 3 + rough, 8, 'rgba(208,181,134,0.52)');
      rect(x + width, y, 3 + rough, 8, 'rgba(208,181,134,0.48)');
      if (hash(x, y, 93) > .72) rect(x + 10, y + 3, 3, 2, '#ead3a3');
    }
  };
  vertical(604, 600, SOUTH_VALLEY_ROAD_END, 34);
  vertical(1220, 311, 1209, 32);
  for (const bridge of RIVER_BRIDGES) {
    horizontal(bridge.westRoad, bridge.west + 3, bridge.y, bridge.height);
    horizontal(bridge.east - 3, bridge.eastRoad, bridge.y, bridge.height);
    drawRiverBridge(bridge);
  }
  for (const trail of COURIER_TRAILS) {
    if (trail.w > trail.h) horizontal(trail.x, trail.x + trail.w, trail.y, trail.h);
    else vertical(trail.x, trail.y, trail.y + trail.h, trail.w);
  }
  for (const path of MINE_LAYOUT.paths) {
    if (path.w > path.h) horizontal(path.x, path.x + path.w, path.y, path.h);
    else vertical(path.x, path.y, path.y + path.h, path.w);
  }
  // The quarry road and market approach merge with the existing south road.
  rect(1812, 1191, 32, 31, '#d0b586');
  rect(1972, 1191, 32, 31, '#d0b586');
  rect(1812, 1416, 32, 32, '#d0b586');
  rect(1550, 1683, 32, 31, '#d0b586');
  rect(1550, 1495, 32, 31, '#d0b586');
  rect(1650, 1495, 32, 31, '#d0b586');
  rect(1650, 1416, 32, 32, '#d0b586');
  for (const path of SCENIC_PATHS) {
    if (path.w > path.h) horizontal(path.x, path.x + path.w, path.y, path.h);
    else vertical(path.x, path.y, path.y + path.h, path.w);
  }
  // A narrow footpath meets the garden's centre aisle without touching its beds.
  const gardenAccess = MARKET_LAYOUT.garden.access, gardenAisle = MARKET_LAYOUT.garden.aisle;
  vertical(gardenAccess.left, gardenAccess.top, gardenAccess.bottom, gardenAccess.width);
  rect(gardenAccess.left, gardenAccess.top - 6, gardenAccess.width, 16, '#d0b586');
  rect(gardenAisle.left, gardenAisle.top, gardenAisle.width, gardenAisle.height, '#c1a577');
  for (let x = gardenAisle.left + 4; x < gardenAisle.left + gardenAisle.width - 4; x += 12)
    if (hash(x, gardenAisle.top, 815) > .62) rect(x, gardenAisle.top + 11, 4, 3, '#ddc18e');
  if (farm.upgrades >= 4) horizontal(638, 704, 1378, 32);
  // Remove feathered cross-strips inside the continuous north-south road.
  for (const bridge of RIVER_BRIDGES.slice(1, 3))
    rect(604, bridge.y - 3, 34, bridge.height + 7, '#d0b586');
  // Cover the feathered internal edges where the valley road turns east.
  rect(604, 1680, 34, 34, '#d0b586');
  rect(850, 1683, 32, 31, '#d0b586');
  rect(850, 1726, 32, 28, '#d0b586');
  rect(942, 1726, 32, 28, '#d0b586');
  rect(1109, 1683, 18, 31, '#d0b586');
  // The nursery footpath joins the cart road and its own bends as one ribbon.
  const nurseryPaths = NURSERY_LAYOUT.paths;
  horizontal(nurseryPaths.entry.x, nurseryPaths.entry.x + nurseryPaths.entry.w,
    nurseryPaths.entry.y, nurseryPaths.entry.h);
  vertical(nurseryPaths.home.x, nurseryPaths.home.y,
    nurseryPaths.home.y + nurseryPaths.home.h, nurseryPaths.home.w);
  vertical(nurseryPaths.aisle.x, nurseryPaths.aisle.y,
    nurseryPaths.aisle.y + nurseryPaths.aisle.h, nurseryPaths.aisle.w);
  // Feather belongs on the outside edges only, never across a junction.
  rect(nurseryPaths.entry.x, nurseryPaths.entry.y,
    nurseryPaths.entry.w, nurseryPaths.entry.h, '#d0b586');
  rect(604, nurseryPaths.entry.y - 3, 34,
    nurseryPaths.entry.h + 6, '#d0b586');
}
function drawRiverBridge(bridge) {
  const { west, east, y, height } = bridge;
  rect(west - 3, y - 4, east - west + 6, height + 8, '#674e3d');
  for (let x = west + 1; x < east - 4; x += 11) {
    rect(x, y + 1, 8, height - 2, '#d5ad72');
    rect(x + 2, y + 3, 4, 2, '#ead0a0');
  }
  scenePart(`bridge-back:${y}`, y, () => {
    rect(west - 5, y - 11, east - west + 10, 6, '#8b6848');
  });
  scenePart(`bridge-front:${y}`, y + height + 15, () => {
    rect(west - 5, y + height + 5, east - west + 10, 6, '#8b6848');
  });
  for (let x = west; x <= east; x += 29) {
    scenePart(`bridge-post-back:${x}:${y}`, y, () => rect(x, y - 14, 5, 14, '#76583e'));
    scenePart(`bridge-post-front:${x}:${y}`, y + height + 15, () => rect(x, y + height, 5, 15, '#76583e'));
  }
}
