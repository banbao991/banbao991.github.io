'use strict';
// Goods stay at their source until the village carrier's two-day road journey.
const DEPOT_SITES = {
  farm: { x: 565, y: 558, name: '主场货箱' },
  pasture: { x: 930, y: 1253, name: '牧场货箱' },
  valley: { x: 1180, y: 1173, name: '山谷香草箱' },
  lake: { x: 476, y: 955 + SOUTH_LAKE_SHIFT_Y, name: '西湖鱼箱' },
  forest: { ...FOREST_DEPOT_LAYOUT.box, name: '森林采集箱' },
  nursery: { ...NURSERY_LAYOUT.depot, name: '湿地苗圃货箱' }
};
const GOOD_NAMES = {
  wheat: '小麦', carrot: '胡萝卜', pumpkin: '南瓜', strawberry: '草莓', corn: '玉米',
  eggs: '鸡蛋', honey: '蜂蜜', fruit: '水果', milk: '牛奶', wool: '羊毛', goatMilk: '山羊奶',
  lavender: '薰衣草', mint: '薄荷', thyme: '百里香', carp: '湖鲤', gold: '金鳞鱼',
  mushroom: '蘑菇', acorn: '橡果', flowerBundle: '野花束', seedPacket: '种子包'
};
const COURIER_HOME = { x: 1655, y: 950 };
const COURIER_REST = { x: COURIER_COTTAGE.x + 34, y: COURIER_COTTAGE.y - 15 };
const COURIER_SPEED = 160;
const COURIER_AFTER_FESTIVAL = [
  { x: COURIER_VILLAGE_DOOR.x, y: 812 }, { x: 1490, y: 812 },
  { x: 1490, y: COURIER_HOME.y }, { ...COURIER_HOME }
];
const COURIER_OUTBOUND = [
  { x: COURIER_HOME.x, y: 1021 }, { x: 1460, y: 1021 }, { x: 1298, y: 1021 },
  { x: 620, y: 1021 }, { x: 620, y: 592 }, { x: 256, y: 592 },
  { ...COURIER_REST, rest: true }
];
function courierReturnBase(plannedDepots) {
  const has = id => plannedDepots.includes(id);
  const route = [{ x: 256, y: 592 }];
  if (has('farm')) route.push({ x: 565, y: 592, depot: 'farm' });
  route.push({ x: 620, y: 592 });
  if (has('lake')) route.push({ x: 620, y: DEPOT_SITES.lake.y },
    { x: DEPOT_SITES.lake.x, y: DEPOT_SITES.lake.y, depot: 'lake' }, { x: 620, y: DEPOT_SITES.lake.y });
  if (has('nursery')) route.push({ ...NURSERY_LAYOUT.roadStop, depot: 'nursery' });
  if (has('valley') || has('pasture')) {
    route.push({ x: 620, y: 1206 });
    if (has('pasture')) route.push({ x: DEPOT_SITES.pasture.x, y: 1206 },
      { x: DEPOT_SITES.pasture.x, y: DEPOT_SITES.pasture.y, depot: 'pasture' },
      { x: DEPOT_SITES.pasture.x, y: 1206 });
    if (has('valley')) route.push({ x: 1180, y: 1206 },
      { x: 1180, y: 1173, depot: 'valley' }, { x: 1180, y: 1206 });
    route.push({ x: 1228, y: 1206 }, { x: 1228, y: 1021 });
  } else route.push({ x: 620, y: 1021 }, { x: 1228, y: 1021 });
  return route;
}
const COURIER_RETURN_BASE = courierReturnBase(DEPOT_IDS);
const COURIER_DIRECT_RETURN = [
  { x: COURIER_HOME.x, y: 1021 }, { ...COURIER_HOME, market: true }
];
const COURIER_FOREST_RETURN = [
  { x: 1228, y: FOREST_DEPOT_LAYOUT.stop.y }, { ...FOREST_DEPOT_LAYOUT.stop, depot: 'forest' },
  { x: 1228, y: FOREST_DEPOT_LAYOUT.stop.y }, { x: 1228, y: 307 }, { x: 1460, y: 307 },
  { x: 1460, y: 640 }, { x: 1785, y: 640 }, { x: 1785, y: 950 },
  { ...COURIER_HOME, market: true }
];
function resetCourier() {
  return { ...COURIER_HOME, stopIndex: 0, journeyDay: 0, lastReturnDay: 0,
    leg: 'market', routeVariant: null, plannedDepots: [], cargo: {}, step: 0, dir: -1, wait: 0, night: null };
}
let courier = resetCourier();

