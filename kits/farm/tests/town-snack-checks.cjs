module.exports=function checkTownSnacks(run,assert){
 const result=run(`(()=>{
 const original=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
 try{
  farm=newFarm();farm.day=11;farm.phase=.2;farm.coins=80000;farm.weather=farm.weatherFrom='sunny';farm.town.merchantUnlocked=true;farm.town.allowance=15000;
  ensureValleyHerbs();spawnForageForDay();spawnFishForDay();const town=farm.town,s=town.snacks;Object.assign(town.traveller,TOWN_LAYOUT.counter,{mode:'shop',tier:1,offers:[{id:'snackBox',price:160,sold:false}]});
  result.useful=!townGoodsUseful('snackBox');town.improvements.teaChimes.level=1;result.useful&&=townGoodsUseful('snackBox');
  const coins=farm.coins,seed=town.seed;
  result.buy=townBuy('snackBox',true)&&s.stock.length===4&&town.inventory.snackBox===4&&farm.coins===coins-160&&town.spending.care===160&&town.seasonSpent===160&&s.stock.every(t=>t===seasonIndex());
  result.once=!townBuy('snackBox')&&town.seed===seed;town.traveller.offers=[{id:'snackBox',price:160,sold:false}];s.stock.push(0);town.inventory.snackBox=5;const fullCoins=farm.coins;result.capacity=!townBuy('snackBox')&&farm.coins===fullCoins&&s.stock.length===5;s.stock.pop();town.inventory.snackBox=4;const price=farm.coins;
  town.construction={id:'teaChimes',kind:'care',level:1,cost:100,progress:0,startedAt:farm.day+farm.phase};townPrepareSnackParcel();result.pack=s.stock.length===2&&s.carried.length===2&&town.inventory.snackBox===2;
  Object.assign(town.traveller,{mode:'walk'},TOWN_LAYOUT.projects.teaChimes.work);townDeliverSnackParcel(town.traveller);result.actual=s.pantry.length===0;
  town.traveller.mode='work';town.traveller.x+=10;townDeliverSnackParcel(town.traveller);result.actual&&=s.pantry.length===0;
  town.traveller.x-=10;townDeliverSnackParcel(town.traveller);result.actual&&=s.pantry.length===2&&s.carried.length===0&&farm.coins===price;
  townPrepareSnackParcel();result.pack&&=s.stock.length===0&&s.carried.length===2;
  s.stock=Array(8).fill(3);town.inventory.snackBox=8;townReturnSnackParcel();result.fullReturn=s.carried.length===2&&s.stock.length===8;
  s.stock.pop();town.inventory.snackBox=7;townReturnSnackParcel();result.fullReturn&&=s.carried.length===1&&s.stock.length===8;
  s.stock=[];town.inventory.snackBox=0;townReturnSnackParcel();result.fullReturn&&=s.carried.length===0&&s.stock.length===1;
  miner=resetMiner();const trip=Array.from({length:11},(_,i)=>i+1).find(d=>hash(d,211,967)<.7);Object.assign(miner,MINE_TEA_SEAT,{mode:'teaRest',deliveryDay:trip,action:0});
  miner.x+=10;updateTownSnacks(.1);result.seated=!s.meal&&s.decidedTrip===0;
  miner.x-=10;miner.action=5;updateTownSnacks(.1);result.late=!s.meal;
  miner.action=0;farm.day=10;updateTownSnacks(.1);result.festival=!s.meal;farm.day=11;
  farm.paused=true;updateTownSnacks(.1);result.pause=!s.meal;farm.paused=false;
  updateTownSnacks(.1);result.begin=!!s.meal&&s.taken===1&&s.pantry.length===1&&s.meal.theme===seasonIndex()&&miner.action===0&&farm.coins===price;
  updateTownSnacks(.9);const snapshot=()=>{const rt=captureRuntimeState();delete rt.now;return JSON.stringify({farm,runtime:rt});};
  const before=snapshot(),loaded=importFarmText(farmExportText());replaceFarmState(loaded.state,loaded.runtime);result.partial=snapshot()===before&&farm.town.snacks.meal.elapsed===.9;
  farm.paused=true;const frozen=snapshot(),raise=townSnackHandRaise();tick(last+65);result.pause&&=snapshot()===frozen&&townSnackHandRaise()!==raise;
  renderCompleteFarmCanvas();result.readOnly=snapshot()===frozen;
  farm.paused=false;updateTownSnacks(1.5);result.finish=farm.town.snacks.finished===1&&!farm.town.snacks.meal&&miner.action===0;
  updateTownSnacks(.1);result.once&&=!farm.town.snacks.meal&&farm.town.snacks.pantry.length===1;
  const snack=farm.town.snacks;miner.deliveryDay=Array.from({length:11},(_,i)=>i+1).find(d=>d!==trip&&hash(d,211,967)<.7);snack.pantry.push(2);updateTownSnacks(.1);
  miner.mode='teaHome';updateTownSnacks(.1);result.leave=!snack.meal&&snack.finished===1&&snack.taken===2;
  miner.mode='teaRest';miner.deliveryDay=Array.from({length:11},(_,i)=>i+1).find(d=>hash(d,211,967)>=.7);const pantry=snack.pantry.length;updateTownSnacks(.1);updateTownSnacks(.1);
  result.decision=!snack.meal&&snack.decidedTrip===miner.deliveryDay&&snack.pantry.length===pantry;
  miner.deliveryDay=trip;snack.decidedTrip=0;snack.pantry=[1];miner.action=0;farm.weather=farm.weatherFrom='rain';updateTownSnacks(.1);result.rain=!snack.meal&&snack.pantry.length===1;
  farm.weather=farm.weatherFrom='sunny';farm.phase=NIGHT_START-1/DAY_SECONDS;updateTownSnacks(.1);result.late&&=!snack.meal;
  farm.phase=.2;updateTownSnacks(.1);farm.weather=farm.weatherFrom='rain';updateTownSnacks(.1);result.rain&&=!snack.meal&&snack.taken===3&&snack.finished===1;
  farm.weather=farm.weatherFrom='sunny';farm.ledgerExpanded=true;updateUI();result.ui=$('town-snack-status').textContent.includes('茶箱')&&$('ledger-town-snacks').textContent.includes('已取 3');
  result.hint=townDescribe(TOWN_LAYOUT.pavilionTea.x,TOWN_LAYOUT.pavilionTea.y).text.includes('四季茶点');
  centerCamera(MINE_TEA_SEAT.x,MINE_TEA_SEAT.y);const items=farmSceneItems();result.depth=items.find(i=>i.id==='tea-table')?.y===TOWN_LAYOUT.snackPlate.depth&&items.find(i=>i.id==='town-pavilion-tea-box')?.y===TOWN_LAYOUT.pavilionTea.y+6;
  const complete=snapshot(),again=importFarmText(farmExportText());replaceFarmState(again.state,again.runtime);result.save=snapshot()===complete;
  const old=JSON.parse(JSON.stringify(farm));delete old.town.snacks;delete old.town.inventory.snackBox;const actor=JSON.stringify(old.town.traveller),legacy=parseFarmSave({version:1,state:old});
  result.defaults=legacy.town.inventory.snackBox===0&&JSON.stringify(legacy.town.snacks)===JSON.stringify(makeTownSnacks())&&JSON.stringify(legacy.town.traveller)===actor;
  result.reject=true;for(const change of [s=>s.town.snacks.stock.push(5),s=>s.town.inventory.snackBox++,s=>s.town.snacks.carried=Array(3).fill(1),s=>s.town.snacks.pantry=Array(5).fill(1),s=>s.town.snacks.finished=100,s=>s.town.snacks.decidedTrip=12,s=>s.town.snacks.meal={trip:1,theme:0,elapsed:2.4}]){
   const state=JSON.parse(JSON.stringify(farm));change(state);try{parseFarmSave({version:1,state});result.reject=false;}catch(_){}}
  farm.paused=false;farm.town.inventory.snackBox=0;farm.town.snacks=makeTownSnacks();farm.coins=townReserve()+159;Object.assign(farm.town.traveller,TOWN_LAYOUT.counter,{mode:'shop',offers:[{id:'snackBox',price:160,sold:false}]});
  result.reserve=!townBuy('snackBox');farm.coins=80000;farm.town.budgetMode='off';result.manual=!townBuy('snackBox',true)&&townBuy('snackBox');
  result.themes=true;for(const [i,day]of [1,9,17,25].entries()){farm.day=day;farm.town.snacks=makeTownSnacks();farm.town.inventory.snackBox=0;farm.town.traveller.offers=[{id:'snackBox',price:160,sold:false}];result.themes&&=townBuy('snackBox')&&farm.town.snacks.stock.length===4&&farm.town.snacks.stock.every(t=>t===i);}
  return result;
 }finally{replaceFarmState(original,runtime);updateUI();}
 })()`);
 for(const [key,value]of Object.entries(result))assert.ok(value,'Season snacks '+key+': '+JSON.stringify(result));
 console.log('Season snacks passed: real paid quantities/budget/reserve, original work arrival, bounded preserved parcel, actual tea seat, one saved decision, consumption/completion, full restore, pause gestures, defaults and original depths.');
};
