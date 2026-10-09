'use strict';
// West lake water plants, pier, fishing points, ducks and 阿蓼 painting.
function lakeReed(x, y, height, seed) {
  if (sceneQueue) return scenePart(`lake-reed:${x}:${y}`, y + 6, () => lakeReed(x,y,height,seed));
  rect(x - 6, y + 2, 17, 4, '#759778');
  rect(x, y - height, 3, height + 2, '#557849');
  rect(x + 6, y - height + 5, 3, height - 3, '#688c50');
  rect(x - 4, y - height + 10, 11, 4, '#7ba35d');
  rect(x + 2, y - height + 16, 11, 4, '#8fb16b');
  rect(x - 1, y - height - 6, 5, 10, '#8b6042');
  if (seed % 2) rect(x + 5, y - height, 5, 9, '#9d6d48');
}

function lakeLily(x, y, flower) {
  if (sceneQueue) return scenePart(`lake-lily:${x}:${y}`, y + 7, () => lakeLily(x,y,flower));
  rect(x - 13, y + 2, 28, 5, '#4f8786');
  rect(x - 11, y - 3, 22, 8, blendHex('#73a66f', '#a9c5b8', sceneSeason.winter));
  rect(x - 6, y - 6, 12, 4, blendHex('#8eb778', '#c3d6c9', sceneSeason.winter));
  rect(x + 5, y, 8, 3, blendHex('#659964', '#9bb9ac', sceneSeason.winter));
  if (flower) {
    rect(x - 2, y - 11, 5, 8, blendHex('#f7d5c0', '#f4f0e4', sceneSeason.winter));
    rect(x - 7, y - 8, 6, 5, blendHex('#f2bfb2', '#e8e9df', sceneSeason.winter));
    rect(x + 3, y - 8, 6, 5, blendHex('#f2bfb2', '#e8e9df', sceneSeason.winter));
    rect(x, y - 7, 3, 3, '#e7b567');
  }
}

function drawSouthernLakePierDeck() {
  if(!villageSiteOpen('lake'))return;
  // The walking surface stays below people; railings and posts are drawn in the scenery pass.
  rect(340, 849 + SOUTH_LAKE_SHIFT_Y, 112, 37, '#5d5948');
  rect(346, 844 + SOUTH_LAKE_SHIFT_Y, 108, 34, '#8a6747');
  for (let x = 349; x < 452; x += 14) {
    rect(x, 846 + SOUTH_LAKE_SHIFT_Y, 11, 29, x % 3 ? '#c99b65' : '#d4ac72');
    rect(x + 2, 849 + SOUTH_LAKE_SHIFT_Y, 6, 2, '#e6c18a');
  }
}

