module.exports=function checkTownDog(run,assert){
  const checks=run(`(() => {
    const original=farm,result={arrival:true,choice:true,motion:true,space:true,pause:true,home:true,festival:true,leave:true,earlyRain:true,greet:true,depth:true,save:true};
    try{
      farm=newFarm();farm.coins=100000;farm.town.merchantUnlocked=true;farm.town.visits=1;farm.town.seed=1;
      const actor=farm.town.traveller;Object.assign(actor,{mode:'shop',...TOWN_LAYOUT.counter});
      updateTownDog(.05);const dog=farm.town.dog,seed=farm.town.seed;
      result.choice=dog.present && dog.visit===1;updateTownDog(.05);result.choice &&=farm.town.seed===seed;
      const collide=()=>{
        const x=dog.x,y=dog.y;
        return inRect(x,y,TOWN_LAYOUT.cart.left-8,TOWN_LAYOUT.cart.top,TOWN_LAYOUT.cart.right+8,TOWN_LAYOUT.cart.bottom+5)
          || inRect(x,y,TOWN_LAYOUT.home.left,TOWN_LAYOUT.home.top,TOWN_LAYOUT.home.right,TOWN_LAYOUT.home.bottom)
          || inRect(x,y,TOWN_LAYOUT.showcase.left,TOWN_LAYOUT.showcase.top,TOWN_LAYOUT.showcase.right,TOWN_LAYOUT.showcase.bottom)
          || inRect(x,y,TOWN_LAYOUT.garden.x-47,TOWN_LAYOUT.garden.y-25,TOWN_LAYOUT.garden.x+47,TOWN_LAYOUT.garden.y+51);
      };
      for(let i=0;i<100&&dog.mode==='walk';i++){updateTownDog(.05);result.space &&=!collide();}
      result.arrival=dog.mode==='rest';const first={x:dog.x,y:dog.y};
      for(let i=0;i<200;i++){updateTownDog(.05);result.space &&=!collide();}
      result.motion=distance(dog,first)>1;
      const shelf=TOWN_LAYOUT.dogYard;
      result.space &&=dog.x>=shelf.left && dog.x<=shelf.right && dog.y>=shelf.top && dog.y<=shelf.bottom;
      const item=farmSceneItems().find(item=>item.id==='town-traveller-dog');
      result.depth=item && item.y===dog.y+6 && (item.layer||0)===0 && townDogAt(dog.x,dog.y);
      const events=farm.town.events.length;greetTownDog();greetTownDog();
      result.greet=farm.town.events.length===events+1 && dog.greetedDay===farm.day && dog.wagUntil>now;
      const saved=JSON.stringify(farm.town);farm.paused=true;updateTownDog(5);farmSceneItems();
      result.pause=JSON.stringify(farm.town)===saved;farm.paused=false;
      result.save=JSON.stringify(parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))}).town)===saved;
      farm.weather='rain';farm.weatherFrom='rain';
      for(let i=0;i<150&&dog.mode!=='home';i++){updateTownDog(.05);result.space &&=!collide();}
      result.home=dog.mode==='home' && !townDogVisible();
      farm.weather='sunny';farm.weatherFrom='sunny';farm.day=10;farm.phase=.2;
      for(let i=0;i<20;i++)updateTownDog(.05);result.festival=dog.mode==='home';
      farm.day=11;farm.phase=.08;
      for(let i=0;i<150&&dog.mode!=='rest';i++){updateTownDog(.05);result.space &&=!collide();}
      result.home &&=dog.mode==='rest';actor.target='leave';actor.mode='leave';
      for(let i=0;i<100&&dog.present;i++){updateTownDog(.05);result.space &&=!collide();}
      result.leave=!dog.present && dog.mode==='away' && distance(dog,TOWN_LAYOUT.gate)<.01;
      farm.town.visits++;farm.town.seed=1;Object.assign(actor,{mode:'arrive',target:'shop'});updateTownDog(.5);
      farm.weather='rain';farm.weatherFrom='rain';
      for(let i=0;i<150&&dog.mode!=='home';i++){updateTownDog(.05);result.space &&=!collide();}
      result.earlyRain=dog.mode==='home';farm.weather='sunny';farm.weatherFrom='sunny';
      updateTownDog(0);updateTownDog(.5);actor.target='leave';
      for(let i=0;i<200&&dog.present;i++){updateTownDog(.05);result.space &&=!collide();}
      result.leave &&=!dog.present;
      return result;
    }finally{farm=original;updateUI();}
  })()`);
  for(const [name,passed]of Object.entries(checks))assert.ok(passed,`Traveller dog failed: ${name}`);
  console.log('Dog checks passed: one visit choice, arrival, yard movement, space, pause, rain return, festival rest, exit, greeting, depth and save.');
  const greeting=run(`(() => {
    const original=farm,oldResidents=townNearbyResidents;let result;
    try{
      farm=newFarm();farm.phase=.2;const dog=farm.town.dog;
      Object.assign(dog,{present:true,mode:'rest',target:'yard',x:2070,y:1040,wait:3});
      const neighbor={x:2094,y:1020,waveUntil:0,route:[{x:2094,y:950}],task:'walk'};
      townNearbyResidents=()=>[{name:'阿宁',person:neighbor}];
      const route=JSON.stringify(dog.route),position={x:dog.x,y:dog.y},task=neighbor.task;
      updateTownDogGreetings();const saved=JSON.stringify(farm.town),events=farm.town.events.length;
      updateTownDogGreetings();
      result=dog.friendName==='阿宁' && dog.friendDay===farm.day && neighbor.waveUntil>now
        && dog.wagUntil>now && farm.town.events.length===events && dog.wait===3
        && JSON.stringify(dog.route)===route && distance(dog,position)===0 && neighbor.task===task
        && JSON.stringify(parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))}).town)===saved;
      dog.friendDay=0;farm.paused=true;updateTownDogGreetings();result &&=dog.friendDay===0;
      farm.paused=false;farm.day=10;updateTownDogGreetings();result &&=dog.friendDay===0;
      return result;
    }finally{farm=original;townNearbyResidents=oldResidents;updateUI();}
  })()`);
  assert.ok(greeting,'Dog neighbor greeting preserves routes, daily limits, pause, festivals and saves');
  console.log('Dog neighbor greetings passed: one daily encounter, wave and wag, unchanged tasks/routes, pause, festivals and save.');
};
