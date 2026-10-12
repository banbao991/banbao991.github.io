'use strict';
// Only the latest exact wetness/layout/color combination is kept. The original
// marsh depth and water spread formulas still run whenever wetness changes.
let nurseryGroundCache=null;
function drawCachedNurseryGround() {
  const winter=sceneSeason.winter;
  const colors=[blendHex('#94a57a','#c5d3be',winter),blendHex('#a8b795','#ced9ca',winter),
    blendHex('#7da9a0','#a9c7bf',winter),blendHex('#619b9d','#95b6b7',winter)];
  const lobes=NURSERY_LAYOUT.wetlandLobes,basins=[NURSERY_LAYOUT.wetlandPool,...NURSERY_LAYOUT.wetlandPuddles];
  const key=[WORLD_W,WORLD_H,farm.nursery.wetness,lobes.length,basins.length,
    ...lobes.flatMap(p=>[p.x,p.y,p.rx,p.ry]),...basins.flatMap(p=>[p.x,p.y,p.rx,p.ry]),...colors].join(':');
  if(nurseryGroundCache?.key!==key)nurseryGroundCache={key,layers:buildNurseryGround(colors)};
  // Painters use the current transform/context; streams and actors remain animated.
  for(const layer of nurseryGroundCache.layers)layer.draw();
}
function buildNurseryGround(colors) {
  const layers=[];
  const lobes = NURSERY_LAYOUT.wetlandLobes;
  const left = Math.max(0, Math.floor(Math.min(...lobes.map(lobe => lobe.x - lobe.rx * 1.08)) / 8) * 8);
  const top = Math.max(0, Math.floor(Math.min(...lobes.map(lobe => lobe.y - lobe.ry * 1.08)) / 8) * 8);
  const right = Math.min(WORLD_W, Math.max(...lobes.map(lobe => lobe.x + lobe.rx * 1.08)));
  const bottom = Math.min(WORLD_H, Math.max(...lobes.map(lobe => lobe.y + lobe.ry * 1.08)));
  const marsh=groundTilePainter(),marshGrains=groundTilePainter();
  for (let y = top; y < bottom; y += 8)
    for (let x = left; x < right; x += 8) {
      const grain = (hash(Math.floor(x / 24), Math.floor(y / 24), 611) - .5) * .11;
      const depth = wetlandMarshDepth(x + 4, y + 4) + grain;
      if (depth > 1.08) continue;
      const fade = 1 - smoothRange(.76, 1.08, depth);
      const damp = .43 + farm.nursery.wetness * .16;
      marsh.add(x, y, 8, 8, `rgba(74,124,103,${(fade * damp).toFixed(2)})`);
      if (depth < .9 && hash(x, y, 613) > .88)
        marshGrains.add(x + 2, y + 3, 5, 2, colors[0]);
    }
  layers.push(marsh,marshGrains);
  const basins = [NURSERY_LAYOUT.wetlandPool, ...NURSERY_LAYOUT.wetlandPuddles];
  for (const [index, pool] of basins.entries()) {
    const water=groundTilePainter(),highlights=groundTilePainter();
    const waterSpread = index === 0 ? wetlandWaterSpread() : wetlandPuddleSpread();
    const rx = pool.rx * waterSpread, ry = pool.ry * waterSpread;
    for (let y = Math.floor((pool.y - ry - 8) / 8) * 8; y < pool.y + ry + 8; y += 8)
      for (let x = Math.floor((pool.x - rx - 8) / 8) * 8; x < pool.x + rx + 8; x += 8) {
        const depth = ((x + 4 - pool.x) / rx) ** 2 + ((y + 4 - pool.y) / ry) ** 2;
        if (depth > 1.04) continue;
        water.add(x, y, 8, 8, depth > .8
          ? colors[1]
          : depth > .53 ? colors[2]
            : colors[3]);
        if (depth < .58 && hash(x, y, 612) > .85)
          highlights.add(x + 2, y + 3, 5, 2, '#bdd7c4');
      }
    layers.push(water,highlights);
  }
  return layers;
}