function drawSouthernLakeScenery() {
  // Scattered shoreline growth follows the ellipse rather than a rectangular patch.
  for (const [x, y, height, seed] of [
    [119, 826, 27, 1], [136, 797, 21, 2], [162, 783, 29, 3], [202, 773, 21, 4],
    [306, 777, 24, 5], [347, 795, 29, 6], [377, 818, 25, 7],
    [119, 899, 26, 8], [141, 933, 23, 9], [177, 950, 31, 10],
    [281, 959, 25, 11], [337, 942, 29, 12], [369, 917, 21, 13]
  ]) lakeReed(x, y + SOUTH_LAKE_SHIFT_Y, height, seed);
  for (const [x, y, flower] of [[153, 856, true], [183, 909, false], [259, 813, true], [320, 908, true], [291, 940, false]]) lakeLily(x, y + SOUTH_LAKE_SHIFT_Y, flower);

  // A tied rowboat rocks near the fishing pier.
  scenePart('lake-boat', 908 + SOUTH_LAKE_SHIFT_Y, () => {
    rect(313, 903 + SOUTH_LAKE_SHIFT_Y, 48, 5, '#4d8180');
    rect(318, 895 + SOUTH_LAKE_SHIFT_Y, 39, 11, '#845d43');
    rect(322, 896 + SOUTH_LAKE_SHIFT_Y, 30, 7, '#b88756');
    rect(328, 899 + SOUTH_LAKE_SHIFT_Y, 19, 3, '#684e3b');
    rect(330, 893 + SOUTH_LAKE_SHIFT_Y, 4, 11, '#d7bc85');
    rect(340, 893 + SOUTH_LAKE_SHIFT_Y, 4, 11, '#d7bc85');
    rect(354, 894 + SOUTH_LAKE_SHIFT_Y, 21, 2, '#e1c998');
  });
  // Foreground posts and rails still cover feet and fishing line where they cross.
  scenePart('pier-back', 844 + SOUTH_LAKE_SHIFT_Y, () => {
    rect(344, 839 + SOUTH_LAKE_SHIFT_Y, 7, 47, '#71533d'); rect(391, 839 + SOUTH_LAKE_SHIFT_Y, 7, 47, '#71533d');
    rect(344, 832 + SOUTH_LAKE_SHIFT_Y, 7, 10, '#9d7650'); rect(391, 832 + SOUTH_LAKE_SHIFT_Y, 7, 10, '#9d7650');
    rect(345, 835 + SOUTH_LAKE_SHIFT_Y, 53, 4, '#b58a5a');
  });
  scenePart('pier-front', 898 + SOUTH_LAKE_SHIFT_Y, () => {
    rect(344, 875 + SOUTH_LAKE_SHIFT_Y, 7, 19, '#664d3b'); rect(390, 875 + SOUTH_LAKE_SHIFT_Y, 7, 21, '#664d3b');
    rect(432, 878 + SOUTH_LAKE_SHIFT_Y, 7, 20, '#664d3b');
  });
  scenePart('pier-lamp', 848 + SOUTH_LAKE_SHIFT_Y, () => {
    rect(399, 828 + SOUTH_LAKE_SHIFT_Y, 4, 20, '#76583e'); rect(395, 825 + SOUTH_LAKE_SHIFT_Y, 12, 7, '#b66e47');
    rect(398, 828 + SOUTH_LAKE_SHIFT_Y, 6, 5, '#f2d18b');
  });
  // A small lakeside fishing hut and gear make this an obvious destination.
  scenePart('fishing-hut', 898 + SOUTH_LAKE_SHIFT_Y, () => {
    rect(462, 854 + SOUTH_LAKE_SHIFT_Y, 67, 44, '#c9ae7c');
    rect(455, 844 + SOUTH_LAKE_SHIFT_Y, 81, 14, '#a46b4c'); rect(465, 835 + SOUTH_LAKE_SHIFT_Y, 62, 13, '#c3875c');
    rect(472, 862 + SOUTH_LAKE_SHIFT_Y, 20, 18, '#6f9c99'); rect(507, 861 + SOUTH_LAKE_SHIFT_Y, 16, 37, '#7d5e43');
    rect(462, 893 + SOUTH_LAKE_SHIFT_Y, 68, 5, '#8e7250');
  });
  scenePart('fishing-gear', 925 + SOUTH_LAKE_SHIFT_Y, () => {
    rect(471, 908 + SOUTH_LAKE_SHIFT_Y, 7, 17, '#78583e'); rect(477, 906 + SOUTH_LAKE_SHIFT_Y, 30, 5, '#ba925f');
    rect(497, 911 + SOUTH_LAKE_SHIFT_Y, 15, 13, '#9c744e'); rect(500, 908 + SOUTH_LAKE_SHIFT_Y, 9, 4, '#d2a86e');
  });
  for (const [x, y] of [[96, 847], [126, 937], [322, 970], [409, 913]]) {
    scenePart(`lake-stone:${x}:${y}`, y + SOUTH_LAKE_SHIFT_Y + 7, () => {
      rect(x - 10, y + SOUTH_LAKE_SHIFT_Y + 2, 23, 5, '#819a7c');
      rect(x - 8, y + SOUTH_LAKE_SHIFT_Y - 3, 15, 6, '#b8b796');
      rect(x - 3, y + SOUTH_LAKE_SHIFT_Y - 6, 8, 4, '#d4c5a4');
    });
  }
}

