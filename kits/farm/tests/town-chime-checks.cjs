module.exports=function checkTownChimes(run,assert){
 const results=run(`(()=>{
  const original=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
  try{
   farm=newFarm();farm.day=11;farm.phase=.16;farm.coins=80000;farm.weather=farm.weatherFrom='sunny';farm.town.merchantUnlocked=true;farm.town.allowance=15000;
   Object.assign(farm.town.traveller,TOWN_LAYOUT.counter,{mode:'shop',tier:1,offers:[{id:'windchime',price:320,sold:false}]});
   const coins=farm.coins,actors=JSON.stringify(captureRuntimeState());
   result.purchase=townBuy('windchime',true)&&farm.town.chimes.pieces.length===1&&farm.coins===coins-320&&farm.town.spending.goods===320&&farm.town.seasonSpent===320;
   const seed=farm.town.seed;result.once=!townBuy('windchime')&&farm.town.seed===seed&&farm.town.chimes.pieces.length===1;
   const first=farm.town.chimes.pieces[0];result.growth=townChimeGrowth(0)===0;farm.phase+=.04;
   result.growth&&=Math.abs(townChimeGrowth(0)-.5)<.001;const partial=JSON.stringify(farm.town),loaded=importFarmText(farmExportText());
   replaceFarmState(loaded.state,loaded.runtime);result.partial=JSON.stringify(farm.town)===partial;
   for(let i=1;i<3;i++){farm.town.traveller.offers=[{id:'windchime',price:320,sold:false}];result.purchase&&=townBuy('windchime');}
   farm.phase+=.1;result.count=farm.town.chimes.pieces.length===3&&farm.coins===coins-960&&farm.town.spending.goods===960
    &&TOWN_LAYOUT.chimes.every((point,i)=>townChimeGrowth(i)===1&&townDescribe(point.x,point.y+14).kind==='windchime');
   farm.town.traveller.offers=[{id:'windchime',price:320,sold:false}];result.limit=!townBuy('windchime')&&farm.town.chimes.pieces.length===3;
   const beforeCoins=farm.coins,beforeSeed=farm.town.seed;now=5;const point=TOWN_LAYOUT.chimes[2];result.click=handleTownClick(point.x,point.y+14);
   const events=JSON.stringify(farm.events);touchTownChime(2);result.click&&=farm.town.chimes.pieces[2].touchedUntil===7.8&&farm.coins===beforeCoins&&farm.town.seed===beforeSeed&&JSON.stringify(farm.events)===events;
   const saved=JSON.stringify(farm.town),again=importFarmText(farmExportText());replaceFarmState(again.state,again.runtime);result.save=JSON.stringify(farm.town)===saved;
   farm.paused=true;const freeze=()=>{const state=captureRuntimeState();delete state.now;return JSON.stringify({town:farm.town,runtime:state});};
   const frozen=freeze(),sway=townChimeSway(2);tick(last+65);
   for(let i=0;i<3;i++){drawTownChime(i);townChimeDescription(i);}updateTownUI();
   result.pause=freeze()===frozen&&townChimeSway(2)!==sway;
   const parts=farmSceneItems();result.depth=TOWN_LAYOUT.chimes.every(point=>parts.find(item=>item.id===point.parent)?.y===point.depth)
    &&!parts.some(item=>item.id.startsWith('windchime:'));
   farm.ledgerExpanded=true;updateLedgerUI();result.ledger=$('ledger-town-chimes').textContent==='3 件';
   result.status=$('town-chime-status').textContent.includes('阿芽')&&!$('town-chime-locate-2').hidden;
   const old=JSON.parse(JSON.stringify(farm));delete old.town.chimes;const oldActor=JSON.stringify(old.town.traveller),legacy=parseFarmSave({version:1,state:old});
   result.legacy=legacy.town.chimes.pieces.length===3&&legacy.town.chimes.pieces.every(p=>p.installedAt===0)&&JSON.stringify(legacy.town.traveller)===oldActor;
   result.reject=true;for(const change of [s=>s.town.chimes.pieces.pop(),s=>s.town.chimes.pieces[0].palette=4,s=>s.town.chimes.pieces[0].installedAt=99,
    s=>s.town.chimes.pieces[0].touchedUntil=-1,s=>s.town.chimes.pieces[0].noticedDay=99]){const state=JSON.parse(JSON.stringify(farm));change(state);
     try{parseFarmSave({version:1,state});result.reject=false;}catch(_){}}
   farm.town.inventory.windchime=0;farm.town.chimes=makeTownChimes();result.unowned=!townChimeAt(point.x,point.y+14);
   farm.town.traveller.offers=[{id:'windchime',price:320,sold:false}];farm.paused=false;farm.coins=townReserve()+319;result.reserve=!townBuy('windchime');
   farm.coins=80000;farm.town.budgetMode='off';result.manual=!townBuy('windchime',true)&&townBuy('windchime');
   farm.day=10;farm.phase=.2;farm.town.traveller.offers=[{id:'windchime',price:320,sold:false}];result.festival=!townBuy('windchime');
   return result;
  }finally{replaceFarmState(original,runtime);updateUI();}
 })()`);
 for(const [key,value]of Object.entries(results))assert.ok(value,'Three chimes '+key+': '+JSON.stringify(results));
 console.log('Three chimes passed: three actual purchases/places, gradual saved installation, random saved ties, original fees/reserve, pause/click, parent depth/hints/ledger and legacy validation.');
};
