'use strict';
// The small valley lake is a separate habitat with slower, quieter routines.
let valleyOtter, valleyTurtle, valleyHeron, valleyShoal, valleyRipples;

function valleyWaterTarget(radius = .55) {
  const angle = rand(0, Math.PI * 2), distance = Math.sqrt(Math.random()) * radius;
  return { x: 195 + Math.cos(angle) * 121 * distance, y: 1220 + Math.sin(angle) * 70 * distance };
}
function valleyMove(actor, dt, speed) {
  const dx = actor.tx - actor.x, dy = actor.ty - actor.y, distance = Math.hypot(dx, dy);
  if (distance < 3) return true;
  const step = Math.min(distance, speed * dt);
  actor.x += dx / distance * step;
  actor.y += dy / distance * step;
  if (Math.abs(dx) > 1) actor.dir = dx < 0 ? -1 : 1;
  return false;
}
function valleyRipple(x, y) { valleyRipples.push({ x, y, age: 0 }); }
function resetValleyLife() {
  valleyOtter = { x: 155, y: 1202, tx: 224, ty: 1235, wait: 0, dive: 0, dir: 1, step: 0 };
  valleyTurtle = { x: 251, y: 1241, tx: 225, ty: 1254, wait: 1, hide: 0, dir: -1, step: 0, bask: makeTurtleBask() };
  valleyHeron = { x: 294, y: 1187, tx: 284, ty: 1180, wait: 1, flap: 0, dir: -1, step: 0,fishing:makeHeronFishing() };
  valleyShoal = { x: 218, y: 1260, tx: 181, ty: 1245, scatter: 0, wait: 0, dir: -1, step: 0 };
  valleyRipples = [];
}
function valleyCreatureAt(x, y) {
  const heron = valleyHeron;
  if ((Math.abs(x - heron.x) < (heron.flap > 0 ? 26 : 22) && y >= heron.y - 45 && y <= heron.y + 14) || heronFishingHeadHit(x,y)) return { kind: 'heron', actor: heron };
  const otter = valleyOtter;
  if (otter.dive <= 0 && Math.abs(x - otter.x) < 37 && y >= otter.y - 21 && y <= otter.y + 16) return { kind: 'otter', actor: otter };
  const turtle = valleyTurtle;
  if (Math.abs(x - turtle.x) < 25 && Math.abs(y - turtle.y) < 17) return { kind: 'turtle', actor: turtle };
  const shoal = valleyShoal;
  if (Math.abs(x - shoal.x) < 32 && Math.abs(y - shoal.y) < 22) return { kind: 'shoal', actor: shoal };
  return null;
}
function valleyCreatureHint(creature) {
  return {
    heron: `西南小湖 · 苍鹭${heronFishingActivity()} · 点击看它振翅`,
    otter: '西南小湖 · 水獭在水中游玩 · 点击看它潜水',
    turtle: `西南小湖 · 乌龟${turtleBaskActivity()} · 点击打招呼`,
    shoal: '西南小湖 · 一群小鱼 · 点击看它们散开'
  }[creature.kind];
}
function scatterValleyShoal(source=valleyOtter) {
  valleyShoal.scatter = 2.4;
  const away = Math.atan2(valleyShoal.y - source.y, valleyShoal.x - source.x);
  const angle = Number.isFinite(away) ? away + rand(-.5, .5) : rand(0, Math.PI * 2);
  valleyShoal.tx = clamp(valleyShoal.x + Math.cos(angle) * 36, 146, 246);
  valleyShoal.ty = clamp(valleyShoal.y + Math.sin(angle) * 22, 1190, 1259);
}
function interactValleyCreature(creature) {
  if (creature.kind === 'otter') {
    valleyOtter.dive = 1.7;
    valleyOtter.wait = 0;
    const next = valleyWaterTarget(.57); valleyOtter.tx = next.x; valleyOtter.ty = next.y;
    valleyRipple(valleyOtter.x, valleyOtter.y);
    record('水獭打了个滚，潜进西南小湖，留下一圈泡泡。');
  } else if (creature.kind === 'turtle') {
    valleyTurtle.hide = 2.8;
    if(!turtleBaskOnLand())valleyRipple(valleyTurtle.x, valleyTurtle.y);
    record(turtleBaskOnLand()?'晒背的小乌龟缩进壳里，过一会儿再探头看看。':'小乌龟缩进壳里，等水面安静下来再探头。');
  } else if (creature.kind === 'heron') {
    stopHeronFishing();
    valleyHeron.flap = 2;
    valleyHeron.wait = 0;
    valleyHeron.tx = 300; valleyHeron.ty = 1207;
    record('苍鹭轻轻振翅，沿着浅水走向另一丛芦苇。');
  } else {
    scatterValleyShoal();
    valleyRipple(valleyShoal.x, valleyShoal.y);
    record('小鱼们忽地四散，过一会儿又会聚到一起。');
  }
  save();
}
function updateValleyLife(dt) {
  if(farm.paused)return;
  const night = farm.phase >= NIGHT_START, rain = weatherVisual().rain;
  const otter = valleyOtter, turtle = valleyTurtle, heron = valleyHeron, shoal = valleyShoal;
  otter.step += dt * 5; otter.dive = Math.max(0, otter.dive - dt); otter.wait -= dt;
  if (night || rain > .75) { otter.tx = 143; otter.ty = 1195; }
  else if (valleyMove(otter, dt, otter.dive > 0 ? 38 : 19) && otter.wait <= 0) {
    const target = valleyWaterTarget(.58); otter.tx = target.x; otter.ty = target.y; otter.wait = rand(.4, 1.8);
  }
  if (night || rain > .75) valleyMove(otter, dt, 17);
  turtle.step += dt; turtle.hide = Math.max(0, turtle.hide - dt); turtle.wait -= dt;
  if (rain > .7) turtle.hide = Math.max(turtle.hide, .35);
  const basking=updateTurtleBask(dt);
  if (!basking) {
    if (night) { turtle.tx = 260; turtle.ty = 1238; }
    else if (valleyMove(turtle, dt, 5.5) && turtle.wait <= 0) {
      const target = valleyWaterTarget(.55); turtle.tx = target.x; turtle.ty = target.y; turtle.wait = rand(1.5, 3.5);
    }
    if (night) valleyMove(turtle, dt, 5.5);
  }
  heron.step += dt; heron.flap = Math.max(0, heron.flap - dt); heron.wait -= dt;
  const fishing=updateHeronFishing(dt);
  if(!fishing){
  if (night || rain > .75) { heron.tx = 299; heron.ty = 1180; }
  else if (valleyMove(heron, dt, 7) && heron.wait <= 0) {
    const spots = [[294, 1187], [302, 1207], [277, 1194], [283, 1177]];
    const [x, y] = spots[Math.floor(rand(0, spots.length))];
    heron.tx = x; heron.ty = y; heron.wait = rand(1.8, 3.7);
  }
  if (night || rain > .75) valleyMove(heron, dt, 8);
  }
  shoal.step += dt * (shoal.scatter > 0 ? 13 : 5);
  shoal.scatter = Math.max(0, shoal.scatter - dt); shoal.wait -= dt;
  if (!night && otter.dive <= 0 && Math.hypot(shoal.x - otter.x, shoal.y - otter.y) < 38 && shoal.scatter <= 0) scatterValleyShoal();
  if (valleyMove(shoal, dt, shoal.scatter > 0 ? 32 : night ? 5 : 11) && shoal.wait <= 0) {
    const target = valleyWaterTarget(.43); shoal.tx = target.x; shoal.ty = target.y; shoal.wait = rand(.5, 1.6);
  }
  valleyRipples = valleyRipples.filter(ripple => (ripple.age += dt) < 1.4);
}
resetValleyLife();
