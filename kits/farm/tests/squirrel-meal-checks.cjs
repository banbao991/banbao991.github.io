module.exports=function checkSquirrelMeal(run,assert){
 const result=run(`(() => {
  const original=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
  function setup(day){farm=newFarm();farm.day=day;farm.forageSpawnDay=day;farm.phase=.2;farm.paused=false;farm.weather=farm.weatherFrom='sunny';resetWildlife();
   farm.forage=[{id:'meal',kind:'berry',x:1070,y:428},{id:'other',kind:'berry',x:1190,y:550},{id:'mushroom',kind:'mushroom',x:1090,y:450}];
   Object.assign(squirrel,{x:1058,y:420,tx:1058,ty:420,moving:false,wait:1});}
  function archive(){const before=JSON.stringify({m:farm.town.squirrelMeal,s:squirrel,forage:farm.forage});
   const saved=importFarmText(farmExportText());replaceFarmState(saved.state,saved.runtime);
   return before===JSON.stringify({m:farm.town.squirrelMeal,s:squirrel,forage:farm.forage});}
  try{
   const good=Array.from({length:24},(_,i)=>i+1).find(d=>hash(d,1141)<.65),bad=Array.from({length:24},(_,i)=>i+1).find(d=>hash(d,1141)>=.65);
   setup(good);const initial={coins:farm.coins,berries:farm.berries,trust:farm.squirrelTrust,total:farm.forageTotal,stock:depotCount('forest')};
   updateWildlife(.05);const m=farm.town.squirrelMeal;
   result.arrived=m.eaten&&m.wait===2.8&&m.total===1&&!squirrel.moving&&!farm.forage.some(s=>s.id==='meal');
   result.facing=squirrel.dir===1;
   result.otherFood=farm.forage.length===2&&farm.forage.some(s=>s.id==='mushroom');
   result.noHarvest=JSON.stringify(initial)===JSON.stringify({coins:farm.coins,berries:farm.berries,trust:farm.squirrelTrust,total:farm.forageTotal,stock:depotCount('forest')});
   updateWildlife(.5);result.partial=archive();const frozen=JSON.stringify(captureRuntimeState()),plan=JSON.stringify(farm.town.squirrelMeal);farm.paused=true;
   updateWildlife(2);drawSquirrel();result.pause=frozen===JSON.stringify(captureRuntimeState())&&plan===JSON.stringify(farm.town.squirrelMeal);farm.paused=false;
   result.depth=farmSceneItems().find(s=>s.id==='squirrel').y===squirrel.y+13;
   result.hint=describe(squirrel.x,squirrel.y)?.text.includes('抱着野莓');
   for(let i=0;i<60;i++)updateWildlife(.05);
   result.finished=!squirrelEating()&&farm.town.squirrelMeal.berry===null&&farm.town.squirrelMeal.total===1;
   Object.assign(squirrel,{x:1178,y:542,moving:false,wait:1});updateWildlife(.05);
   result.once=farm.town.squirrelMeal.total===1&&farm.forage.some(s=>s.id==='other');
   farm.ledgerExpanded=true;updateLedgerUI();result.ledger=$('ledger-squirrel-meals').textContent==='1 簇';
   setup(bad);updateWildlife(.05);result.failure=farm.town.squirrelMeal.decided&&!farm.town.squirrelMeal.eaten&&farm.forage.length===3;
   result.failureSave=archive();for(let i=0;i<30;i++)updateWildlife(.01);result.failure&&=farm.town.squirrelMeal.total===0;
   setup(good);squirrel.x=1000;squirrel.moving=true;updateWildlife(.05);result.noRemote=!farm.town.squirrelMeal.decided&&farm.forage.length===3;
   setup(good);collectForage(farm.forage[0]);updateWildlife(.05);result.playerFirst=!farm.town.squirrelMeal.decided&&farm.town.squirrelMeal.total===0;
   setup(good);updateWildlife(.05);farm.weather=farm.weatherFrom='rain';updateWildlife(.05);result.rain=!squirrelEating()&&farm.town.squirrelMeal.total===1&&squirrel.tx===1126;
   setup(good);updateWildlife(.05);farm.weather=farm.weatherFrom='snow';updateWildlife(.05);result.snow=!squirrelEating()&&squirrel.tx===1126;
   setup(good);updateWildlife(.05);farm.phase=.6;updateWildlife(.05);result.night=!squirrelEating()&&squirrel.tx===1126;
   setup(28);updateWildlife(.05);result.winter=!farm.town.squirrelMeal.decided;
   setup(10);updateWildlife(.05);result.festival=farm.town.squirrelMeal.decided; // Wild animals keep their own lives on holidays.
   setup(good);updateWildlife(.05);farm.berries=2;feedSquirrel();result.playerFeed=!squirrelEating()&&farm.berries===1&&farm.squirrelTrust===1&&farm.town.squirrelMeal.total===1;
   setup(good);updateWildlife(.05);farm.day++;updateWildlife(.05);result.newDay=farm.town.squirrelMeal.day===farm.day&&farm.town.squirrelMeal.total===1&&!farm.town.squirrelMeal.eaten;
   delete farm.town.squirrelMeal;const legacy=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});result.defaults=JSON.stringify(legacy.town.squirrelMeal)===JSON.stringify(makeSquirrelMeal());
   farm.town.squirrelMeal={...makeSquirrelMeal(),wait:2};result.invalid=false;try{importFarmText(farmExportText());}catch{result.invalid=true;}
   return result;
  }finally{replaceFarmState(original,runtime);}
 })()`);
 for(const [name,pass]of Object.entries(result))assert.equal(pass,true,'squirrel meal '+name);
 console.log('Squirrel meal passed: actual berry arrival/removal, other food, no harvest or cost, one daily result, pause, full save, player priority, weather/night/winter, holiday life, depth, hints and ledger.');
};
