'use strict';
// Borrow the original squirrel's berry route. Food is removed only after actual arrival.
function squirrelEating(){return farm.town.squirrelMeal.wait>0;}
function stopSquirrelMeal(){const m=farm.town.squirrelMeal;m.wait=0;m.berry=null;}
function squirrelMealWeather(){const w=weatherVisual();return w.rain>=.72||w.snow>=.4;}
function updateSquirrelMeal(dt){
  if(farm.paused)return squirrelEating();
  const m=farm.town.squirrelMeal;
  if(m.day!==farm.day){stopSquirrelMeal();Object.assign(m,makeSquirrelMeal(),{day:farm.day,total:m.total});}
  if(squirrelEating()){
    if(farm.phase>=NIGHT_START||squirrelMealWeather()){stopSquirrelMeal();return false;}
    squirrel.moving=false;m.wait=Math.max(0,m.wait-dt);
    if(m.wait===0){m.berry=null;squirrel.wait=.45;save();}
    return true;
  }
  if(m.decided||farm.phase<.06||farm.phase>=.46||seasonTransition().winter>=.8
    ||squirrelMealWeather()||squirrel.moving||squirrel.wait<=0)return false;
  const berry=farm.forage.filter(site=>site.kind==='berry'&&site.x>960&&site.x<1280
    &&distance(squirrel,site)<19).sort((a,b)=>distance(squirrel,a)-distance(squirrel,b))[0];
  if(!berry)return false;
  m.decided=true;
  if(hash(farm.day,1141)>=.65){save();return false;}
  const index=farm.forage.findIndex(site=>site===berry);
  if(index<0)return false;
  farm.forage.splice(index,1);
  m.eaten=true;m.total++;m.wait=2.8;m.berry={x:berry.x,y:berry.y};squirrel.moving=false;
  squirrel.dir=berry.x<squirrel.x?-1:1;
  record('松鼠跑到野莓旁，采下一簇抱着慢慢吃。');save();return true;
}
function squirrelMealDescription(){return squirrelEating()?'正抱着野莓慢慢吃':farm.town.squirrelMeal.eaten&&farm.town.squirrelMeal.day===farm.day?'今天已经采食一簇野莓':'';}
