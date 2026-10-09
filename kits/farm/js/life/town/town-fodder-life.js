'use strict';
function townFodderInterrupted(){return townDonkeyWaterBusy()||townDonkeyShelter()||farm.phase>=.45
  ||['out','wait','feed'].includes(farm.town.donkeyVisit.stage)||farm.town.construction?.id==='donkeyInn';}
function townCancelFodder(){const meal=farm.town.fodder,animal=farm.town.donkeys[meal.active];
  if(animal?.target==='fodder'){animal.target='pen';animal.mode='graze';animal.route=[];animal.index=0;animal.wait=6;}
  meal.queue=[];meal.active=-1;meal.departing=-1;meal.eating=false;meal.wait=0;
}
function scheduleTownFodder(){const town=farm.town,meal=town.fodder;
  if(meal.day!==farm.day&&(meal.active>=0||meal.departing>=0||meal.queue.length))townCancelFodder();
  if(townFodderInterrupted()){if(meal.active>=0||meal.departing>=0||meal.queue.length)townCancelFodder();return;}
  if(meal.day!==farm.day&&town.inventory.fodder>0&&farm.phase>=.18&&farm.phase<.34){
    const ready=town.donkeys.filter(animal=>animal.mode!=='home'&&animal.target!=='home'
      &&animal.y>=TOWN_LAYOUT.donkeyInn.insideGate.y).map(animal=>animal.id);
    if(ready.length){meal.day=farm.day;meal.chosen=townRandom()<.55+.2*seasonTransition().winter;
      if(meal.chosen)meal.queue=ready.sort((a,b)=>(a+farm.day)%2-(b+farm.day)%2);save();}
  }
  if(meal.departing>=0){
    if(distance(town.donkeys[meal.departing],TOWN_LAYOUT.fodder.stand)<50)return;
    meal.departing=-1;
  }
  if(meal.active<0&&meal.queue.length){
    if(town.inventory.fodder>0)meal.active=meal.queue.shift();else meal.queue=[];
  }
}
function updateTownFodderAnimal(animal,dt){const town=farm.town,meal=town.fodder,site=TOWN_LAYOUT.fodder;
  if(meal.active!==animal.id)return false;
  if(townFodderInterrupted()){townCancelFodder();return false;}
  if(!meal.eating){
    if(town.inventory.fodder<=0){townCancelFodder();return false;}
    if(animal.target!=='fodder')townDonkeyRoute(animal,[{...site.stand}],'fodder');
    if(!townFollowRoute(animal,dt,22))return true;
    animal.mode='graze';animal.dir=-1;animal.walk=0;animal.route=[];animal.index=0;
    meal.eating=true;meal.wait=3.5;town.inventory.fodder--;meal.served++;
    townNote(`${TOWN_DONKEY_NAMES[animal.id]}走到牧草架，慢慢嚼了一份干草。`);save();return true;
  }
  animal.dir=-1;animal.mode='graze';animal.walk=0;meal.wait=Math.max(0,meal.wait-dt);
  if(meal.wait===0){
    const y=site.stand.y+52+animal.id*6;
    townDonkeyRoute(animal,[{x:site.stand.x,y},{x:TOWN_LAYOUT.donkeyInn.pen.left+94+animal.id*46,y}],'pen');
    meal.departing=animal.id;meal.active=-1;meal.eating=false;save();
  }
  return true;
}
function townFodderDescription(){const town=farm.town,meal=town.fodder,animal=town.donkeys[meal.active];
  if(!town.improvements.donkeyInn.level)return '小驴驿建成后，可以在商人货架添些干牧草。';
  return `驴驿牧草 · ${town.inventory.fodder}/8 份 · ${animal?`${TOWN_DONKEY_NAMES[animal.id]}${meal.eating?'在架旁慢慢嚼草':'正走向牧草架'}`:meal.departing>=0?'吃完的小驴先让出架旁':'偶尔轮流来吃草'} · 已吃 ${meal.served} 份`;
}
