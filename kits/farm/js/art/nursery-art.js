'use strict';
// The southwest wetland, a lived-in cottage, and seed beds that emerge in stages.
function drawWetlandCreek() {
  const first = NURSERY_LAYOUT.creek[0], last = NURSERY_LAYOUT.creek.at(-1);
  const winter = sceneSeason.winter;
  for (let y = Math.floor(first.y / 8) * 8; y < last.y + 8; y += 8) {
    const center = wetlandCreekCenter(y + 4);
    for (let x = Math.floor((center - 28) / 8) * 8; x < center + 32; x += 8) {
      const edge = Math.abs(x + 4 - center) + (hash(x, y, 731) - .5) * 4;
      if (edge > 27) continue;
      const bank = blendHex('#799d79', '#b7c9bd', winter);
      if (edge > 19) rect(x, y, 8, 8, bank);
      else if (edge > 13) rect(x, y, 8, 8, blendHex('#a7b78d', '#c9d7c9', winter));
      else rect(x, y, 8, 8, blendHex('#75a9a4', '#a2c2c0', winter));
      if (edge < 11 && hash(x, y, 732) > .86)
        rect(x + 2, y + 3, 4, 2, blendHex('#c4d6bd', '#e3e9dc', winter));
    }
  }
  for (let i = 0; i < 7; i++) {
    const y = first.y + ((motionNow * 15 + i * 59) % (last.y - first.y));
    const x = wetlandCreekCenter(y) + (i % 2 ? 4 : -5);
    rect(x, y, 5, 2, blendHex('#c8ded0', '#e4eae1', winter));
  }
}
function drawNurseryGround() {
  const lobes = NURSERY_LAYOUT.wetlandLobes;
  const winter = sceneSeason.winter;
  const left = Math.max(0, Math.floor(Math.min(...lobes.map(lobe => lobe.x - lobe.rx * 1.08)) / 8) * 8);
  const top = Math.max(0, Math.floor(Math.min(...lobes.map(lobe => lobe.y - lobe.ry * 1.08)) / 8) * 8);
  const right = Math.min(WORLD_W, Math.max(...lobes.map(lobe => lobe.x + lobe.rx * 1.08)));
  const bottom = Math.min(WORLD_H, Math.max(...lobes.map(lobe => lobe.y + lobe.ry * 1.08)));
  for (let y = top; y < bottom; y += 8)
    for (let x = left; x < right; x += 8) {
      const grain = (hash(Math.floor(x / 24), Math.floor(y / 24), 611) - .5) * .11;
      const depth = wetlandMarshDepth(x + 4, y + 4) + grain;
      if (depth > 1.08) continue;
      const fade = 1 - smoothRange(.76, 1.08, depth);
      const damp = .43 + farm.nursery.wetness * .16;
      rect(x, y, 8, 8, `rgba(74,124,103,${(fade * damp).toFixed(2)})`);
      if (depth < .9 && hash(x, y, 613) > .88)
        rect(x + 2, y + 3, 5, 2, blendHex('#94a57a', '#c5d3be', winter));
    }
  const basins = [NURSERY_LAYOUT.wetlandPool, ...NURSERY_LAYOUT.wetlandPuddles];
  for (const [index, pool] of basins.entries()) {
    const waterSpread = index === 0 ? wetlandWaterSpread() : wetlandPuddleSpread();
    const rx = pool.rx * waterSpread, ry = pool.ry * waterSpread;
    for (let y = Math.floor((pool.y - ry - 8) / 8) * 8; y < pool.y + ry + 8; y += 8)
      for (let x = Math.floor((pool.x - rx - 8) / 8) * 8; x < pool.x + rx + 8; x += 8) {
        const depth = ((x + 4 - pool.x) / rx) ** 2 + ((y + 4 - pool.y) / ry) ** 2;
        if (depth > 1.04) continue;
        rect(x, y, 8, 8, depth > .8
          ? blendHex('#a8b795', '#ced9ca', winter)
          : depth > .53 ? blendHex('#7da9a0', '#a9c7bf', winter)
            : blendHex('#619b9d', '#95b6b7', winter));
        if (depth < .58 && hash(x, y, 612) > .85)
          rect(x + 2, y + 3, 5, 2, '#bdd7c4');
      }
  }
}
function drawNurseryBed(index) {
  if (sceneQueue) return scenePart(`nursery-bed:${index}`, NURSERY_LAYOUT.beds[index].y + 13, () => drawNurseryBed(index));
  const spot = NURSERY_LAYOUT.beds[index], bed = farm.nursery.beds[index];
  const build = clamp((nurseryClock() - bed.builtAt) / .35, 0, 1);
  const width = 44 * build;
  if (width < 2) return;
  const x = spot.x - width / 2, y = spot.y - 12;
  rect(x - 3, y + 21, width + 6, 4, '#64795366');
  rect(x, y, width, 25, '#896a4c');
  rect(x + 3, y + 3, Math.max(0, width - 6), 18, '#6b543e');
  rect(x - 2, y - 2, width + 4, 4, '#b28b5d');
  rect(x - 2, y + 21, width + 4, 4, '#b28b5d');
  if (build < 1) return;
  const growth = nurseryBedProgress(index), leaf = blendHex('#689457', '#a9baac', sceneSeason.winter);
  for (let i = 0; i < 3; i++) {
    const cx = spot.x - 14 + i * 14, cy = spot.y + (i % 2) * 3;
    if (growth < .12) {
      rect(cx - 4, cy + 4, 9, 3, '#b99568');
      rect(cx - 2, cy + 1, 5, 3, '#e2c78d');
      continue;
    }
    rect(cx, cy - 2 - growth * 5, 3, 10 + growth * 4, '#557c4b');
    rect(cx - 5, cy - 2 - growth * 4, 7, 4, leaf);
    rect(cx + 2, cy - 5 - growth * 4, 7, 4, leaf);
    if (growth > .67) {
      const color = spot.kind === 'flowerBundle' ? ['#e6aa79', '#f0d2ab', '#b992b8'][i]
        : ['#e4c57d', '#d5ab72', '#ecd6a4'][i];
      circle(cx + 1, cy - 9 - growth * 5, 3 + growth * 2, color);
      rect(cx, cy - 10 - growth * 5, 2, 2, '#f3e6b9');
    }
  }
  // The sign sits beside each finished bed, clear of the small seedlings.
  const signX = spot.x - width / 2 - 11, signY = spot.y - 23;
  rect(signX + 4, signY + 9, 3, 12, '#765d42');
  rect(signX, signY, 12, 10, '#805e43');
  rect(signX + 2, signY + 2, 8, 6, '#e3c994');
  if (spot.kind === 'flowerBundle') {
    rect(signX + 5, signY + 3, 3, 4, '#c97f82');
    rect(signX + 4, signY + 5, 5, 2, '#e7a997');
  } else {
    rect(signX + 4, signY + 4, 5, 3, '#8fac70');
    rect(signX + 6, signY + 2, 2, 4, '#5f8755');
  }
}
function drawNurseryScenery() {
  const h = NURSERY_LAYOUT.home, night = farm.phase >= NIGHT_START;
  scenePart('nursery-home', h.top + 90, () => {
    rect(h.left + 6, h.top + 28, 75, 56, '#ba9266');
    rect(h.left + 11, h.top + 34, 65, 48, '#dfbc88');
    rect(h.left, h.top + 17, 84, 22, '#9c6851');
    rect(h.left + 9, h.top + 6, 67, 17, '#bd805d');
    rect(h.left + 19, h.top - 2, 47, 12, '#d1966b');
    rect(h.left + 17, h.top + 49, 16, 17, '#725c47');
    rect(h.left + 20, h.top + 52, 10, 11, night ? '#e9c27c' : '#8eafa2');
    rect(h.left + 54, h.top + 45, 22, 39, '#74543c');
    rect(h.left + 57, h.top + 48, 16, 33, '#9a754e');
    circle(h.left + 70, h.top + 66, 2, '#f3d395');
    rect(h.left + 49, h.top + 81, 31, 5, '#a98962');
    rect(h.left + 45, h.top + 86, 37, 4, '#826d53');
  });
  // A low birdwatch platform marks the stream even before the nursery opens.
  const lookout = NURSERY_LAYOUT.creekLookout;
  scenePart('wetland-lookout', lookout.y + 12, () => {
    rect(lookout.x - 31, lookout.y + 7, 65, 5, '#755d48');
    rect(lookout.x - 30, lookout.y - 10, 61, 18, '#b78f62');
    for (let i = 0; i < 5; i++) rect(lookout.x - 28 + i * 12, lookout.y - 8, 2, 16, '#d0ad7a');
    rect(lookout.x - 30, lookout.y - 20, 5, 11, '#8b694d');
    rect(lookout.x + 26, lookout.y - 20, 5, 11, '#8b694d');
    rect(lookout.x - 30, lookout.y - 21, 61, 5, '#d2ac77');
  });
  const bridge = NURSERY_LAYOUT.creekBridge;
  rect(bridge.x - 37, bridge.y + 7, 76, 4, '#745d49');
  rect(bridge.x - 35, bridge.y - 7, 72, 15, '#a77e55');
  for (let i = 0; i < 8; i++) {
    const x = bridge.x - 34 + i * 9;
    rect(x, bridge.y - 6, 8, 12, i % 2 ? '#bd9566' : '#c5a171');
    rect(x + 3, bridge.y - 3, 2, 2, '#725b47');
  }
  scenePart('wetland-bridge-posts', bridge.y + 10, () => {
    rect(bridge.x - 38, bridge.y - 10, 4, 20, '#84684b');
    rect(bridge.x + 35, bridge.y - 10, 4, 20, '#84684b');
  });
  for (const [x, y] of [[83, 1353], [206, 1338], [79, 1544], [141, 1582]]) {
    scenePart(`creek-flower:${x}:${y}`, y + 4, () => {
      rect(x - 9, y + 1, 21, 3, '#708f6d');
      for (const dx of [-7, 0, 8]) {
        rect(x + dx, y - 10 - (dx === 0 ? 5 : 0), 2, 13 + (dx === 0 ? 5 : 0), '#688c61');
        rect(x + dx - 2, y - 11 - (dx === 0 ? 5 : 0), 5, 5,
          blendHex('#dbb38b', '#d7d8c9', sceneSeason.winter));
      }
    });
  }
  for (let i = 0; i < 26; i++) {
    const x = 84 + hash(i, 340) * 330, y = 1665 + hash(i, 341) * 176;
    if (wetlandMarshDepth(x, y) < 1.08) continue;
    scenePart(`wetland-flower:${i}`, y + 3, () => {
      rect(x, y - 5, 2, 8, '#6c935b');
      circle(x + 1, y - 7, 3, blendHex(i % 3 ? '#e5bf83' : '#dfa9a4', '#e7e9d9', sceneSeason.winter));
    });
  }
  drawWetlandPlants();
  for (let index = 0; index < nurseryActiveBeds(); index++) drawNurseryBed(index);
  if (farm.nursery.level) {
    // A low bench gives 阿芽 a readable idle destination.
    const benchX = NURSERY_LAYOUT.rest.x, benchY = NURSERY_LAYOUT.rest.y;
    scenePart('nursery-bench', benchY + 15, () => {
      rect(benchX - 28, benchY - 2, 57, 7, '#9b7653');
      rect(benchX - 24, benchY + 5, 5, 10, '#745a43');
      rect(benchX + 19, benchY + 5, 5, 10, '#745a43');
      rect(benchX - 21, benchY - 13, 44, 7, '#bb9161');
    });
  }
}
function drawNurseryLife() {
  if (seasonTransition().winter < .7) {
    scenePart('nursery-frog', nurseryFrogPosition().y + 8, () => {
      const frog = nurseryFrogPosition();
      rect(frog.x - 9, frog.y + 5, 20, 3, '#5c875d');
      rect(frog.x - 7, frog.y - 4, 16, 11, '#719c61');
      rect(frog.x - 5, frog.y - 8, 5, 6, '#8ab374');
      rect(frog.x + 3, frog.y - 8, 5, 6, '#8ab374');
      rect(frog.x - 3, frog.y - 6, 2, 2, '#31453a');
      rect(frog.x + 5, frog.y - 6, 2, 2, '#31453a');
      if (farm.paused) circle(frog.x + 1, frog.y + 2, 2 + Math.abs(pausePulse(frog.x, 2)), '#a3c789');
    });
  }
  scenePart('nursery-air', 0, () => {
    if (farm.nursery.level && farm.phase < NIGHT_START && weatherVisual().rain < .65) {
      for (let i = 0; i < 4; i++) {
        const x = 244 + i * 31 + Math.sin(motionNow * (1.2 + i * .15) + i) * 17;
        const y = 1465 + i * 43 + Math.cos(motionNow * 1.5 + i) * 14;
        rect(x - 7, y, 6, 3, i % 2 ? '#f4d0a7' : '#e9dba3');
        rect(x + 3, y - 2, 6, 3, i % 2 ? '#e4b69a' : '#eedcaa');
        rect(x, y, 3, 6, '#836f51');
      }
    }
  }, 0, 1);
}
