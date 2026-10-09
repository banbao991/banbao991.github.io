'use strict';
function chickenEating(c) {
  const m=farm.town.henMeal;
  return m.stage==='eat' && m.day===farm.day && chickens[m.active]===c;
}
function chickenMealVisible() {return farm.town.inventory.henGrain>0 || farm.town.henMeal.served>0;}
function chickenMealAt(x,y) {
  const p=TOWN_LAYOUT.henMeal.tray;
  return chickenMealVisible() && inRect(x,y,p.x-9,p.y-4,p.x+9,p.y+5);
}
function chickenMealDescription() {
  const m=farm.town.henMeal;
  const action=m.stage==='eat'?`正在慢慢啄食 · ${Math.floor(m.elapsed/3.2*100)}%`
    :m.stage==='approach'?'一只小鸡正走向谷粒盘':'等鸡群来啄食';
  return `鸡舍谷粒盘 · 余 ${farm.town.inventory.henGrain} 份 · ${action} · 已吃完 ${m.finished} 份`;
}
function prepareChickenMeal() {
  if(farm.paused)return;
  let m=farm.town.henMeal;
  if(m.day!==farm.day)farm.town.henMeal=m={...makeTownHenMeal(),served:m.served,finished:m.finished};
  const weather=weatherVisual();
  if(m.day || farm.phase<.08 || farm.phase>=.36 || !farm.town.inventory.henGrain
    || weather.rain>=.4 || weather.snow>=.25)return;
  m.day=farm.day;m.chosen=hash(farm.day,3,2401)<.72;
  if(m.chosen){m.active=Math.floor(hash(farm.day,3,2402)*chickens.length);m.stage='approach';}
}
function updateChickenMeal(c,index,dt) {
  if(farm.paused)return farm.town.henMeal.active===index;
  const m=farm.town.henMeal;
  if(m.active!==index || !['approach','eat'].includes(m.stage))return false;
  const weather=weatherVisual();
  if(m.day!==farm.day || farm.phase>=.46 || weather.rain>=.4 || weather.snow>=.25) {
    m.stage='done';m.active=-1;c.wait=0;return false;
  }
  const p=TOWN_LAYOUT.henMeal.spot;c.tx=p.x;c.ty=p.y;
  if(m.stage==='approach') {
    const d=distance(c,p),travel=Math.min(d,dt*15);
    if(d>0){c.x+=(p.x-c.x)/d*travel;c.y+=(p.y-c.y)/d*travel;c.step+=travel/15*11;}
    if(distance(c,p)>1)return true;
    if(!farm.town.inventory.henGrain){m.stage='done';m.active=-1;c.wait=0;return false;}
    farm.town.inventory.henGrain--;m.served++;m.taken=true;m.stage='eat';
    townNote('一只小鸡走到谷粒盘边，低头慢慢啄食。');return true;
  }
  m.elapsed=Math.min(3.2,m.elapsed+dt);
  if(m.elapsed>=3.2){m.finished++;m.stage='done';m.active=-1;c.wait=0;}
  return true;
}
