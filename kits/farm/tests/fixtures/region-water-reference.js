// Original full ground pass before stationary water group caching; QA only.
function qaReferenceRegionGround() {
  const season = sceneSeason.palette, winter = sceneSeason.winter;
  const colorValues = [season.grass, season.grass2,
    blendHex('#759965', '#b7cbc1', winter), blendHex('#a4b97c', '#c6d6cb', winter),
    blendHex('#aaa371', '#bdc6aa', winter), blendHex('#88a66f', '#b8cbbf', winter),
    blendHex('#93aa72', '#bcccb9', winter)];
  // Include every resolved color used by terrainDetails, not continuous time.
  // This preserves seasonal transitions while avoiding rebuilding unchanged RGBs.
  const key=[...colorValues,season.dark,season.flower,
    blendHex('#b5c584','#dfe6d9',winter),blendHex('#e9d8ac','#edf2e5',winter),
    blendHex('#e8f0c1','#e5ece0',winter)].join(':');
  drawCachedBaseTerrain(key,()=>drawBaseTerrain(colorValues.map(colorChannels)));
  drawMineGround();
  drawVillageGround();
  drawEastShoreGround();
  const lakeColors = [
    blendHex('#b2bc8e', '#c7d0c5', winter),
    blendHex('#79afa8', '#a9c9c5', winter),
    blendHex('#639ba6', '#93b9bd', winter),
    blendHex('#aad0c2', '#d9e5dc', winter)
  ];
  const lakeWater=groundTilePainter(),lakeHighlights=groundTilePainter();
  for (let y = 782 + SOUTH_LAKE_SHIFT_Y; y < 970 + SOUTH_LAKE_SHIFT_Y; y += 8) for (let x = 86; x < 400; x += 8) lakePixel(x, y, lakeColors,lakeWater,lakeHighlights);
  lakeWater.draw();lakeHighlights.draw();
  const valleyWater=groundTilePainter(),valleyHighlights=groundTilePainter();
  for (let y = 1152; y < 1298; y += 8) for (let x = 70; x < 325; x += 8) {
    const d = valleyLakeDepth(x, y);
    if (d < 1.07) valleyWater.add(x, y, 8, 8, d > .79 ? '#afbc91' : d > .65 ? '#7aaea5' : '#679ba3');
    if (d < .62 && hash(x, y, 49) > .85) valleyHighlights.add(x + 2, y + 3, 5, 2, '#acd3c4');
  }
  valleyWater.draw();valleyHighlights.draw();
  drawWetlandCreek();
  drawNurseryGround();
  const river=groundTilePainter();
  for (let y = 0; y < WORLD_H; y += 8) {
    const center = riverCenterAt(y);
    river.add(center - 36, y, 74, 8, '#819d87');
    river.add(center - 28, y, 58, 8, '#64a2aa');
  }
  river.draw();
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
