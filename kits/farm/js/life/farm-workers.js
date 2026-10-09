'use strict';
// Farm workers, responsibilities, task selection, movement, harvest and return home.
function createFarmWorkers() { return [
  { x: 567, y: 285, speed: 82, dir: -1, walk: 0, task: null, action: 0, shirt: '#e8a068', hat: '#ead08b', name: '阿满' },
  { x: 446, y: 298, speed: 76, dir: 1, walk: 0, task: null, action: 0, shirt: '#7394a0', hat: '#d8ba70', name: '小禾' }
]; }
let workers = createFarmWorkers();
function addSouthWorker() {
  if (workers.some(w => w.name === '阿青')) return;
  workers.push({ x: 795, y: 280, speed: 105, dir: 1, walk: 0, task: null, action: 0, shirt: '#a37fa9', hat: '#e8c77d', name: '阿青' });
}
function addFarmWorker() {
  if (!villageResidentWorking('阿麦')) return;
  if (workers.some(w => w.name === '阿麦')) return;
  workers.push({ x: 520, y: 285, speed: 88, dir: 1, walk: 0, task: null, action: 0,
    shirt: '#a7ad72', hat: '#d8b782', name: '阿麦', route: [] });
}
function addValleyWorker() {
  if (!villageResidentWorking('阿栀')) return;
  if (workers.some(w => w.name === '阿栀')) return;
  workers.push({ x: VALLEY_WORKER_LAYOUT.home.x, y: VALLEY_WORKER_LAYOUT.home.y,
    speed: 148, dir: 1, walk: 0, task: null, action: 0,
    shirt: '#a87567', hat: '#e0bd86', name: '阿栀', route: [] });
}
function addPastureWorker() {
  if (!villageResidentWorking('阿牧') || !villageSiteOpen('sheep') || workers.some(w => w.name === '阿牧')) return;
  workers.push({ x: PASTURE_WORKER_LAYOUT.home.x, y: PASTURE_WORKER_LAYOUT.home.y,
    speed: 92, dir: 1, walk: 0, task: null, action: 0,
    shirt: '#7d9274', hat: '#e5bd80', name: '阿牧', route: [] });
}
addSouthWorker();
addValleyWorker();
addFarmWorker();
addPastureWorker();
function workerHome(w) {
  if (w.name === '阿青') return { x: 795, y: 280 };
  if (w.name === '阿麦') return { x: 427, y: 266 };
  if (w.name === '阿栀') return VALLEY_WORKER_LAYOUT.home;
  if (w.name === '阿牧') return PASTURE_WORKER_LAYOUT.home;
  return { x: 401 + (w.name === '阿满' ? -13 : 13), y: 266 };
}
function workerCanDoTask(worker, type) {
  if (['阿满', '小禾', '阿青', '阿麦'].includes(worker.name))
    return ['harvest', 'plant', 'water', 'eggs', 'fruit', 'honey', 'milk'].includes(type);
  if (worker.name === '阿牧') return ['wool', 'goatMilk'].includes(type);
  return worker.name === '阿栀' && type === 'herb';
}
function pastureWorkerRestWaypoint(worker) {
  const layout = PASTURE_WORKER_LAYOUT;
  if (worker.x > GOAT_LAYOUT.pen.left + 35 && worker.y > GOAT_LAYOUT.pen.top) return layout.goatGate;
  if (worker.x > layout.rest.x + 15 && worker.y > layout.rest.y + 40) return layout.goatApproach;
  return layout.rest;
}
function pastureWorkerNightWaypoint(w) {
  const home=PASTURE_WORKER_LAYOUT.home;
  if(distance(w,home)<12)return home;
  if(w.y>1390)return pastureWorkerRestWaypoint(w);
  if(w.x>744&&w.y>1283)return {x:970,y:1275};
  if(w.x>680&&w.y<1290)return {x:672,y:1275};
  if(w.y<1338)return {x:672,y:home.y};
  return home;
}

