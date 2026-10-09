module.exports=function checkTownDonkeyBond(run,assert){
 const results=run(`(()=>{
  const old=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
  function setup(day=12){farm=newFarm();farm.day=day;farm.phase=.31;farm.coins=80000;farm.paused=false;
   farm.weather=farm.weatherFrom='sunny';farm.town=makeTownState(day);farm.town.seed=1;
   farm.town.improvements.donkeyInn={level:3,builtAt:1,stages:[1,1,1],wear:0,agedAt:day,lastCare:0};
   farm.town.donkeys=[{...makeTownDonkey(0),x:2214,y:1568,mode:'graze',wait:50},
    {...makeTownDonkey(1),x:2296,y:1604,mode:'rest',wait:50}];}
  function step(dt=.05){farm.phase+=dt/DAY_SECONDS;motionNow+=dt;now+=dt;updateTownDonkeys(dt);}
  function equalSave(){const before=JSON.stringify(farm.town),saved=importFarmText(farmExportText());
   replaceFarmState(saved.state,saved.runtime);return JSON.stringify(farm.town)===before;}
  try{
   setup();const initial=JSON.stringify(farm.town.donkeys),coins=farm.coins;step();
   result.start=farm.town.donkeyBond.stage==='out'&&initial!==JSON.stringify(farm.town.donkeys)
    &&farm.town.donkeys[0].x===2214&&farm.town.donkeys[1].x===2296;
   result.outSave=equalSave();let min=Infinity,frames=0,maxMove=0;
   while(farm.town.donkeyBond.stage==='out'&&frames++<180){const p=farm.town.donkeys.map(a=>({x:a.x,y:a.y}));step();
    maxMove=Math.max(maxMove,...p.map((q,id)=>distance(q,farm.town.donkeys[id])));min=Math.min(min,distance(...farm.town.donkeys));}
   const bond=farm.town.donkeyBond;
   result.arrival=bond.stage==='nuzzle'&&bond.sessions===0&&farm.town.donkeys.every(a=>distance(a,bond.spots[a.id===bond.left?0:1])<.01);
   result.motion=maxMove<=22*.05+.001&&min>=40;
   step(.9);result.partial=equalSave();const before=JSON.stringify(farm.town),positions=farm.town.donkeys.map(a=>({x:a.x,y:a.y}));
   farm.paused=true;now+=2;updateTownDonkeys(10);farmSceneItems();updateTownUI();result.pause=JSON.stringify(farm.town)===before;farm.paused=false;
   result.pose=townDonkeyNuzzlePose(farm.town.donkeys[0]).reach>0;
   result.depth=farmSceneItems().filter(item=>item.id.startsWith('town-donkey:')).length===2
    &&farm.town.donkeys.every(a=>farmSceneItems().find(item=>item.id==='town-donkey:'+a.id).y===a.y+14);
   result.hint=townDescribe(farm.town.donkeys[0].x,farm.town.donkeys[0].y).text.includes(TOWN_DONKEY_NAMES[1])
    &&$('town-donkey-status').textContent.includes('蹭鼻子');
   while(townDonkeyBondActive())step();result.done=farm.town.donkeyBond.sessions===1&&farm.coins===coins&&farm.town.inventory.fodder===0
    &&positions.every((p,id)=>distance(p,farm.town.donkeys[id])===0);
   result.doneSave=equalSave();farm.ledgerExpanded=true;updateLedgerUI();result.ledger=$('ledger-donkey-bond').textContent==='1 回';
   farm.phase=.32;farm.town.donkeys.forEach(a=>a.wait=50);for(let i=0;i<20;i++)step();result.once=farm.town.donkeyBond.sessions===1&&!townDonkeyBondActive();
   setup();step();const p=farm.town.donkeys.map(a=>({x:a.x,y:a.y}));farm.weather=farm.weatherFrom='rain';step();
   result.rain=!townDonkeyBondActive()&&farm.town.donkeyBond.sessions===0&&farm.town.donkeys.every(a=>a.target==='home')
    &&p.every((q,id)=>distance(q,farm.town.donkeys[id])<=1.101);
   setup();step();farm.phase=.48;step();result.night=!townDonkeyBondActive()&&farm.town.donkeys.every(a=>a.target==='home');
   setup();step();farm.town.donkeyVisit={...makeTownDonkeyVisit(),day:farm.day,decided:true,chosen:true,donkey:0,cost:15,stage:'out'};
   step();result.visitor=!townDonkeyBondActive()&&distance(farm.town.donkeys[0].route.at(-1),TOWN_LAYOUT.donkeyInn.greetSpot)===0;
   setup();step();farm.town.inventory.fodder=2;farm.town.fodder={...makeTownFodder(),day:farm.day,chosen:true,queue:[0,1]};
   step();result.fodder=!townDonkeyBondActive()&&farm.town.fodder.active===0&&farm.town.donkeys[0].target==='fodder';
   setup();step();farm.town.construction={id:'donkeyInn',kind:'care',level:3,progress:0,startedAt:farm.day,cost:500};step();result.build=!townDonkeyBondActive();
   setup();step();const animal=farm.town.donkeys[0],point={x:animal.x,y:animal.y};greetTownDonkey(animal);
   result.click=!townDonkeyBondActive()&&distance(animal,point)===0&&animal.greetedDay===farm.day&&farm.town.donkeyBond.sessions===0;
   setup();step();farm.day++;farm.phase=.1;step();result.day=!townDonkeyBondActive()&&farm.town.donkeyBond.day===farm.day;
   setup(10);step();result.festival=townDonkeyBondActive();
   setup();farm.town.donkeys.pop();farm.town.improvements.donkeyInn.level=1;step();result.one=!townDonkeyBondActive();
   setup();farm.phase=.415;step();result.tooLate=!townDonkeyBondActive()&&!farm.town.donkeyBond.decided;
   setup();farm.town.donkeys[0].y=1500;step();result.safe=!farm.town.donkeyBond.decided;
   setup();farm.town.donkeys[1].x=2220;step();result.overlap=!farm.town.donkeyBond.decided;
   setup();farm.town.seed=12345;step();const seed=farm.town.seed;result.failure=farm.town.donkeyBond.decided&&!townDonkeyBondActive();
   equalSave();for(let i=0;i<10;i++)step();result.failure&&=farm.town.seed===seed&&!townDonkeyBondActive();
   setup();const legacy=JSON.parse(JSON.stringify(farm)),actors=JSON.stringify(legacy.town.donkeys);delete legacy.town.donkeyBond;
   const loaded=parseFarmSave({version:1,state:legacy});result.legacy=JSON.stringify(loaded.town.donkeys)===actors&&loaded.town.donkeyBond.sessions===0;
   setup();step();result.reject=true;
   for(const mutate of [s=>s.town.donkeyBond.spots[0].x=2180,s=>s.town.donkeyBond.wait=9,s=>s.town.donkeyBond.left=2,
    s=>s.town.donkeyBond.spots[1].x++,s=>s.town.donkeys[0].target='home',
    s=>s.town.donkeys[0].route[0].y=1580,s=>s.town.donkeyBond.decided=false,s=>s.town.donkeyBond.sessions=-1]){
    const state=JSON.parse(JSON.stringify(farm));mutate(state);try{parseFarmSave({version:1,state});result.reject=false;}catch(_){}}
   return result;
  }finally{replaceFarmState(old,runtime);updateUI();}
 })()`);
 for(const [key,value]of Object.entries(results))assert.ok(value,'Donkey bond '+key+': '+JSON.stringify(results));
 console.log('Donkey bond passed: real paired arrival, safe separation, once/day, pause/save, weather/home/visitor/fodder priorities, click, hints/depth, no expense and legacy validation.');
};
