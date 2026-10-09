'use strict';
// A bird takes grain only after its own flight reaches the original tray.
function townBirdEating(bird){return bird.variant!==1&&bird.mode==='perch'&&bird.meal?.taken&&!bird.meal.done&&bird.meal.day===farm.day;}
function beginTownBirdMeal(bird){
  if(bird.variant===1||bird.meal.taken)return true;
  const total=farm.town.birdMeals;
  if(!villageSiteOpen('traveller')||bird.meal.day!==farm.day||total.lastDay===farm.day||!farm.town.inventory.birdFeed
    ||distance(bird,townBirdPerch(bird))>1)return false;
  farm.town.inventory.birdFeed--;total.taken++;total.lastDay=farm.day;
  bird.meal.taken=true;farm.town.careDay=farm.day;
  townNote(`${bird.variant===2?'冬日知更鸟':'驿屋小雀'}落在浅盘边，取了一份谷粒慢慢吃。`);
  return true;
}
function updateTownBirdMeal(bird,dt){
  if(farm.paused||!townBirdEating(bird))return;
  bird.meal.elapsed=Math.min(2.4,bird.meal.elapsed+dt);
  if(bird.meal.elapsed>=2.4){bird.meal.done=true;farm.town.birdMeals.finished++;}
}
function townBirdMealActivity(bird){
  if(bird.mode==='leave')return '正沿来路飞走';
  if(bird.mode!=='perch')return bird.variant===1&&bird.mode==='dive'?'掠过水面觅食':'正在飞行';
  if(townBirdEating(bird))return `正在啄谷粒 · ${Math.floor(bird.meal.elapsed/2.4*100)}%`;
  return bird.variant===1?'停着歇脚':'吃过谷粒，抬头整理羽毛';
}
function townBirdMealDescription(){
  const bird=farm.town.birds.find(b=>b.variant!==1);
  return `驿屋鸟食 · 余 ${farm.town.inventory.birdFeed} 份 · ${bird?townBirdMealActivity(bird):'等小鸟来啄食'} · 已吃完 ${farm.town.birdMeals.finished} 份`;
}
