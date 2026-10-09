module.exports=function checkEastExpansion(run,assert){
 const result=run(`(()=>{
 const original=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
 function setup(){farm=newFarm();farm.day=11;farm.phase=.12;farm.coins=600000;farm.weather=farm.weatherFrom='sunny';ensureValleyHerbs();spawnForageForDay();spawnFishForDay();farm.town.merchantUnlocked=true;Object.assign(farm.town.traveller,TOWN_LAYOUT.counter,{mode:'shop'});}
 function world(){const r=captureRuntimeState();delete r.now;return JSON.stringify({farm,r});}
 function saved(){const before=world(),loaded=importFarmText(farmExportText());replaceFarmState(loaded.state,loaded.runtime);return before===world();}
 try{
  setup();const money=farm.coins,seed=farm.town.seed;for(let i=0;i<500;i++){const before=farm.eastWoods.birds.map(b=>({x:b.x,y:b.y}));updateEastWoods(.05);if(farm.eastWoods.birds.some((b,id)=>!eastWoodsClear(b,b)||distance(b,before[id])>.951))throw Error('unsafe east walk');}
  result.walk=farm.eastWoods.birds.some(b=>b.mode!=='home')&&farm.coins===money&&farm.town.seed===seed&&saved();
  farm.paused=true;const before=world();tick(last+65);renderCompleteFarmCanvas();result.pause=before===world();farm.paused=false;
  const bird=farm.eastWoods.birds.find(b=>b.mode!=='home');result.hint=describe(bird.x,bird.y-5).target===bird&&describe(bird.x,bird.y-5).text.includes('山雉');greetEastPheasant(bird);greetEastPheasant(bird);result.observation=farm.eastWoods.observations===1&&farm.coins===money&&saved();
  const activeId=bird.id;const items=farmSceneItems();result.depth=items.filter(i=>i.id==='east-pheasant:'+activeId).length===1&&items.find(i=>i.id==='east-pheasant:'+activeId).y===bird.y+12;
  farm.weather=farm.weatherFrom='rain';for(let i=0;i<1800;i++)updateEastWoods(.05);result.rain=farm.eastWoods.birds.every((b,id)=>b.mode==='home'&&distance(b,EAST_WOODS.homes[id])===0)&&saved();
  setup();farm.day=20;for(let i=0;i<200;i++)updateEastWoods(.05);result.festival=farm.eastWoods.birds.some(b=>b.mode!=='home');farm.phase=.65;for(let i=0;i<1800;i++)updateEastWoods(.05);result.night=farm.eastWoods.birds.every(b=>b.mode==='home');
  setup();const empty=farmSceneItems();result.emptyShelf=!empty.some(i=>i.id==='town-curio-cabinet:1');result.payment=true;
  const newShelf=TOWN_LAYOUT.showcases[1];for(const slot of newShelf.slots){const good=TOWN_GOODS[slot.id];farm.town.traveller.offers=[{id:slot.id,price:good.price,sold:false}];const oldCoins=farm.coins;result.payment&&=townBuy(slot.id)&&farm.coins===oldCoins-good.price&&!townBuy(slot.id)&&townDescribe(slot.x,slot.y-8).text.includes(good.description);}
  const shelf=farmSceneItems().find(i=>i.id==='town-curio-cabinet:1');result.shelfDepth=newShelf.top===TOWN_LAYOUT.showcase.top&&newShelf.bottom===TOWN_LAYOUT.showcase.bottom&&shelf.y===newShelf.bottom&&(shelf.layer||0)===0&&saved();
  result.space=true;for(const shelf of TOWN_LAYOUT.showcases)for(let x=shelf.left-3;x<=shelf.right+3;x+=5)for(let y=shelf.top;y<=shelf.bottom;y+=5)result.space&&=!townRoadAt(x,y,shelf===TOWN_LAYOUT.showcase?0:32)&&!riverAt(x,y);
  for(const b of EAST_GARDEN_EXTENSION.beds)result.space&&=!townRoadAt(b.x,b.y,32)&&b.y+8<TOWN_LAYOUT.donkeyInn.stable.top&&b.y-25>TOWN_LAYOUT.gardenHabitat.bottom;
  result.space&&=EAST_PICNIC.bench.x-31-2408>=32&&EAST_WOODS.trees.every(t=>t.y+22<640&&t.x-43>RIDGE_OWL_PERCHES[3].x+40);
  const ridgeItems=farmSceneItems().filter(i=>i.id.startsWith('town-mine-boundary:'));result.ridge=ridgeItems.length===9&&!ridgeItems.some(i=>i.id==='town-mine-boundary:0'||i.id==='town-mine-boundary:1')&&landmarkAt(2084,1330)!=='mine-ridge'&&landmarkAt(2084,1540)==='mine-ridge';
  const project=farm.town.improvements.travellerGarden;Object.assign(project,{level:3,builtAt:8,stages:[8,8,8]});const grown=farmSceneItems();result.garden=grown.filter(i=>i.id.startsWith('east-garden:')).length===4&&grown.some(i=>i.id==='east-garden-bench')&&saved();
  updateTownUI();farm.ledgerExpanded=true;updateLedgerUI();result.ui=$('town-curio-summary').textContent.includes('3/6')&&$('east-woods-status').textContent.includes('山雉')&&$('ledger-east-pheasants').textContent==='0 次';
  const old=JSON.parse(farmExportText());delete old.state.eastWoods;for(const id of ['pressedLeaves','pheasantClay','seedJar'])delete old.state.town.inventory[id];const loaded=importFarmText(JSON.stringify(old));result.legacy=loaded.state.eastWoods.birds.every(b=>b.mode==='home')&&loaded.state.town.inventory.pressedLeaves===0&&JSON.stringify(loaded.runtime)===JSON.stringify(captureRuntimeState());
  result.reject=true;for(const change of [s=>s.eastWoods.birds[0].x=0,s=>s.eastWoods.birds[0].index=200,s=>s.eastWoods.birds[0].route=[{x:0,y:0}],s=>s.eastWoods.birds[0].chosen='yes',s=>s.eastWoods.observations=-1,s=>s.town.inventory.seedJar=2]){const data=JSON.parse(farmExportText());change(data.state);try{importFarmText(JSON.stringify(data));result.reject=false;}catch(_){}}
  return result;
 }finally{replaceFarmState(original,runtime);updateUI();}
 })()`);
 for(const [key,value]of Object.entries(result))assert.ok(value,'East expansion '+key+': '+JSON.stringify(result));
 console.log('East expansion passed: original mine boundary removal, real safe pheasant routes/home/pause/save, observations, full garden spacing, paid permanent collectibles/hidden empty shelf, original depths/UI and defaults/validation.');
};
