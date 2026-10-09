module.exports=function checkTownDonkeyWater(run,assert){
 const r=run(`(()=>{
 const original=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),r={};
 const world=()=>{const x=captureRuntimeState();delete x.now;return JSON.stringify({farm,x});};
 const saved=()=>{const before=world(),d=importFarmText(farmExportText());replaceFarmState(d.state,d.runtime);return before===world();};
 function setup(){farm=newFarm();farm.day=Array.from({length:15},(_,i)=>i+2).find(d=>hash(d,0,1349)<.55&&hash(d,1,1349)<.55&&seasonTransitionForDay(d)<.6);farm.phase=.09;farm.paused=false;farm.weather=farm.weatherFrom='sunny';farm.coins=90000;prepareFestival();ensureValleyHerbs();spawnForageForDay();spawnFishForDay();farm.town.merchantUnlocked=true;farm.town.improvements.donkeyInn={level:3,builtAt:1,stages:[1,1,1],wear:0,agedAt:farm.day,lastCare:0};farm.town.donkeys=[{...makeTownDonkey(0),x:2264,y:1506,mode:'rest',wait:50},{...makeTownDonkey(1),x:2214,y:1584,mode:'graze',wait:50}];}
 function seasonTransitionForDay(d){const old=farm.day;farm.day=d;const w=seasonTransition().winter;farm.day=old;return w;}
 function step(dt=.05){farm.phase+=dt/DAY_SECONDS;now+=dt;motionNow+=dt;updateTownDonkeys(dt);}
 try{
 setup();const coins=farm.coins,seed=farm.town.seed;step();const b=farm.town.donkeyWater,a=farm.town.donkeys[b.active];
 r.start=b.ready&&b.stage==='out'&&a.target==='water'&&distance(a,TOWN_LAYOUT.donkeyWater.stand)>1&&b.drinks===0&&b.water>.74&&saved();
 let moved=true,depth=false,half=false,actual=true;const paths=[];
 for(let i=0;i<600;i++){const old=farm.town.donkeys.map(a=>({x:a.x,y:a.y}));step();const w=farm.town.donkeyWater;
  for(const [id,a]of farm.town.donkeys.entries())moved&&=distance(a,old[id])<=22*.05+.001;
  if(w.active>=0){const a=farm.town.donkeys[w.active];actual&&=townDonkeyWaterPointClear(a)&&distance(...farm.town.donkeys)>=42-1e-8;
   paths.push({stage:w.stage,x:a.x,y:a.y});
   if(w.stage==='drink'){actual&&=distance(a,TOWN_LAYOUT.donkeyWater.stand)<.01;
    if(!half&&w.wait>1){half=true;r.drinking=saved()&&w.water>.73&&w.drinks===0;
     farm.paused=true;const frozen=world();tick(last+65);renderCompleteFarmCanvas();r.pause=frozen===world();farm.paused=false;
     const items=farmSceneItems(),animal=items.find(i=>i.id==='town-donkey:'+a.id),trough=items.find(i=>i.id==='town-donkey-water');depth=items.filter(i=>i.id.startsWith('town-donkey:')).length===2&&animal.y===a.y+14&&animal.y>trough.y;
    }
   }
  }
  if(w.drinks>=2&&w.active<0&&w.departing<0)break;
 }
 r.real=moved&&actual&&half&&depth&&farm.town.donkeyWater.drinks===2&&saved();
 r.consume=farm.town.donkeyWater.water<.44&&farm.town.donkeyWater.water>.39&&farm.coins===coins;
 const done=farm.town.donkeyWater.drinks;for(let i=0;i<50;i++)step();r.daily=farm.town.donkeyWater.drinks===done;
 farm.ledgerExpanded=true;updateUI();updateLedgerUI();r.ui=$('town-donkey-water-status').textContent.includes('已喝 2 回')&&$('ledger-donkey-water').textContent==='2 回';
 const p=TOWN_LAYOUT.donkeyInn.trough;r.hint=townDescribe(p.x,p.y).kind==='donkey-water';const beforeCoins=farm.coins;handleTownClick(p.x,p.y);r.refill=farm.town.donkeyWater.water===1&&farm.coins===beforeCoins&&saved();
 setup();while(farm.town.donkeyWater.drinks<1)step();farm.town.inventory.fodder=4;scheduleTownFodder();r.departurePriority=farm.town.donkeyWater.departing>=0&&farm.town.fodder.active<0&&farm.town.donkeys[0].target==='pen';
 setup();step();const left=farm.town.donkeyWater.water;farm.weather=farm.weatherFrom='rain';step();r.rain=farm.town.donkeyWater.active===-1&&farm.town.donkeyWater.drinks===0&&farm.town.donkeyWater.water>=left&&farm.town.donkeys.every(a=>a.target==='home');for(let i=0;i<400;i++)step();r.rainHome=farm.town.donkeys.every(a=>a.mode==='home')&&saved();
 setup();while(farm.town.donkeyWater.stage!=='drink')step();farm.phase=.5;step();r.night=farm.town.donkeyWater.drinks===0&&farm.town.donkeyWater.active===-1;for(let i=0;i<400;i++)step();r.nightHome=farm.town.donkeys.every(a=>a.mode==='home')&&saved();
 setup();farm.town.improvements.donkeyInn.level=1;farm.town.donkeys.length=1;step();r.unbuilt=!townDonkeyWaterBuilt()&&!townDonkeyWaterAt(p.x,p.y)&&!refillTownDonkeyWater()&&!farm.town.donkeyWater.ready;
 setup();farm.day=30;step();r.winter=farm.town.donkeyWater.active===-1;
 setup();farm.town.construction={id:'donkeyInn',kind:'care',level:3,progress:0,cost:500,startedAt:farm.day};step();r.work=farm.town.donkeyWater.active===-1;
 setup();farm.town.donkeyVisit={...makeTownDonkeyVisit(),day:farm.day,decided:true,chosen:true,donkey:0,cost:15,stage:'out'};step();r.visit=farm.town.donkeyWater.active===-1;
 setup();farm.phase=.2;farm.town.inventory.fodder=4;step();r.food=farm.town.donkeyWater.active===-1;
 setup();farm.town.donkeyWater={...makeTownDonkeyWater(farm.day),ready:true,water:0,agedAt:farm.day+farm.phase};step();r.empty=farm.town.donkeyWater.active===-1;
 const w=farm.town.donkeyWater;farm.phase+=.1;farm.weather=farm.weatherFrom='rain';updateTownDonkeyWaterPlan(.05);r.rainFill=w.water>.05;
 setup();step();const chosen=farm.town.donkeyWater.decided.slice(),random=farm.town.seed;r.choice=saved()&&JSON.stringify(chosen)===JSON.stringify(farm.town.donkeyWater.decided)&&farm.town.seed===random;
 setup();step();const selected=farm.town.donkeys[farm.town.donkeyWater.active],other=farm.town.donkeys[1-selected.id];other.x=selected.x-42;other.y=selected.y;const v={x:selected.x,y:selected.y};updateTownDonkeyWaterAnimal(selected,.05);r.collision=farm.town.donkeyWater.active===-1&&farm.town.donkeyWater.drinks===0&&distance(selected,v)===0;
 setup();farm.phase=.2;farm.town.donkeyWater={...makeTownDonkeyWater(farm.day),ready:true,water:.2,agedAt:farm.day+farm.phase};farm.town.improvements.donkeyInn.wear=.6;Object.assign(farm.town.traveller,TOWN_LAYOUT.counter,{mode:'shop'});const cost=townCarePrice('donkeyInn'),money=farm.coins;const commissioned=townCommissionCare('donkeyInn');Object.assign(farm.town.traveller,TOWN_LAYOUT.projects.donkeyInn.work,{mode:'work'});farm.town.construction.progress=.999;updateTownProjectWork(farm.town.traveller,.05);r.care=commissioned&&farm.coins===money-cost&&farm.town.donkeyWater.water===1&&farm.town.maintenanceCount===1&&saved();
 setup();const old=JSON.parse(farmExportText());delete old.state.town.donkeyWater;const d=importFarmText(JSON.stringify(old));r.defaults=d.state.town.donkeyWater.drinks===0&&!d.state.town.donkeyWater.ready&&JSON.stringify(d.state.town.donkeys)===JSON.stringify(farm.town.donkeys);
 r.reject=true;for(const mutate of [s=>s.town.donkeyWater.water=2,s=>s.town.donkeyWater.active=2,s=>s.town.donkeyWater.drinks=-1,s=>s.town.donkeyWater.decided=[true],s=>Object.assign(s.town.donkeyWater,{stage:'drink',active:0,ready:true,day:s.day,decided:[true,false]})]){const v=JSON.parse(farmExportText());mutate(v.state);try{importFarmText(JSON.stringify(v));r.reject=false;}catch(_){}}
 return r;
 }finally{replaceFarmState(original,runtime);updateUI();}
 })()`);
 for(const [k,v]of Object.entries(r))assert.ok(v,'Donkey water '+k+': '+JSON.stringify(r));
 console.log('Donkey water passed: real sequential approach/drink/clearance, complete-only water, pause/full save, rain/night home, work/visitor/food priority, seasons, refill/UI/depth and legacy validation.');
};
