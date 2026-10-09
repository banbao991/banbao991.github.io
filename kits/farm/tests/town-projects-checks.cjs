module.exports = function checkTownProjects(run, assert) {
  const checks = run(`(() => {
    const originalFarm=farm,originalWorkers=workers;
    const result={paidOnce:true,finish:true,save:true,night:true,festival:true,routes:true,depth:true};
    try {
      for(const id of Object.keys(TOWN_PROJECTS)) {
        farm=newFarm();farm.day=9;farm.phase=.1;farm.coins=200000;farm.town=makeTownState(9);
        farm.town.budgetMode='off';farm.town.merchantUnlocked=true;updateTownPlanning();
        const actor=farm.town.traveller;
        Object.assign(actor,{...TOWN_LAYOUT.counter,mode:'shop',day:9,stayUntil:10});
        const cost=townProjectPrice(id),before=farm.coins;
        result.paidOnce &&=townCommission(id) && farm.coins===before-cost && !townCommission(id)
          && farm.town.spending.projects===cost;
        const initial=JSON.stringify(farm.town);
        result.save &&=JSON.stringify(parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))}).town)===initial;
        let everWorked=false,day=9,festivalProgress=null;
        for(let i=0;i<14000&&farm.town.construction;i++) {
          const dt=.05;farm.phase+=dt/DAY_SECONDS;
          if(farm.phase>=1){farm.day++;farm.phase=0;updateTownPlanning();}
          updateTownTraveller(dt);everWorked ||= actor.mode==='work';
          if(farm.day===10){festivalProgress??=farm.town.construction.progress;
            result.festival &&=actor.festival!=null && farm.town.construction.progress===festivalProgress;}
          if(farm.phase>.72)result.night &&=actor.mode==='home'||festivalAtHome(actor);
          if(actor.mode!=='home'&&!festivalAtHome(actor)) {
            const {x,y}=actor;
            result.routes &&=(!riverAt(x,y)||bridgeAt(x,y))
              && !MARKET_LAYOUT.homes.some(h=>inRect(x,y,h.x,h.y+13,h.x+117,h.y+116))
              && !MARKET_LAYOUT.stalls.some(s=>inRect(x,y,s.x,844,s.x+118,917))
              && !inRect(x,y,NURSERY_LAYOUT.home.left,NURSERY_LAYOUT.home.top,NURSERY_LAYOUT.home.right,NURSERY_LAYOUT.home.bottom)
              && !inRect(x,y,VALLEY_GARDEN_LAYOUT.teaHouse.left,VALLEY_GARDEN_LAYOUT.teaHouse.top,VALLEY_GARDEN_LAYOUT.teaHouse.right,VALLEY_GARDEN_LAYOUT.teaHouse.bottom);
          }
          if(farm.day!==day){day=farm.day;parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});}
        }
        result.finish &&=everWorked && !farm.town.construction
          && farm.town.improvements[id].level===1 && farm.coins===before-cost;
        if(!everWorked||farm.town.construction||farm.town.improvements[id].level!==1||farm.coins!==before-cost)
          console.log('Project continuation:',id,{day:farm.day,phase:farm.phase,mode:actor.mode,
            progress:farm.town.construction?.progress,level:farm.town.improvements[id].level,everWorked,coins:farm.coins,before,cost});
        const items=farmSceneItems();result.depth &&=items.every(item=>Number.isFinite(item.y))
          &&new Set(items.map(item=>item.id)).size===items.length;
        const restored=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});
        result.save &&=JSON.stringify(restored.town)===JSON.stringify(farm.town);
      }
      farm=newFarm();farm.day=9;farm.phase=.2;farm.coins=200000;farm.town=makeTownState(9);
      farm.town.budgetMode='off';farm.town.merchantUnlocked=true;updateTownPlanning();
      const actor=farm.town.traveller;Object.assign(actor,{...TOWN_LAYOUT.counter,mode:'shop',day:9,stayUntil:10});
      townCommission('travellerGarden');townStartWork(actor);
      for(let i=0;i<70;i++)updateTownTraveller(.05);
      const saved=JSON.parse(JSON.stringify(farm));farm= parseFarmSave({version:1,state:saved});
      const progress=farm.town.construction.progress,before=farm.coins;farm.paused=true;
      updateTownTraveller(10);result.pause=farm.town.construction.progress===progress && farm.coins===before;
      result.limits=true;farm.paused=false;
      const bad=JSON.parse(JSON.stringify(farm));bad.town.construction.level=3;
      try{parseFarmSave({version:1,state:bad});result.limits=false;}catch(_){}
      // Planting dates follow world time, survive reload, and retain older garden rows.
      farm.town.construction=null;
      Object.assign(farm.town.traveller,{mode:'shop',target:'shop',route:[],index:0,
        offers:[{id:'flowerPot',price:120,sold:false}]});
      result.growth=townBuy('flowerPot') && townPlantGrowth('flowerPot',0)===0;
      const plantedAt=farm.town.plantings.flowerPot[0];
      farm.day++;farm.phase=.2;
      const growth=townPlantGrowth('flowerPot',0);
      farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});
      result.growth &&=farm.town.plantings.flowerPot[0]===plantedAt
        && townPlantGrowth('flowerPot',0)===growth && growth>0 && growth<1;
      farm.town.improvements.travellerGarden={level:2,builtAt:farm.day+.2,stages:[farm.day-2,farm.day+.2]};
      result.growth &&=townImprovementGrowth('travellerGarden',0)===1
        && townImprovementGrowth('travellerGarden',1)===0;
      farm.paused=true;const frozen=townImprovementGrowth('travellerGarden',1);now+=100;
      result.growth &&=townImprovementGrowth('travellerGarden',1)===frozen;
      const invalidPlanting=JSON.parse(JSON.stringify(farm));invalidPlanting.town.plantings.flowerPot[0]=farm.day+20;
      try{parseFarmSave({version:1,state:invalidPlanting});result.growth=false;}catch(_){}
      farm.paused=false;farm.day=11;farm.phase=.22;farm.town.budgetMode='balanced';
      farm.town.allowance=15000;farm.town.seasonSpent=0;farm.town.traveller.commissioned=true;
      townChooseCommission();result.visitLimit=!farm.town.construction;
      farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});
      townChooseCommission();result.visitLimit &&=!farm.town.construction;
      farm.town.traveller.commissioned=false;townChooseCommission();
      result.visitLimit &&=!!farm.town.construction;
      farm=newFarm();farm.day=11;farm.phase=.2;farm.town=makeTownState(11);farm.town.merchantUnlocked=true;
      Object.assign(farm.town.inventory,{flowerPot:1,birdNest:1,petToy:1,butterflySeed:1});
      farm.town.plantings.flowerPot=[11.2];farm.town.plantings.butterflySeed=[11.2];
      Object.assign(farm.town.improvements.teaChimes,{level:3,builtAt:8,stages:[6,7,8]});
      result.hints=townDescribe(908,1810)?.target===TOWN_LAYOUT.projects.teaChimes
        && townDescribe(824,1838)?.target===TOWN_LAYOUT.projects.teaChimes
        && townDescribe(430,1343)?.target===TOWN_LAYOUT.birdhouse
        && townDescribe(510,1286)?.target===TOWN_LAYOUT.flowerPatch
        && townDescribe(2090,794)?.target===TOWN_LAYOUT.flowerPots[0];
      const pot=farmSceneItems().find(item=>item.id==='traveller-flower-pot:0');
      result.depth &&=pot.y===TOWN_LAYOUT.flowerPots[0].y+1 && pot.y>TOWN_LAYOUT.home.bottom;
      workers=[{name:'阿满',x:824,y:1838}];
      result.hints &&=townDescribe(824,1838)===null && describe(824,1838).target===workers[0];
      return result;
    } finally {farm=originalFarm;workers=originalWorkers;updateUI();}
  })()`);
  for (const [name, passed] of Object.entries(checks)) assert.ok(passed, `Public project failed: ${name}`);
  console.log('Public project checks passed: six routes, payment, construction, festivals, save, depth, gradual growth and visit limits.');
};
