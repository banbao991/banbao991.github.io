'use strict';
// The northeastern ridge has a daylight clearing and an owl's night route.
let ridgeDeer, ridgeHare, ridgeOwl;

function ridgeForageClear(x, y) {
  return RIDGE_DEER_SPOTS.some(([px, py]) => Math.hypot(px - x, py - y) < 70)
    || RIDGE_HARE_SPOTS.some(([px, py]) => Math.hypot(px - x, py - y) < 52)
    || RIDGE_OWL_PERCHES.some(perch => Math.hypot(x - perch.x, y - perch.baseY) < 47);
}

function resetRidgeLife() {
  ridgeDeer = { x: 1494 + RIDGE_SHIFT, y: 192, tx: 1441 + RIDGE_SHIFT, ty: 207, wait: 0, step: 0, dir: -1, startled: 0, grazing: false };
  ridgeHare = { x: 1490 + RIDGE_SHIFT, y: 483, tx: 1530 + RIDGE_SHIFT, ty: 431, wait: .4, step: 0, dir: 1, startled: 0, hidden: false };
  ridgeOwl = { x: RIDGE_OWL_HOME.x, y: RIDGE_OWL_HOME.y, tx: RIDGE_OWL_HOME.x, ty: RIDGE_OWL_HOME.y,
    wait: 0, step: 0, dir: -1, flapping: 0, flying: false,
    perchIndex: 0, targetIndex: 0, patrolDay: farm.day - 1 };
}
function ridgeOwlPerch() {
  return RIDGE_OWL_PERCHES[ridgeOwl.perchIndex];
}
function ridgeOwlPerchAt(x, y) {
  return RIDGE_OWL_PERCHES.find(perch => Math.abs(x - perch.x) <= ({ maple: 55, elm: 47, birch: 47, spruce: 35 }[perch.kind] || 37)
    && y >= perch.y - 120 && y <= perch.baseY + 8) || null;
}
function chooseRidgeOwlPerch(randomValue = Math.random()) {
  const choices = RIDGE_OWL_PERCHES.filter((_, index) => index !== ridgeOwl.perchIndex);
  const target = choices[Math.min(choices.length - 1, Math.floor(randomValue * choices.length))];
  ridgeOwl.targetIndex = RIDGE_OWL_PERCHES.indexOf(target);
  ridgeOwl.tx = target.x;
  ridgeOwl.ty = target.y;
  return target;
}
function refreshRidgeOwlRoute() {
  const oldRoute = !Number.isInteger(ridgeOwl.patrolDay);
  const nearest = RIDGE_OWL_PERCHES.reduce((best, perch, index) =>
    Math.hypot(ridgeOwl.x - perch.x, ridgeOwl.y - perch.y) < Math.hypot(ridgeOwl.x - RIDGE_OWL_PERCHES[best].x, ridgeOwl.y - RIDGE_OWL_PERCHES[best].y)
      ? index : best, 0);
  if (!Number.isInteger(ridgeOwl.perchIndex) || !RIDGE_OWL_PERCHES[ridgeOwl.perchIndex]) ridgeOwl.perchIndex = nearest;
  if (oldRoute) ridgeOwl.patrolDay = farm.phase >= NIGHT_START ? farm.day : farm.day - 1;
  const targetIndex = RIDGE_OWL_PERCHES.findIndex(perch => perch.x === ridgeOwl.tx && perch.y === ridgeOwl.ty);
  if (targetIndex >= 0 && !(oldRoute && farm.phase < NIGHT_START)) {
    ridgeOwl.targetIndex = targetIndex;
    return;
  }
  ridgeOwl.wait = 0;
  ridgeOwl.perchIndex = nearest;
  ridgeOwl.targetIndex = ridgeOwl.perchIndex;
  ridgeOwl.tx = RIDGE_OWL_PERCHES[ridgeOwl.perchIndex].x;
  ridgeOwl.ty = RIDGE_OWL_PERCHES[ridgeOwl.perchIndex].y;
  ridgeOwl.flying = Math.hypot(ridgeOwl.tx - ridgeOwl.x, ridgeOwl.ty - ridgeOwl.y) > 3;
}
function ridgeTarget(actor, spots) {
  const alternatives = spots.filter(([x, y]) => Math.hypot(x - actor.x, y - actor.y) > 15);
  const [x, y] = alternatives[Math.floor(rand(0, alternatives.length))];
  actor.tx = x; actor.ty = y;
}
function ridgeStep(actor, dt, speed) {
  const dx = actor.tx - actor.x, dy = actor.ty - actor.y, distance = Math.hypot(dx, dy);
  if (distance <= 3) return true;
  const step = Math.min(distance, speed * dt);
  actor.x += dx / distance * step;
  actor.y += dy / distance * step;
  if (Math.abs(dx) > 1) actor.dir = dx < 0 ? -1 : 1;
  return false;
}
function ridgeAnimalAt(x, y) {
  if (Math.abs(x - ridgeDeer.x) < 43 && y >= ridgeDeer.y - 53 && y <= ridgeDeer.y + 16) return { kind: 'deer', actor: ridgeDeer };
  if (Math.abs(x - ridgeHare.x) < 22 && y >= ridgeHare.y - 30 && y <= ridgeHare.y + 15) return { kind: 'hare', actor: ridgeHare };
  if (Math.abs(x - ridgeOwl.x) < (ridgeOwl.flying ? 31 : 18) && y >= ridgeOwl.y - 34 && y <= ridgeOwl.y + 13) return { kind: 'owl', actor: ridgeOwl };
  return null;
}
function ridgeAnimalHint(creature) {
  if (creature.kind === 'deer') return `北岭小鹿 · ${ridgeDeer.grazing ? '低头啃着嫩草' : '在林间空地散步'} · 点击打招呼`;
  if (creature.kind === 'hare') return `北岭野兔 · ${ridgeHare.hidden ? '躲在草丛里' : '在灌木间跳跃'} · 点击看它蹦跳`;
  return `北岭猫头鹰 · ${ridgeOwl.targetIndex !== ridgeOwl.perchIndex ? '正在夜空巡飞' : ridgeOwl.flying ? '正在树梢展翅' : `停在${ridgeOwlPerch().name}枝上`} · 点击看它展翅`;
}
function interactRidgeAnimal(creature) {
  if (creature.kind === 'deer') {
    ridgeDeer.startled = 2.2; ridgeDeer.wait = 0; ridgeDeer.grazing = false;
    ridgeTarget(ridgeDeer, RIDGE_DEER_SPOTS);
    record('北岭小鹿抬起头，轻轻跃向另一片青草地。');
  } else if (creature.kind === 'hare') {
    ridgeHare.startled = 2.4; ridgeHare.wait = 0; ridgeHare.hidden = false;
    ridgeTarget(ridgeHare, RIDGE_HARE_SPOTS);
    record('野兔竖起长耳朵，一蹦一跳地钻进另一丛草里。');
  } else {
    if (ridgeOwl.targetIndex !== ridgeOwl.perchIndex) {
      ridgeOwl.step += 1;
      record('猫头鹰振了振翅，继续飞向今晚选中的树。');
    } else {
      ridgeOwl.flapping = 2.5;
      ridgeOwl.flying = true;
      record(`猫头鹰从${ridgeOwlPerch().name}枝上展翅，很快又会回来。`);
    }
  }
}
function updateRidgeLife(dt) {
  const night = farm.phase >= NIGHT_START, rain = weatherVisual().rain;
  const deer = ridgeDeer, hare = ridgeHare, owl = ridgeOwl;
  deer.step += dt * (deer.startled > 0 ? 10 : 3);
  deer.startled = Math.max(0, deer.startled - dt);
  deer.wait = Math.max(0, deer.wait - dt);
  if ((night || rain > .75) && deer.startled <= 0) { deer.tx = 1550 + RIDGE_SHIFT; deer.ty = 185; deer.wait = 0; }
  deer.grazing = deer.wait > 0 && deer.startled <= 0;
  if (deer.wait <= 0 && ridgeStep(deer, dt, deer.startled > 0 ? 31 : 10)) {
    if (!night && rain <= .75) { ridgeTarget(deer, RIDGE_DEER_SPOTS); deer.wait = rand(1.2, 3); }
  }

  hare.step += dt * (hare.startled > 0 ? 15 : 7);
  hare.startled = Math.max(0, hare.startled - dt);
  hare.wait = Math.max(0, hare.wait - dt);
  const owlNear = owl.flying && Math.hypot(hare.x - owl.x, hare.y - owl.y) < 95;
  hare.hidden = rain > .75 || owlNear || (night && Math.hypot(hare.x - (1573 + RIDGE_SHIFT), hare.y - 485) < 12);
  if ((night || rain > .75 || owlNear) && hare.startled <= 0) { hare.tx = 1573 + RIDGE_SHIFT; hare.ty = 485; hare.wait = 0; }
  if (hare.wait <= 0 && ridgeStep(hare, dt, hare.startled > 0 || owlNear ? 41 : 23)) {
    if (!night && rain <= .75 && !owlNear) { ridgeTarget(hare, RIDGE_HARE_SPOTS); hare.wait = rand(.4, 1.8); }
  }

  if (night && owl.patrolDay !== farm.day) {
    owl.patrolDay = farm.day;
    owl.flapping = 0;
    chooseRidgeOwlPerch();
  }
  owl.step += dt * (owl.flying || owl.flapping > 0 ? 13 : 2);
  if (owl.targetIndex !== owl.perchIndex || (owl.flapping <= 0 && Math.hypot(owl.tx - owl.x, owl.ty - owl.y) > 3)) {
    owl.flying = true;
    ridgeStep(owl, dt, 41);
    if (Math.hypot(owl.tx - owl.x, owl.ty - owl.y) <= 3) {
      owl.x = owl.tx; owl.y = owl.ty;
      owl.perchIndex = owl.targetIndex;
      owl.flapping = 0;
      owl.flying = false;
    }
  } else if (owl.flapping > 0) {
    owl.flapping = Math.max(0, owl.flapping - dt);
    const perch = ridgeOwlPerch(), progress = 1 - owl.flapping / 2.5;
    owl.x = perch.x + Math.sin(progress * Math.PI * 2) * 18;
    owl.y = perch.y - Math.sin(progress * Math.PI) * 24;
    owl.flying = owl.flapping > 0;
  } else {
    const perch = ridgeOwlPerch();
    owl.x = perch.x; owl.y = perch.y;
    owl.tx = perch.x; owl.ty = perch.y;
    owl.flying = false;
  }
}
resetRidgeLife();
