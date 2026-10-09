module.exports=function checkDonkeyVisits(run,assert){
  const result=run(`(()=>{
    const original=farm,originalWalker=villageWalker,result={paths:true,saves:true,returnSpeed:true};
    function setup(){farm=newFarm();farm.day=11;farm.phase=.06;farm.coins=100000;farm.town=makeTownState(11);
      farm.town.merchantUnlocked=true;farm.town.budgetMode='off';farm.weather=farm.weatherFrom='sunny';
      Object.assign(farm.town.improvements.donkeyInn,{level:1,builtAt:9,stages:[9]});
      farm.town.donkeys=[{...makeTownDonkey(0),x:2210,y:1570,mode:'graze',wait:10}];
      villageWalker={...resetVillageWalker(),x:1650,y:VILLAGE_WALKER_LAYOUT.promenade.y};}
    function step(){const before={...villageWalker},returning=farm.town.donkeyVisit.stage==='return';
      farm.phase+=.05/DAY_SECONDS;updateTownDonkeys(.05);updateVillageWalker(.05);
      if(returning)result.returnSpeed &&=distance(before,villageWalker)<=VILLAGE_HOME_SPEED*.05+.001;
      const {x,y}=villageWalker,cart=TOWN_LAYOUT.cart;
      if(!townDonkeyVisitHome())result.paths &&=!MARKET_LAYOUT.homes.some(h=>inRect(x,y,h.x,h.y+13,h.x+117,h.y+116))
        && !MARKET_LAYOUT.stalls.some(s=>inRect(x,y,s.x,844,s.x+118,917))
        && !inRect(x,y,cart.left,cart.top,cart.right,cart.bottom)
        && !inRect(x,y,TOWN_LAYOUT.donkeyInn.pen.left,TOWN_LAYOUT.donkeyInn.pen.top,TOWN_LAYOUT.donkeyInn.pen.right,TOWN_LAYOUT.donkeyInn.pen.bottom)
        && !riverAt(x,y) && !MARKET_LAYOUT.lamps.some(lamp=>Math.abs(x-lamp.x)<18&&y>=lamp.y-12&&y<=lamp.y+29);
    }
    try{
      setup();const coins=farm.coins;
      result.invite=townCanInviteDonkeyVisit()&&townInviteDonkeyVisit()&&!townInviteDonkeyVisit()
        &&farm.coins===coins&&farm.town.donkeyVisit.cost===25;
      const seen=new Set();for(let i=0;i<1800&&!townDonkeyVisitHome();i++){
        step();seen.add(farm.town.donkeyVisit.stage);
        if(i%100===0){const restored=importFarmText(farmExportText());result.saves &&=JSON.stringify(restored.state.town)===JSON.stringify(farm.town)
          &&JSON.stringify(restored.runtime.villageWalker)===JSON.stringify(villageWalker);}
      }
      result.complete=seen.has('wait')&&seen.has('feed')&&seen.has('return')&&townDonkeyVisitHome()
        &&distance(villageWalker,VILLAGE_WALKER_LAYOUT.home)<.01 && farm.coins===coins-25
        &&farm.town.donkeyVisits===1&&farm.town.spending.outings===25&&farm.town.spentTotal===25;
      result.door=farm.town.donkeyVisit.route.every(point=>point.y!==TOWN_LAYOUT.flowerLaneY||point.x>=VILLAGE_WALKER_LAYOUT.home.x);
      result.hidden=!villagerAt(villageWalker.x,villageWalker.y)&&!farmSceneItems().some(item=>item.id==='village-walker');
      result.cooldown=!townCanInviteDonkeyVisit();farm.day=12;farm.phase=.01;const atDoor={...villageWalker};
      updateVillageWalker(.05);result.nextMorning=!townDonkeyVisitHome()&&distance(atDoor,villageWalker)<=VILLAGE_STROLL_SPEED*.05+.001;
      farm.phase=.06;
      villageWalker={...resetVillageWalker(),x:1650,y:812};updateTownDonkeyVisit(.05);result.cooldown &&=!townCanInviteDonkeyVisit();
      farm.day=14;farm.phase=.06;Object.assign(farm.town.donkeys[0],{x:2210,y:1570,mode:'graze',target:'pen'});
      updateTownDonkeyVisit(.05);result.cooldown &&=townCanInviteDonkeyVisit();
      setup();townInviteDonkeyVisit();for(let i=0;i<40;i++)step();farm.weather=farm.weatherFrom='rain';
      updateTownDonkeyVisit(.05);result.rain=farm.town.donkeyVisit.stage==='return'&&farm.coins===100000;
      for(let i=0;i<1000&&!townDonkeyVisitHome();i++)step();result.rain &&=townDonkeyVisitHome()&&farm.town.donkeyVisits===0;
      setup();townInviteDonkeyVisit();for(let i=0;i<300&&farm.town.donkeyVisit.stage!=='feed';i++)step();
      result.pause=farm.town.donkeyVisit.stage==='feed';farm.paused=true;const frozen=farmExportText();
      updateTownDonkeyVisit(3);updateTownDonkeys(3);now+=5;const snapshot=JSON.parse(frozen);
      result.pause &&=JSON.stringify(snapshot.state.town)===JSON.stringify(farm.town)
        &&JSON.stringify(snapshot.runtime.villageWalker)===JSON.stringify(villageWalker);farm.paused=false;
      const scene=farmSceneItems();result.depth=scene.find(item=>item.id==='village-walker').y===actorDepth(villageWalker,22)
        &&scene.find(item=>item.id==='town-donkey:0').y===farm.town.donkeys[0].y+14;
      const hint=describe(villageWalker.x,villageWalker.y);result.hint=hint.target===villageWalker&&hint.text.includes('胡萝卜');
      const paidCost=farm.town.spending.outings;farm.weather=farm.weatherFrom='rain';updateTownDonkeyVisit(.05);
      result.paidRain=farm.town.donkeyVisit.stage==='return'&&farm.town.spending.outings===paidCost&&farm.town.donkeyVisits===1;
      for(let i=0;i<1600&&!townDonkeyVisitHome();i++)step();result.paidRain &&=townDonkeyVisitHome()&&farm.town.spending.outings===paidCost;
      const spending=farm.town.spending.outings;farm.day=20;farm.phase=.06;updateVillageWalker(.05);
      result.festival=farm.town.donkeyVisit.stage==='done'&&!!villageWalker.festival&&farm.town.spending.outings===spending;
      setup();townInviteDonkeyVisit();farm.coins=townReserve();for(let i=0;i<300&&farm.town.donkeyVisit.stage!=='return';i++)step();
      result.reserve=farm.town.donkeyVisit.stage==='return'&&farm.town.spending.outings===0;
      setup();farm.town.budgetMode='balanced';farm.town.allowance=100;farm.town.seed=1;
      result.automatic=updateTownDonkeyVisit(.05)&&farm.town.donkeyVisit.automatic;
      for(let i=0;i<1600&&!townDonkeyVisitHome();i++)step();result.automatic &&=farm.town.seasonSpent===25;
      setup();farm.town.budgetMode='balanced';farm.town.allowance=100;farm.town.seed=123456;
      updateTownDonkeyVisit(.05);const seed=farm.town.seed;const chosen=farm.town.donkeyVisit.chosen;
      for(let i=0;i<20;i++)updateTownDonkeyVisit(.05);
      result.choice=farm.town.donkeyVisit.decided&&farm.town.donkeyVisit.chosen===chosen&&farm.town.seed===seed;
      setup();Object.assign(farm.town.donkeys[0],{x:2200,y:1418,mode:'walk',target:'pen',
        route:[{x:2232,y:1416},{...TOWN_LAYOUT.donkeyInn.insideGate},{x:2210,y:1570}],index:0});
      result.gateExit=townInviteDonkeyVisit();for(let i=0;i<350&&farm.town.donkeyVisit.stage!=='feed';i++){
        step();const animal=farm.town.donkeys[0];
        if(animal.y>=1440&&animal.y<1472)result.gateExit &&=Math.abs(animal.x-2232)<.01;
      }
      result.gateExit &&=farm.town.donkeyVisit.stage==='feed';
      setup();farm.phase=.2;result.window=!townCanInviteDonkeyVisit();farm.phase=.06;farm.day=28;result.window &&=!townCanInviteDonkeyVisit();
      setup();townInviteDonkeyVisit();const bad=JSON.parse(JSON.stringify(farm));bad.town.donkeyVisit.stage='feed';
      result.reject=false;try{parseFarmSave({version:1,state:bad});}catch(_){result.reject=true;}
      return result;
    }finally{farm=original;villageWalker=originalWalker;updateUI();}
  })()`);
  for(const [key,value]of Object.entries(result))assert.ok(value,'Donkey visit: '+key+' '+JSON.stringify(result));
  console.log('Donkey visits passed: real road arrivals, one payment, original home speed, daily choice/cooldown, pause, rain, reserve, festival, depth, hints and full saves.');
};
