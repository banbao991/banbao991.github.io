'use strict';
const COURIER_PASTRY_NAMES=['春葱小饼','夏莓小饼','南瓜小饼','栗子小饼'];
function courierMealWeather() {const w=weatherVisual();return w.rain<.3&&w.snow<.25;}
function courierMealEating() {
  const m=farm.town.courierMeal;
  return m.stage==='eating' && m.day===farm.day && !isFestivalDay() && !courier.night
    && courier.leg==='market' && courier.lastReturnDay===farm.day && distance(courier,COURIER_HOME)<2;
}
// Called once at the original actual market arrival, after the goods are delivered.
function beginCourierMeal(delivered) {
  const m=farm.town.courierMeal;
  if(farm.paused || m.day===farm.day || !delivered || courier.leg!=='market'
    || courier.lastReturnDay!==farm.day || distance(courier,COURIER_HOME)>=2)return false;
  Object.assign(m,{day:farm.day,decided:true,chosen:false,stage:'idle',elapsed:0,theme:seasonIndex(),price:0});
  if(isFestivalDay() || courier.night || farm.upgrades<5 || farm.coins<5000
    || farm.phase>=.44 || !courierMealWeather() || hash(farm.day,courier.journeyDay,2711)>=.5)return false;
  const price=farm.coins>=500000?36:farm.coins>=100000?24:12;
  if(!townSpend(price,'goods',true))return false;
  Object.assign(m,{chosen:true,stage:'eating',price});m.bought++;m.spent+=price;
  townNote(`阿运送好货，在集市买了一份${COURIER_PASTRY_NAMES[m.theme]}，花费 ${price} 金，站在小车旁慢慢吃。`,true);
  return true;
}
function updateCourierMeal(dt) {
  if(farm.paused)return farm.town.courierMeal.stage==='eating';
  const m=farm.town.courierMeal;if(m.stage!=='eating')return false;
  if(!courierMealEating() || farm.phase>=NIGHT_START || !courierMealWeather()){
    m.stage='done';save();return false;
  }
  m.elapsed=Math.min(2.8,m.elapsed+dt);
  if(m.elapsed>=2.8){m.finished++;m.stage='done';townNote('阿运吃完赶集小饼，把纸袋收好，今天的货也送妥了。');save();}
  return true;
}
function courierMealActivity() {
  const m=farm.town.courierMeal;
  return courierMealEating()?`送好货，正在品尝${COURIER_PASTRY_NAMES[m.theme]} · ${Math.floor(m.elapsed/2.8*100)}%`:null;
}
function greetCourier() {
  record(courierMealEating()?`阿运举了举${COURIER_PASTRY_NAMES[farm.town.courierMeal.theme]}：“货送好啦，今天的小饼也很香。”`
    :`阿运 · ${courierActivity()} · 车上 ${Object.values(courier.cargo).reduce((a,b)=>a+b,0)} 件`);
  save();
}
