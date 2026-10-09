'use strict';
function townDogYardTarget() {
  const yard=TOWN_LAYOUT.dogYard;
  return {x:yard.left+townRandom()*(yard.right-yard.left),y:yard.top+townRandom()*(yard.bottom-yard.top)};
}
function townDogRoad(home=false) {
  const lane=[{x:2070,y:1040},{x:2052,y:1040},{x:2052,y:950},{x:2272,y:950},{x:2272,y:812},
    {x:TOWN_LAYOUT.home.door.x,y:812},{...TOWN_LAYOUT.home.door}];
  return home?lane:lane.slice().reverse();
}
function townDogSetRoute(route,target) {
  const dog=farm.town.dog;dog.route=route.map(p=>({...p}));dog.index=0;dog.target=target;dog.mode='walk';
}
function townDogVisible() { const dog=farm.town.dog;return villageSiteOpen('traveller') && dog.present && !['away','home'].includes(dog.mode); }
function updateTownDog(dt) {
  if(!villageSiteOpen('traveller'))return;
  if(farm.paused)return;
  const town=farm.town,dog=town.dog,merchant=town.traveller;
  if(dog.visit!==town.visits && merchant.mode!=='away'){
    Object.assign(dog,makeTownDog(),{visit:town.visits,present:townRandom()<.6});
    if(dog.present){townDogSetRoute([{x:2272,y:950},{x:2052,y:950},{x:2052,y:1040},{x:2070,y:1040}],'yard');
      townNote('这趟来访，阿棠带着旅伴小狗豆豆，一起沿村路走进苔谷。');}
  }
  if(!dog.present){updateTownDogStretch(dt);return;}
  if((merchant.target==='leave' || merchant.mode==='away') && dog.target!=='leave'){
    const lane=dog.x>2160?2272:2052;
    townDogSetRoute([{x:lane,y:dog.y},{x:lane,y:950},{x:2272,y:950},{...TOWN_LAYOUT.gate}],'leave');
  }
  const weather=weatherVisual(),indoors=isFestivalDay() || farm.phase>=.46 || weather.rain>=.25 || weather.snow>=.25;
  if(dog.target!=='leave' && indoors && dog.target!=='home'){
    if(dog.mode==='walk'){
      // Turn back along the traversed route instead of cutting through the cart or house.
      const fromHome=dog.route.some(p=>p.x===TOWN_LAYOUT.home.door.x);
      const homeRoute=fromHome?dog.route.slice(0,dog.index).reverse()
        :dog.route.length>1?[...dog.route.slice(0,dog.index).reverse(),{x:2272,y:950},{x:2272,y:812},
          {x:TOWN_LAYOUT.home.door.x,y:812},{...TOWN_LAYOUT.home.door}]:townDogRoad(true);
      townDogSetRoute(homeRoute,'home');
    }else townDogSetRoute(townDogRoad(true),'home');
  }
  updateTownDogStretch(dt);
  if(dog.mode==='home'){
    if(!indoors && merchant.mode!=='away' && farm.phase>=.04)townDogSetRoute(townDogRoad(false),'yard');
    return;
  }
  if(dog.mode==='rest'){
    dog.wait=Math.max(0,dog.wait-dt);
    if(dog.wait===0)townDogSetRoute([townDogYardTarget()],'yard');
    return;
  }
  const speed=dog.target==='leave'?230:dog.route.length>1?170:35;
  if(townFollowRoute(dog,dt,speed)){
    dog.walk=0;
    if(dog.target==='leave'){dog.mode='away';dog.present=false;}
    else if(dog.target==='home'){dog.mode='home';dog.x=TOWN_LAYOUT.home.door.x;dog.y=TOWN_LAYOUT.home.door.y;}
    else{dog.mode='rest';dog.wait=1.5+townRandom()*2.5;}
  }
}
function townDogAt(x,y) {const d=farm.town.dog,reach=townDogStretchActive()?townDogStretchPose().reach+2:0;
 return townDogVisible()&&inRect(x,y,d.x-22-(d.dir<0?reach:0),d.y-20,d.x+22+(d.dir>0?reach:0),d.y+7);}
function updateTownDogGreetings() {
  const dog=farm.town.dog;
  if(farm.paused || isFestivalDay() || !townDogVisible() || dog.target!=='yard'
    || farm.phase<.04 || farm.phase>=.46 || dog.friendDay===farm.day)return;
  const neighbor=townNearbyResidents().filter(entry=>distance(dog,entry.person)<64)
    .sort((a,b)=>distance(dog,a.person)-distance(dog,b.person))[0];
  if(!neighbor)return;
  dog.friendDay=farm.day;dog.friendName=neighbor.name;dog.wagUntil=now+4;
  if(Math.abs(neighbor.person.x-dog.x)>1)dog.dir=neighbor.person.x<dog.x?-1:1;
  neighbor.person.waveUntil=Math.max(neighbor.person.waveUntil||0,now+2.5);
  townNote(`${neighbor.name}经过驿屋，向豆豆挥挥手；小狗转头摇尾，目送这位邻居继续忙自己的事。`);
  save();
}
function greetTownDog() {
  const dog=farm.town.dog;dog.wagUntil=now+3;
  if(dog.greetedDay!==farm.day){dog.greetedDay=farm.day;townNote('豆豆抬起头，向你轻轻摇尾巴，像在向新朋友问好。',true);}
  updateUI();save();
}
