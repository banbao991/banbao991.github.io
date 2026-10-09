'use strict';
// Hand-drawn pixel creatures and small details unique to the southernmost lake.
function drawValleyScenery() {
  for (const [x, y, h] of [[89, 1207, 18], [101, 1260, 24], [131, 1280, 18], [250, 1156, 22], [309, 1221, 19], [279, 1272, 24]]) {
    rect(x - 4, y + 2, 15, 4, '#698a73');
    rect(x, y - h, 3, h + 3, '#597f57');
    rect(x + 6, y - h + 5, 3, h - 3, '#72985e');
    rect(x - 3, y - h + 10, 9, 3, '#93ad68');
    rect(x + 3, y - h - 4, 5, 8, '#a87551');
  }
  for (const [x, y, bloom] of [[119, 1230, true], [164, 1268, false], [244, 1190, true], [265, 1259, false]]) {
    rect(x - 10, y + 4, 25, 3, '#5c8d8b');
    rect(x - 8, y - 2, 20, 8, blendHex('#81a669', '#a9c2b1', sceneSeason.winter));
    rect(x - 1, y - 5, 11, 4, blendHex('#9abc7d', '#c9d6c8', sceneSeason.winter));
    if (bloom) {
      rect(x + 1, y - 11, 5, 9, '#f3d1bf');
      rect(x - 3, y - 8, 11, 4, '#f8e6d7');
      rect(x + 2, y - 7, 3, 3, '#efbc72');
    }
  }
  drawTurtleBaskRock();
  // Scattered stones mark the upper bank without covering the heron's feeding area.
  for (const [x, y] of [[115, 1159], [281, 1154], [310, 1262]]) {
    rect(x - 8, y + 3, 23, 4, '#709073');
    rect(x - 6, y - 1, 17, 6, '#b7b89d');
    rect(x - 2, y - 4, 9, 4, '#d4d1b5');
  }
}
function drawTurtleBaskRock(){
 const {x,y}=VALLEY_TURTLE_BASK.rock;
 scenePart('valley-turtle-rock',y+9,()=>{
  rect(x-22,y+7,45,4,'#708876');rect(x-20,y-1,40,10,'#a7aa92');
  rect(x-16,y-7,32,11,blendHex('#d0c8a4','#dae1d8',sceneSeason.winter));
  rect(x-12,y-6,18,3,'#dfd5b2');rect(x+10,y+2,5,3,'#8b9983');
 });
}
function drawValleyShoal() {
  if (sceneQueue) return scenePart('valley-shoal', valleyShoal.y + 12, () => drawValleyShoal());
  const school = valleyShoal, x = school.x, y = school.y;
  const finStep = school.step + (farm.paused ? now * .8 : 0);
  const spread = 1 + Math.min(.55, school.scatter * .28);
  for (const [i, dx, dy] of [[0, -11, -3], [1, 4, 3], [2, 13, -5], [3, -2, -9], [4, -15, 8]]) {
    const sway = Math.sin(finStep + i * 2) * 2;
    const fx = x + dx * spread + sway, fy = y + dy * spread + Math.cos(finStep * .6 + i) * 1.5;
    rect(fx - 6, fy + 4, 15, 2, '#4d898d');
    rect(fx - 4, fy, 9, 4, i === 2 ? '#dfbe7e' : '#b6d4bd');
    rect(fx - school.dir * 6 - 2, fy + 1, 4, 2, i === 2 ? '#d1a66a' : '#94b7ae');
    rect(fx + school.dir * 3, fy + 1, 2, 1, '#48615b');
  }
}
function drawValleyOtter() {
  if (sceneQueue) return scenePart('valley-otter', valleyOtter.y + 14, () => drawValleyOtter());
  const o = valleyOtter, x = o.x, y = o.y + Math.sin(o.step) * 1.4 + pausePulse(o.x,1.8);
  rect(x - 25, y + 10, 53, 3, '#a8cbbd');
  rect(x - 35, y + 13, 12, 2, '#bad8c7');
  rect(x + 23, y + 14, 12, 2, '#bad8c7');
  if (o.dive > 0) {
    for (const [dx, dy, r] of [[-7, -4, 3], [6, -13, 4], [16, -5, 2]]) circle(x + dx, y + dy - (1.7 - o.dive) * 5, r, '#d8ece0');
    return;
  }
  rect(x - o.dir * 30, y + 3 + pausePulse(o.x,2.4)*2, 17, 6, '#76543d');
  rect(x - 19, y - 6, 34, 17, '#76513d');
  rect(x - 15, y - 8, 27, 14, '#91634b');
  rect(x - 7, y + 3, 18, 5, '#c9a67d');
  rect(x + o.dir * 8 - 7, y - 16, 19, 17, '#906148');
  rect(x + o.dir * 3 - 5, y - 18, 7, 6, '#76513d');
  rect(x + o.dir * 14 - 4, y - 17, 7, 6, '#76513d');
  rect(x + o.dir * 16 - 4, y - 5, 8, 5, '#d5ad84');
  rect(x + o.dir * 13, y - 11, 3, 3, '#352e2d');
  rect(x + o.dir * 19, y - 5, 3, 2, '#43322f');
}
function drawValleyTurtle() {
  if (sceneQueue) return scenePart('valley-turtle', valleyTurtle.y + 11, () => drawValleyTurtle());
  const t = valleyTurtle, x = t.x, y = t.y + Math.sin(t.step * 1.5) * .8 + pausePulse(t.x,1.3)*.8;
  rect(x - 22, y + 8, 47, 3, turtleBaskOnLand()?'#899379':'#a2c6b4');
  rect(x - 14, y + 5, 30, 4, '#618777');
  rect(x - 14, y - 5, 29, 14, '#5c7551');
  rect(x - 10, y - 10, 21, 17, '#789159');
  rect(x - 5, y - 12, 11, 6, turtleBasking()?'#c3c17a':'#a6af69');
  rect(x - 8, y - 4, 6, 5, '#9daa67');
  rect(x + 4, y - 4, 7, 5, '#9daa67');
  if (t.hide <= 0) {
    const nod = pausePulse(t.x,1.5)*2;
    rect(x + t.dir * 14 - 4, y - 4 + nod, 13, 9, '#8faa69');
    rect(x + t.dir * 21 - 3, y - 3 + nod, 6, 5, '#a7be7d');
    const blink=turtleBasking()&&Math.sin(now*1.3)> .96;
    rect(x + t.dir * 21, y - 2 + nod, 2, blink?1:2, '#344239');
  }
  rect(x - 10, y + 7, 5, 4, '#668657'); rect(x + 7, y + 7, 5, 4, '#668657');
}
function drawValleyHeron() {
  if (sceneQueue) return scenePart('valley-heron', valleyHeron.y + 11, () => drawValleyHeron());
  const h = valleyHeron, x = h.x, y = h.y;
  rect(x - 10, y + 8, 22, 3, '#618f8a');
  rect(x - 8, y + 4, 5, 5, '#b8c7ba'); rect(x + 4, y + 4, 5, 5, '#b8c7ba');
  rect(x - 5, y - 11, 2, 20, '#9d7658'); rect(x + 4, y - 10, 2, 19, '#9d7658');
  rect(x - 10, y - 25, 20, 18, '#b8c5b8');
  rect(x - 7, y - 29, 14, 18, '#d8dac6');
  if (h.flap > 0) {
    const lift = Math.abs(Math.sin(farm.paused ? now * 4 : h.step * 12)) * 12;
    rect(x - 22, y - 37 - lift, 18, 9, '#b8c5b8');
    rect(x + 5, y - 37 - lift, 19, 9, '#b8c5b8');
  } else {
    rect(x - 10, y - 16, 9, 11, '#8ea8a0');
    rect(x + 5, y - 15, 7, 10, '#8ea8a0');
  }
  if(drawHeronFishingHead())return;
  const headNod = pausePulse(h.x,1.4)*2;
  rect(x + h.dir * 4 - 2, y - 39 + headNod, 8, 22, '#d6d9c8');
  rect(x + h.dir * 7 - 5, y - 42 + headNod, 12, 8, '#e6e5d4');
  rect(x + h.dir * 16 - 2, y - 39 + headNod, 17, 3, '#d7af70');
  rect(x + h.dir * 9, y - 40 + headNod, 2, 2, '#343a37');
}
function drawValleyLife() {
  for (const ripple of valleyRipples) {
    const width = 7 + ripple.age * 19;
    rect(ripple.x - width, ripple.y + 9, width * 2, 2, `rgba(215,238,217,${(1 - ripple.age / 1.4).toFixed(2)})`);
  }
  drawValleyShoal(); drawValleyOtter(); drawValleyTurtle(); drawValleyHeron();
  scenePart('valley-lake-air', 0, () => {
    if (sceneSeason.winter < .7 && weatherVisual().rain < .65 && farm.phase < NIGHT_START) {
      for (const [baseX, baseY, seed] of [[128, 1184, 1], [226, 1169, 2], [290, 1244, 3]]) {
        const x = baseX + Math.sin(motionNow * 1.5 + seed) * 10, y = baseY + Math.cos(motionNow * 2 + seed) * 5;
        rect(x - 6, y, 5, 2, '#f3e1bd'); rect(x + 3, y, 5, 2, '#f3e1bd'); rect(x, y - 2, 3, 7, '#7a9c8e');
        if (farm.paused) rect(x - 7, y + pausePulse(seed,4)*2, 6, 1, '#f9e7c4');
      }
    }
  }, 0, 1);
}