function depotCount(id) {
  return Object.values(farm.depots[id]).reduce((sum, count) => sum + count, 0);
}
function stockGood(depot, good, count = 1) {
  if (!DEPOT_SITES[depot] || !GOOD_IDS.includes(good) || !Number.isInteger(count) || count < 1) return false;
  farm.depots[depot][good] = (farm.depots[depot][good] || 0) + count;
  return true;
}
function depotAt(x, y) {
  return DEPOT_IDS.find(id => (id !== 'nursery' || farm.nursery.level > 0)
    && Math.abs(x - DEPOT_SITES[id].x) <= 23
    && Math.abs(y - DEPOT_SITES[id].y) <= 24) || null;
}
function courierAt(x, y) {
  return !(courier.night?.sleeping && !courier.night.waking)
    && !festivalAtHome(courier)
    && !(isFestivalDay() && farm.phase >= NIGHT_START && distance(courier, COURIER_HOME) < 20)
    && Math.abs(x - courier.x) <= 27
    && y >= courier.y - 29 && y <= courier.y + 21;
}
function courierActivity() {
  if (courier.festival?.stage === 'morning') return '从村口小屋步行到出发点';
  if (courier.festival?.day === farm.day) return courier.festival.attending
    ? festivalActivity(courier) || '在广场参加欢庆日' : '为欢庆日休息';
  if (courier.leg === 'market' && isFestivalDay(farm.day + 1)) return '为明天的欢庆日留在村口';
  const night = courier.night;
  if (night) {
    const home = night.side === 'farm' ? '主场小屋' : '村口小屋';
    return night.waking ? '从小屋回到运货路线' : night.sleeping ? `在${home}睡觉` : `正回${home}休息`;
  }
  return { outbound: '沿路前往主场小屋', rest: '在主场小屋旁等候返程',
    return: '沿路收货返村口', market: courier.lastReturnDay === farm.day ? '今日已归来' : '在村口准备出发' }[courier.leg];
}
function courierJourneyPoints() {
  if (courier.leg === 'outbound') return {
    points: [COURIER_HOME, ...COURIER_OUTBOUND], target: 1 + courier.stopIndex
  };
  const base = courierReturnBase(courier.plannedDepots);
  const variant = courier.plannedDepots.includes('forest') ? COURIER_FOREST_RETURN : COURIER_DIRECT_RETURN;
  return {
    points: [COURIER_REST, ...base, ...variant],
    target: 1 + (courier.routeVariant ? base.length : 0) + courier.stopIndex
  };
}
function courierPlanText() {
  const festival = festivalActivity(courier);
  if (festival || courier.festival?.day === farm.day) return `今日安排：${courierActivity()}；货箱留待下趟收取。`;
  if (courier.leg === 'outbound' || courier.leg === 'rest')
    return `下一站：主场小屋${courier.leg === 'rest' ? '（已抵达）' : ''}\n收货顺序：返程出发时规划。`;
  if (courier.leg === 'market') return isFestivalDay(farm.day + 1)
    ? '下一站：明天的广场聚会；今日留在村口休息。'
    : courier.lastReturnDay === farm.day ? '本趟已送达集市，今日休息。' : '下一站：主场小屋；返程出发时规划收货。';
  const base = courierReturnBase(courier.plannedDepots);
  const variant = courier.plannedDepots.includes('forest') ? COURIER_FOREST_RETURN : COURIER_DIRECT_RETURN;
  const remaining = courier.routeVariant ? variant.slice(courier.stopIndex)
    : [...base.slice(courier.stopIndex), ...variant];
  const next = remaining.find(stop => stop.depot)?.depot;
  const pending = new Set(remaining.filter(stop => stop.depot).map(stop => stop.depot));
  const sequence = courier.plannedDepots.map(id => `${pending.has(id) ? '' : '✓ '}${DEPOT_SITES[id].name}`);
  return `下一站：${next ? DEPOT_SITES[next].name : '村口集市'}${courier.night ? '（休息后继续）' : ''}\n本趟收货：${sequence.join(' → ') || '无待取货物，直接回村口'}`;
}
function courierNightPath(side) {
  const path = [{ x: courier.x, y: courier.y }];
  if (courier.leg === 'outbound' || courier.leg === 'return') {
    const { points, target } = courierJourneyPoints();
    const forward = (courier.leg === 'outbound' && side === 'farm')
      || (courier.leg === 'return' && side === 'village');
    // Repeated junctions mark daytime collection spurs; omit completed loops on the way home.
    const route = forward ? points.slice(target) : points.slice(0, target);
    const compact = [];
    for (const point of route) {
      const repeat = compact.findIndex(previous => previous.x === point.x && previous.y === point.y);
      if (repeat >= 0) compact.splice(repeat + 1);
      else compact.push(point);
    }
    const stops = forward ? compact : compact.reverse();
    path.push(...stops.map(({ x, y }) => ({ x, y })));
  } else path.push(side === 'farm' ? { ...COURIER_REST } : { ...COURIER_HOME });
  if (side === 'farm') path.push({ x: COURIER_COTTAGE_DOOR.x, y: COURIER_REST.y }, { ...COURIER_COTTAGE_DOOR });
  else path.push({ x: 1490, y: COURIER_HOME.y }, { x: 1490, y: 810 },
    { x: COURIER_VILLAGE_DOOR.x, y: 810 }, { ...COURIER_VILLAGE_DOOR });
  return path;
}
function moveCourierToward(target, dt, speed) {
  const dx = target.x - courier.x, dy = target.y - courier.y, distance = Math.hypot(dx, dy);
  if (distance <= speed * dt + 2) { courier.x = target.x; courier.y = target.y; return true; }
  courier.x += dx / distance * speed * dt;
  courier.y += dy / distance * speed * dt;
  if (Math.abs(dx) > 1) courier.dir = dx < 0 ? -1 : 1;
  courier.step += dt * 12;
  return false;
}
function updateCourierNight(dt) {
  if (farm.phase >= NIGHT_START && !courier.night) {
    const side = courier.x < riverCenterAt(courier.y) ? 'farm' : 'village';
    courier.night = { side, path: courierNightPath(side), index: 1, sleeping: false, waking: false };
  }
  const trip = courier.night;
  if (!trip) return false;
  if (!trip.sleeping) {
    if (moveCourierToward(trip.path[trip.index], dt, COURIER_SPEED * 1.35)) trip.index++;
    if (trip.index >= trip.path.length) trip.sleeping = true;
    return true;
  }
  if (farm.phase >= NIGHT_START || farm.phase < .02) return true;
  if (!trip.waking) { trip.waking = true; trip.index = trip.path.length - 2; }
  if (moveCourierToward(trip.path[trip.index], dt, COURIER_SPEED * 1.35)) trip.index--;
  if (trip.index < 0) courier.night = null;
  return true;
}
function collectDepot(id) {
  const goods = farm.depots[id];
  const amount = depotCount(id);
  if (amount) {
    for (const [good, count] of Object.entries(goods)) courier.cargo[good] = (courier.cargo[good] || 0) + count;
    farm.depots[id] = {};
    record(`运货村民从${DEPOT_SITES[id].name}收走 ${amount} 件货物。`);
  }
}
function goodValue(good) {
  if (crops[good]) return farm.upgrades >= 5 ? Math.round(crops[good].value * 1.15) : crops[good].value;
  if (good === 'eggs') return 10 + Math.min(2, farm.chickenLove * 2 / 3);
  if (good === 'milk') return 16 + Math.min(4, farm.cowLove);
  if (good === 'fruit') return seasonIndex() === 2 ? 54 : seasonIndex() === 1 ? 48 : 36;
  return { honey: 21, wool: 72, goatMilk: 24, lavender: 22, mint: 18,
    thyme: 16, carp: 24, gold: 42, mushroom: 18, acorn: 30,
    flowerBundle: 26, seedPacket: 31 }[good] || 0;
}
function deliverCourierGoods() {
  const goods = courier.cargo;
  const count = Object.values(goods).reduce((sum, number) => sum + number, 0);
  if (count) {
    let income = 0;
    for (const [good, number] of Object.entries(goods)) {
      income += Math.round(goodValue(good) * number);
      let available = number;
      for (const order of farm.orders.filter(order => order.crop === good).sort((a, b) => a.due - b.due)) {
        const used = Math.min(available, order.target - order.progress);
        order.progress += used;
        available -= used;
        if (order.progress >= order.target) {
          income += order.reward;
          record(`阿葵的${crops[good].name}订单送达，额外获得 ${order.reward} 金。`);
          farm.orders = farm.orders.filter(entry => entry.id !== order.id);
        }
        if (!available) break;
      }
    }
    farm.coins += income;
    farm.shippedTotal += count;
    updateNurseryMilestones();
    farm.marketGoods = { ...goods };
    record(`运货村民抵达村口，送达 ${count} 件货物，收入 ${income} 金。`);
    courier.cargo = {};
    expandIfReady();
    updateUI();
  }
}
function updateCourier(dt) {
  if (isFestivalDay()) {
    if (!courier.festival || courier.festival.day !== farm.day) {
      const villageHome = courier.night?.side === 'village'
        || (!courier.night && courier.leg === 'market' && courier.x > riverCenterAt(courier.y));
      courier.festival = { day: farm.day, attending: villageHome };
      if (villageHome) {
        courier.night = null;
        courier.x = COURIER_VILLAGE_DOOR.x; courier.y = COURIER_VILLAGE_DOOR.y;
      }
    }
    if (courier.festival.attending) {
      updateFestivalActor(courier, dt, COURIER_VILLAGE_DOOR, 5, 'village');
      return;
    }
    if (!courier.night) courier.night = {
      side: 'farm', path: courierNightPath('farm'), index: 1,
      sleeping: false, waking: false
    };
    if (!courier.night.sleeping) updateCourierNight(dt);
    return;
  }
  if (festivalMorning(courier, dt, COURIER_AFTER_FESTIVAL, COURIER_SPEED)) return;
  if (courier.festival && courier.festival.day !== farm.day) {
    courier.festival = null;
  }
  if (updateCourierNight(dt)) return;
  if (courier.leg === 'market' && !isFestivalDay(farm.day + 1)
    && courier.lastReturnDay < farm.day && farm.phase >= .18 && farm.phase < .5) {
    courier.leg = 'outbound';
    courier.journeyDay = farm.day;
    courier.plannedDepots = [];
    courier.stopIndex = 0;
    courier.wait = 0;
  }
  if (courier.leg === 'rest' && farm.day > courier.journeyDay && farm.phase >= .02) {
    // Commit every pickup and the forest detour when the return journey starts.
    courier.plannedDepots = DEPOT_IDS.filter(id => depotCount(id) > 0);
    courier.leg = 'return';
    courier.stopIndex = 0;
    courier.routeVariant = null;
    courier.wait = 0;
  }
  if (courier.leg === 'market' || courier.leg === 'rest') return;
  if (courier.wait > 0) { courier.wait -= dt; return; }
  let route = courier.leg === 'outbound' ? COURIER_OUTBOUND
    : courier.routeVariant === 'forest' ? COURIER_FOREST_RETURN
    : courier.routeVariant === 'direct' ? COURIER_DIRECT_RETURN
      : courierReturnBase(courier.plannedDepots);
  if (courier.leg === 'return' && !courier.routeVariant && courier.stopIndex >= route.length) {
    courier.routeVariant = courier.plannedDepots.includes('forest') ? 'forest' : 'direct';
    courier.stopIndex = 0;
    route = courier.routeVariant === 'forest' ? COURIER_FOREST_RETURN : COURIER_DIRECT_RETURN;
  }
  const stop = route[courier.stopIndex];
  if (!stop) return;
  const dx = stop.x - courier.x, dy = stop.y - courier.y, distance = Math.hypot(dx, dy);
  const step = Math.min(distance, COURIER_SPEED * dt);
  if (distance > 0) {
    courier.x += dx / distance * step;
    courier.y += dy / distance * step;
    if (Math.abs(dx) > 1) courier.dir = dx < 0 ? -1 : 1;
    courier.step += dt * 12;
  }
  if (distance > step + 2) return;
  courier.x = stop.x; courier.y = stop.y;
  if (stop.depot) { collectDepot(stop.depot); courier.wait = .32; }
  if (stop.rest) { courier.leg = 'rest'; courier.stopIndex = 0; return; }
  if (stop.market) {
    deliverCourierGoods();
    courier.leg = 'market';
    courier.lastReturnDay = farm.day;
    courier.stopIndex = 0;
    courier.routeVariant = null;
    courier.plannedDepots = [];
    save();
    return;
  }
  courier.stopIndex++;
}
