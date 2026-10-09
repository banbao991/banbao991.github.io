module.exports=function checkEastShore(run,assert){
 const result=run(`(()=>{
 const original=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),r={};
 const world=()=>{const x=captureRuntimeState();delete x.now;return JSON.stringify({farm,x});};
 const saved=()=>{const before=world(),d=importFarmText(farmExportText());replaceFarmState(d.state,d.runtime);return before===world();};
 try{
 farm=newFarm();farm.day=11;farm.phase=.2;farm.weather=farm.weatherFrom='sunny';ensureValleyHerbs();spawnForageForDay();spawnFishForDay();
 const coins=farm.coins,seed=farm.town.seed;
 let moved=false;for(let i=0;i<600;i++){const before=farm.eastShore.ducks.map(b=>({x:b.x,y:b.y}));updateEastShore(.05);farm.eastShore.ducks.forEach((b,id)=>{if(distance(b,before[id])>.701||!eastShoreWater(b,EAST_SHORE.pond,-6))throw Error('unsafe duck movement');if(distance(b,before[id])>.01)moved=true;});}
 r.water=moved&&saved();
 // Observe each real water resident without altering its target or spending.
 r.hints=true;for(const b of farm.eastShore.ducks){const hint=describe(b.x,b.y-8);r.hints&&=hint.target===b&&hint.text.includes('鸳鸯');greetEastShore({animal:b,type:'duck'});greetEastShore({animal:b,type:'duck'});}
 r.observe=farm.eastShore.observations===2&&saved();
 farm.phase=.85;for(let i=0;i<700;i++)updateEastShore(.05);r.nests=farm.eastShore.ducks.every((b,id)=>b.mode==='sleep'&&distance(b,EAST_SHORE.nests[id])===0);
 // Reproducible daytime choices; actual dusk routes must visit and consume individual shrubs.
 farm.day=12;farm.phase=.49;let mealSeen=false,continued=false;for(let day=12;day<25&&!continued;day++){
 farm.day=day;farm.phase=.49;spawnForageForDay();spawnFishForDay();for(let i=0;i<2000;i++){
  const h=farm.eastShore.hedge,old={x:h.x,y:h.y},oldMeals=farm.eastShore.meals;updateEastShore(.05);
  if(!eastHedgeClear(h,h)||distance(h,old)>1.251)throw Error('unsafe hedge route');
  if(farm.eastShore.meals>oldMeals){mealSeen=true;continued=h.mode==='walk'&&h.goal==='berries';if(continued)break;}
 }if(!continued){farm.phase=.95;for(let i=0;i<1000;i++)updateEastShore(.05);}}
 r.forage=mealSeen&&continued&&farm.eastShore.berries.some(b=>b.readyAt>farm.day+farm.phase)&&saved();
 const h=farm.eastShore.hedge,position={x:h.x,y:h.y};greetEastShore({animal:h,type:'hedge'});r.hedgeHint=describe(h.x,h.y-5).text.includes('刺猬')&&distance(h,position)===0&&farm.eastShore.observations===3;
 const spring=EAST_SHORE.spring,oldMeals=farm.eastShore.meals;r.spring=handleEastShoreClick(spring.x,spring.y)&&farm.eastShore.rippleUntil>now&&farm.eastShore.meals===oldMeals&&saved();
 updateUI();farm.ledgerExpanded=true;updateLedgerUI();r.ui=$('east-shore-status').textContent.includes('鸳鸯')&&$('ledger-east-shore').textContent.includes('3 次');
 farm.paused=true;const before=world();updateEastShore(10);tick(last+65);renderCompleteFarmCanvas();r.pause=before===world();farm.paused=false;
 const items=farmSceneItems();r.depth=items.filter(i=>i.id==='east-shore-hedge').length===1&&items.find(i=>i.id==='east-shore-hedge').y===h.y+8&&items.filter(i=>i.id.startsWith('east-mandarin:')).length===2;
 farm.weather=farm.weatherFrom='rain';for(let i=0;i<1300;i++)updateEastShore(.05);r.rain=farm.eastShore.hedge.mode==='hide'&&farm.eastShore.ducks.every(b=>b.mode==='sleep')&&saved();
 r.free=farm.coins===coins&&farm.town.seed===seed;
 const full=JSON.parse(farmExportText());delete full.state.eastShore;const old=importFarmText(JSON.stringify(full));r.default=old.state.eastShore.ducks.length===2&&old.state.eastShore.meals===0&&JSON.stringify(old.runtime)===JSON.stringify(captureRuntimeState());
 r.reject=true;for(const change of [s=>s.eastShore.ducks[0].x=0,s=>s.eastShore.hedge.route=[EAST_SHORE.pond],s=>s.eastShore.meals=-1,s=>s.eastShore.berries[0].readyAt=null,s=>s.eastShore.ducks[0].chosen='yes']){const d=JSON.parse(farmExportText());change(d.state);try{importFarmText(JSON.stringify(d));r.reject=false;}catch(_){}}
 // Full-development obstacles and the original road system are checked together.
 r.space=true;for(const p of [EAST_SHORE.spring,EAST_SHORE.pond])for(let y=p.y-p.ry;y<=p.y+p.ry;y+=8)for(let x=p.x-p.rx;x<=p.x+p.rx;x+=8)if(eastShoreWater({x,y},p))r.space&&=!townRoadAt(x,y,32)&&!riverAt(x,y);
 for(const t of EAST_SHORE.trees)r.space&&=!townRoadAt(t.x,t.y+10,32)&&!eastShoreWater({x:t.x,y:t.y+10},EAST_SHORE.pond,24)&&!eastShoreWater({x:t.x,y:t.y+10},EAST_SHORE.spring,20);
 r.space&&=EAST_SHORE.pond.y-EAST_SHORE.pond.ry>TOWN_LAYOUT.donkeyInn.area.bottom+32&&EAST_SHORE.spring.x-EAST_SHORE.spring.rx>TOWN_LAYOUT.showcases[1].right+24;
 r.night=true;for(let day=31;day<47;day++){
  farm.day=day;farm.phase=.08;farm.weather=farm.weatherFrom='sunny';prepareFestival();spawnForageForDay();spawnFishForDay();
  for(let i=0;i<600;i++){farm.phase=.08+i/600*.86;updateEastShore(.08);validateEastShore(farm);if(i%150===0)r.night&&=saved();}
  farm.phase=.95;for(let i=0;i<1100;i++)updateEastShore(.05);r.night&&=farm.eastShore.hedge.mode==='hide'&&farm.eastShore.ducks.every(b=>b.mode==='sleep');
 }
 return r;
 }finally{replaceFarmState(original,runtime);updateUI();}
 })()`);
 for(const [k,v]of Object.entries(result))assert.ok(v,'East shore '+k+': '+JSON.stringify(result));
 console.log('East shore passed: mature layout clearances, real swimming and dusk foraging, direct next shrub, rain/night nests, pause/depth/readonly export, hints/one-time observations, full restoration and invalid archive rejection.');
};
