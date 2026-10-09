'use strict';
// Brief greetings acknowledge nearby residents without interrupting their work or routes.
function townStoryText() {
  const story=TOWN_STORIES[farm.town.traveller.storyIndex];
  return story ? `「${story.title}」${story.text}` : '等阿棠下一次来访，再听听新的旅行故事。';
}
function townReadStory() {
  const actor=farm.town.traveller;
  if(!townShopOpen() || actor.storyIndex<0 || actor.storyHeard)return false;
  actor.storyHeard=true;actor.waveUntil=now+3;
  townNote(`你在驿屋听完一段旅行故事：${townStoryText()}`,true);
  updateUI();save();return true;
}
function townNearbyResidents() {
  const residents=workers.filter(person=>!festivalAtHome(person) && distance(person,workerHome(person))>20)
    .map(person=>({name:person.name,person}));
  for(const [name,person,visible] of [
    ['阿运',courier,courierAt(courier.x,courier.y)],
    ['阿宁',villageWalker,!villageWalkerAtHome()],
    ['阿蓼',angler,!!angler.routine && anglerAt(angler.x,angler.y)],
    ['阿葵',orderKeeper,!festivalAtHome(orderKeeper) && distance(orderKeeper,ORDER_KEEPER_HOME)>20],
    ['阿森',forestKeeper,forestKeeperVisible()],
    ['阿芽',nurseryKeeper,nurseryKeeperAt(nurseryKeeper.x,nurseryKeeper.y)
      && distance(nurseryKeeper,NURSERY_LAYOUT.home.door)>20],
    ['阿矿',miner,minerAt(miner.x,miner.y) && distance(miner,MINE_HOME)>20]
  ])if(visible)residents.push({name,person});
  return residents;
}
function updateTownGreetings(dt) {
  const actor=farm.town.traveller;
  if(farm.paused || isFestivalDay() || !townTravellerVisible() || farm.phase<.04 || farm.phase>.46)return;
  const greetings=actor.greetings;
  if(greetings.day!==farm.day){greetings.day=farm.day;greetings.names=[];greetings.wait=0;}
  greetings.wait=Math.max(0,greetings.wait-dt);
  if(greetings.wait>0 || greetings.names.length>=3)return;
  const neighbor=townNearbyResidents().filter(entry=>!greetings.names.includes(entry.name)
    && distance(actor,entry.person)<64).sort((a,b)=>distance(actor,a.person)-distance(actor,b.person))[0];
  if(!neighbor)return;
  greetings.names.push(neighbor.name);greetings.wait=8;
  actor.waveUntil=now+2.5;neighbor.person.waveUntil=now+2.5;
  townNote(`阿棠在路边遇见${neighbor.name}，两人挥手问好，各自接着忙手头的事。`);
}