function drawFishingSpot(site) {
  const pulse = Math.sin(now * 3 + site.x) * 2;
  const x = site.x, y = site.y;
  rect(x - 13 - pulse, y + 3, 7, 2, '#b4d9c7');
  rect(x + 7 + pulse, y + 3, 7, 2, '#b4d9c7');
  rect(x - 8, y + 7, 17, 2, '#8cbeb8');
  rect(x - 7, y - 2, 14, 5, site.kind === 'gold' ? '#e8c572' : '#a9d7c3');
  rect(x + 5, y - 5, 4, 3, site.kind === 'gold' ? '#ffe6a1' : '#e4e4c0');
  rect(x - 1, y - 12 - Math.abs(Math.sin(now * 2 + x)) * 3, 4, 4, '#fff3c6');
}

function drawLakeDuck(duck) {
  if (sceneQueue) return scenePart(`lake-duck:${duck.x}:${duck.y}`, duck.y + 14, () => drawLakeDuck(duck));
  const x = duck.x, y = duck.y + Math.sin(duck.step) * 1.5 + pausePulse(duck.x,2.1), dir = duck.dir;
  const preen=lakeDuckVisitCompanion(duck),hello=lakeDuckVisitHello()&&lakeDucks.indexOf(duck)===angler.duckVisit.duck;
  const headDip=preen?3+Math.sin(now*2)*1.5:0;
  rect(x - dir * 21, y + 7, 9, 2, '#b8d8c7');
  rect(x - dir * 32, y + 10, 10, 2, '#9dc9bf');
  rect(x - 16, y + 10, 35, 4, '#9bc7b8');
  rect(x - 14, y - 3, 27, 15, duck.color === 'cream' ? '#f1e7c8' : '#b88761');
  rect(x - 17, y - 7, 12, 10, duck.color === 'cream' ? '#faf1d8' : '#cb9a70');
  rect(x + dir * 6 - 5, y - 13+headDip, 14, 13, duck.color === 'cream' ? '#f9efd8' : '#b97959');
  rect(x + dir * 14 - 2, y - 5+headDip, 10, 5, '#dda763');
  if(hello&&Math.sin(now*5)>.2)rect(x+dir*16-2,y-3,8,1,'#705d44');
  rect(x + dir * 10, y - 10+headDip, 3, 3, '#453c35');
  rect(x - 8, y + 2, 13, 4, duck.color === 'cream' ? '#ddd6b4' : '#9b694e');
  if (farm.paused||preen) rect(x - 11, y - 2 + (preen?Math.sin(now*3.2)*1.2:pausePulse(duck.x,2.8)*2), 10, 5, duck.color === 'cream' ? '#ddd6b4' : '#9b694e');
}

