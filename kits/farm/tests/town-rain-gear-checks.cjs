module.exports=function checkTownRainGear(run,assert) {
  const result=run(`(() => {
    const originalFarm=farm,originalWalker=villageWalker,result={};
    function setup(){
      farm=newFarm();farm.day=11;farm.phase=.22;farm.coins=80000;farm.weather=farm.weatherFrom='rain';
      farm.town=makeTownState(11);farm.town.merchantUnlocked=true;farm.town.budgetMode='off';
      farm.town.inventory.rainGear=1;
      Object.assign(farm.town.traveller,TOWN_LAYOUT.counter,{mode:'shop',day:11,stayUntil:12});
      villageWalker={...resetVillageWalker(),x:VILLAGE_WALKER_LAYOUT.promenade.left,y:VILLAGE_WALKER_LAYOUT.promenade.y};
    }
    try {
      setup();const actor=farm.town.traveller,seed=farm.town.seed,coins=farm.coins;
      const movement=JSON.stringify({actor,walker:villageWalker});updateTownRainGear(.1);
      result.smooth=farm.town.rainGear.merchant>0&&farm.town.rainGear.merchant<1
        &&farm.town.rainGear.child>0&&farm.town.rainGear.child<1;
      for(let i=0;i<20;i++)updateTownRainGear(.1);
      result.open=farm.town.rainGear.merchant===1&&farm.town.rainGear.child===1;
      result.noSideEffects=farm.coins===coins&&farm.town.seed===seed
        &&JSON.stringify({actor,walker:villageWalker})===movement;
      const child=townRainCanopy('child'),merchant=townRainCanopy('merchant');
      result.hints=townDescribe(child.x,child.y-2).kind==='rain-child'
        &&townDescribe(merchant.x,merchant.y-2).target===actor;
      const beforeWave=villageWalker.waveUntil;
      result.childClick=handleTownClick(child.x,child.y-2)&&villageWalker.waveUntil>beforeWave&&farm.coins===coins;
      const hook=townRainHook();result.hook=townDescribe(hook.x,hook.y).kind==='rain-hook';
      const beforePalette=farm.town.rainGear.palette;
      result.colours=handleTownClick(hook.x,hook.y)&&farm.town.rainGear.palette!==beforePalette&&farm.coins===coins;
      townChangeRainPalette();townChangeRainPalette();result.colours &&=farm.town.rainGear.palette===beforePalette;
      const saved=JSON.stringify(farm.town);farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});
      result.save=JSON.stringify(farm.town)===saved;
      farm.paused=true;now+=3;const frozen=JSON.stringify(farm.town);
      updateTownRainGear(3);drawTownRainUmbrella('merchant');drawTownRainUmbrella('child');
      result.pause=JSON.stringify(farm.town)===frozen;
      farm.paused=false;farm.weather=farm.weatherFrom='sunny';updateTownRainGear(.1);
      result.clear=farm.town.rainGear.merchant>0&&farm.town.rainGear.merchant<1;
      for(let i=0;i<20;i++)updateTownRainGear(.1);
      result.clear &&=!townRainCanopy('merchant')&&!townRainCanopy('child');
      setup();farm.weather=farm.weatherFrom='snow';updateTownRainGear(2);
      result.snow=!townRainCanopy('merchant')&&!townRainCanopy('child');
      setup();updateTownRainGear(2);Object.assign(farm.town.traveller,TOWN_LAYOUT.home.door,{mode:'home'});
      Object.assign(villageWalker,VILLAGE_WALKER_LAYOUT.home);
      result.inside=!townRainCanopy('merchant')&&!townRainCanopy('child');
      setup();farm.town.inventory.rainGear=0;updateTownRainGear(2);
      result.empty=!townRainCanopy('merchant')&&!townRainHookAt(hook.x,hook.y)&&!townChangeRainPalette();
      setup();farm.day=10;Object.assign(actor,{mode:'walk',festival:{day:10,stage:'out',index:0}});
      farm.town.traveller.festival={day:10,stage:'out',index:0};villageWalker.festival={day:10,stage:'out',index:0};
      updateTownRainGear(2);result.festival=!!townRainCanopy('merchant')&&!!townRainCanopy('child');
      setup();updateTownRainGear(2);const items=farmSceneItems(),m=items.find(i=>i.id==='town-traveller'),c=items.find(i=>i.id==='village-walker');
      result.depth=m.y===actorDepth(farm.town.traveller)&&c.y===actorDepth(villageWalker,22)
        &&!items.some(i=>i.id.includes('umbrella')||i.id.includes('rain-gear'));
      setup();Object.assign(farm.town.traveller,{cartAttached:true,x:2250,y:950});
      const movingHook=townRainHook(),movingCart=townCartPosition();
      result.cart=movingHook.x===movingCart.x+TOWN_LAYOUT.rainHookOffset.x
        &&movingHook.y===movingCart.y+TOWN_LAYOUT.rainHookOffset.y&&townRainHookAt(movingHook.x,movingHook.y);
      setup();farm.town.inventory.rainGear=0;
      farm.town.traveller.offers=[{id:'rainGear',price:260,sold:false}];
      result.purchase=townBuy('rainGear')&&farm.coins===79740&&farm.town.inventory.rainGear===1
        &&farm.town.spending.goods===260&&!townBuy('rainGear');
      result.useful=!townGoodsUseful('rainGear');
      setup();farm.town.inventory.rainGear=0;farm.coins=townReserve()+259;
      farm.town.traveller.offers=[{id:'rainGear',price:260,sold:false}];result.reserve=!townBuy('rainGear');
      setup();farm.town.inventory.rainGear=0;farm.town.budgetMode='balanced';farm.town.allowance=259;
      farm.town.traveller.offers=[{id:'rainGear',price:260,sold:false}];result.budget=!townBuy('rainGear',true);
      farm.town.allowance=260;result.budget &&=townBuy('rainGear',true)&&farm.town.seasonSpent===260;
      setup();const legacy=JSON.parse(JSON.stringify(farm));delete legacy.town.rainGear;delete legacy.town.inventory.rainGear;
      const restored=parseFarmSave({version:1,state:legacy});
      result.defaults=restored.town.inventory.rainGear===0&&JSON.stringify(restored.town.rainGear)===JSON.stringify(makeTownRainGear());
      result.invalid=true;for(const mutate of [s=>s.town.rainGear.merchant=2,s=>s.town.rainGear.child=-1,
        s=>s.town.rainGear.palette=3,s=>s.town.rainGear.palette=.5,s=>s.town.inventory.rainGear=2]) {
        const bad=JSON.parse(JSON.stringify(farm));mutate(bad);
        try{parseFarmSave({version:1,state:bad});result.invalid=false;}catch(_){}
      }
      return result;
    }finally{farm=originalFarm;villageWalker=originalWalker;updateUI();}
  })()`);
  for(const [key,value]of Object.entries(result))assert.ok(value,'Town rain gear failed: '+key);
  console.log('Rain gear passed: gradual open/close, no route/cost/seed effects, pause, home, festivals, parent depth, hints, palette, moving cart, purchases and full saves.');
};
