'use strict';
// Small reserved activity spots and short walks keep the gathering lively without crowding.
const FESTIVAL_SPOTS = [
  { kind: 'snack', x: 766, y: 784 }, { kind: 'snack', x: 766, y: 824 },
  { kind: 'snack', x: 1098, y: 784 }, { kind: 'snack', x: 1098, y: 824 },
  { kind: 'chat', x: 820, y: 864 }, { kind: 'chat', x: 852, y: 868 },
  { kind: 'chat', x: 1044, y: 868 }, { kind: 'chat', x: 1076, y: 864 },
  { kind: 'chat', x: 864, y: 926 }, { kind: 'chat', x: 896, y: 930 },
  { kind: 'watch', x: 832, y: 812 }, { kind: 'watch', x: 884, y: 812 },
  { kind: 'watch', x: 988, y: 812 }, { kind: 'watch', x: 1040, y: 812 },
  { kind: 'rest', x: 788, y: 924 }, { kind: 'rest', x: 1100, y: 924 },
  { kind: 'dance', x: 910, y: 852 }, { kind: 'dance', x: 966, y: 852 },
  { kind: 'dance', x: 910, y: 900 }, { kind: 'dance', x: 966, y: 900 },
  { kind: 'perform', x: 902, y: 772 }, { kind: 'perform', x: 970, y: 772 }
];
function festivalParticipants() {
  return [...workers, courier, villageWalker, orderKeeper,
    ...(villageResidentWorking('阿蓼')?[angler]:[]),...(villageResidentWorking('阿芽')?[nurseryKeeper]:[]),
    ...(villageResidentWorking('阿矿')?[miner]:[]),...(villageResidentWorking('阿森')?[forestKeeper]:[]),
    ...farm.development.crew,...Object.values(farm.development.residents).flatMap(r=>r.actor?[r.actor]:[]),
    ...(farm.town.traveller.mode !== 'away' ? [farm.town.traveller] : [])];
}
function festivalWalkable(point) {
  const s = CENTRAL_PLAZA;
  if (!centralPlazaAt(point.x, point.y) || point.y < 766) return false;
  if (distance(point, s.well) < 45) return false;
  if (s.tables.some(table => Math.abs(point.x - table.x) < 40 && Math.abs(point.y - table.y) < 39)) return false;
  return !s.benches.some(bench => Math.abs(point.x - bench.x) < 30 && point.y > bench.y - 14);
}
function festivalPlazaPath(actor, target, avoidResidents = false) {
  const step = 16, left = 708, top = 766, columns = 29, rows = 13;
  const others = avoidResidents ? festivalParticipants().filter(other => other !== actor
    && other.festival?.stage === 'gather' && !other.festival.activity?.route?.length) : [];
  const nodes = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
    const point = { x: left + x * step, y: top + y * step };
    if (festivalWalkable(point) && !others.some(other => distance(point, other) < 26)) nodes.push({ ...point, key: y * columns + x });
  }
  if (!nodes.length) return [];
  const nearest = point => nodes.reduce((best, node) => distance(node, point) < distance(best, point) ? node : best);
  const start = nearest(actor), end = nearest(target), valid = new Map(nodes.map(node => [node.key, node]));
  const queue = [start.key], previous = new Map([[start.key, null]]);
  for (let index = 0; index < queue.length && !previous.has(end.key); index++) {
    const key = queue[index];
    for (const next of [key - columns, key + columns,
      ...(key % columns ? [key - 1] : []), ...(key % columns < columns - 1 ? [key + 1] : [])]) {
      if (valid.has(next) && !previous.has(next)) { previous.set(next, key); queue.push(next); }
    }
  }
  if (!previous.has(end.key)) return [];
  const path = [];
  for (let key = end.key; key !== null; key = previous.get(key)) {
    const node = valid.get(key); path.unshift({ x: node.x, y: node.y });
  }
  path.push({ x: target.x, y: target.y });
  return path;
}
function festivalSpotFree(actor, index) {
  const spot = FESTIVAL_SPOTS[index];
  return festivalParticipants().every(other => other === actor || other.festival?.stage !== 'gather'
    || (other.festival.activity?.spot !== index && distance(other, spot) >= 30));
}
function updateFestivalActivity(actor, dt, slot) {
  if (farm.paused) return;
  const visit = actor.festival;
  const activity = visit.activity ??= { kind: 'watch', spot: null, route: [], index: 0,
    wait: 1 + hash(slot, farm.day, 421) * 2, cycle: 0, blocked: 0 };
  actor.facing = 'down';
  if (activity.route.length) {
    const target = activity.route[activity.index], d = distance(actor, target), travel = Math.min(d, 64 * dt);
    const next = d ? { x: actor.x + (target.x - actor.x) / d * travel,
      y: actor.y + (target.y - actor.y) / d * travel } : target;
    const obstructed = festivalParticipants().some(other => other !== actor && other.festival?.stage === 'gather'
      && distance(next, other) < 25 && distance(next, other) < distance(actor, other));
    if (obstructed) {
      activity.blocked += dt;
      if (activity.blocked > 1.1) Object.assign(activity, { route: [], index: 0, spot: null, kind: 'chat', wait: 1.4, blocked: 0 });
      return;
    }
    activity.blocked = 0;
    if (Math.abs(target.x - actor.x) > .5) actor.dir = target.x < actor.x ? -1 : 1;
    Object.assign(actor, next); actor.walk = (actor.walk || 0) + dt * 10; actor.step = (actor.step || 0) + dt * 10;
    if (d <= travel + .1) activity.index++;
    if (activity.index >= activity.route.length) {
      activity.route = []; activity.index = 0; activity.wait = 2.4 + hash(slot, activity.cycle, farm.day) * 2.5;
      if (activity.kind === 'chat') actor.dir = actor.x < CENTRAL_PLAZA.stage.x ? 1 : -1;
    }
    return;
  }
  if (activity.kind === 'chat') {
    const partner = festivalParticipants().find(other => other !== actor && other.festival?.stage === 'gather'
      && other.festival.activity?.kind === 'chat' && !other.festival.activity.route.length && distance(actor, other) < 70);
    if (partner) actor.dir = partner.x < actor.x ? -1 : 1;
  }
  actor.facing = activity.kind === 'watch' ? 'up' : 'down';
  activity.wait = Math.max(0, activity.wait - dt);
  if (activity.wait || farm.phase >= .425) return;
  if (festivalParticipants().filter(other => other.festival?.stage === 'gather'
    && other.festival.activity?.route?.length).length >= 4) { activity.wait = .35; return; }
  const programme = farm.phase >= .22 && farm.phase < .32 && currentFestivalLevel() >= 2;
  const choices = ['snack', 'chat', 'watch', 'rest', 'dance'];
  const kind = programme ? [0, 2].includes(slot) ? 'perform'
    : [1, 3, 4, 7].includes(slot) ? 'dance' : 'watch' : choices[(slot + activity.cycle) % choices.length];
  const available = FESTIVAL_SPOTS.map((spot, index) => ({ ...spot, index }))
    .filter(spot => spot.kind === kind && spot.index !== activity.spot && festivalSpotFree(actor, spot.index))
    .sort((a, b) => distance(actor, a) - distance(actor, b));
  for (const spot of available) {
    const path = festivalPlazaPath(actor, spot, true);
    if (!path.length) continue;
    Object.assign(activity, { kind, spot: spot.index, route: path, index: 0, blocked: 0 });
    activity.cycle++;
    return;
  }
  activity.cycle++; activity.wait = 1;
}
function festivalResidentActivity(actor) {
  const activity = actor.festival.activity;
  const names = { snack: '取点心、喝茶', chat: '和邻居聊天', watch: '看木台节目',
    rest: '在广场长椅歇脚', dance: '参加四季小舞', perform: '在木台前演奏' };
  return activity?.route.length ? activity.kind === 'rest' ? '正去广场长椅歇脚' : `正去${names[activity.kind]}` : names[activity?.kind] || `在广场参加${festivalTheme().name}`;
}
