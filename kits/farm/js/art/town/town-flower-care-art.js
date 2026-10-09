'use strict';
// Soil and droplets belong to each pot; the lifted can belongs to its gardener.
function drawTownFlowerSoil(index){
  const pot=TOWN_LAYOUT.flowerPots[index],care=farm.town.flowerCare.pots[index];
  const damp=care?.damp ?? .7;rect(pot.x-5,pot.y-9,10,2,blendHex('#a28a63','#6e7861',damp));
  const visit=farm.town.flowerCare.visit;
  if(visit.stage==='water' && visit.targets[visit.index]===index && !isFestivalDay()){
    const drop=(farm.paused?now:motionNow)*7%3;
    for(let i=0;i<3;i++)rect(pot.x-4+i*3,pot.y-12+drop+i,1,3,'#a9c8ba');
  }
}
function drawTownFlowerWatering(actor){
  const x=Math.round(actor.x),y=Math.round(actor.y),lift=Math.round(Math.sin(now*2)*1);
  rect(x+9,y-24-lift,4,17,'#dfb28b');rect(x+6,y-30-lift,12,9,'#8fa9a2');
  rect(x+9,y-34-lift,6,4,'#b7c8b6');rect(x-2,y-30-lift,9,3,'#9daf9f');
}
