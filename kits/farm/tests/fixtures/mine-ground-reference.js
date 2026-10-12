function qaReferenceMineGround() {
  if (!mineVisible()) return;
  const winter = sceneSeason.winter, rain = weatherVisual().rain;
  const dirt = blendHex('#a69370', '#b7b9ad', winter * .7);
  const rock = blendHex('#8e8b78', '#b8c2bc', winter * .8);
  const ground=groundTilePainter(),ridges=groundTilePainter(),grains=groundTilePainter();
  for (let y = 1424; y < WORLD_H; y += 16) {
    const edge = 1680 + Math.round(Math.sin(y / 57) * 27 + (hash(y, 1, 841) - .5) * 25);
    const fade = y < 1460 ? (y - 1424) / 36 : 1;
    if (fade > 0) {
      ground.add(edge,y,MINE_LAYOUT.area.right-edge-32,16,`rgba(157,142,112,${(.38*fade).toFixed(2)})`);
      for(let band=0;band<2;band++)ground.add(MINE_LAYOUT.area.right-32+band*16,y,16,16,
        `rgba(157,142,112,${(.25*fade*(1-band*.5)).toFixed(2)})`);
    }
    const ridge = edge + 44 + Math.round(Math.sin(y / 44) * 20);
    ridges.add(ridge, y + 2, MINE_LAYOUT.area.right - 24 - ridge, 9,
      `rgba(91,91,78,${(.14 + rain * .1).toFixed(2)})`);
    if (hash(y, 2, 842) > .42) grains.add(ridge + 22, y + 11, 90 + hash(y, 3, 843) * 120, 3, dirt);
  }
  ground.draw();ridges.draw();grains.draw();
  for (let i = 0; i < 130; i++) {
    const x = 1690 + hash(i, 4, 844) * 346, y = 1450 + hash(i, 5, 845) * 455;
    if (x > 1803 && x < 1852 && y < 1608) continue;
    rect(x, y, 6 + hash(i, 6, 846) * 14, 3 + hash(i, 7, 847) * 5,
      i % 3 ? rock : dirt);
  }
  // The old decorative tufts are natural vegetation too: keep the meadow edge,
  // but clear actual rail/work areas with the same gradual project masks.
  const clearance=farm.development?villageWildPlantClearance():[];
  for (let i = 0; i < 22; i++) {
    const x = 1600 + hash(i, 8, 848) * 430, y = 1365 + hash(i, 9, 849) * 500;
    if (x < 1705 && y < 1495 || x > 1790 && x < 1850 && y < 1610) continue;
    if(!villagePlantVisible('mine',{x,y,seed:848+i},clearance))continue;
    rect(x, y, 8, 4, '#72865f'); rect(x + 3, y - 6, 4, 7, '#81996b');
  }
  if (rain > .2) for (const [x, y, width] of [[1725, 1606, 24], [1885, 1780, 35], [1990, 1565, 17]])
    rect(x, y, width, 4, `rgba(112,158,161,${(rain * .45).toFixed(2)})`);
}
