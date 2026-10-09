module.exports=function checkEaves(run,assert){
 const result=run(`(() => {
  const original=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
  function setup(day=12){farm=newFarm();farm.day=day;farm.phase=.18;farm.paused=false;farm.weather=farm.weatherFrom='sunny';
   resetPlazaLife();for(const c of plazaCats)c.wait=20;for(const b of plazaSparrows)b.wait=14;
   Object.assign(plazaSparrows[0],PLAZA_PET_LAYOUT.birdSites[0],{site:0,mode:'peck',wait:4});
   villageWalker=resetVillageWalker();Object.assign(villageWalker,{x:VILLAGE_WALKER_LAYOUT.home.x-40,y:VILLAGE_WALKER_LAYOUT.promenade.y,dir:1});}
  const frame=()=>{now+=.05;motionNow+=.05;updateVillageWalker(.05);updatePlazaLife(.05);};
  function roundTrip(){const before=JSON.stringify({v:farm.town.eavesVisit,b:plazaSparrows,c:villageWalker});
   const saved=importFarmText(farmExportText());replaceFarmState(saved.state,saved.runtime);
   return JSON.stringify({v:farm.town.eavesVisit,b:plazaSparrows,c:villageWalker})===before;}
  try{
   setup();const seed=farm.town.seed;frame();const plan=farm.town.eavesVisit,bird=plazaSparrows[plan.bird];
   result.realFlight=plan.stage==='out'&&bird.mode==='fly'&&bird.x!==bird.tx&&bird.flightLength>400&&plazaSparrows.length===5;
   for(let i=0;i<25;i++)frame();result.partialSave=roundTrip();
   const frozen=JSON.stringify({v:farm.town.eavesVisit,b:plazaSparrows,c:villageWalker});farm.paused=true;
   updatePlazaLife(2);updatePlazaEavesChild(2);drawPlazaSparrow(plazaSparrows[0]);updateWorldStatusUI();
   result.pause=JSON.stringify({v:farm.town.eavesVisit,b:plazaSparrows,c:villageWalker})===frozen;farm.paused=false;
   for(let i=0;i<400&&farm.town.eavesVisit.stage!=='perch';i++)frame();
   const v=farm.town.eavesVisit,point=PLAZA_EAVES_SITES[v.site];
   result.landing=v.stage==='perch'&&distance(plazaSparrows[v.bird],point)<.01&&plazaSparrows[v.bird].lift===0;
   for(let i=0;i<90&&!v.greeted;i++)frame();
   result.actualEncounter=v.greeted&&v.encounters===1&&v.childWait>0&&plazaEavesChildActivity()?.includes('麻雀');
   result.contact=Math.abs(villageWalker.x-plazaSparrows[v.bird].x)<=54&&Math.abs(villageWalker.y-VILLAGE_WALKER_LAYOUT.promenade.y)<2;
   const position=JSON.stringify(villageWalker);for(let i=0;i<10;i++)frame();
   result.still=JSON.stringify(villageWalker)===position&&v.childWait>0;result.encounterSave=roundTrip();
   const items=sortSceneItems(farmSceneItems()),home=MARKET_LAYOUT.homes[1];
   result.depth=items.find(i=>i.id==='plaza-sparrow:'+farm.town.eavesVisit.bird).y===home.y+117
    &&items.findIndex(i=>i.id==='plaza-sparrow:'+farm.town.eavesVisit.bird)>items.findIndex(i=>i.id==='village-home:'+home.x);
   result.hit=plazaSparrowAt(point.x,point.y-6)===plazaSparrows[farm.town.eavesVisit.bird]
    &&plazaSparrowHint(plazaSparrows[farm.town.eavesVisit.bird]).includes('屋檐');
   result.reserved=PLAZA_EAVES_SITES.every((p,i)=>!sparrowSiteAvailable(plazaSparrows[1],PLAZA_EAVES_SITE_START+i));
   for(let i=0;i<500&&plazaEavesVisitActive();i++)frame();
   result.return=farm.town.eavesVisit.stage==='done'&&farm.town.eavesVisit.encounters===1
    &&farm.town.eavesVisit.childWait===0&&!plazaEavesChildWaiting();
   result.free=farm.coins===120&&farm.town.spentTotal===0;
   farm.ledgerExpanded=true;updateLedgerUI();result.ledger=$('ledger-plaza-eaves').textContent==='1 次';
   const choice=JSON.stringify(farm.town.eavesVisit);for(let i=0;i<100;i++)frame();
   result.once=JSON.stringify(farm.town.eavesVisit)===choice;
   setup(11);frame();result.savedFailure=farm.town.eavesVisit.decided&&!farm.town.eavesVisit.chosen;
   const failed=JSON.stringify(farm.town.eavesVisit);for(let i=0;i<100;i++)frame();result.savedFailure&&=JSON.stringify(farm.town.eavesVisit)===failed;
   setup();farm.town.childVisit={day:12,stage:'out',route:[{x:1800,y:812}],index:0,wait:0};updatePlazaLife(.05);
   result.teaPriority=!farm.town.eavesVisit.decided;
   setup();farm.town.donkeyVisit={...makeTownDonkeyVisit(),day:12,chosen:true,stage:'home'};updatePlazaLife(.05);
   result.donkeyPriority=!farm.town.eavesVisit.decided;
   setup(28);frame();result.winter=!farm.town.eavesVisit.decided;
   setup();frame();farm.weather=farm.weatherFrom='rain';frame();result.rain=farm.town.eavesVisit.stage==='back'&&farm.town.eavesVisit.encounters===0;
   for(let i=0;i<300&&plazaEavesVisitActive();i++)frame();result.rain&&=farm.town.eavesVisit.stage==='done';
   setup();frame();farm.phase=.6;frame();result.night=farm.town.eavesVisit.stage==='back';
   setup();frame();farm.day=20;frame();result.festival=farm.town.eavesVisit.stage==='back'&&!plazaEavesChildWaiting();
   setup();frame();greetPlazaSparrow(plazaSparrows[0]);result.click=farm.town.eavesVisit.stage==='back';
   setup();frame();const invalid=JSON.parse(farmExportText());invalid.state.town.eavesVisit.site=3;
   result.invalid=false;try{importFarmText(JSON.stringify(invalid));}catch{result.invalid=true;}
   delete farm.town.eavesVisit;const legacy=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});
   result.defaults=JSON.stringify(legacy.town.eavesVisit)===JSON.stringify(makePlazaEavesVisit());
   return result;
  }finally{replaceFarmState(original,runtime);}
 })()`);
 for(const [name,pass]of Object.entries(result))assert.equal(pass,true,'eaves visit '+name);
 console.log('Eaves visit passed: actual existing bird flight/landing/return, child road encounter, pause, full save, one daily choice, free, roof depth/hits, weather/winter/night/festival, tea/donkey priorities and defaults.');
};
