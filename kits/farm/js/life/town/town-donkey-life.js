'use strict';
// A quiet pasture uses saved destinations; the mine and freight economy stay independent.
const TOWN_DONKEY_NAMES=['麦穗','豆包'];
function townDonkeyVisible(animal){return animal.mode!=='home';}
function townDonkeyAt(x,y){return farm.town.donkeys.find(animal=>townDonkeyVisible(animal)
  && inRect(x,y,animal.x-20,animal.y-29,animal.x+22,animal.y+15));}
function townDonkeyShelter(){const weather=weatherVisual();return farm.phase<.04 || farm.phase>=.48
  || weather.rain>=.25 || weather.snow>=.25;}
function townDonkeyPenTarget(){const pen=TOWN_LAYOUT.donkeyInn.pen;return {
  x:pen.left+62+townRandom()*(pen.right-pen.left-96),y:pen.top+56+townRandom()*(pen.bottom-pen.top-82)};}
function townDonkeyHomeRoute(animal){const site=TOWN_LAYOUT.donkeyInn,door=site.doors[animal.id];
  return [{...site.insideGate},{x:site.northGate.x,y:site.yardLaneY},{x:door.x,y:site.yardLaneY},{...door}];}
function townDonkeyRoute(animal,route,target){animal.mode='walk';animal.wait=0;townSetRoute(animal,route,target);}
function updateTownDonkeys(dt){
  if(farm.paused)return;
  const town=farm.town,site=TOWN_LAYOUT.donkeyInn,level=town.improvements.donkeyInn.level;
  const count=level===3?2:level?1:0;
  while(town.donkeys.length<count){const animal=makeTownDonkey(town.donkeys.length);town.donkeys.push(animal);
    townNote(`${TOWN_DONKEY_NAMES[animal.id]}住进东岸小驴驿，有了自己的草地与避雨棚。`);save();}
  updateTownDonkeyWaterPlan(dt);
  scheduleTownFodder();
  if(updateTownDonkeyBond(dt))return;
  for(const animal of town.donkeys){
    if(townDonkeyShelter()){
      if(animal.mode==='home')continue;
      if(animal.target!=='home'){
        const returning=animal.y<site.insideGate.y && animal.mode==='walk' && animal.route.length>1
          ?[...animal.route.slice(0,animal.index).reverse(),{...site.doors[animal.id]}]
          :townDonkeyHomeRoute(animal);
        townDonkeyRoute(animal,returning,'home');
      }
    } else if(animal.mode==='home'){
      const door=site.doors[animal.id];townDonkeyRoute(animal,[{x:door.x,y:site.yardLaneY},
        {x:site.northGate.x,y:site.yardLaneY},{...site.insideGate},townDonkeyPenTarget()],'pen');
    }
    if(updateTownFodderAnimal(animal,dt))continue;
    if(updateTownDonkeyWaterAnimal(animal,dt))continue;
    const visiting=townDonkeyVisitAnimal(animal);
    if(visiting && !townDonkeyShelter() && animal.y>=site.insideGate.y){
      if(distance(animal,site.greetSpot)<.01){animal.mode='rest';animal.dir=1;animal.walk=0;animal.wait=1;}
      else if(!animal.route.length || distance(animal.route.at(-1),site.greetSpot)>.01)
        townDonkeyRoute(animal,[{...site.greetSpot}],'pen');
    }
    if(animal.mode==='walk'){
      if(townDonkeyWaterHoldOther(animal,dt))continue;
      if(townFollowRoute(animal,dt,22)){
        animal.mode=animal.target==='home'?'home':townRandom()<.65?'graze':'rest';
        animal.walk=0;animal.route=[];animal.index=0;animal.wait=5+townRandom()*8;save();
      }
    } else if(animal.mode!=='home' && !visiting){
      animal.wait=Math.max(0,animal.wait-dt);
      if(animal.wait===0)townDonkeyRoute(animal,[townDonkeyPenTarget()],'pen');
    }
    const merchant=town.traveller;
    if(!visiting && !townDonkeyShelter() && !isFestivalDay() && town.construction?.id==='donkeyInn'
      && merchant.mode==='work' && animal.friendDay!==farm.day
      && ['graze','rest'].includes(animal.mode) && distance(animal,merchant)<190){
      townDonkeyRoute(animal,[{...site.greetSpot}],'pen');
    }
    if(animal.mode!=='home' && !isFestivalDay() && townTravellerVisible()
      && animal.friendDay!==farm.day && distance(animal,merchant)<43){
      animal.friendDay=farm.day;animal.waveUntil=now+2;
      townNote(`阿棠路过驴驿时，${TOWN_DONKEY_NAMES[animal.id]}凑过来蹭蹭他的手。`);save();
    }
  }
}
function townDonkeyActivity(animal){return townDonkeyWaterActivity(animal)||townDonkeyBondActivity(animal)
  ||(animal.target==='home'?'回棚避雨休息':animal.mode==='home'?'在棚里休息'
    :animal.target==='fodder'?(farm.town.fodder.eating?'在牧草架旁慢慢嚼草':'正走向牧草架')
    :animal.mode==='walk'?'在草地慢慢散步':animal.mode==='graze'?'安静嚼草':'歇脚、转转耳朵');}
function greetTownDonkey(animal){
  finishTownDonkeyBond();
  if(animal.greetedDay===farm.day){record(`${TOWN_DONKEY_NAMES[animal.id]}已经记得今天的问候，正慢慢嚼草。`);return;}
  animal.greetedDay=farm.day;animal.waveUntil=now+2.5;
  townNote(`你轻轻招呼${TOWN_DONKEY_NAMES[animal.id]}，它转转耳朵，抬头看了过来。`);updateUI();save();
}
