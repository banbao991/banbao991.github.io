'use strict';
// Read-only head and grain poses stay inside the existing bird and support items.
function townBirdMealHeadBob(bird){
  if(!townBirdEating(bird))return bird.mode==='perch'?Math.sin(now*2+bird.id)*.5:0;
  const t=bird.meal.elapsed;
  const envelope=smoothRange(0,.25,t)*(1-smoothRange(2.15,2.4,t));
  return envelope*(.5+.5*Math.sin(t*Math.PI*2.5))*(bird.variant===2?5:8)
    +Math.sin(now*3+bird.id)*.5;
}
function drawTownBirdGrain(){
  const bird=farm.town.birds.find(townBirdEating),tray=TOWN_LAYOUT.feeding;
  const count=bird?Math.ceil(7*(1-bird.meal.elapsed/2.4)):farm.town.inventory.birdFeed?7:0;
  for(let i=0;i<count;i++)rect(tray.x-8+i*3,tray.y-3+i%2,2,2,'#e2bc71');
}
