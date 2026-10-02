'use strict';
// Forest forage, squirrels and 阿森 painting.
function drawForage(site) {
  if (sceneQueue) return scenePart(`forage:${site.id}`, site.y + 11, () => drawForage(site));
  const x = site.x, y = site.y;
  rect(x - 15, y + 8, 30, 3, '#405c4655');
  if (site.kind === 'mushroom') {
    for (const [dx, size] of [[-8, 7], [4, 10]]) {
      rect(x + dx - 2, y - size + 3, 5, size + 5, '#e9d9b8');
      rect(x + dx - size / 2, y - size, size + 5, 5, '#c97d5d');
      rect(x + dx - size / 2 + 3, y - size - 4, size - 1, 5, '#df9870');
      rect(x + dx, y - size - 2, 3, 2, '#f9dfb7');
    }
  } else if (site.kind === 'berry') {
    rect(x - 2, y - 13, 4, 24, '#587d49');
    for (const [dx, dy] of [[-9, -8], [4, -14], [-4, -18], [9, -4]]) {
      rect(x + dx - 5, y + dy - 3, 11, 7, '#5d8f52');
      rect(x + dx - 2, y + dy - 5, 8, 4, '#83ac62');
      circle(x + dx + 1, y + dy + 3, 3, '#b95059');
    }
  } else {
    rect(x - 7, y - 1, 15, 10, '#b17d4b');
    rect(x - 10, y - 5, 21, 7, '#785b3c');
    rect(x - 4, y - 10, 7, 6, '#e7c177');
    circle(x + 12, y - 15 + Math.sin(now * 3) * 2, 2, '#f7e5a1');
  }
}

function drawSquirrel() {
  if (sceneQueue) return scenePart('squirrel', squirrel.y + 13, () => drawSquirrel());
  if (farm.phase >= NIGHT_START && Math.hypot(squirrel.x - 1126, squirrel.y - 401) < 10) return;
  const hop = squirrel.moving ? Math.abs(Math.sin(squirrel.step)) * 5 : 0;
  const x = squirrel.x, y = squirrel.y - hop, dir = squirrel.dir;
  rect(x - 12, squirrel.y + 10, 29, 4, '#425f4866');
  circle(x - dir * 13, y - 11, 11, '#a66a46');
  circle(x - dir * 17, y - 17 + pausePulse(x,2.4)*2, 8, '#c48450');
  circle(x - dir * 16, y - 17, 4, '#dfad71');
  rect(x - 7, y - 8, 16, 17, '#b8784a');
  rect(x + dir * 6 - 5, y - 15, 14, 13, '#c88955');
  rect(x + dir * 10 - 2, y - 19, 4, 7, '#8b583e');
  rect(x + dir * 9, y - 10, 3, 3, '#453b35');
  rect(x + dir * 9, y - 4, 4, 3, '#f0d5a0');
  rect(x - 5, y + 8, 5, 5, '#785b44');
  rect(x + 4, y + 8 + (squirrel.moving ? Math.sin(squirrel.step) * 2 : 0), 5, 5, '#785b44');
  if (squirrel.excited > 0) {
    rect(x - 1, y - 29, 4, 4, '#e3a57e');
    rect(x + 5, y - 25, 3, 3, '#f1d4a3');
  }
}

function drawForestKeeper() {
  const actor = forestKeeper, picking = actor.mode === 'picking' && !isFestivalDay();
  const dip = picking ? Math.sin(Math.min(1, actor.action / 1.2) * Math.PI) * 5 : 0;
  worker({ ...actor, y: actor.y + dip, shirt: '#8b9670', hat: '#b4865d', gardenTending: picking });
  if (isFestivalDay()) return;
  const x = Math.round(actor.x), y = Math.round(actor.y + dip);
  rect(x - 16, y + 7, 9, 12, '#9b7248'); rect(x - 17, y + 5, 11, 3, '#d7ae73');
  if (actor.choice === 'gather') for (let i = 0; i < Math.min(3, actor.picked); i++) {
    rect(x - 15 + i * 3, y + 4 - i % 2, 2, 4, '#e7d3a1'); rect(x - 16 + i * 3, y + 3 - i % 2, 4, 2, '#bb7857');
  }
}
