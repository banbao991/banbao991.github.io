module.exports=function checkTownBirdMeal(run,assert){
 const result=run(`(()=>{
 const original=farm,runtime=captureRuntimeState(),result={};
 function setup(day=11){farm=newFarm();farm.day=day;farm.phase=.2;farm.weather=farm.weatherFrom='sunny';farm.town=makeTownState(day);farm.town.merchantUnlocked=true;farm.town.seed=1;farm.town.inventory.birdFeed=1;spawnForageForDay();spawnFishForDay();ensureValleyHerbs();}
 function state(){const r=captureRuntimeState();delete r.now;return JSON.stringify({farm,r});}
 function saved(){const before=state(),loaded=importFarmText(farmExportText());replaceFarmState(loaded.state,loaded.runtime);return state()===before;}
 function reach(){for(let i=0;i<100&&farm.town.birds[0]?.mode!=='perch';i++)updateTownEcology(.05);return farm.town.birds[0];}
 try{
  setup();const coins=farm.coins;updateTownEcology(.05);let bird=farm.town.birds[0];
  result.noRemote=bird.mode==='arrive'&&farm.town.inventory.birdFeed===1&&farm.town.birdMeals.taken===0&&saved();
  bird=reach();result.arrival=bird.mode==='perch'&&distance(bird,townBirdPerch(bird))===0&&farm.town.inventory.birdFeed===0&&farm.town.birdMeals.taken===1&&bird.meal.elapsed===0;
  const seed=farm.town.seed;updateTownEcology(.6);result.partial=saved();bird=farm.town.birds[0];
  result.progress=Math.abs(bird.meal.elapsed-.6)<1e-8&&townDescribe(bird.x,bird.y).text.includes('啄谷粒');
  farm.paused=true;const frozen=state(),head=townBirdMealHeadBob(bird);tick(last+65);renderCompleteFarmCanvas();result.pause=state()===frozen&&townBirdMealHeadBob(bird)!==head;farm.paused=false;
  centerCamera(TOWN_LAYOUT.feeding.x,TOWN_LAYOUT.feeding.y);const items=farmSceneItems();result.depth=items.filter(i=>i.id==='town-bird:0').length===1&&items.find(i=>i.id==='town-bird:0').y===TOWN_LAYOUT.feeding.y+6&&items.find(i=>i.id==='traveller-bird-tray').y===TOWN_LAYOUT.feeding.y+5;
  updateTownUI();farm.ledgerExpanded=true;updateLedgerUI();result.ui=$('town-bird-meal-status').textContent.includes('啄谷粒')&&$('ledger-town-bird-meals').textContent==='1 / 0 份';
  for(let i=0;i<40;i++)updateTownEcology(.1);result.finish=farm.town.birdMeals.finished===1&&farm.town.birdMeals.taken===1&&farm.town.inventory.birdFeed===0&&farm.town.birds[0].meal.done&&farm.coins===coins&&farm.town.seed===seed&&saved();
  result.rest=townBirdMealActivity(farm.town.birds[0]).includes('整理羽毛');
  handleTownClick(bird.x,bird.y);handleTownClick(bird.x,bird.y);result.observe=farm.town.observations.sparrow===1&&farm.town.birdMeals.taken===1;
  setup();updateTownEcology(.05);farm.weather=farm.weatherFrom='rain';updateTownEcology(.05);for(let i=0;i<100;i++)updateTownEcology(.05);result.flightRain=farm.town.birds.length===0&&farm.town.inventory.birdFeed===1&&farm.town.birdMeals.taken===0&&saved();
  farm.weather=farm.weatherFrom='sunny';updateTownEcology(10);result.noRetry=farm.town.birds.length===0&&farm.town.inventory.birdFeed===1;
  setup();updateTownEcology(.05);reach();updateTownEcology(.6);farm.weather=farm.weatherFrom='rain';updateTownEcology(.05);result.mealRain=farm.town.birds[0].mode==='leave'&&farm.town.birdMeals.taken===1&&farm.town.birdMeals.finished===0&&farm.town.inventory.birdFeed===0&&saved();
  setup();farm.phase=.07;farm.weatherFrom='rain';farm.weather='sunny';updateTownEcology(.05);result.continuous=farm.town.birds.length===0&&farm.town.ecologyDay===0;farm.phase=.12;updateTownEcology(.05);result.continuous&&=farm.town.birds.length===1&&farm.town.inventory.birdFeed===1;
  setup(25);updateTownEcology(.05);bird=reach();result.robin=bird.variant===2&&farm.town.birdMeals.taken===1;for(let i=0;i<30;i++)updateTownEcology(.1);result.robin&&=farm.town.birdMeals.finished===1;
  setup(20);updateTownEcology(.05);reach();for(let i=0;i<30;i++)updateTownEcology(.1);result.festival=farm.town.birdMeals.finished===1;
  setup();farm.town.inventory.birdNest=1;const king=makeTownBird(1);Object.assign(king,townBirdPerch(king),{mode:'perch',target:townBirdPerch(king)});farm.town.birds=[king];farm.town.ecologyDay=farm.day;updateTownEcology(.1);result.king=king.meal===null&&farm.town.inventory.birdFeed===1&&farm.town.birdMeals.taken===0&&saved();
  setup();updateTownEcology(.05);const legacy=JSON.parse(farmExportText());delete legacy.state.town.birdMeals;delete legacy.state.town.birds[0].meal;const position={x:legacy.state.town.birds[0].x,y:legacy.state.town.birds[0].y};const old=importFarmText(JSON.stringify(legacy));replaceFarmState(old.state,old.runtime);reach();updateTownEcology(5);result.legacy=farm.town.inventory.birdFeed===1&&farm.town.birdMeals.taken===0&&old.state.town.birds[0].meal.day===0&&position.x!==farm.town.birds[0].x;
  result.reject=true;for(const change of [s=>s.birdMeals.finished=2,s=>s.birdMeals.lastDay=farm.day+1,s=>s.birds[0].meal.elapsed=-1,s=>s.birds[0].meal.done='yes',s=>s.birds[0].meal.taken=false]){const data=JSON.parse(farmExportText());change(data.state.town);try{importFarmText(JSON.stringify(data));result.reject=false;}catch(_){}}
  return result;
 }finally{replaceFarmState(original,runtime);updateUI();}
 })()`);
 for(const [key,value]of Object.entries(result))assert.ok(value,'Bird tray meal '+key+': '+JSON.stringify(result));
 console.log('Bird tray meals passed: real landing before grain, saved pecking and rest, pause, weather flight/cancellation, daily limit, robin/kingfisher, original depth/UI, no extra fee, legacy and validation.');
};