function drawSouthernLakeLife() {
  for (const site of farm.fishSpots) drawFishingSpot(site);
  for (const ripple of lakeRipples) {
    const width = 8 + ripple.age * 20;
    rect(ripple.x - width, ripple.y + 7, width * 2, 2, `rgba(228,244,218,${(1 - ripple.age / 1.25).toFixed(2)})`);
  }
  for (const duck of lakeDucks) drawLakeDuck(duck);
  if (sceneSeason.winter < .65) {
    scenePart('lake-frog', 932 + SOUTH_LAKE_SHIFT_Y, () => {
      const frogX = 129 + Math.sin(motionNow * (weatherVisual().rain > .5 ? 1.2 : .48)) * 13;
      const frogY = 923 + SOUTH_LAKE_SHIFT_Y - Math.max(0, Math.sin(motionNow * 1.8)) * 5;
      rect(frogX - 8, frogY + 6, 20, 3, '#55785f');
      rect(frogX - 7, frogY - 1, 16, 10, '#6c9957');
      rect(frogX - 5, frogY - 6, 6, 7, '#83ae67');
      rect(frogX + 4, frogY - 6, 6, 7, '#83ae67');
      rect(frogX - 3, frogY - 4, 2, 2, '#303f33');
      rect(frogX + 6, frogY - 4, 2, 2, '#303f33');
      if (farm.paused) circle(frogX + 1, frogY + 3, 2 + Math.abs(pausePulse(1,2)), '#a8c78c');
    });
    scenePart('lake-air', 0, () => {
      if (farm.phase < NIGHT_START) {
        for (const [baseX, baseY, seed] of [[187, 807, 1], [292, 812, 2]]) {
          const x = baseX + Math.sin(motionNow * 1.3 + seed) * 18;
          const y = baseY + SOUTH_LAKE_SHIFT_Y + Math.cos(motionNow * 1.8 + seed) * 7;
          rect(x - 6, y, 5, 2, '#e4dfb2'); rect(x + 3, y, 5, 2, '#e4dfb2');
          rect(x, y - 1, 3, 7, '#61938a');
          if (farm.paused) rect(x - 7, y + pausePulse(seed,4)*2, 6, 1, '#f1e7c4');
        }
      }
    }, 0, 1);
  }
  // 阿蓼 visits the pier by day and checks the fishing line.
  if (farm.phase < NIGHT_START && !isFestivalDay()
    && !angler.festival && distance(angler, ANGLER_PIER) < 2) {
    scenePart('angler-fishing', actorDepth(angler), () => {
      const { x, y } = anglerPosition();
      rect(x - 5, y + 11, 6, 10, '#604d40'); rect(x + 4, y + 11, 6, 10, '#604d40');
      rect(x - 8, y - 9, 19, 22, '#668e83');
      rect(x - 6, y - 19, 15, 12, '#ddb994');
      rect(x - 10, y - 22, 24, 6, '#aa7754'); rect(x - 2, y - 27, 10, 7, '#b88358');
      if(!anglerQuietAtPier())rect(x - 10, y - 1 + pausePulse(8,1.8)*2, 6, 13, '#d7ad88');
      rect(x - 3, y - 15, 2, 2, '#4b493c');
      const fishing = angler.fishing?.day === farm.day ? angler.fishing : null;
      if(anglerQuietAtPier()){
        drawAnglerAtRest(x,y);return;
      }
      const site = farm.fishSpots.find(fish => fish.id === fishing?.targetId);
      const reel = fishing?.action > 1.8 ? (fishing.action - 1.8) / .6 : 0;
      const rodX = 319 + reel * 20, rodY = 810 + SOUTH_LAKE_SHIFT_Y - reel * 15;
      const cast = site ? Math.min(1, fishing.action / .4) : 1;
      let bobberX = site ? x - 8 + (site.x - x + 8) * cast : 314;
      let bobberY = site ? y + (site.y - y) * cast - Math.sin(cast * Math.PI) * 24 : 863 + SOUTH_LAKE_SHIFT_Y;
      if (reel > 0) {
        bobberX += (x - 8 - bobberX) * reel;
        bobberY += (y + 3 - bobberY) * reel;
      }
      ctx.strokeStyle = '#795d43'; ctx.lineWidth = 3; ctx.beginPath();
      ctx.moveTo(x - 6, y + 1); ctx.lineTo(rodX, rodY + Math.sin(now * .4) * 2); ctx.stroke();
      ctx.strokeStyle = '#ede0bb'; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(rodX, rodY + 1); ctx.lineTo(bobberX, bobberY); ctx.stroke();
      rect(bobberX - 3, bobberY - 3 + Math.sin(now * 2) * 1.2, 6, 8, '#df9873');
      if (site && reel > .3) {
        rect(bobberX - 5, bobberY + 9, 10, 5, site.kind === 'gold' ? '#e7c574' : '#afc4b0');
        rect(bobberX + 5, bobberY + 7, 3, 8, '#e0d5a7');
      }
    });
  }
}
