'use strict';
// Calendar, continuous seasonal/weather transitions and daily world updates.
function seasonIndex() { return Math.floor((farm.day - 1) / 8) % 4; }

function dayInSeason() { return ((farm.day - 1) % 8) + 1; }

function seasonTransition() {
  const position = farm.day - 1 + farm.phase;
  const boundary = Math.round(position / 8) * 8;
  const halfWindow = 1.5;
  let from = seasonIndex(), to = from, amount = 0;
  if (boundary > 0 && Math.abs(position - boundary) < halfWindow) {
    from = ((boundary / 8 - 1) % 4 + 4) % 4;
    to = (boundary / 8) % 4;
    const progress = (position - boundary + halfWindow) / (halfWindow * 2);
    amount = progress * progress * (3 - 2 * progress);
  }
  const palette = {};
  for (const key of ['grass', 'grass2', 'dark', 'flower', 'tree', 'tree2']) {
    palette[key] = blendHex(seasons[from][key], seasons[to][key], amount);
  }
  const weights = index => (from === index ? 1 - amount : 0) + (to === index ? amount : 0);
  return { from, to, amount, palette, winter: weights(3), autumn: weights(2) };
}

function weatherVisual() {
  const from = farm.weatherFrom || farm.weather;
  const to = farm.weather;
  const progress = from === to ? 1 : clamp(farm.phase / .15, 0, 1);
  const amount = progress * progress * (3 - 2 * progress);
  const cloudFor = weather => weather === 'rain' ? .88 : weather === 'snow' ? .74 : weather === 'cloud' ? .58 : 0;
  const rainFor = weather => weather === 'rain' ? 1 : 0;
  const snowFor = weather => weather === 'snow' ? 1 : 0;
  return {
    from, to, amount,
    cloud: cloudFor(from) * (1 - amount) + cloudFor(to) * amount,
    rain: rainFor(from) * (1 - amount) + rainFor(to) * amount,
    snow: snowFor(from) * (1 - amount) + snowFor(to) * amount
  };
}

function chooseWeather(season, roll = Math.random()) {
  if (season === 3) return roll < .32 ? 'snow' : roll < .44 ? 'rain' : roll < .67 ? 'cloud' : 'sunny';
  return roll < (season === 0 ? .33 : .24) ? 'rain' : roll < .43 ? 'cloud' : 'sunny';
}

function timeText() {
  const minutes = Math.floor((360 + farm.phase * 1440) % 1440);
  const hour = Math.floor(minutes / 60), minute = minutes % 60;
  const part = hour < 5 ? '凌晨' : hour < 11 ? '早晨' : hour < 14 ? '午间' : hour < 18 ? '午后' : hour < 20 ? '傍晚' : '夜晚';
  return `${part} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function shortTime() {
  const m = Math.floor((360 + farm.phase * 1440) % 1440);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

function nextDay() {
  const previousWeather = farm.weather;
  const growingSeason = seasonIndex();
  farm.day++;
  farm.events = [];
  farm.phase = 0;
  if (isFestivalDay()) {
    prepareFestival();
    for (const order of farm.orders) if (order.due >= farm.day) order.due++;
    record(`今天是苔谷欢庆日 · ${festivalTheme().name}！大家到广场分享${festivalTheme().detail}，未完成订单顺延一天。`);
  }
  farm.marketGoods = {};
  farm.milkToday = 0;
  farm.eggsToday = 0;
  farm.eggsReady = true;
  farm.fruitReady ||= seasonIndex() !== 3
    && (farm.nursery.level >= 2 ? farm.day % 2 === 0 : farm.day % 3 === 0);
  farm.woolReady ||= villageSiteOpen('sheep') && farm.day % 3 === 0;
  farm.honeyReady ||= farm.upgrades >= 2 && farm.day % 2 === 0;
  farm.goatMilkReady ||= farm.goatBarnOpen;
  farm.nightLogged = false;
  farm.milked = [false, false];
  farm.weatherFrom = previousWeather;
  farm.weather = chooseWeather(seasonIndex());
  advanceEastGardenDay();
  spawnForageForDay();
  spawnFishForDay();
  farm.plots.forEach(p => {
    if (p.crop && p.age < crops[p.crop].days) {
      const winterFactor = growingSeason === 3 && !villageSiteOpen('greenhouse') ? .65 : 1;
      const growingTime = p.plantedAt == null ? 1 : clamp(1 - p.plantedAt, 0, 1);
      p.age = Math.min(crops[p.crop].days, p.age + (p.watered ? 1 : .45) * winterFactor * growingTime);
    }
    p.plantedAt = null;
    p.watered = farm.weather === 'rain';
  });
  cows.forEach(c => { c.milk = true; });
  workers.forEach(w => { w.task = null; w.action = 0; w.route = []; });
  const expired = farm.orders.filter(order => farm.day > order.due);
  farm.orders = farm.orders.filter(order => farm.day <= order.due);
  if (expired.length) record(`${expired.length} 份村民订单到期，阿葵整理了新的委托。`);
  while (farm.orders.length < 3 || (farm.day % 2 === 0 && !isFestivalDay() && farm.orders.length < 5)) {
    const order = makeOrder(farm.day, farm.nextOrderId++);
    farm.orders.push(order);
    record(`阿葵贴出${crops[order.crop].name}委托：${order.target} 份，第 ${order.due} 天前送达。`);
  }
  if (farm.weatherFrom !== farm.weather) {
    const names = { sunny: '晴天', cloud: '多云', rain: '细雨', snow: '飘雪' };
    record(`清晨的天气正从${names[farm.weatherFrom]}慢慢转为${names[farm.weather]}。`);
  } else record(farm.weather === 'rain' ? '细雨继续落下，田地自然喝饱了水。'
    : farm.weather === 'snow' ? '雪花仍在缓缓飘落，农场铺上一层冬日的安静。'
      : '晨光照亮了农场，新的一天开始。');
  if (dayInSeason() === 1) record(`${seasons[seasonIndex()].name}正式开始，风景还会慢慢染上新颜色。`);
  if (farm.honeyReady && farm.day % 2 === 0) record('蜂箱酿好了蜂蜜，小禾会把它收进主场货箱。');
  expandIfReady();
  updateUI(); save();
}
