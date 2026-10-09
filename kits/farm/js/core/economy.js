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
  farm.events = farm.events.filter(event => event.day === farm.day);
  farm.events.unshift({ day: farm.day, time: shortTime(), text });
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
  if(farm.paused||isFestivalDay())return;
  const d=farm.development.independent;
  const tasks=[
    ['eastFields',250,120,FIELD_EXPANSIONS.east,'东侧田地开垦好了，又多了十八格土地。'],
    ['beehives',430,120,null,'果园边摆上蜂箱，花香引来了蜜蜂。'],
    ['upperFields',680,150,FIELD_EXPANSIONS.upperSouth,'主场田地向南延伸，阿麦也来帮忙了。'],
    ['southFields',1200,250,FIELD_EXPANSIONS.south,'伙伴们开垦好了下面的新田地。'],
    ['market',1900,600,null,'村口集市开张了，今后的作物能卖出更好的价钱。']
  ];
  const next=tasks.find(([id])=>!d[id]);
  if(!next||farm.coins<next[1])return;
  const [id,,price,bounds,text]=next;farm.coins-=price;d[id]=true;
  if(bounds)addExpansionPlots(bounds);
  farm.upgrades=Object.values(d).filter(Boolean).length;
  if(id==='upperFields'){
    farm.development.residents['阿麦']={stage:'home',project:null,arrivedAt:farm.day+farm.phase};addFarmWorker();
  }
  record(text);
}
