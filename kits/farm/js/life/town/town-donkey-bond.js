'use strict';
function townDonkeyBondActive(){return farm.town.donkeyBond.stage!=='idle';}
function townDonkeyBondInterrupted(){const town=farm.town,meal=town.fodder;
  return townDonkeyWaterBusy()||townDonkeyShelter()||farm.phase>=.46||town.construction?.id==='donkeyInn'
    ||['out','wait','feed'].includes(town.donkeyVisit.stage)
    ||meal.active>=0||meal.departing>=0||meal.queue.length>0;
}
function townDonkeyBondClear(point){const meadow=TOWN_LAYOUT.donkeyBond;
  return inRect(point.x,point.y,meadow.left,meadow.top,meadow.right,meadow.bottom);
}
function townDonkeyBondTargets(left){const animals=farm.town.donkeys,meadow=TOWN_LAYOUT.donkeyBond;
  const x=clamp((animals[0].x+animals[1].x)/2,meadow.left+25,meadow.right-25);
  const y=clamp((animals[0].y+animals[1].y)/2,meadow.top+2,meadow.bottom-2);
  const spots=[{x:x-25,y:y-2},{x:x+25,y:y+2}];
  // Check the entire simultaneous approach, including the first animal waiting at its seat.
  const targets=animals.map(animal=>spots[animal.id===left?0:1]);
  const lengths=animals.map((animal,id)=>distance(animal,targets[id]));
  const duration=Math.max(...lengths)/22;
  for(let t=0;t<=duration+.1;t+=.1){
    const pair=animals.map((animal,id)=>{const mix=lengths[id]?Math.min(1,t*22/lengths[id]):1;
      return {x:animal.x+(targets[id].x-animal.x)*mix,y:animal.y+(targets[id].y-animal.y)*mix};});
    if(pair.some(point=>!townDonkeyBondClear(point))||distance(...pair)<40)return null;
  }
  return spots;
}
function finishTownDonkeyBond(completed=false){const bond=farm.town.donkeyBond;
  if(!townDonkeyBondActive())return;
  for(const animal of farm.town.donkeys)Object.assign(animal,{mode:'rest',target:'pen',route:[],index:0,walk:0,wait:3});
  Object.assign(bond,{stage:'idle',left:-1,spots:[],wait:0});
  if(completed){bond.sessions++;townNote(TOWN_DONKEY_NAMES.join('与')+'在草场慢慢靠近，轻轻蹭了蹭鼻子，又各自低头嚼草。');}
  save();
}
function updateTownDonkeyBond(dt){
  if(farm.paused)return townDonkeyBondActive();
  const town=farm.town,bond=town.donkeyBond;
  if(bond.day!==farm.day){finishTownDonkeyBond();Object.assign(bond,{day:farm.day,decided:false});}
  if(townDonkeyBondActive()){
    if(townDonkeyBondInterrupted()||town.donkeys.some(animal=>animal.target!=='pen'
      ||!townDonkeyBondClear(animal))){finishTownDonkeyBond();return false;}
    if(bond.stage==='out'){
      bond.wait+=dt;
      for(const animal of town.donkeys){
        if(townFollowRoute(animal,dt,22)){
          animal.mode='rest';animal.walk=0;animal.dir=animal.id===bond.left?1:-1;
        }
      }
      if(town.donkeys.every(animal=>distance(animal,bond.spots[animal.id===bond.left?0:1])<.01)){
        bond.stage='nuzzle';bond.wait=0;save();
      }else if(bond.wait>=8)finishTownDonkeyBond();
    }else{
      bond.wait=Math.min(4.4,bond.wait+dt);
      if(bond.wait>=4.4)finishTownDonkeyBond(true);
    }
    return true;
  }
  if(bond.decided||town.donkeys.length!==2||farm.phase<.30||farm.phase>=.42
    ||townDonkeyBondInterrupted()||town.donkeys.some(animal=>!['graze','rest'].includes(animal.mode)
      ||animal.target!=='pen'||!townDonkeyBondClear(animal)||animal.waveUntil>now)
    ||distance(...town.donkeys)<40||distance(...town.donkeys)>110)return false;
  const left=town.donkeys[0].x<=town.donkeys[1].x?0:1,spots=townDonkeyBondTargets(left);
  if(!spots)return false;
  const travel=Math.max(...town.donkeys.map(animal=>distance(animal,spots[animal.id===left?0:1])))/22;
  if(travel+4.4+dt>(.46-farm.phase)*DAY_SECONDS)return false;
  bond.decided=true;
  if(townRandom()>=.55){save();return false;}
  Object.assign(bond,{stage:'out',left,spots,wait:0});
  for(const animal of town.donkeys)townDonkeyRoute(animal,[spots[animal.id===left?0:1]],'pen');
  save();return true;
}
function townDonkeyBondActivity(animal){return townDonkeyBondActive()
  ?farm.town.donkeyBond.stage==='out'?`慢慢走近${TOWN_DONKEY_NAMES[1-animal.id]}`:`和${TOWN_DONKEY_NAMES[1-animal.id]}轻轻蹭鼻子`:null;}
