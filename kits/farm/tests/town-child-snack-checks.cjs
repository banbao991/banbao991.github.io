module.exports=function checkTownChildSnack(run,assert){
 const result=run(`(()=>{
 const original=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
 const days=Array.from({length:28},(_,i)=>i+11).filter(d=>d%10!==0&&hash(d,829)<.65);
 const day=days.find(d=>hash(d,313,967)<.65),failed=days.find(d=>hash(d,313,967)>=.65);
 function setup(d=day){farm=newFarm();farm.day=d;farm.phase=.05;farm.coins=100000;farm.weather=farm.weatherFrom='sunny';
  ensureValleyHerbs();spawnForageForDay();spawnFishForDay();farm.town.merchantUnlocked=true;farm.town.visits=1;farm.town.inventory.teaBlend=4;
  Object.assign(farm.town.traveller,TOWN_LAYOUT.counter,{mode:'shop',tier:1,offers:[{id:'snackBox',price:160,sold:false}]});
  villageWalker=resetVillageWalker();townBuy('snackBox');}
 function world(){const runtime=captureRuntimeState();delete runtime.now;return JSON.stringify({farm,runtime});}
 function saved(){const before=world(),loaded=importFarmText(farmExportText());replaceFarmState(loaded.state,loaded.runtime);return world()===before;}
 function reach(){for(let i=0;i<500&&farm.town.childVisit?.stage!=='tea';i++){farm.phase+=.05/DAY_SECONDS;updateTownChildVisit(.05);updateTownChildSnack(.05);}return townChildSnackSeated();}
 try{
  setup();const money=farm.coins,seed=farm.town.seed;updateTownChildVisit(.05);updateTownChildSnack(.05);
  result.noRemote=farm.town.childSnack.taken===0&&farm.town.snacks.stock.length===4&&farm.town.childVisit.stage==='out';
  result.arrival=reach()&&distance(villageWalker,TOWN_LAYOUT.childSeat)<2&&farm.town.childSnack.taken===1;
  result.stock=farm.town.snacks.stock.length===3&&farm.town.inventory.snackBox===3&&farm.coins===money&&farm.town.snacks.taken===0&&farm.town.childSnack.meal.theme===seasonIndex();
  result.noSeed=farm.town.seed===seed;updateTownChildVisit(.3);updateTownChildSnack(.3);result.partial=saved();
  farm.paused=true;const before=world(),raise=townChildSnackHandRaise();tick(last+65);renderCompleteFarmCanvas();result.pause=world()===before&&townChildSnackHandRaise()!==raise;farm.paused=false;
  centerCamera(TOWN_LAYOUT.tea.x,TOWN_LAYOUT.tea.y);const items=farmSceneItems();result.depth=items.filter(i=>i.id==='village-walker').length===1&&items.find(i=>i.id==='village-walker').y===actorDepth(villageWalker,22)
   &&items.find(i=>i.id==='traveller-tea-table').y===TOWN_LAYOUT.childSnackPlate.depth;
  result.hint=describe(villageWalker.x,villageWalker.y).text.includes('品尝')&&townDescribe(TOWN_LAYOUT.tea.x,TOWN_LAYOUT.tea.y).text.includes('茶点')&&villageResidentDescription('阿宁').includes('品尝');
  updateTownUI();result.status=$('town-child-snack-status').textContent.includes('品尝');farm.ledgerExpanded=true;updateLedgerUI();result.ledger=$('ledger-town-child-snacks').textContent==='已取 1 / 吃完 0 份';
  const originalWait=farm.town.childVisit.wait;for(let i=0;i<23;i++){farm.phase+=.1/DAY_SECONDS;updateTownChildVisit(.1);updateTownChildSnack(.1);}
  result.finish=farm.town.childSnack.finished===1&&!farm.town.childSnack.meal&&farm.town.childVisit.stage==='tea'&&Math.abs(farm.town.childVisit.wait-originalWait-2.3)<1e-8&&saved();
  for(let i=0;i<15;i++){farm.phase+=.1/DAY_SECONDS;updateTownChildVisit(.1);updateTownChildSnack(.1);}result.originalReturn=farm.town.childVisit.stage==='return'&&farm.town.childSnack.taken===1;
  setup();reach();updateTownChildSnack(.4);farm.weather=farm.weatherFrom='rain';updateTownChildSnack(.1);result.rain=farm.town.childSnack.meal===null&&farm.town.childSnack.taken===1&&farm.town.childSnack.finished===0&&farm.town.snacks.stock.length===3&&saved();
  farm.weather=farm.weatherFrom='sunny';updateTownChildSnack(.1);result.noRetry=!farm.town.childSnack.meal;
  setup();reach();villageWalker.x+=10;updateTownChildSnack(.1);result.departure=!farm.town.childSnack.meal&&farm.town.childSnack.finished===0;
  setup();reach();farm.day=20;updateTownChildSnack(.1);result.festival=!farm.town.childSnack.meal&&farm.town.childSnack.finished===0;
  setup(failed);reach();result.failed=farm.town.childSnack.decidedDay===failed&&farm.town.childSnack.taken===0&&saved();for(let i=0;i<20;i++)updateTownChildSnack(.1);result.failed&&=farm.town.childSnack.taken===0;
  setup();reach();farm.town.childSnack=makeTownChildSnack();farm.town.childVisit.wait=1.2;const stock=farm.town.snacks.stock.length;updateTownChildSnack(.1);result.short=farm.town.childSnack.taken===0&&farm.town.snacks.stock.length===stock;
  const archive=JSON.parse(farmExportText()),pos=JSON.stringify(archive.runtime.villageWalker);delete archive.state.town.childSnack;const old=importFarmText(JSON.stringify(archive));replaceFarmState(old.state,old.runtime);
  result.legacy=farm.town.childSnack.taken===0&&JSON.stringify(villageWalker)===pos;
  result.reject=true;for(const change of [s=>s.taken=-1,s=>s.finished=1,s=>s.decidedDay=farm.day+1,s=>s.meal={day:0,theme:9,elapsed:9}]){const saved=JSON.parse(farmExportText());change(saved.state.town.childSnack);try{importFarmText(JSON.stringify(saved));result.reject=false;}catch(_){}}
  farm.town.improvements.teaChimes.level=0;farm.town.inventory.snackBox=0;farm.town.snacks=makeTownSnacks();farm.town.teaServed=1;result.useful=townGoodsUseful('snackBox');
  return result;
 }finally{replaceFarmState(original,runtime);updateUI();}
 })()`);
 for(const [key,value]of Object.entries(result))assert.ok(value,'Child tea snack '+key+': '+JSON.stringify(result));
 console.log('Child tea snack passed: real original tea arrival, purchased stock, saved daily choice/meal, no extra fees/time, pause gestures, interruption, original return/depth/hints, defaults and validation.');
};
