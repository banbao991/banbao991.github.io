'use strict';
// Pixel cats, sparrows and their little house read the shared daily-life state.
function drawPlazaCatHouse() {
  const s = PLAZA_PET_LAYOUT.house;
  rect(s.left - 3, s.bottom, s.right - s.left + 6, 5, '#566c4550');
  rect(s.left + 3, s.top + 16, s.right - s.left - 6, 22, '#b68b5d');
  rect(s.left + 7, s.top + 18, s.right - s.left - 14, 17, '#d3ad79');
  rect(s.left - 3, s.top + 10, s.right - s.left + 6, 8, '#8b6047');
  rect(s.left + 4, s.top + 4, s.right - s.left - 8, 7, '#ad7754');
  rect(s.left + 15, s.top, s.right - s.left - 30, 5, '#c18d63');
  for (const [index, door] of s.doors.entries()) {
    rect(door.x - 9, s.bottom - 19, 18, 17, '#72533c');
    rect(door.x - 6, s.bottom - 22, 12, 5, '#72533c');
    rect(door.x - 8, s.bottom - 3, 16, 3, '#e0bd83');
    if (plazaCats[index].mode === 'home') {
      const coat = index ? '#514d45' : '#d89b5b';
      rect(door.x - 5, s.bottom - 12, 11, 6, coat);
      rect(door.x - 5, s.bottom - 15, 3, 4, coat); rect(door.x + 3, s.bottom - 15, 3, 4, coat);
      const blink = Math.sin(now * .65 + index * 2) > .97;
      rect(door.x - 3, s.bottom - 10, 2, blink ? 1 : 2, '#dfcb97');
      rect(door.x + 2, s.bottom - 10, 2, blink ? 1 : 2, '#dfcb97');
    }
  }
  // A tiny paw plaque and two bowls identify the house without a floating label.
  rect(s.left + 30, s.top + 12, 12, 8, '#e8d0a0');
  rect(s.left + 34, s.top + 16, 4, 3, '#8e694c');
  rect(s.left + 32, s.top + 13, 2, 2, '#8e694c'); rect(s.left + 38, s.top + 13, 2, 2, '#8e694c');
  rect(s.left + 7, s.bottom + 6, 12, 3, '#99795c'); rect(s.left + 8, s.bottom + 5, 10, 2, '#92b6b0');
  rect(s.right - 19, s.bottom + 6, 12, 3, '#a47d58'); rect(s.right - 18, s.bottom + 5, 10, 2, '#d5b477');
}
function drawPlazaCat(cat) {
  const x = Math.round(cat.x), y = Math.round(cat.y), pose=plazaCatCompanyPose(cat)||cat.mode;
  const orange = cat.coat === 'ginger', white = '#f1e9d5', coat = orange ? '#d8a063' : '#514e47';
  const shade = orange ? '#b17b46' : '#363e39';
  const walking = pose === 'move' || pose === 'return' || pose==='play';
  const leg = walking && !farm.paused ? Math.round(Math.sin(cat.step) * 2) : 0;
  const tail = Math.round(Math.sin(now * 1.3 + x) * 2);
  rect(x - 15, y + 5, 31, 4, '#586b4550');
  if (pose === 'sleep') {
    const curled=(dx,dy,w,h,color)=>rect(x+(cat.dir>0?dx:-dx-w),y+dy,w,h,color);
    curled(-12,-8,26,13,coat); curled(-9,-10,21,4,coat);
    curled(-7,-1,12,6,white); curled(5,-5,10,8,white);
    curled(8,-10,4,6,coat); curled(14,-7,3,5,coat);
    curled(9,-2,5,1,shade); curled(-17,0,9,5,coat);
    if (Math.sin(now * .65 + x) > .7) curled(1,-15,3,2,'#e9d7a755');
  } else {
    const stretch = pose === 'stretch', sitting = pose === 'watch' || pose === 'groom';
    const headX = x + cat.dir * (sitting ? 2 : 12), headY = y - (pose==='drink' ? 5 : sitting ? 15 : stretch ? 5 : 12);
    rect(x - (sitting ? 8 : 14), y - (sitting ? 13 : 9), sitting ? 17 : 28, sitting ? 18 : 13, coat);
    rect(x - 10, y - 1, 20, 7, white);
    rect(x - 11, y + 1, 5, 7 + leg, white); rect(x + 7, y + 1, 5, 7 - leg, white);
    if (orange) { rect(x - 8, y - 9, 3, 6, shade); rect(x + 1, y - 9, 3, 5, shade); }
    else { rect(x - 11, y - 8, 9, 9, '#3f4540'); rect(x + 5, y - 5, 7, 7, '#454a42'); }
    const tailX = x - cat.dir * (sitting ? 10 : 18);
    rect(tailX - (cat.dir > 0 ? 4 : 0), y - 4 + tail, 7, 5, coat);
    rect(tailX - (cat.dir > 0 ? 5 : -3), y - 9 + tail, 4, 7, shade);
    rect(headX - 8, headY, 17, 13, white);
    rect(headX - 8, headY - 5, 5, 7, coat); rect(headX + 4, headY - 5, 5, 7, coat);
    rect(headX - 6, headY - 3, 2, 3, '#c79d88'); rect(headX + 6, headY - 3, 2, 3, '#c79d88');
    rect(headX - 7, headY, 7, 5, coat);
    if (!orange) rect(headX + 3, headY + 1, 5, 5, coat);
    const blink = Math.sin(now * .7 + x) > .985;
    rect(headX - 4, headY + 6, 2, blink ? 1 : 2, '#3f463b');
    rect(headX + 4, headY + 6, 2, blink ? 1 : 2, '#3f463b');
    rect(headX, headY + 9, 2, 2, '#c99889');
    rect(headX - 12, headY + 9, 5, 1, '#baa991'); rect(headX + 9, headY + 9, 5, 1, '#baa991');
    if(pose==='play' && distance(cat,farm.town.catPlay.balls[farm.town.catPlay.ball] || cat)<22)
      rect(headX+cat.dir*4,y+1+Math.round(Math.sin(now*4)*2),7,4,white);
    if(pose==='drink'){rect(headX-3,headY+11,4,1+Math.round((Math.sin(now*7)+1)*.5),'#ce9b8d');}
    if (pose === 'groom') rect(headX - 5, headY + 6 + Math.round(Math.sin(now * 3) * 2), 5, 5, white);
  }
  if (cat.purr > 0) {
    const hy = y - 32 + Math.round(Math.sin(now * 2) * 2);
    rect(x - 2, hy, 3, 3, '#d79a84'); rect(x + 2, hy, 3, 3, '#d79a84');
    rect(x, hy + 2, 3, 4, '#d79a84');
  }
}
function drawPlazaSparrow(bird) {
  const x = Math.round(bird.x), y = Math.round(bird.y - bird.lift);
  const flying = bird.mode === 'fly', peck = bird.mode === 'peck';
  const bob = bird.headBob ?? (peck ? Math.round(Math.max(0, Math.sin(now * 4 + x)) * 3) : 0);
  const headX = x + bird.dir * 4;
  rect(x - 6, y - 8, 12, 8, '#997654'); rect(x - 4, y - 3, 8, 5, '#dcc498');
  rect(x - bird.dir * 9, y - 4, 6, 3, '#786449');
  rect(headX - 4, y - 13 + bob, 8, 8, '#a3835e');
  rect(headX - 3, y - 10 + bob, 7, 3, '#d8c29a');
  rect(headX + bird.dir * 2, y - 10 + bob, 2, 2, '#3b4035');
  rect(headX + bird.dir * 5, y - 8 + bob, 3, 2, '#caab68');
  if (flying) {
    const wing = Math.round(Math.sin(farm.paused ? now * 3 + x : bird.step * 2) * (farm.paused ? 2 : 6));
    rect(x - 11, y - 9 - wing, 9, 4, '#bb9870'); rect(x + 3, y - 9 + wing, 9, 4, '#bb9870');
  } else {
    rect(x - 4, y, 2, 4, '#a78d62'); rect(x + 3, y, 2, 4, '#a78d62');
    const fluff = bird.mode === 'preen' || farm.paused ? Math.round(Math.sin(now * 2 + x) * 2) : 0;
    rect(x - 7, y - 6 + fluff, 6, 5, '#b39166');
  }
}
function plazaLifeSceneItems() {
  const items = [{ id: 'cat-house', y: PLAZA_PET_LAYOUT.house.bottom + 8, draw: drawPlazaCatHouse }];
  for (const cat of plazaCats) if (plazaCatVisible(cat)) items.push({ id: `plaza-cat:${cat.name}`, y: cat.y + 9, order: 10, draw: () => drawPlazaCat(cat) });
  for (const bird of plazaSparrows) if (plazaSparrowVisible(bird) && bird.mode !== 'fly') {
    const site = PLAZA_PET_LAYOUT.birdSites[bird.site];
    const supports = { well: CENTRAL_PLAZA.well.y + 31, stage: CENTRAL_PLAZA.stage.y + 22,
      roof: PLAZA_PET_LAYOUT.house.bottom + 8 };
    items.push({ id: `plaza-sparrow:${plazaSparrows.indexOf(bird)}`, y: supports[site?.kind] != null
      ? supports[site.kind] + 1 : site?.depth ?? bird.y + 5, order: 30, draw: () => drawPlazaSparrow(bird) });
  }
  return items;
}
function drawPlazaFlyingSparrows() {
  for (const bird of plazaSparrows) if (bird.mode === 'fly') drawPlazaSparrow(bird);
}
