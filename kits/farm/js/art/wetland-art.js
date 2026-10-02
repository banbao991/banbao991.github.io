'use strict';
// Open water stays visible between small, distinct shoreline habitats.
function drawWetlandPlants() {
  const winter = sceneSeason.winter, autumn = sceneSeason.autumn;
  const leaf = blendHex('#789a64', '#b2c4b6', winter);
  const pale = blendHex('#a5bb79', '#c9d5c8', winter);
  for (const [x, y, height] of [[97, 1709, 18], [153, 1658, 14], [435, 1729, 21],
    [500, 1774, 16], [116, 1845, 18], [394, 1890, 22]]) {
    scenePart(`wetland-reed:${x}:${y}`, y + 4, () => {
      rect(x, y - height, 3, height + 4, '#688859');
      rect(x + 6, y - height + 7, 3, height - 4, leaf);
      rect(x - 2, y - height + 4, 8, 4, pale);
      rect(x + 1, y - height - 5, 4, 10, blendHex('#a87554', '#c2b199', winter));
    });
  }
  for (const [x, y, flower] of [[120, 1710, true], [456, 1745, false], [458, 1860, true]]) {
    scenePart(`wetland-pad:${x}:${y}`, y + 8, () => {
      rect(x - 12, y + 5, 27, 3, '#648e86');
      rect(x - 9, y, 22, 8, blendHex('#81a36d', '#b5c7b8', winter));
      rect(x - 1, y - 3, 12, 4, blendHex('#9fbd82', '#d1dacf', winter));
      if (flower && winter < .7) {
        rect(x + 1, y - 9, 5, 8, '#f0d5c5');
        rect(x - 3, y - 6, 12, 4, '#f8e9d9');
      }
    });
  }
  for (const plant of WETLAND_PLANTS) {
    const { x, y } = plant;
    scenePart(`wetland-plant:${x}:${y}`, y + 5, () => {
      if (plant.kind === 'cattail') {
        for (const [dx, height] of [[-7, 20], [1, 27], [8, 17]]) {
          rect(x + dx, y - height, 2, height + 4, '#678457');
          rect(x + dx - 3, y - height + 7, 5, 13, leaf);
          rect(x + dx + 2, y - height + 13, 4, 11, pale);
        }
        rect(x - 1, y - 33, 7, 14,
          blendHex('#8b6248', '#d4c4ac', clamp(autumn * .32 + winter * .72, 0, 1)));
        rect(x + 8, y - 22, 5, 10, '#98714e');
      } else if (plant.kind === 'iris') {
        rect(x - 1, y - 21, 3, 24, '#5e875d');
        rect(x - 10, y - 17, 9, 16, leaf); rect(x + 2, y - 14, 9, 13, pale);
        const bloom = clamp(1 - winter - autumn * .65, 0, 1);
        if (bloom > .08) {
          const tip = y - 23 - bloom * 6;
          rect(x - 8, tip + 2, 7, 5 + bloom * 4, '#9f99c4');
          rect(x + 2, tip + 1, 7, 5 + bloom * 4, '#b7a8d3');
          rect(x - 3, tip - 3, 7, 9, '#cec0df');
          rect(x, tip + 2, 3, 4, '#edca79');
        }
      } else if (plant.kind === 'lily') {
        const width = 19 + farm.nursery.wetness * 6;
        const pad = blendHex('#6f9f72', '#a7b8a5', winter);
        rect(x - width / 2, y - 3, width, 8, pad);
        rect(x - width / 2 + 4, y - 7, width - 7, 5, pad);
        rect(x + 4, y - 6, 7, 4, blendHex('#6b9e9e', '#9bbabd', winter));
        rect(x - 7, y - 4, 7, 2, '#a5c38a');
        const dayBloom = Math.min(smoothRange(.01, .16, farm.phase),
          1 - smoothRange(.49, .64, farm.phase));
        if (winter < .8 && dayBloom > .08) {
          const size = 3 + dayBloom * 5 * (1 - winter);
          rect(x - size / 2, y - 7 - size, size, size + 2, '#f4e4ce');
          rect(x - size / 2 + 2, y - 8 - size, Math.max(2, size - 4), 3, '#fff1df');
          rect(x, y - 8, 3, 3, '#e5bc75');
        }
      } else {
        for (const [dx, lean] of [[-10, -4], [-4, 2], [2, -2], [8, 3]]) {
          rect(x + dx, y - 12 - lean, 3, 16 + lean, leaf);
          rect(x + dx + 2, y - 8 - lean, 4, 4, pale);
        }
        rect(x - 12, y + 2, 25, 4, '#71926b');
      }
    });
  }
}
function drawWetlandLife() {
  scenePart('wetland-waterhen', wetlandWaterhenPosition().y + 13, () => {
    const bird = wetlandWaterhenPosition(), x = bird.x, y = bird.y;
    const ripple = 20 + Math.sin(motionNow * 2) * 3;
    rect(x - ripple / 2, y + 9, ripple, 2, '#b9d4c3');
    rect(x - 15, y + 12, 10, 2, '#a5c9ba');
    rect(x + 9, y + 13, 11, 2, '#a5c9ba');
    rect(x - 11, y - 2, 22, 12, '#454943');
    rect(x - 6, y - 8, 15, 10, '#535850');
    rect(x - 8, y + 4, 13, 3, '#dad4bb');
    rect(x - bird.dir * 12, y - 4, 6, 5, '#73756b');
    rect(x + bird.dir * 4, y - 5, 3, 3, '#f0dfae');
    rect(x + bird.dir * 10, y - 3, 7, 3, '#d89a6e');
    if (farm.paused) rect(x + bird.dir * 3, y - 5 + pausePulse(x, 2), 3, 2, '#364139');
  });
  scenePart('wetland-air', 0, () => {
    const dragonflyActivity = wetlandDragonflyActivity();
    if (dragonflyActivity > .01) {
      ctx.save(); ctx.globalAlpha *= dragonflyActivity;
      for (let index = 0; index < 2; index++) {
        const insect = wetlandDragonflyPosition(index), wing = pausePulse(index, 5) * 2;
        rect(insect.x - 10, insect.y - 4 + wing, 9, 3, '#c7e1d6');
        rect(insect.x + 3, insect.y - 6 - wing, 9, 3, '#d7e8dc');
        rect(insect.x - 2, insect.y - 7, 4, 8, '#437f8d');
        rect(insect.x - 1, insect.y + 1, 2, 10, '#5b9ba4');
        rect(insect.x - 1, insect.y - 9, 3, 3, '#d7b878');
      }
      ctx.restore();
    }
    const fireflyActivity = wetlandFireflyActivity();
    if (fireflyActivity > .01) {
      ctx.save(); ctx.globalAlpha *= fireflyActivity;
      for (let index = 0; index < 4; index++) {
        const insect = wetlandFireflyPosition(index);
        const glow = .22 + .42 * (.5 + .5 * Math.sin(motionNow * 3.2 + index * 1.8
          + pausePulse(index * 2, 3)));
        circle(insect.x, insect.y, 7, `rgba(240,214,128,${glow.toFixed(2)})`);
        rect(insect.x - 2, insect.y - 2, 4, 4, '#f9e7a8');
      }
      ctx.restore();
    }
  }, 0, 1);
}