function validTask(task) {
  if (!task) return false;
  if (task.type === 'eggs') return farm.eggsReady;
  if (task.type === 'fruit') return farm.fruitReady;
  if (task.type === 'honey') return farm.honeyReady && farm.upgrades >= 2;
  if (task.type === 'wool') return farm.woolReady && villageSiteOpen('sheep');
  if (task.type === 'goatMilk') return farm.goatMilkReady && farm.goatBarnOpen;
  if (task.type === 'herb') return farm.valleyHerbs[task.index] && valleyHerbProgress(farm.valleyHerbs[task.index]) >= 1;
  if (task.type === 'milk') return cows[task.index] && cows[task.index].milk;
  const p = farm.plots[task.index];
  if (!p) return false;
  if (task.type === 'harvest') return p.crop && p.age >= crops[p.crop].days;
  if (task.type === 'plant') return !p.crop && farm.coins >= 8;
  if (task.type === 'water') return p.crop && !p.watered && farm.phase < .85;
  return false;
}

function taskPoint(task) {
  if (task.type === 'eggs') return { x: 263, y: 92 };
  if (task.type === 'fruit') return { x: 212, y: 451 };
  if (task.type === 'honey') return { x: HIVE_SITES[0].x + 13, y: HIVE_SITES[0].y + 10 };
  if (task.type === 'wool') return { x: sheep[0].x, y: sheep[0].y + 12 };
  if (task.type === 'goatMilk') return { x: GOAT_LAYOUT.pen.left + 100, y: GOAT_LAYOUT.pen.top + 90 };
  if (task.type === 'herb') return { x: farm.valleyHerbs[task.index].x, y: farm.valleyHerbs[task.index].y + 13 };
  if (task.type === 'milk') return { x: cows[task.index].x, y: cows[task.index].y + 12 };
  const p = farm.plots[task.index]; return { x: (p.x + .5) * T, y: (p.y + .62) * T };
}

function assignTask(worker) {
  const taken = new Set(workers.filter(w => w !== worker && w.task).map(w => `${w.task.type}:${w.task.index}`));
  const options = [];
  if (worker.name === '阿栀') {
    farm.valleyHerbs.forEach((herb, index) => {
      if (valleyHerbProgress(herb) >= 1) options.push({ type: 'herb', index, priority: 0 });
    });
  } else if (worker.name === '阿牧') {
    if (farm.woolReady && villageSiteOpen('sheep')) options.push({ type: 'wool', index: 0, priority: 1 });
    if (farm.goatMilkReady && farm.goatBarnOpen) options.push({ type: 'goatMilk', index: 0, priority: 2 });
  } else {
    cows.forEach((c, index) => { if (c.milk) options.push({ type: 'milk', index, priority: -2 }); });
    farm.plots.forEach((p, index) => {
      if (p.crop && p.age >= crops[p.crop].days) options.push({ type: 'harvest', index, priority: 0 });
      else if (!p.crop && farm.coins >= 8) options.push({ type: 'plant', index, priority: 2 });
      else if (p.crop && !p.watered && farm.phase < .85) options.push({ type: 'water', index, priority: 3 });
    });
    if (farm.eggsReady) options.push({ type: 'eggs', index: 0, priority: -1 });
    if (farm.fruitReady) options.push({ type: 'fruit', index: 0, priority: -.8 });
    if (farm.honeyReady && farm.upgrades >= 2) options.push({ type: 'honey', index: 0, priority: -.6 });
  }
  options.sort((a, b) => a.priority - b.priority || distance(worker, taskPoint(a)) - distance(worker, taskPoint(b)));
  worker.task = options.find(o => !taken.has(`${o.type}:${o.index}`)) || null;
  worker.route = worker.task?.type === 'eggs' && worker.y > 145 ? [{ x: 275, y: 282 }, { x: 275, y: 96 }]
    : worker.task?.type === 'herb' && worker.x < 800
      ? [VALLEY_WORKER_LAYOUT.doorPath, VALLEY_WORKER_LAYOUT.gardenPath,
        { x: 982, y: 1082 }]
      : worker.task?.type === 'goatMilk' && worker.x < GOAT_LAYOUT.pen.left + 25 && worker.y < GOAT_LAYOUT.pen.top + 35
        ? [PASTURE_WORKER_LAYOUT.goatApproach, PASTURE_WORKER_LAYOUT.goatGate] : [];
}

