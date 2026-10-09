'use strict';
// Perched birds inherit the support's depth; flight uses the air layer; butterflies inherit a flower head when sipping.
function drawTownEcology() {
  const nest = TOWN_LAYOUT.birdhouse;
  if (villageSiteOpen('herbs') && farm.town.inventory.birdNest) scenePart('town-birdhouse', nest.y + 8, () => {
    rect(nest.x - 3, nest.y - 30, 6, 38, '#886949'); rect(nest.x - 13, nest.y - 48, 26, 24, '#be9969');
    rect(nest.x - 17, nest.y - 51, 34, 6, '#865f45'); rect(nest.x - 11, nest.y - 57, 22, 7, '#a87951');
    rect(nest.x - 4, nest.y - 41, 8, 8, '#6c5740'); rect(nest.x - 8, nest.y - 26, 16, 3, '#d8b985');
    rect(nest.x + 12, nest.y + 3, 24, 4, '#a89d76'); drawTownBirdBathWater();
  });
  drawTownCatToys();
  for (const bird of farm.town.birds) {
    const perch = bird.mode === 'perch';
    const depth = bird.variant === 1 ? nest.y + 9 : TOWN_LAYOUT.feeding.y + 6;
    scenePart(`town-bird:${bird.id}`, perch ? depth : bird.y, () => drawTownBird(bird), 30, perch ? 0 : 1);
  }
  drawTownButterflies();
}
function drawTownBird(bird) {
  if (!bird.variant) {
    drawPlazaSparrow({ ...bird, lift: 0, mode: bird.mode === 'perch' ? 'preen' : 'fly', headBob:townBirdMealHeadBob(bird) });
    return;
  }
  ctx.save();
  try {
    ctx.translate(Math.round(bird.x),Math.round(bird.y));
    ctx.scale(bird.dir===1?-1:1,1);
    drawTownBirdPixels(bird);
  } finally {ctx.restore();}
}
function drawTownBirdPixels(bird) {
  const x=0,y=0;
  if (bird.variant===2) {
    const peck=townBirdMealHeadBob(bird);
    rect(x-6,y-7,13,9,'#a69b83');rect(x-8,y-9+peck,9,8,'#b7a184');
    rect(x-7,y-5+peck,9,6,'#cf956d');rect(x-5,y-7+peck,2,2,'#485545');
    rect(x-11,y-5+peck,4,2,'#9b7955');rect(x+6,y-3,6,3,'#9c9076');
    if(bird.mode==='perch'){rect(x-2,y+2,2,3,'#9c8259');rect(x+3,y+2,2,3,'#9c8259');}
    else rect(x,y-10-Math.sin(farm.paused?now*2:bird.step)*4,9,4,'#c6b799');
    return;
  }
  if (bird.mode === 'dive' && distance(bird, bird.target) < 2) {
    rect(x - 11, y + 3, 24, 2, '#a8cec5'); rect(x - 6, y, 13, 2, '#d3e2c9');
    return;
  }
  rect(x - 8, y - 7, 16, 10, '#508f96'); rect(x - 4, y - 3, 10, 7, '#c5a370');
  rect(x - 10, y - 13, 12, 9, '#65a7ab'); rect(x - 12, y - 9, 4, 3, '#3e5c59');
  rect(x - 17, y - 8, 8, 3, '#7c6950'); rect(x - 7, y - 10, 2, 2, '#334b45');
  rect(x + 6, y - 4, 9, 3, '#5c8786');
  if (bird.mode !== 'perch') {
    const wing = Math.sin(farm.paused ? now * 2 : bird.step) * 5;
    rect(x - 5, y - 10 - wing, 12, 4, '#82b6b0');
  } else rect(x - 3, y + 2, 2, 4, '#9c8259');
}
