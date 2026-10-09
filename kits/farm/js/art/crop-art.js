'use strict';
// Small pixel sprites grow continuously through six recognizable phases.
function cropVisualProgress(plot) {
  if (!plot.crop) return 0;
  const winterFactor = seasonIndex() === 3 && !villageSiteOpen('greenhouse') ? .65 : 1;
  const dailyGrowth = (plot.watered ? 1 : .45) * winterFactor;
  const activeTime = plot.plantedAt == null ? farm.phase : Math.max(0, farm.phase - plot.plantedAt);
  return clamp((plot.age + activeTime * dailyGrowth) / crops[plot.crop].days, 0, 1);
}
function cropVisualStage(plot) { return Math.min(5, Math.floor(cropVisualProgress(plot) * 6)); }
function cropEase(start, end, value) {
  const t = clamp((value - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
}
function drawSeedling(x, y, g) {
  rect(x - 4, y + 1, 9, 2, '#6b4b36');
  rect(x - 2, y - 2 - Math.round(g * 12), 3, 6 + Math.round(g * 12), '#649751');
  if (g > .07) { rect(x - 7, y - 5 - Math.round(g * 5), 6, 3, '#82ad62'); rect(x + 1, y - 7 - Math.round(g * 5), 6, 3, '#91b96c'); }
}
function drawWheat(x, y, g, sway) {
  for (const dx of [-8, 0, 8]) {
    const height = 5 + Math.round(g * 19) + (dx === 0 ? 2 : 0);
    rect(x + dx + sway, y - height, 2, height + 2, '#5c8d48');
    if (g > .2) { rect(x + dx - 4 + sway, y - 7 - Math.round(g * 6), 5, 3, '#7da659'); rect(x + dx + 2 + sway, y - 5 - Math.round(g * 7), 5, 3, '#94b866'); }
    if (g > .43) rect(x + dx - 4 + sway, y - 14 - Math.round(g * 4), 5, 2, '#86ac57');
    if (g > .56) {
      const head = 2 + Math.round(cropEase(.56, 1, g) * 8);
      const gold = blendHex('#91b26a', '#e2bb69', cropEase(.58, .96, g));
      rect(x + dx - 2 + sway, y - height - head + 2, 6, head, gold);
      if (g > .76) { rect(x + dx - 3 + sway, y - height - head + 3, 2, 4, '#e9cf88'); rect(x + dx + 4 + sway, y - height - head + 5, 2, 4, '#d4a85d'); }
    }
  }
}
function drawCarrot(x, y, g) {
  for (const dx of [-6, 5]) {
    const h = 7 + Math.round(g * 12);
    rect(x + dx, y - h, 3, h + 2, '#568b49');
    if (g > .17) { rect(x + dx - 6, y - h + 4, 7, 4, '#70a858'); rect(x + dx + 2, y - h + 1, 7, 4, '#80b664'); }
    if (g > .37) rect(x + dx - 3, y - h - 3, 8, 4, '#9abf70');
    if (g > .58) {
      const root = 2 + Math.round(cropEase(.58, 1, g) * 8);
      rect(x + dx - root / 2 + 1, y - root + 3, root, root, blendHex('#caa367', '#e58a4b', cropEase(.58, .94, g)));
      if (g > .84) rect(x + dx, y + 2, 3, 3, '#bb6e3e');
    }
  }
}
function drawStrawberry(x, y, g) {
  for (const dx of [-7, 5]) {
    const h = 6 + Math.round(g * 12);
    rect(x + dx, y - h, 3, h + 2, '#518348');
    if (g > .17) { rect(x + dx - 6, y - h + 3, 9, 4, '#6d9e54'); rect(x + dx + 1, y - h + 1, 9, 4, '#84b66a'); }
    if (g > .34 && g < .74) { rect(x + dx - 3, y - h + 7, 5, 5, '#eee6bd'); rect(x + dx - 1, y - h + 8, 2, 2, '#e6bd72'); }
    if (g > .54) {
      const size = 2 + Math.round(cropEase(.54, 1, g) * 6);
      const berry = blendHex('#aabb76', '#d95e63', cropEase(.62, .97, g));
      rect(x + dx - 3, y - size + 1, size, size, berry);
      rect(x + dx - 2, y - size - 1, 5, 3, '#5a8a4c');
      if (g > .83) rect(x + dx, y - 3, 2, 2, '#f3be9c');
    }
  }
}
function drawCorn(x, y, g) {
  for (const dx of [-5, 5]) {
    const h = 7 + Math.round(g * 20);
    rect(x + dx, y - h, 3, h + 2, '#5b8b47');
    if (g > .2) { rect(x + dx - 7, y - h + 9, 9, 5, '#74a651'); rect(x + dx + 2, y - h + 5, 8, 5, '#7bad57'); }
    if (g > .43) { rect(x + dx - 8, y - h + 14, 10, 3, '#659b4b'); rect(x + dx + 2, y - h + 14, 9, 3, '#8bb964'); }
    if (g > .54) rect(x + dx - 2, y - h - 4, 7, 6, '#a9b66a');
    if (g > .62) {
      const cobH = 3 + Math.round(cropEase(.62, 1, g) * 9);
      rect(x + dx - 3, y - h + 10, 8, cobH, blendHex('#a4bd6a', '#eac16b', cropEase(.65, .97, g)));
      rect(x + dx - 4, y - h + 13, 2, cobH - 1, '#659447');
    }
  }
}
function drawPumpkin(x, y, g, sway) {
  const vine = 3 + Math.round(g * 19);
  rect(x - vine / 2, y - 3, vine, 3, '#58894a');
  if (g > .18) { rect(x - 10 + sway, y - 12, 8, 5, '#72a052'); rect(x + 3 + sway, y - 13, 9, 5, '#85b15e'); }
  if (g > .36 && g < .76) { rect(x - 2, y - 14, 5, 7, '#e9c66e'); rect(x - 5, y - 12, 11, 3, '#f1d990'); }
  if (g > .54) {
    const radius = 2 + Math.round(cropEase(.54, 1, g) * 8);
    const orange = blendHex('#90ab63', '#df934a', cropEase(.61, .98, g));
    circle(x, y - radius + 1, radius, orange);
    rect(x - 2, y - radius * 2, 5, 5, '#5d8b4b');
    if (g > .8) { rect(x - radius + 3, y - radius + 2, 2, radius, '#eeb16b'); rect(x + radius - 4, y - radius + 2, 2, radius, '#c97b3f'); }
  }
}
function drawCropSprite(plot, x, y) {
  const g = cropVisualProgress(plot);
  const sway = Math.round(Math.sin(now * 2 + x / 11) * Math.min(2, g * 2));
  if (g < .13) { drawSeedling(x, y, g); return; }
  if (plot.crop === 'wheat') drawWheat(x, y, g, sway);
  else if (plot.crop === 'carrot') drawCarrot(x, y, g);
  else if (plot.crop === 'strawberry') drawStrawberry(x, y, g);
  else if (plot.crop === 'corn') drawCorn(x, y, g);
  else drawPumpkin(x, y, g, sway);
}