function finishTask(task, worker) {
  if (!validTask(task)) return;
  if (task.type === 'eggs') {
    farm.eggsReady = false; farm.eggsToday = 3; farm.eggTotal += 3;
    stockGood('farm', 'eggs', 3);
    record(`${worker.name}从鸡舍收集了 3 枚鸡蛋，放进主场货箱。`);
  } else if (task.type === 'fruit') {
    farm.fruitReady = false; farm.fruitTotal++;
    stockGood('farm', 'fruit', 1);
    record(`${worker.name}从果园摘下一篮水果，放进主场货箱。`);
  } else if (task.type === 'honey') {
    farm.honeyReady = false; farm.honeyTotal++;
    stockGood('farm', 'honey', 1);
    record(`${worker.name}收好一罐蜂蜜，等待村民来运走。`);
  } else if (task.type === 'wool') {
    farm.woolReady = false; farm.woolTotal++;
    stockGood('pasture', 'wool', 1);
    record(`${worker.name}给羊群梳了毛，羊毛放进牧场货箱。`);
  } else if (task.type === 'goatMilk') {
    farm.goatMilkReady = false; farm.goatMilkTotal++;
    stockGood('pasture', 'goatMilk', 1);
    record(`${worker.name}照顾糯米和栗子，收下一瓶山羊奶。`);
  } else if (task.type === 'milk') {
    const cow = cows[task.index];
    cow.milk = false; farm.milked[task.index] = true; farm.milkToday++; farm.milkTotal++;
    stockGood('farm', 'milk', 1);
    record(`${worker.name}给${cow.name}挤了奶，牛奶放进主场货箱。`);
  } else if (task.type === 'herb') {
    collectValleyHerb(farm.valleyHerbs[task.index], worker.name);
  } else {
    const p = farm.plots[task.index];
    if (task.type === 'harvest') {
      const cropType = p.crop, crop = crops[cropType];
      farm.harvested++; p.crop = null; p.age = 0; p.plantedAt = null;
      const depot = p.y >= FIELD_EXPANSIONS.south.top && villageDepotOpen('pasture') ? 'pasture' : 'farm';
      stockGood(depot, cropType, 1);
      if (farm.harvested % 4 === 1) record(`${worker.name}收获了${crop.name}，放进${DEPOT_SITES[depot].name}。`);
    } else if (task.type === 'plant') {
      let type = chooseCrop();
      if (farm.coins < crops[type].cost) type = 'wheat';
      farm.coins -= crops[type].cost; p.crop = type; p.age = 0; p.plantedAt = farm.phase; p.watered = farm.weather === 'rain';
    } else if (task.type === 'water') p.watered = true;
  }
  expandIfReady(); updateUI();
}

