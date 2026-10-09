'use strict';
// Quiet visitors stay in the grass below the east garden, clear of transport roads.
function townGardenTarget() {
  const habitat=TOWN_LAYOUT.gardenHabitat;
  return {x:habitat.left+townRandom()*(habitat.right-habitat.left),
    y:habitat.top+townRandom()*(habitat.bottom-habitat.top)};
}
function makeTownCritter(kind,id) {
  return {...TOWN_LAYOUT.gardenHabitat.home,kind,id,mode:'arrive',target:townGardenTarget(),
    step:0,wait:0,shy:0,noticed:false};
}
function updateTownGardenLife(dt) {
  if(farm.paused)return;
  const town=farm.town,choice=town.gardenChoice;
  if(choice.day!==farm.day && farm.phase>=.07){
    choice.day=farm.day;choice.snails=false;choice.hedgehog=false;
    town.critters=town.critters.filter(animal=>animal.mode!=='hide');
    const mature=town.improvements.travellerGarden.level>0 && townImprovementGrowth('travellerGarden',0)>.6;
    if(mature && seasonTransition().winter<.5){
      choice.snails=townRandom()<(farm.weather==='rain'||farm.weatherFrom==='rain' ? .7 : .2);
      choice.hedgehog=seasonTransition().autumn>.5 && townRandom()<.45;
    }
    if(choice.snails && !town.critters.some(animal=>animal.kind==='snail')){
      town.critters.push(makeTownCritter('snail',0),makeTownCritter('snail',1));
      townNote('花园下方的湿草里，两只小蜗牛慢慢探出触角。');
    }
  }
  if(choice.day===farm.day && choice.hedgehog && farm.phase>=.60 && farm.phase<.76
    && !town.critters.some(animal=>animal.kind==='hedgehog')){
    town.critters.push(makeTownCritter('hedgehog',2));
    townNote('暮色中，一只刺猬从花园叶堆探出头，来寻找小虫。');
  }
  for(const animal of town.critters){
    if(animal.mode==='hide')continue;
    animal.step+=dt;animal.shy=Math.max(0,animal.shy-dt);
    if(farm.phase>=(animal.kind==='snail' ? .48 : .88) && animal.mode!=='leave'){
      animal.mode='leave';animal.target={...TOWN_LAYOUT.gardenHabitat.home};
    }
    if(animal.shy>0)continue;
    if(animal.mode==='forage'){
      animal.wait=Math.max(0,animal.wait-dt);
      if(animal.wait===0){animal.mode='arrive';animal.target=townGardenTarget();}
      continue;
    }
    const dx=animal.target.x-animal.x,dy=animal.target.y-animal.y,length=Math.hypot(dx,dy);
    const speed=animal.kind==='snail' ? (animal.mode==='leave'?8:4) : 18;
    const travel=Math.min(length,dt*speed);
    if(length>.01){animal.x+=dx/length*travel;animal.y+=dy/length*travel;}
    if(length<=travel+.01){
      animal.x=animal.target.x;animal.y=animal.target.y;
      if(animal.mode==='leave')animal.mode='hide';
      else {animal.mode='forage';animal.wait=1.5+townRandom()*2.5;}
    }
  }
}
function noticeTownAnimal(animal,kind) {
  if(!animal.noticed){
    animal.noticed=true;farm.town.observations[kind]++;
    const name={sparrow:'驿屋小雀',kingfisher:'溪畔翠鸟',robin:'冬日知更鸟',snail:'雨后蜗牛',hedgehog:'秋日刺猬',wagtail:'溪畔白鹡鸰',butterfly:'访花的小蝴蝶'}[kind];
    townNote(`你安静地观察了${name}，把这次偶遇记在小镇见闻中。`);
  }
  if(Object.hasOwn(animal,'shy'))animal.shy=2.5;
}
