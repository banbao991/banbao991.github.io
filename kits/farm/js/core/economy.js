'use strict';
// Farm orders, journal events, planting choices and construction milestones.
function makeOrder(day, serial = 0) {
  const s = Math.floor((day - 1) / 8) % 4;
  const menus = [['wheat', 'strawberry', 'carrot'], ['corn', 'strawberry', 'wheat'], ['pumpkin', 'carrot', 'corn'], ['carrot', 'wheat', 'strawberry']];
  const crop = day === 1 ? menus[0][serial % 3] : menus[s][Math.floor(hash(day, serial + 17) * menus[s].length)];
  const target = 3 + (day + serial) % 4;
  return { id: serial + 1, crop, target, progress: 0, due: day + 4 + serial % 3,
    reward: 45 + target * 11, focus: serial === 0 };
}

function record(text) {
  farm.events.unshift({ day: farm.day, time: shortTime(), text });
  farm.events = farm.events.slice(0, 10);
  updateUI();
}

function chooseCrop() {
  const priority = farm.orders.filter(order => order.focus && farm.coins >= crops[order.crop].cost)
    .sort((a, b) => a.due - b.due)[0];
  if (priority && Math.random() < .62) return priority.crop;
  const s = seasonIndex();
  const n = Math.random();
  if (s === 3) return n < .65 ? 'carrot' : 'wheat';
  if (s === 2) return n < .4 ? 'pumpkin' : n < .72 ? 'corn' : 'carrot';
  if (s === 1) return n < .44 ? 'corn' : n < .72 ? 'strawberry' : 'wheat';
  return n < .35 ? 'wheat' : n < .64 ? 'strawberry' : n < .86 ? 'carrot' : 'corn';
}

function addExpansionPlots(bounds) {
  for (const { x, y } of fieldCells(bounds)) farm.plots.push({ x, y, crop: null, age: 0, watered: false });
}

function expandIfReady() {
  if (farm.upgrades === 0 && farm.coins >= 250) {
    farm.coins -= 120;
    addExpansionPlots(FIELD_EXPANSIONS.east);
    farm.upgrades = 1;
    record('收成不错！东侧新开垦了 18 格田地，路边留着草地。');
  } else if (farm.upgrades === 1 && farm.coins >= 430) {
    farm.coins -= 120;
    farm.upgrades = 2;
    record('果园边摆上了蜂箱，花香引来了蜜蜂。');
  } else if (farm.upgrades === 2 && farm.coins >= 680) {
    farm.coins -= 250;
    farm.upgrades = 3;
    addExpansionPlots(FIELD_EXPANSIONS.upperSouth);
    record('温室落成啦！田地也延伸到了南边。');
  } else if (farm.upgrades === 3 && farm.coins >= 1200) {
    farm.coins -= 400;
    farm.upgrades = 4;
    addExpansionPlots(FIELD_EXPANSIONS.south);
    farm.woolReady = true;
    addPastureWorker();
    record('南方牧场开放了！阿牧来到羊舍照顾羊群，闲时在两舍之间歇脚。');
  } else if (farm.upgrades === 4 && !farm.goatBarnOpen && farm.coins >= 1500) {
    farm.coins -= 300;
    farm.goatBarnOpen = true;
    farm.goatMilkReady = true;
    resetMeadowLife();
    record('山羊舍落成了！糯米和栗子搬进草甸，开始在围栏里散步。');
  } else if (farm.upgrades === 4 && farm.goatBarnOpen && farm.coins >= 1900) {
    farm.coins -= 600;
    farm.upgrades = 5;
    record('村口集市开张了，今后的作物能卖出更好的价钱。');
  }
}
