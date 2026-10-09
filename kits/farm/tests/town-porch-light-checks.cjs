module.exports=function checkTownPorchLights(run,assert){
 const result=run(`(()=>{
 const original=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
 try{
  farm=newFarm();farm.day=11;farm.phase=.16;farm.coins=80000;farm.weather=farm.weatherFrom='sunny';farm.town.merchantUnlocked=true;farm.town.allowance=15000;
  Object.assign(farm.town.traveller,TOWN_LAYOUT.counter,{mode:'shop',tier:1,offers:[{id:'lantern',price:460,sold:false}]});
  const coins=farm.coins,actor=JSON.stringify(captureRuntimeState()),seed=farm.town.seed;
  result.buy=townBuy('lantern',true)&&farm.town.porchLights.pieces.length===1&&farm.coins===coins-460&&farm.town.seasonSpent===460;
  result.once=!townBuy('lantern')&&farm.town.porchLights.pieces.length===1&&farm.town.seed===seed;
  result.growth=townPorchLightGrowth(0)===0;farm.phase+=.025;result.growth&&=Math.abs(townPorchLightGrowth(0)-.5)<.001;
  const partial=JSON.stringify(farm.town),loaded=importFarmText(farmExportText());replaceFarmState(loaded.state,loaded.runtime);result.partial=JSON.stringify(farm.town)===partial;
  for(let i=1;i<3;i++){farm.town.traveller.offers=[{id:'lantern',price:460,sold:false}];result.buy&&=townBuy('lantern');}
  farm.phase+=.1;result.three=farm.town.porchLights.pieces.length===3&&farm.coins===coins-1380&&farm.town.spending.goods===1380
   &&TOWN_LAYOUT.porchLights.every((p,i)=>townPorchLightGrowth(i)===1&&townDescribe(p.x,p.y+9).kind==='porch-light');
  farm.town.traveller.offers=[{id:'lantern',price:460,sold:false}];result.limit=!townBuy('lantern');
  now=5;const price=farm.coins;result.click=true;
  for(const [i,p]of TOWN_LAYOUT.porchLights.entries()){
   result.click&&=handleTownClick(p.x,p.y+9)&&farm.town.porchLights.pieces[i].level===.5&&townPorchLightLevel(i)===1;
  }
  now+=.6;result.continuous=TOWN_LAYOUT.porchLights.every((_,i)=>Math.abs(townPorchLightLevel(i)-.75)<.001);
  const current=townPorchLightLevel(2);toggleTownPorchLight(2);result.continuous&&=townPorchLightLevel(2)===current;
  const event=JSON.stringify(farm.events);toggleTownPorchLight(2);result.daily=JSON.stringify(farm.events)===event&&farm.coins===price&&farm.town.seed===seed;
  const snapshot=JSON.stringify({farm,runtime:captureRuntimeState()}),again=importFarmText(farmExportText());replaceFarmState(again.state,again.runtime);
  result.save=JSON.stringify({farm,runtime:captureRuntimeState()})===snapshot;
  farm.paused=true;const state=()=>{const rt=captureRuntimeState();delete rt.now;return JSON.stringify({farm,runtime:rt});};const before=state();
  const level=townPorchLightLevel(0);tick(last+65);result.pause=state()===before&&townPorchLightLevel(0)!==level;
  for(let i=0;i<3;i++)drawTownPorchLight(i);drawTownPorchLightGlow(.7);renderCompleteFarmCanvas();result.readOnly=state()===before;
  result.depth=TOWN_LAYOUT.porchLights.every(p=>{centerCamera(p.x,p.y);const parts=farmSceneItems();return parts.find(item=>item.id===p.parent)?.y===p.depth&&!parts.some(item=>item.id.startsWith('porch-light:'));});
  result.clear=TOWN_LAYOUT.porchLights.every(p=>!townRoadAt(p.x,p.y+22)&&!courierRoadAt(p.x,p.y+22)&&!mineRoadAt(p.x,p.y+22));
  const phases=[.51,.52,.61,.70,.89,.95,.999];result.dusk=phases.every(p=>{farm.phase=p;return Math.abs(nightStrength()-(p<.52?0:p<.7?(p-.52)/.18:p<.9?1:1-(p-.9)/.1))<1e-9;});
  farm.ledgerExpanded=true;updateUI();result.ui=$('ledger-town-porch-lights').textContent==='3 盏'&&$('town-porch-light-status').textContent.includes('阿矿')&&!$('town-porch-light-locate-2').hidden;
  const old=JSON.parse(JSON.stringify(farm));delete old.town.porchLights;const oldActor=JSON.stringify(old.town.traveller),legacy=parseFarmSave({version:1,state:old});
  result.legacy=legacy.town.porchLights.pieces.length===3&&legacy.town.porchLights.pieces.every(p=>p.installedAt===0&&p.level===1)&&JSON.stringify(legacy.town.traveller)===oldActor;
  result.reject=true;for(const change of [s=>s.town.porchLights.pieces.pop(),s=>s.town.porchLights.pieces[0].level=0,s=>s.town.porchLights.pieces[0].from=2,
   s=>s.town.porchLights.pieces[0].installedAt=99,s=>s.town.porchLights.pieces[0].changedAt=-1,s=>s.town.porchLights.pieces[0].noticedDay=99]){
    const state=JSON.parse(JSON.stringify(farm));change(state);try{parseFarmSave({version:1,state});result.reject=false;}catch(_){}}
  farm.town.inventory.lantern=0;farm.town.porchLights=makeTownPorchLights();result.unowned=!townPorchLightAt(TOWN_LAYOUT.porchLights[0].x,TOWN_LAYOUT.porchLights[0].y+9);
  farm.phase=.2;farm.paused=false;farm.coins=townReserve()+459;farm.town.traveller.offers=[{id:'lantern',price:460,sold:false}];result.reserve=!townBuy('lantern');
  farm.coins=80000;farm.town.budgetMode='off';result.manual=!townBuy('lantern',true)&&townBuy('lantern');
  farm.day=10;farm.phase=.2;farm.town.traveller.offers=[{id:'lantern',price:460,sold:false}];result.festival=!townBuy('lantern');
  return result;
 }finally{replaceFarmState(original,runtime);updateUI();}
 })()`);
 for(const [key,value]of Object.entries(result))assert.ok(value,'Porch lights '+key+': '+JSON.stringify(result));
 console.log('Porch lights passed: three paid places, continuous saved installation/dimmer/night, full restore, pause, free clicks, original depths/clear doors, budget/reserve and defaults.');
};
