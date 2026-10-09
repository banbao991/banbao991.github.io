module.exports=function checkCatWater(run,assert){
 const result=run(`(()=>{
  const old=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
  const day=Array.from({length:6},(_,i)=>15+i).find(d=>d%10!==0&&hash(d,0,1259)<.4);
  function setup(d=day){farm=newFarm();farm.day=d;farm.phase=.2;farm.paused=false;farm.weather=farm.weatherFrom='sunny';farm.town.merchantUnlocked=true;farm.town.improvements.catComfort.level=3;resetPlazaLife();
   Object.assign(plazaCats[0],{x:816,y:648,tx:816,ty:648,mode:'groom',wait:6});
   Object.assign(plazaCats[1],{x:1040,y:648,tx:1040,ty:648,mode:'groom',wait:6});farm.town.catCompany.day=d;farm.town.catCompany.decided=true;
  }
  function equalSave(){const before=JSON.stringify({b:farm.town.catWater,c:plazaCats});const archive=importFarmText(farmExportText());replaceFarmState(archive.state,archive.runtime);return before===JSON.stringify({b:farm.town.catWater,c:plazaCats});}
  function advance(dt=.05){updatePlazaLife(dt);}
  function drink(){for(let i=0;i<250&&farm.town.catWater.stage!=='drink';i++)advance();return farm.town.catWater.stage==='drink';}
  try{
   setup();const before={x:plazaCats[0].x,y:plazaCats[0].y};advance(.1);advance(.1);result.out=farm.town.catWater.stage==='out'&&distance(before,plazaCats[0])>0&&distance(before,plazaCats[0])<=4.201;
   result.route=townCatWaterRouteClear(plazaCats[0],plazaCats[0].path,plazaCats[1]);result.tripSave=equalSave();result.arrive=drink()&&distance(plazaCats[0],TOWN_LAYOUT.catWater.stand)<.001;
   const at=JSON.stringify(plazaCats[0]);advance(.5);result.consume=farm.town.catWater.water<.75&&farm.town.catWater.drinks===0&&plazaCats[0].x===TOWN_LAYOUT.catWater.stand.x;
   result.drinkSave=equalSave();result.hint=plazaCatHint(plazaCats[0]).includes('喝水');updateWorldStatusUI();result.status=$('plaza-life-status').textContent.includes('喝水');
   const held=JSON.stringify({t:farm.town,c:plazaCats});farm.paused=true;advance(10);farmSceneItems();result.pause=held===JSON.stringify({t:farm.town,c:plazaCats});
   const water=farm.town.catWater.water;refillTownCatWater();result.manual=farm.town.catWater.water===1&&farm.town.catWater.wait===.5&&farm.coins===120;farm.paused=false;
   for(let i=0;i<60;i++)advance();result.complete=farm.town.catWater.drinks===1&&!townCatWaterActive();result.once=farm.town.catWater.decided[0];
   farm.ledgerExpanded=true;updateLedgerUI();result.ledger=$('ledger-cat-water').textContent==='1 次';
   setup();drink();const items=farmSceneItems(),b=items.find(i=>i.id==='town-cat-water'),c=items.find(i=>i.id==='plaza-cat:橘子');result.depth=b.y===TOWN_LAYOUT.catWater.water.y+5&&c.y===plazaCats[0].y+9&&b.layer===0;
   greetPlazaCat(plazaCats[0]);result.pet=farm.town.catWater.stage==='drink'&&plazaCats[0].purr>0;
   farm.weather=farm.weatherFrom='rain';advance(.1);result.rain=!townCatWaterActive()&&plazaCats[0].mode==='return'&&farm.town.catWater.drinks===0;
   setup();drink();farm.weather=farm.weatherFrom='snow';advance(.1);result.snow=!townCatWaterActive();
   setup();drink();farm.phase=.6;advance(.1);result.night=!townCatWaterActive()&&plazaCats[0].mode==='return';
   setup();drink();farm.day=20;advance(.1);result.holiday=!townCatWaterActive()&&farm.town.catWater.drinks===0;
   setup();drink();farm.town.inventory.petToy=1;const ball=townCatToyBalls()[0];inviteTownCatPlay(ball);result.play=!townCatWaterActive()&&plazaCats[0].mode==='move';
   setup();farm.town.catWater.water=0;farm.town.catWater.ready=true;advance(.1);result.dry=!townCatWaterActive();
   farm.weather=farm.weatherFrom='rain';farm.phase+=.3;advance(.1);result.rainFill=farm.town.catWater.water>0;
   const rainy=farm.town.catWater.water;farm.weather=farm.weatherFrom='sunny';farm.phase+=.2;advance(.1);result.evap=farm.town.catWater.water<rainy;
   setup();farm.town.improvements.catComfort.level=2;advance(.1);result.stageGate=!townCatWaterActive()&&!farm.town.catWater.ready;
   setup(28);advance(.1);result.winter=!townCatWaterActive();
   setup();farm.town.construction={id:'catComfort',kind:'care',level:3,progress:0,cost:68,startedAt:farm.day};advance(.1);result.work=!townCatWaterActive();
   farm.town.catWater.water=.1;const actor=farm.town.traveller;Object.assign(actor,{mode:'work',target:'work',route:townProjectRoute('catComfort'),index:0});farm.phase=.25;updateTownProjectWork(actor,30);result.care=farm.town.catWater.water===1&&farm.town.maintenanceCount===1;
   setup();farm.town.catCompany.stage='nap';farm.town.catCompany.chosen=true;farm.town.catCompany.spot=0;plazaCats.forEach(c=>c.mode='company');updateTownCatWaterPlan(.1);result.company=!townCatWaterActive();
   setup();farm.town.catWater.ready=true;farm.town.catWater.water=.75;farm.town.catWater.day=farm.day;farm.town.catWater.decided=[false,true];Object.assign(plazaCats[1],{x:878,y:612,tx:878,ty:612});updateTownCatWaterPlan(.1);result.crowd=!townCatWaterActive();
   setup();advance(.1);const other=plazaCats[1];Object.assign(other,{x:918,y:612,mode:'move',path:[{x:878,y:612}]});result.hold=townCatWaterHoldOther(other,other.path[0],.1);
   setup();const archive=JSON.parse(farmExportText());delete archive.state.town.catWater;const actorBefore=JSON.stringify(archive.runtime.plazaCats);const loaded=importFarmText(JSON.stringify(archive));replaceFarmState(loaded.state,loaded.runtime);result.legacy=JSON.stringify(plazaCats)===actorBefore&&farm.town.catWater.active===-1;
   const invalid=JSON.parse(farmExportText());invalid.state.town.catWater.water=2;result.invalid=false;try{importFarmText(JSON.stringify(invalid));}catch{result.invalid=true;}
   return result;
  }finally{replaceFarmState(old,runtime);}
 })()`);
 for(const [name,pass]of Object.entries(result))assert.equal(pass,true,'cat water '+name);
 console.log('Cat water passed: real walk/drink, continuous water/rain/care, pause/full save, daily choice, priorities, original cats, spacing, clicks, depth/hints/ledger and defaults.');
};
