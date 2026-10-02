'use strict';
// Mining days and the two-bridge market/tea excursion are separate routines.
const MINE_HOME = { ...MINE_LAYOUT.home.door };
const MINE_REST = { ...MINE_LAYOUT.rest };
const MINE_CART_BAY = { ...MINE_LAYOUT.cartBay };
const MINE_TEA_SEAT = { x: 958, y: 1812 };
const MINE_CART_PICKUP = [
  { ...MINE_HOME }, { x: 1828, y: MINE_HOME.y },
  { x: 1828, y: MINE_CART_BAY.y }, { ...MINE_CART_BAY }
];
const MINE_MARKET_ROUTE = [
  { ...MINE_CART_BAY }, { x: 1828, y: MINE_CART_BAY.y },
  { ...MINE_LAYOUT.gate }, { x: 1988, y: 1206 }, { x: 1988, y: 950 },
  { ...MINE_LAYOUT.market }
];
const MINE_REST_TO_HOME = [
  { ...MINE_REST }, { x: 1828, y: MINE_REST.y },
  { x: 1828, y: MINE_HOME.y }, { ...MINE_HOME }
];
const MINE_HOME_TO_REST = MINE_REST_TO_HOME.slice().reverse();
const MINE_TEA_OUTBOUND = [
  { ...MINE_CART_BAY }, { x: 1828, y: MINE_CART_BAY.y }, { ...MINE_LAYOUT.gate },
  { x: 1228, y: 1206 }, { x: 620, y: 1206 }, { x: 620, y: 1698 },
  { x: 866, y: 1698 }, { x: 866, y: 1742 }, { x: 958, y: 1742 }, { ...MINE_TEA_SEAT }
];
const MINE_TEA_RETURN = [
  { ...MINE_TEA_SEAT }, { x: 958, y: 1742 }, { x: 866, y: 1742 },
  { x: 866, y: 1698 }, { x: 1566, y: 1698 }, { x: 1566, y: 1510 },
  { x: 1666, y: 1510 }, { x: 1666, y: MINE_HOME.y }, { ...MINE_HOME }
];
const MINE_WORK_ROUTE = (index, fromRest = false) => {
  const node = MINE_LAYOUT.nodes[index];
  return [fromRest ? { ...MINE_REST } : { ...MINE_HOME },
    { x: 1828, y: fromRest ? MINE_REST.y : MINE_HOME.y },
    { x: 1828, y: node.y }, { x: node.x, y: node.y }];
};
const MINE_NODE_TO_REST = index => {
  const node = MINE_LAYOUT.nodes[index];
  return [{ x: node.x, y: node.y }, { x: 1828, y: node.y },
    { x: 1828, y: MINE_REST.y }, { ...MINE_REST }];
};
const MINE_NODE_TO_NODE = (fromIndex, toIndex) => {
  const from = MINE_LAYOUT.nodes[fromIndex], to = MINE_LAYOUT.nodes[toIndex];
  return [{ x: from.x, y: from.y }, { x: 1828, y: from.y },
    { x: 1828, y: to.y }, { x: to.x, y: to.y }];
};
function resetMiner() {
  return { ...MINE_HOME, name: '阿矿', dir: 1, step: 0, walk: 0, speed: 265,
    mode: 'home', route: [], routeIndex: 0, targetNode: null, action: 0,
    cargo: {}, nextDeliveryDay: 4, deliveryDay: 0, workedDay: 0,
    festival: null, waveUntil: 0 };
}
let miner = resetMiner();
function mineClock() { return farm.day + farm.phase; }
function mineStockCount() { return Object.values(farm.mine.stock).reduce((sum, count) => sum + count, 0); }
function mineCargoCount() { return Object.values(miner.cargo).reduce((sum, count) => sum + count, 0); }
function mineNodeReady(index) { return mineClock() >= farm.mine.nodes[index].readyAt; }
function mineNodeAt(x, y) {
  return MINE_LAYOUT.nodes.findIndex(node => Math.abs(x - node.x) <= 23 && Math.abs(y - node.y) <= 22);
}
function minerAt(x, y) {
  return !festivalAtHome(miner) && !(farm.phase >= NIGHT_START
    && miner.mode === 'home' && distance(miner, MINE_HOME) < 14)
    && miner.mode !== 'homeRest'
    && Math.abs(x - miner.x) <= 14 && Math.abs(y - miner.y) <= 25;
}
function mineOreText(goods) {
  return Object.entries(goods).filter(([, count]) => count > 0)
    .map(([kind, count]) => `${MINE_ORES[kind].name} ${count}`).join('、') || '暂无矿石';
}
function collectMineNode(index, source = 'player') {
  if (index < 0 || !mineNodeReady(index)) return false;
  const kind = MINE_LAYOUT.nodes[index].kind;
  farm.mine.stock[kind]++;
  farm.mine.minedTotal++;
  const wait = { stone: 1.12, copper: 1.65, quartz: 2.15 }[kind];
  farm.mine.nodes[index].readyAt = mineClock() + wait + hash(index, farm.day, 728) * .38;
  if (source === 'player' || farm.mine.minedTotal % 4 === 1)
    record(`${source === 'player' ? '你' : '阿矿'}从矿坡采下一块${MINE_ORES[kind].name}，存进矿区棚屋。`);
  return true;
}
function minerActivity() {
  const festival = festivalActivity(miner);
  if (festival) return festival;
  if (miner.mode === 'toCart') return '去矿区棚屋对面取小车';
  if (miner.mode === 'toMarket') return `推着小车去村口送矿 · ${mineCargoCount()} 块`;
  if (miner.mode === 'returnCart') return '推着空车回棚屋对面的停放点';
  if (miner.mode === 'toTea') return '过南桥去茶亭喝茶';
  if (miner.mode === 'teaRest') return '在茶亭边的小桌旁喝茶休息';
  if (miner.mode === 'teaHome') return '沿新南桥回矿屋';
  if (miner.mode === 'homeRest') return '喝完茶，已经回矿屋休息';
  if (miner.mode === 'returnHome' || miner.mode === 'returnWithCargo') return '正沿路回矿屋';
  if (miner.mode === 'returnRest') return '正去轨旁歇脚点';
  if (miner.mode === 'toNode') return '正走向露天矿脉';
  if (miner.mode === 'mining') return '正在敲开矿石';
  if (farm.phase >= NIGHT_START) return '在矿屋里休息';
  return farm.day >= miner.nextDeliveryDay && mineStockCount() ? '准备把矿石送去村口'
    : miner.mode === 'rest' ? '在轨道支线尽头歇脚' : '从小屋去矿坡';
}
function setMinerRoute(mode, route, targetNode = null) {
  miner.mode = mode;
  miner.route = route.map(point => ({ x: point.x, y: point.y }));
  miner.routeIndex = 0;
  miner.targetNode = targetNode;
  miner.action = 0;
}
function moveMiner(dt) {
  const target = miner.route[miner.routeIndex];
  if (!target) return true;
  const dx = target.x - miner.x, dy = target.y - miner.y, length = Math.hypot(dx, dy);
  const step = Math.min(length, miner.speed * dt);
  if (length > 0) {
    miner.x += dx / length * step; miner.y += dy / length * step;
    if (Math.abs(dx) > .5) miner.dir = dx < 0 ? -1 : 1;
    miner.step += dt * 12; miner.walk += dt * 12;
  }
  if (length <= step + 1) {
    miner.x = target.x; miner.y = target.y;
    miner.routeIndex++;
  }
  return miner.routeIndex >= miner.route.length;
}
function minerReturnRoute() {
  if (miner.mode === 'toCart')
    return [...miner.route.slice(0, miner.routeIndex).reverse(), { ...MINE_HOME }];
  if (miner.mode !== 'toMarket') return [
    { x: 1828, y: miner.y }, { x: 1828, y: MINE_HOME.y }, { ...MINE_HOME }
  ];
  const back = miner.route.slice(0, miner.routeIndex).reverse();
  return [...back, ...MINE_CART_PICKUP.slice(0, -1).reverse()];
}
function alignMinerMarketRoad() {
  if (!['toMarket', 'returnCart'].includes(miner.mode)) return;
  const currentLane = MINE_MARKET_ROUTE[3].x;
  const previousLane = currentLane - T;
  if (!miner.route.some(stop => stop.x === previousLane
    && (stop.y === 1206 || stop.y === 950))) return;
  miner.route = miner.route.map(stop => stop.x === previousLane
    && (stop.y === 1206 || stop.y === 950)
    ? { x: currentLane, y: stop.y } : stop);
  // A saved miner already walking the old vertical lane moves with that lane.
  if (Math.abs(miner.x - previousLane) < 1 && miner.y > 950 && miner.y < 1206)
    miner.x = currentLane;
}
function deliverMinerCargo() {
  const cargo = miner.cargo, count = mineCargoCount();
  if (count) {
    let income = 0;
    for (const [kind, amount] of Object.entries(cargo)) income += MINE_ORES[kind].value * amount;
    farm.coins += income;
    farm.mine.incomeTotal += income;
    farm.mine.deliveredTotal += count;
    farm.mine.marketGoods = { ...cargo };
    farm.mine.lastDeliveryDay = farm.day;
    record(`阿矿把 ${count} 块矿石送到村口右侧摊屋，收入 ${income} 金。`);
    miner.cargo = {};
    miner.nextDeliveryDay = farm.day + 4;
    expandIfReady();
    updateUI(); save();
  }
  setMinerRoute('returnCart', MINE_MARKET_ROUTE.slice().reverse());
}
function updateMineLife(dt) {
  if (isFestivalDay()) {
    if (mineCargoCount()) {
      for (const [kind, count] of Object.entries(miner.cargo)) farm.mine.stock[kind] += count;
      miner.cargo = {};
    }
    miner.mode = 'home'; miner.route = []; miner.routeIndex = 0; miner.targetNode = null;
    miner.deliveryDay = 0;
    updateFestivalActor(miner, dt, MINE_HOME, 10, 'mine');
    return;
  }
  if (festivalAtHome(miner) && farm.phase < .02) return;
  if (miner.festival) miner.festival = null;
  if (miner.mode === 'homeRest') {
    if (farm.day === miner.deliveryDay || farm.phase < .045) return;
    miner.mode = 'home';
  }
  if (farm.phase >= NIGHT_START && miner.mode === 'rest')
    setMinerRoute('returnHome', MINE_REST_TO_HOME);
  else if (farm.phase >= NIGHT_START && !['home', 'returnHome', 'returnWithCargo', 'returnRest',
    'returnCart', 'toTea', 'teaHome', 'teaRest'].includes(miner.mode)) {
    setMinerRoute(mineCargoCount() ? 'returnWithCargo' : 'returnHome', minerReturnRoute());
  }
  if (miner.mode === 'teaRest') {
    miner.action += dt;
    if (miner.action >= 7.2 || farm.phase >= NIGHT_START)
      setMinerRoute('teaHome', MINE_TEA_RETURN);
    return;
  }
  if (['toNode', 'toCart', 'toMarket', 'returnRest', 'returnHome', 'returnWithCargo',
    'returnCart', 'toTea', 'teaHome'].includes(miner.mode)) {
    if (!moveMiner(dt)) return;
    if (miner.mode === 'toNode') { miner.mode = 'mining'; miner.action = 0; return; }
    if (miner.mode === 'toCart') {
      setMinerRoute('toMarket', MINE_MARKET_ROUTE);
      return;
    }
    if (miner.mode === 'toMarket') { deliverMinerCargo(); return; }
    if (miner.mode === 'returnCart') {
      setMinerRoute('toTea', MINE_TEA_OUTBOUND);
      return;
    }
    if (miner.mode === 'toTea') {
      miner.mode = 'teaRest'; miner.action = 0;
      miner.route = []; miner.routeIndex = 0;
      return;
    }
    if (miner.mode === 'returnRest') {
      miner.mode = 'rest'; miner.route = []; miner.routeIndex = 0; miner.targetNode = null;
      return;
    }
    if (miner.mode === 'returnWithCargo') {
      for (const [kind, count] of Object.entries(miner.cargo)) farm.mine.stock[kind] += count;
      miner.cargo = {};
    }
    if (miner.mode === 'teaHome') {
      miner.mode = 'homeRest'; miner.route = []; miner.routeIndex = 0;
      return;
    }
    miner.mode = 'home'; miner.route = []; miner.routeIndex = 0; miner.targetNode = null;
    return;
  }
  if (miner.mode === 'mining') {
    miner.action += dt;
    if (miner.action < .65) return;
    const workedNode = miner.targetNode;
    collectMineNode(workedNode, 'miner');
    const nextNode = MINE_LAYOUT.nodes.findIndex((_, index) => mineNodeReady(index));
    if (nextNode >= 0 && farm.phase < .44)
      setMinerRoute('toNode', MINE_NODE_TO_NODE(workedNode, nextNode), nextNode);
    else setMinerRoute('returnRest', MINE_NODE_TO_REST(workedNode));
    return;
  }
  if (farm.phase >= NIGHT_START || farm.phase < .045 || farm.phase >= .44
    || miner.deliveryDay === farm.day) return;
  if (farm.day >= miner.nextDeliveryDay && mineStockCount() > 0
    && miner.workedDay !== farm.day) {
    miner.cargo = { ...farm.mine.stock };
    farm.mine.stock = { stone: 0, copper: 0, quartz: 0 };
    miner.deliveryDay = farm.day;
    setMinerRoute('toCart', MINE_CART_PICKUP);
    return;
  }
  const nextNode = MINE_LAYOUT.nodes.findIndex((_, index) => mineNodeReady(index));
  if (nextNode >= 0) {
    miner.workedDay = farm.day;
    setMinerRoute('toNode', MINE_WORK_ROUTE(nextNode, miner.mode === 'rest'), nextNode);
  } else if (miner.mode === 'home') setMinerRoute('returnRest', MINE_HOME_TO_REST);
}
