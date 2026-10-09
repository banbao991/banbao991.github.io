module.exports=function checkCourierMeal(run,assert) {
 const checks=run(`(() => {
  const original=JSON.parse(JSON.stringify(farm)),runtime=captureRuntimeState(),r={};
  try {
   const prepare=(coins=60000)=>{
    replaceFarmState(newFarm());farm.paused=false;farm.upgrades=5;farm.goatBarnOpen=true;farm.coins=coins;
    farm.day=Array.from({length:18},(_,i)=>i+2).find(d=>d%10!==0&&hash(d,d-1,2711)<.5);farm.phase=.24;
    farm.weather=farm.weatherFrom='sunny';farm.orders=[];
    Object.assign(farm.town,{season:Math.floor((farm.day-1)/8),allowance:500,seasonSpent:0});
    Object.assign(courier,{...COURIER_HOME,x:COURIER_HOME.x-60,y:COURIER_HOME.y,leg:'return',
     journeyDay:farm.day-1,plannedDepots:[],routeVariant:'direct',stopIndex:1,cargo:{wheat:2},night:null});
    return farm.town.courierMeal;
   };
   let m=prepare(),coins=farm.coins;updateCourier(.05);
   r.beforeArrival=m.bought===0&&farm.coins===coins&&courier.leg==='return';
   for(let i=0;i<20&&courier.leg==='return';i++)updateCourier(.05);
   r.realPurchase=courier.leg==='market'&&distance(courier,COURIER_HOME)<.01&&m.stage==='eating'
    &&m.bought===1&&m.price===12&&m.spent===12&&farm.town.spending.goods===12&&farm.town.seasonSpent===12
    &&farm.coins===coins+Math.round(goodValue('wheat')*2)-12&&farm.shippedTotal===2&&Object.keys(courier.cargo).length===0;
   updateCourier(.5);const position={x:courier.x,y:courier.y},elapsed=m.elapsed;
   const a=importFarmText(farmExportText());r.archive=JSON.stringify(a.state)===JSON.stringify(farm)&&JSON.stringify(a.runtime)===JSON.stringify(captureRuntimeState());
   replaceFarmState(a.state,a.runtime);m=farm.town.courierMeal;farm.paused=true;
   const frozen=JSON.stringify({state:farm,runtime:captureRuntimeState()});updateCourier(4);drawCourier();renderCompleteFarmCanvas();drawMiniMap();describe(courier.x-12,courier.y-10);
   r.pauseReadonly=JSON.stringify({state:farm,runtime:captureRuntimeState()})===frozen&&m.elapsed===elapsed;
   coins=farm.coins;greetCourier();greetCourier();r.freeGreeting=farm.coins===coins&&m.bought===1&&m.elapsed===elapsed;
   r.hint=describe(courier.x-12,courier.y-10).text.includes(COURIER_PASTRY_NAMES[m.theme]);
   const item=farmSceneItems().find(i=>i.id==='courier');r.depth=item.y===actorDepth(courier,24)&&item.layer===0;
   farm.paused=false;for(let i=0;i<60&&m.stage==='eating';i++)updateCourier(.05);
   r.complete=m.stage==='done'&&m.elapsed===2.8&&m.finished===1&&farm.coins===coins&&distance(courier,position)<.01&&courier.leg==='market';
   beginCourierMeal(2);updateCourier(.05);r.once=m.bought===1&&m.finished===1&&m.spent===12;
   farm.ledgerExpanded=true;updateLedgerUI();r.ledger=$('ledger-courier-meal').textContent==='1 份 / 1 份 / 12 金';
   farm.phase=NIGHT_START;for(let i=0;i<150&&!courier.night?.sleeping;i++)updateCourier(.05);
   r.home=courier.night?.sleeping&&distance(courier,COURIER_VILLAGE_DOOR)<.01;
   m=prepare();Object.assign(courier,COURIER_HOME,{leg:'market',lastReturnDay:farm.day,cargo:{}});
   beginCourierMeal(0);r.empty=m.day===0&&m.bought===0;
   const blocked=(setup)=>{const b=prepare();setup();for(let i=0;i<20&&courier.leg==='return';i++)updateCourier(.05);return b.bought===0&&b.finished===0;};
   r.budget=blocked(()=>farm.town.budgetMode='off')&&blocked(()=>farm.town.allowance=0);
   r.reserve=blocked(()=>{farm.coins=5005;farm.plots=Array.from({length:500},(_,i)=>({x:i%80,y:Math.floor(i/80),crop:null,age:0,watered:false,plantedAt:null}));});
   r.wealth=blocked(()=>farm.coins=4900);
   m=prepare();farm.upgrades=4;Object.assign(courier,COURIER_HOME,{leg:'market',lastReturnDay:farm.day});
   beginCourierMeal(2);r.market=m.bought===0;
   r.weather=blocked(()=>farm.weather=farm.weatherFrom='rain')&&blocked(()=>farm.weather=farm.weatherFrom='snow');
   r.late=blocked(()=>farm.phase=.45);
   m=prepare();Object.assign(courier,COURIER_HOME,{leg:'market',lastReturnDay:farm.day});beginCourierMeal(2);updateCourier(.4);
   farm.weather=farm.weatherFrom='rain';updateCourier(.05);r.rainCancel=m.stage==='done'&&m.finished===0&&m.bought===1&&m.spent===12;
   m=prepare();Object.assign(courier,COURIER_HOME,{leg:'market',lastReturnDay:farm.day});beginCourierMeal(2);updateCourier(.4);
   farm.phase=NIGHT_START;updateCourier(.05);r.nightCancel=m.stage==='done'&&m.finished===0&&courier.night!==null;
   m=prepare();Object.assign(courier,COURIER_HOME,{leg:'market',lastReturnDay:farm.day});beginCourierMeal(2);
   farm.day=10;farm.phase=.2;updateCourier(.05);r.festival=m.stage==='done'&&m.finished===0&&courier.festival?.attending===true;
   r.tiers=[100000,500000].every((money,i)=>{const b=prepare(money);Object.assign(courier,COURIER_HOME,{leg:'market',lastReturnDay:farm.day});beginCourierMeal(2);return b.price===[24,36][i]&&b.spent===b.price;});
   m=prepare();farm.day++;Object.assign(courier,COURIER_HOME,{leg:'market',lastReturnDay:farm.day});
   beginCourierMeal(2);r.noRepeat=beginCourierMeal(2)===false;
   const data=JSON.parse(farmExportText());delete data.state.town.courierMeal;
   r.defaults=importFarmText(JSON.stringify(data)).state.town.courierMeal.bought===0;
   r.invalid=[b=>b.day=-1,b=>b.stage='teleport',b=>b.elapsed=3,b=>b.bought=-1,b=>b.finished=b.bought+1,
    b=>b.spent=999999,b=>b.price=15,b=>b.theme=4,b=>{b.chosen=false;b.stage='eating';}].every(change=>{
     const bad=JSON.parse(farmExportText());change(bad.state.town.courierMeal);try{importFarmText(JSON.stringify(bad));return false;}catch{return true;}});
   replaceFarmState(newFarm());r.reset=farm.town.courierMeal.bought===0&&farm.town.courierMeal.stage==='idle';
   return r;
  } finally {replaceFarmState(original,runtime);}
 })()`);
 for(const [name,passed] of Object.entries(checks))assert.equal(passed,true,'Courier pastry: '+name);
 console.log('Courier pastry passed: original real delivery, saved arrival price/payment, budgets, pause/full restore, bite/greeting/depth, rain/night/festival, completion and validation.');
};
