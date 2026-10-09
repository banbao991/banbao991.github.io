'use strict';
// The original food birds own their meal; totals count only actual new servings.
function makeTownBirdMeals(){return {taken:0,finished:0,lastDay:0};}
function makeTownBirdMeal(day){return {day,elapsed:0,taken:false,done:false};}
function validateTownBirdMeals(town,day){
  if(!Object.hasOwn(town,'birdMeals'))town.birdMeals=makeTownBirdMeals();
  const count=v=>Number.isSafeInteger(v)&&v>=0;
  const total=town.birdMeals;
  const fail=()=>{throw new Error('存档里的驿屋鸟食状态不正确。');};
  if(!total||!['taken','finished','lastDay'].every(k=>count(total[k]))
    ||total.finished>total.taken||total.lastDay>day||total.taken===0&&total.lastDay!==0)fail();
  if(!Array.isArray(town.birds))fail();
  for(const bird of town.birds){
    // Old visitors already paid at invitation, so never charge their food twice.
    if(bird&&!Object.hasOwn(bird,'meal'))bird.meal=bird.variant===1?null:{day:0,elapsed:2.4,taken:true,done:true};
    if(bird?.variant===1){if(bird.meal!==null)fail();continue;}
    const meal=bird?.meal;
    if(!meal||!count(meal.day)||meal.day>day||!Number.isFinite(meal.elapsed)||meal.elapsed<0||meal.elapsed>2.4
      ||typeof meal.taken!=='boolean'||typeof meal.done!=='boolean'
      ||!meal.taken&&(meal.done||meal.elapsed!==0||meal.day===0)
      ||meal.done&&(!meal.taken||meal.elapsed!==2.4)
      ||meal.taken&&meal.day>0&&(meal.day!==total.lastDay||total.taken===0)
      ||meal.day===0&&(!meal.taken||!meal.done))fail();
  }
}
