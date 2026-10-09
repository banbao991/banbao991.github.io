module.exports=function checkCatCompany(run,assert){
 const result=run(`(() => {
  const original=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
  function setup(){
   farm=newFarm();farm.day=11;farm.phase=.2;farm.paused=false;farm.weather=farm.weatherFrom='sunny';farm.town.seed=1;
   resetPlazaLife();
   for(const [i,cat] of plazaCats.entries())Object.assign(cat,{x:752+i*56,y:872,tx:752+i*56,ty:872,mode:'groom',wait:5});
  }
  const frame=(dt=.05)=>{now+=dt;motionNow+=dt;updatePlazaLife(dt);};
  function restored(){const before=JSON.stringify({plan:farm.town.catCompany,cats:plazaCats});
   const loaded=importFarmText(farmExportText());replaceFarmState(loaded.state,loaded.runtime);
   return JSON.stringify({plan:farm.town.catCompany,cats:plazaCats})===before;}
  try{
   setup();frame();result.approach=plazaCatCompanyActive()&&plazaCats.every(cat=>cat.mode==='company'&&cat.path.length);
   result.actualSeats=plazaCatCompanyTargets().every((p,i)=>distance(p,{x:plazaCats[i].tx,y:plazaCats[i].ty})<.01)
    &&distance(...plazaCatCompanyTargets())===56;
   for(let i=0;i<10;i++)frame();result.partialSave=restored();
   const frozen=JSON.stringify({plan:farm.town.catCompany,cats:plazaCats}),seed=farm.town.seed;
   farm.paused=true;updatePlazaLife(5);drawPlazaCat(plazaCats[0]);updateWorldStatusUI();
   result.pause=JSON.stringify({plan:farm.town.catCompany,cats:plazaCats})===frozen&&farm.town.seed===seed;farm.paused=false;
   let waited=false,groomed=false,napped=false,clear=true;
   for(let i=0;i<500&&plazaCatCompanyActive();i++){
    frame();const p=farm.town.catCompany;
    waited ||=p.stage==='out'&&plazaCats.some(cat=>!cat.path.length)&&plazaCats.some(cat=>cat.path.length);
    groomed ||=p.stage==='groom'&&plazaCats.every(cat=>!cat.path.length)&&plazaCats.map(plazaCatCompanyPose).includes('groom');
    napped ||=p.stage==='nap'&&plazaCats.every(cat=>plazaCatCompanyPose(cat)==='sleep');
    clear &&=plazaCats.every(plazaPetWalkable)&&distance(...plazaCats)>=32;
    if(i%40===0)result.partialSave &&=restored();
   }
   result.sequence=waited&&groomed&&napped&&farm.town.catCompany.sessions===1;
   result.clear=clear;farm.ledgerExpanded=true;updateLedgerUI();result.ledger=$('ledger-plaza-company').textContent==='1 回';
   result.free=farm.coins===120&&farm.town.spentTotal===0&&farm.town.inventory.petToy===0;
   const settled=JSON.stringify(farm.town.catCompany),afterSeed=farm.town.seed;
   for(let i=0;i<400;i++)frame();result.once=JSON.stringify(farm.town.catCompany)===settled&&farm.town.seed===afterSeed;
   setup();frame();const greeted=JSON.stringify(farm.town.catCompany),route=JSON.stringify(plazaCats[0].path);
   greetPlazaCat(plazaCats[0]);result.pet=JSON.stringify(farm.town.catCompany)===greeted&&JSON.stringify(plazaCats[0].path)===route
    &&plazaCats[0].mode==='company'&&plazaCats[0].purr===2.5&&plazaCatHint(plazaCats[0]).includes('作伴');
   const items=farmSceneItems();result.depth=plazaCats.every(cat=>items.find(item=>item.id==='plaza-cat:'+cat.name).y===cat.y+9)
    &&!items.some(item=>item.id.includes('company'));
   result.viewer=$('plaza-life-status').textContent.includes('相约');
   setup();frame();farm.weather=farm.weatherFrom='rain';frame();result.rain=farm.town.catCompany.stage==='done'
    &&farm.town.catCompany.sessions===0&&plazaCats.every(cat=>cat.mode==='return');
   for(let i=0;i<200&&plazaCats.some(cat=>cat.mode!=='home');i++)frame();result.rain&&=plazaCats.every(cat=>cat.mode==='home');
   setup();frame();farm.weather=farm.weatherFrom='snow';frame();result.snow=plazaCats.every(cat=>cat.mode==='return');
   setup();farm.phase=.04;farm.weatherFrom='sunny';farm.weather='rain';
   result.weatherBlend=!plazaCatsSheltering();farm.phase=.08;result.weatherBlend&&=plazaCatsSheltering();
   setup();frame();farm.phase=.6;frame();result.night=plazaCats.every(cat=>cat.mode==='return')&&!plazaCatCompanyActive();
   setup();frame();farm.day=20;frame();result.festival=!plazaCatCompanyActive()&&farm.town.catCompany.sessions===0;
   setup();frame();const targets=plazaCatCompanyTargets();
   Object.assign(workers[0],targets[0]);frame();result.crowd=!plazaCatCompanyActive();
   // Original runtime is restored before further tests since the crowd belongs to it.
   replaceFarmState(original,runtime);setup();
   Object.assign(plazaCats[0],{x:1088,y:888,tx:1088,ty:888});Object.assign(plazaCats[1],{x:1040,y:840,tx:1040,ty:840});frame();
   result.seatAssignment=farm.town.catCompany.flipped&&plazaCatCompanyTargets()[0].x>plazaCatCompanyTargets()[1].x;
   setup();farm.town.inventory.petToy=1;townPrepareCatToys();farm.town.catPlay.choices=[false,false];frame();
   result.ballPriority=plazaCatCompanyActive()&&inviteTownCatPlay(farm.town.catPlay.balls[0])&&!plazaCatCompanyActive();
   setup();farm.town.seed=123456;frame();const choice=JSON.stringify(farm.town.catCompany),chosenSeed=farm.town.seed;
   frame();result.choice=choice===JSON.stringify(farm.town.catCompany)&&farm.town.seed===chosenSeed&&farm.town.catCompany.decided;
   setup();frame();const bad=JSON.parse(farmExportText());bad.state.town.catCompany.spot=100;
   result.invalid=false;try{importFarmText(JSON.stringify(bad));}catch{result.invalid=true;}
   delete farm.town.catCompany;const legacy=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});
   result.defaults=JSON.stringify(legacy.town.catCompany)===JSON.stringify(makePlazaCatCompany());
   return result;
  }finally{replaceFarmState(original,runtime);}
 })()`);
 for(const [name,passed] of Object.entries(result))assert.equal(passed,true,'cat company '+name);
 console.log('Cat company passed: actual paired seats, wait/groom/nap, clear routes, daily choice, pause, save/restore, weather/night/crowds/festival, ball priority, petting and parent depth.');
};
