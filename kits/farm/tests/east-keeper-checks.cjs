module.exports=function checkEastKeeper(run,assert){
 const result=run(`(()=>{
 const original=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
 function world(){const r=captureRuntimeState();delete r.now;return JSON.stringify({farm,r});}
 function saved(){const before=world(),loaded=importFarmText(farmExportText());replaceFarmState(loaded.state,loaded.runtime);return before===world();}
 function setup(){farm=newFarm();farm.day=11;farm.phase=.2;farm.weather=farm.weatherFrom='sunny';ensureValleyHerbs();spawnForageForDay();spawnFishForDay();forestKeeper=resetForestKeeper();Object.assign(forestKeeper,{day:11,choice:'stroll',watchIndex:4});
  for(const [id,b]of farm.eastWoods.birds.entries())Object.assign(b,EAST_WOODS.spots[id?4:2],{day:11,decided:true,chosen:true,mode:'forage',goal:'grass',wait:3});}
 try{
  setup();const coins=farm.coins,seed=farm.town.seed;updateForestKeeper(.05);
  result.route=forestKeeper.mode==='toWatch'&&distance(forestKeeper.route.at(-1),EAST_WOODS.watch)<1&&forestKeeper.route.every(p=>forestGroundClear(p.x,p.y));
  result.safe=true;let half=false;for(let i=0;i<1500&&forestKeeper.mode!=='watching';i++){const before={x:forestKeeper.x,y:forestKeeper.y};updateForestKeeper(.05);result.safe&&=forestGroundClear(forestKeeper.x,forestKeeper.y)&&distance(before,forestKeeper)<=5.601;
   if(!half&&forestKeeper.x>2050){result.halfSave=saved();half=true;}}
  result.arrival=distance(forestKeeper,EAST_WOODS.watch)<1&&forestKeeper.mode==='watching'&&farm.eastWoods.keeperVisits===1&&farm.eastWoods.keeperVisitDay===11;
  result.birds=farm.eastWoods.birds.every(b=>b.waveUntil>now&&b.wait>=1.8&&!b.noticed)&&farm.eastWoods.observations===0;
  result.money=coins===farm.coins&&seed===farm.town.seed&&saved();visitForestAnimals();visitEastPheasants(forestKeeper);result.once=farm.eastWoods.keeperVisits===1;
  const items=farmSceneItems();result.depth=items.filter(i=>i.id==='forest-keeper').length===1&&items.find(i=>i.id==='forest-keeper').y===actorDepth(forestKeeper)&&items.filter(i=>i.id.startsWith('east-pheasant:')).length===2;
  farm.paused=true;const frozen=world();updateForestKeeper(1);visitEastPheasants(forestKeeper);tick(last+60);renderCompleteFarmCanvas();result.pause=frozen===world();
  const oldPaint=ctx.fillRect,arms=[];ctx.fillRect=function(x,y,w,h){if(this.fillStyle==='#dfb28b'&&w===5)arms.push({x,y,h});return oldPaint.call(this,x,y,w,h);};try{drawForestKeeper();}finally{ctx.fillRect=oldPaint;}result.oneHand=arms.filter(a=>a.x===Math.round(forestKeeper.x)+9).length===1;farm.paused=false;
  updateUI();farm.ledgerExpanded=true;updateLedgerUI();result.ui=forestKeeperActivity().includes('东缘山雉')&&$('keeper-status').textContent.includes('东缘山雉')&&$('east-woods-status').textContent.includes('阿森招呼 1 次')&&$('ledger-east-keeper').textContent==='1 次';
  farm.phase=NIGHT_START;for(let i=0;i<1800&&forestKeeper.mode!=='home';i++){updateForestKeeper(.05);result.safe&&=forestGroundClear(forestKeeper.x,forestKeeper.y);}result.home=distance(forestKeeper,FOREST_HOME)<1&&!forestKeeperVisible()&&saved();
  setup();forestKeeper.mode='watching';Object.assign(forestKeeper,EAST_WOODS.watch);farm.weather=farm.weatherFrom='rain';result.rain=!visitEastPheasants(forestKeeper)&&farm.eastWoods.keeperVisits===0;
  farm.weather=farm.weatherFrom='sunny';farm.day=10;forestKeeper.day=10;result.festival=!visitEastPheasants(forestKeeper);updateForestKeeper(.05);result.festival&&=forestKeeper.festival?.day===10&&['out','gather'].includes(forestKeeper.festival.stage)&&farm.eastWoods.keeperVisits===0;
  setup();forestKeeper.mode='watching';result.distant=!visitEastPheasants(forestKeeper);Object.assign(forestKeeper,EAST_WOODS.watch);for(const b of farm.eastWoods.birds){b.mode='walk';b.goal='home';}result.returning=!visitEastPheasants(forestKeeper);
  forestKeeper.wait=4;updateForestKeeper(.05);const b=farm.eastWoods.birds[1];Object.assign(b,EAST_WOODS.spots[4],{mode:'forage',goal:'grass'});updateForestKeeper(.05);result.lateEncounter=farm.eastWoods.keeperVisits===1&&forestKeeper.mode==='watching'&&forestKeeper.wait>3&&distance(forestKeeper,EAST_WOODS.watch)===0;
  setup();const old=JSON.parse(farmExportText());delete old.state.eastWoods.keeperVisits;delete old.state.eastWoods.keeperVisitDay;const loaded=importFarmText(JSON.stringify(old));result.legacy=loaded.state.eastWoods.keeperVisits===0&&loaded.state.eastWoods.keeperVisitDay===0&&JSON.stringify(loaded.runtime)===JSON.stringify(captureRuntimeState());
  result.reject=true;for(const change of [s=>s.eastWoods.keeperVisits=-1,s=>s.eastWoods.keeperVisitDay=12,s=>s.eastWoods.keeperVisits=NaN,s=>s.eastWoods.keeperVisitDay=2,s=>s.eastWoods.keeperVisits=1]){const archive=JSON.parse(farmExportText());change(archive.state);try{importFarmText(JSON.stringify(archive));result.reject=false;}catch(_){}}
  return result;
 }finally{replaceFarmState(original,runtime);updateUI();}
 })()`);
 for(const [key,value]of Object.entries(result))assert.ok(value,'East keeper '+key+': '+JSON.stringify(result));
 console.log('East keeper passed: original real patrol/return, safe roots/river/steps, halfway/full restore, nearby original birds, one daily greeting, pause/festival/rain, original depth/UI and legacy validation.');
};
