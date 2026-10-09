'use strict';
// Habitat choices persist through refresh; the swarm never changes crops or transport stock.
function townSummerWeight() {
  const season=seasonTransition();
  return (season.from===1?1-season.amount:0)+(season.to===1?season.amount:0);
}
function townFireflyTarget(habitat) {
  const site=TOWN_LAYOUT.fireflyHabitats[habitat],angle=townRandom()*Math.PI*2,radius=Math.sqrt(townRandom());
  return {x:site.x+Math.cos(angle)*radius*site.rx,y:site.y+Math.sin(angle)*radius*site.ry};
}
function makeTownFirefly(habitat,id) {
  return {...townFireflyTarget(habitat),target:townFireflyTarget(habitat),habitat,id,wait:0,step:0,fade:0};
}
function updateTownFireflies(dt) {
  if(farm.paused)return;
  const town=farm.town,choice=town.fireflyChoice;
  if(choice.day!==farm.day && farm.phase>=.06){
    Object.assign(choice,makeTownFireflyChoice(),{day:farm.day});town.fireflies=[];
    const chance=(farm.weather==='rain' || farm.weatherFrom==='rain'?.8:.35)*townSummerWeight();
    choice.wetland=farm.nursery.level>0 && townRandom()<chance;
    const flowers=town.inventory.butterflySeed>0 && townPlantGrowth('butterflySeed',0)>.65;
    choice.meadow=flowers && townRandom()<chance;
  }
  const weather=weatherVisual(),clear=weather.rain<.25 && weather.snow<.25;
  if(choice.day===farm.day && !choice.appeared && farm.phase>=.59 && farm.phase<.73 && clear
    && (choice.wetland || choice.meadow)){
    choice.appeared=true;
    if(choice.wetland)for(let id=0;id<6;id++)town.fireflies.push(makeTownFirefly('wetland',id));
    if(choice.meadow)for(let id=6;id<10;id++)town.fireflies.push(makeTownFirefly('meadow',id));
    townNote('暖季的暮色中，几只萤火虫在芦苇与花叶间渐渐亮了起来。');
  }
  for(const fly of town.fireflies){
    fly.fade=clamp(fly.fade+dt*(clear && farm.phase<.88?.6:-.5),0,1);
    fly.step+=dt;
    if(fly.wait>0){fly.wait=Math.max(0,fly.wait-dt);continue;}
    const dx=fly.target.x-fly.x,dy=fly.target.y-fly.y,length=Math.hypot(dx,dy),travel=Math.min(length,dt*(9+fly.id%3*2));
    if(length>.01){fly.x+=dx/length*travel;fly.y+=dy/length*travel;}
    if(length<=travel+.01){fly.x=fly.target.x;fly.y=fly.target.y;fly.wait=.8+townRandom()*1.2;fly.target=townFireflyTarget(fly.habitat);}
  }
  if(!clear || farm.phase>=.88)town.fireflies=town.fireflies.filter(fly=>fly.fade>0);
}
function townFireflyAt(x,y) {
  return farm.town.fireflies.find(fly=>fly.fade>.15 && Math.hypot(fly.x-x,fly.y-5-y)<13);
}
function noticeTownFireflies() {
  const choice=farm.town.fireflyChoice;
  if(choice.observed)return false;
  choice.observed=true;farm.town.observations.firefly++;
  townNote('你在暮色中停下脚步，记住了这一夜芦苇与花叶间的萤光。',true);
  return true;
}