function updateFarmWorkers(dt) {
  const sleeping = farm.phase >= NIGHT_START;
  workers.forEach(w => {
    if(!villageResidentWorking(w.name))return;
    if (isFestivalDay()) {
      w.task = null; w.route = []; w.action = 0;
      const slot = { '阿满': 0, '小禾': 1, '阿青': 2, '阿栀': 3, '阿牧': 4, '阿麦': 12 }[w.name];
      updateFestivalActor(w, dt, festivalWorkerHome(w), slot,
        w.name === '阿牧' ? 'pasture' : w.name === '阿栀' ? 'south' : 'north');
      return;
    }
    if (festivalAtHome(w) && farm.phase < .02) return;
    if (w.festival) w.festival = null;
    if (sleeping) {
      w.task = null; w.route = []; w.action = 0;
      const home = w.name === '阿栀' ? valleyWorkerNightWaypoint(w) : w.name==='阿牧'?pastureWorkerNightWaypoint(w):workerHome(w), d = distance(w, home);
      if (d > 8) { w.x += (home.x - w.x) / d * Math.min(w.speed * dt, d - 6); w.y += (home.y - w.y) / d * Math.min(w.speed * dt, d - 6); w.walk += dt * 12; }
      return;
    }
    if (!validTask(w.task)) { w.task = null; w.action = 0; }
    if (!w.task) assignTask(w);
    if (!w.task) {
      if (w.name === '阿栀') {
        const home = valleyWorkerRestWaypoint(w), d = distance(w, home);
        if (d > 8) { w.x += (home.x - w.x) / d * Math.min(w.speed * dt, d - 6); w.y += (home.y - w.y) / d * Math.min(w.speed * dt, d - 6); w.walk += dt * 12; }
      } else if (w.name === '阿牧') {
        const rest = pastureWorkerRestWaypoint(w), d = distance(w, rest);
        if (d > 8) { const dx = rest.x - w.x; w.x += dx / d * Math.min(w.speed * dt, d - 6); w.y += (rest.y - w.y) / d * Math.min(w.speed * dt, d - 6); w.dir = dx < 0 ? -1 : 1; w.walk += dt * 12; }
      }
      return;
    }
    const waypoint = w.route?.[0];
    const point = waypoint || taskPoint(w.task), d = distance(w, point);
    if (d > 12) {
      const dx = point.x - w.x, dy = point.y - w.y;
      w.x += dx / d * Math.min(w.speed * dt, d - 10);
      w.y += dy / d * Math.min(w.speed * dt, d - 10);
      w.dir = dx < 0 ? -1 : 1; w.walk += dt * 12; w.action = 0;
    } else if (waypoint) {
      w.route.shift();
    } else {
      w.action += dt;
      if (w.action >= .37) { finishTask(w.task, w); w.task = null; w.action = 0; }
    }
  });
}

function festivalWorkerHome(worker) {
  return worker.name === '阿栀'
    ? { x: VALLEY_WORKER_LAYOUT.home.x, y: VALLEY_WORKER_LAYOUT.home.bottom + 7 }
    : workerHome(worker);
}

function workerAt(x,y){return workers.find(w=>!festivalAtHome(w)&&(farm.phase<NIGHT_START||distance(w,workerHome(w))>20)&&Math.abs(w.x-x)<20&&y>=w.y-27&&y<=w.y+24)||null;}

function greetWorker(worker) {
  worker.waveUntil = now + 2.3;
  const replies = {
    '阿满': '阿满向你挥手：“田地、鸡舍和牛牛，今天也都要好好照看。”',
    '小禾': '小禾向你挥手：“忙完鸡蛋，我再去看看牛和田地。”',
    '阿青': '阿青向你挥手：“主场的活儿，我们四个会一起照料好。”',
    '阿麦': '阿麦向你挥手：“我来搭把手，田地、鸡舍和牛牛都会照顾好。”',
    '阿牧': '阿牧从两舍之间起身向你挥手：“绵羊和山羊都照顾妥当啦。”',
    '阿栀': '阿栀抬手向你打招呼：“香草熟了，我就去逐株采下。”'
  };
  record(replies[worker.name] || `${worker.name}向你挥了挥手。`);
  save();
}

const WORKER_ROLES = { '阿满': '田地、鸡蛋、牛奶等主场农务', '小禾': '田地、鸡蛋、牛奶等主场农务', '阿青': '田地、鸡蛋、牛奶等主场农务', '阿麦': '田地、鸡蛋、牛奶等主场农务', '阿牧': '羊舍与山羊舍', '阿栀': '山谷香草' };
