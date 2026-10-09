module.exports = function checkChickenMeal(run,assert) {
  const result=run(`(() => {
    const original=JSON.parse(JSON.stringify(farm)),runtime=captureRuntimeState(),result={};
    try {
      const prepare=()=>{
        replaceFarmState(newFarm());farm.phase=.18;farm.weather=farm.weatherFrom='sunny';
        farm.day=Array.from({length:8},(_,i)=>i+1).find(d=>hash(d,3,2401)<.72);
        farm.town.inventory.henGrain=4;return farm.town.henMeal;
      };
      prepare();prepareChickenMeal();let m=farm.town.henMeal,c=chickens[m.active];
      const seed=farm.town.seed,coins=farm.coins,eggs=farm.eggTotal;
      result.choice=m.chosen&&m.stage==='approach'&&m.active>=0;
      const start={x:c.x,y:c.y};updateFarmAnimals(.01);
      result.walk=distance(c,start)>0&&distance(c,start)<=.151&&m.served===0&&farm.town.inventory.henGrain===4;
      for(let i=0;i<200&&m.stage==='approach';i++)updateFarmAnimals(.05);
      result.arrival=m.stage==='eat'&&distance(c,TOWN_LAYOUT.henMeal.spot)<=1&&m.served===1
        &&farm.town.inventory.henGrain===3&&m.elapsed===0&&m.finished===0;
      updateFarmAnimals(.5);const snap=importFarmText(farmExportText());
      result.save=JSON.stringify(snap.state)===JSON.stringify(farm)&&JSON.stringify(snap.runtime)===JSON.stringify(captureRuntimeState());
      replaceFarmState(snap.state,snap.runtime);m=farm.town.henMeal;c=chickens[m.active];
      farm.paused=true;const frozen=JSON.stringify({state:farm,runtime:captureRuntimeState()});
      updateFarmAnimals(4);prepareChickenMeal();updateChickenMeal(c,m.active,4);chicken(c);coop();describe(TOWN_LAYOUT.henMeal.tray.x,TOWN_LAYOUT.henMeal.tray.y);renderCompleteFarmCanvas();
      result.pauseReadOnly=JSON.stringify({state:farm,runtime:captureRuntimeState()})===frozen;
      farm.paused=false;const spot={x:c.x,y:c.y};for(let i=0;i<100&&m.stage==='eat';i++)updateFarmAnimals(.05);
      result.finish=m.finished===1&&m.served===1&&m.stage==='done'&&distance(c,spot)===0
        &&farm.coins===coins&&farm.eggTotal===eggs&&farm.town.seed===seed;
      updateFarmAnimals(.05);result.resume=distance(c,spot)>0;for(let i=0;i<200;i++)updateFarmAnimals(.05);
      result.once=m.served===1&&farm.town.inventory.henGrain===3;
      farm.ledgerExpanded=true;updateLedgerUI();result.ledger=$('ledger-hen-meal').textContent==='3 / 1 / 1 份';
      result.hint=describe(TOWN_LAYOUT.henMeal.tray.x,TOWN_LAYOUT.henMeal.tray.y).text.includes('已吃完 1 份');
      const queue=farmSceneItems(),tray=queue.find(i=>i.id==='coop-grain-tray');
      result.depth=!!tray&&tray.y===TOWN_LAYOUT.henMeal.tray.y+3;
      prepare();prepareChickenMeal();m=farm.town.henMeal;farm.weather=farm.weatherFrom='rain';updateFarmAnimals(.05);
      result.rainBefore=m.stage==='done'&&!m.taken&&m.served===0&&farm.town.inventory.henGrain===4;
      prepare();prepareChickenMeal();m=farm.town.henMeal;
      for(let i=0;i<200&&m.stage==='approach';i++)updateFarmAnimals(.05);
      farm.weather=farm.weatherFrom='rain';updateFarmAnimals(.05);
      result.rainAfter=m.stage==='done'&&m.taken&&m.served===1&&m.finished===0&&farm.town.inventory.henGrain===3;
      prepare();prepareChickenMeal();m=farm.town.henMeal;farm.phase=NIGHT_START;updateFarmAnimals(.05);
      result.night=m.stage==='done'&&!m.taken&&chickens.every((c,i)=>c.tx===173+i*8&&c.ty===78);
      prepare();farm.day=10;prepareChickenMeal();m=farm.town.henMeal;
      result.festival=m.chosen===(hash(10,3,2401)<.72);
      prepare();farm.town.inventory.henGrain=0;updateFarmAnimals(.05);
      result.empty=farm.town.henMeal.day===0&&!chickenMealVisible();
      prepare();farm.coins=5000;farm.town.budgetMode='balanced';farm.town.allowance=1000;
      const a=farm.town.traveller;a.mode='shop';a.offers=[{id:'henGrain',price:55,sold:false}];farm.town.inventory.henGrain=0;
      updateTownAutomaticShopping();result.purchase=a.offers[0].sold&&farm.coins===4945&&farm.town.inventory.henGrain===4
        &&farm.town.seasonSpent===55&&farm.town.spending.care===55&&!townBuy('henGrain');
      a.offers[0].sold=false;a.boughtDay=0;farm.town.allowance=55;
      result.budget=!townBuy('henGrain',true);farm.town.allowance=1000;farm.coins=townReserve()+54;
      result.reserve=!townBuy('henGrain');farm.coins=5000;farm.town.inventory.henGrain=5;
      result.capacity=!townBuy('henGrain');
      prepare();const archive=JSON.parse(farmExportText());delete archive.state.town.henMeal;delete archive.state.town.inventory.henGrain;
      const legacy=importFarmText(JSON.stringify(archive));result.legacy=legacy.state.town.inventory.henGrain===0&&legacy.state.town.henMeal.served===0;
      result.invalid=true;for(const value of [null,{...makeTownHenMeal(),day:farm.day+1},{...makeTownHenMeal(),active:3},
        {...makeTownHenMeal(),finished:1},{...makeTownHenMeal(),elapsed:1},{...makeTownHenMeal(),day:1,chosen:true,stage:'eat',active:0}]) {
        const bad=JSON.parse(farmExportText());bad.state.town.henMeal=value;
        try{importFarmText(JSON.stringify(bad));result.invalid=false;}catch(_){}
      }
      const bad=JSON.parse(farmExportText());bad.state.town.inventory.henGrain=9;
      try{importFarmText(JSON.stringify(bad));result.invalid=false;}catch(_){}
      replaceFarmState(newFarm());result.reset=!chickenMealVisible()&&farm.town.henMeal.served===0;
      return result;
    }finally{replaceFarmState(original,runtime);}
  })()`);
  for(const [key,value]of Object.entries(result))assert.ok(value,'Chicken meal '+key+' '+JSON.stringify(result));
  console.log('Chicken meal passed: real arrival, exact portions/costs, pause, rain/night, festival, full saves, depth and UI.');
};
