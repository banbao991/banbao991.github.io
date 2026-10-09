module.exports=function checkBeeForager(run,assert) {
 const result=run(`(() => {
  const original=JSON.parse(JSON.stringify(farm)),runtime=captureRuntimeState(),r={};
  try {
   const prepare=()=>{
    replaceFarmState(newFarm());farm.paused=false;farm.upgrades=2;farm.weather=farm.weatherFrom='sunny';
    farm.day=Array.from({length:8},(_,i)=>i+1).find(d=>hash(d,611,2601)<.7);farm.phase=.08;
    const h=farm.valleyHerbs[0];h.pickedAt=farm.day+farm.phase-1.6;h.readyAt=h.pickedAt+2;
    return farm.beeForager;
   };
   let b=prepare(),h=farm.valleyHerbs[0],ready=h.readyAt,money=farm.coins,honey=farm.honeyTotal;
   updateBeeForager(.05);r.start=b.stage==='out'&&b.target===0&&h.readyAt===ready;
   let moving=true,noEarly=true;
   for(let i=0;i<350&&b.stage==='out';i++){
    const p={x:b.x,y:b.y};updateBeeForager(.05);moving&&=distance(b,p)<=110*.05+.001;noEarly&&=h.readyAt===ready;
   }
   r.arrival=moving&&noEarly&&b.stage==='sip'&&distance(b,beeForagerFlower(0))<.01&&b.cycles[0]===h.pickedAt;
   updateBeeForager(.6);r.gradual=h.readyAt<ready&&Math.abs(ready-h.readyAt-2*.04*.6/1.8)<.00001&&valleyHerbProgress(h)<1;
   const archive=importFarmText(farmExportText());r.half=JSON.stringify(archive.state)===JSON.stringify(farm)&&JSON.stringify(archive.runtime)===JSON.stringify(captureRuntimeState());
   replaceFarmState(archive.state,archive.runtime);b=farm.beeForager;h=farm.valleyHerbs[0];farm.paused=true;
   const frozen=JSON.stringify({state:farm,runtime:captureRuntimeState()});updateBeeForager(5);drawBeeForager();renderCompleteFarmCanvas();drawMiniMap();describe(b.x,b.y);
   r.pauseReadOnly=JSON.stringify({state:farm,runtime:captureRuntimeState()})===frozen;
   farm.paused=false;for(let i=0;i<50&&b.stage==='sip';i++)updateBeeForager(.05);
   r.complete=b.visits===1&&b.stage==='back'&&Math.abs(b.helped-.08)<.00001&&valleyHerbProgress(h)<1&&farm.coins===money&&farm.honeyTotal===honey;
   observeBeeForager();observeBeeForager();r.observation=b.observed===1&&farm.coins===money;
   const air=farmSceneItems().find(i=>i.id==='bee-forager');r.depth=air?.layer===1;
   for(let i=0;i<350&&b.stage==='back';i++)updateBeeForager(.05);
   r.return=b.stage==='idle'&&distance(b,{x:HIVE_SITES[0].x,y:HIVE_SITES[0].y-9})<.01;
   const cycle=h.pickedAt;farm.day++;updateBeeForager(.05);r.cycle=b.cycles[0]===cycle&&!beeForagerFlowerAvailable(0);
   farm.ledgerExpanded=true;updateLedgerUI();r.ledger=$('ledger-bee-forager').textContent==='1 回 / 1 回';
   b=prepare();updateBeeForager(.05);updateBeeForager(1);farm.valleyHerbs[0].pickedAt+=.1;updateBeeForager(.05);r.harvestRace=b.stage==='back'&&b.visits===0&&b.helped===0;
   b=prepare();updateBeeForager(.05);updateBeeForager(1);farm.weather=farm.weatherFrom='rain';updateBeeForager(.05);r.rain=b.stage==='back'&&b.helped===0;
   b=prepare();updateBeeForager(.05);updateBeeForager(1);farm.phase=.46;updateBeeForager(.05);r.night=b.stage==='back';
   b=prepare();farm.upgrades=1;updateBeeForager(5);r.locked=b.stage==='idle'&&!b.decided;
   b=prepare();farm.day=28;updateBeeForager(.05);r.winter=b.stage==='idle'&&!b.decided;
   b=prepare();farm.valleyHerbs[0].readyAt=farm.day;updateBeeForager(.05);r.noBloom=b.stage==='idle'&&!b.decided;
   b=prepare();farm.day=10;h=farm.valleyHerbs[0];h.pickedAt=8.48;h.readyAt=10.48;
   updateBeeForager(.05);r.festival=b.decided&&b.chosen===(hash(10,611,2601)<.7);
   b=prepare();updateBeeForager(.05);for(let i=0;i<350&&b.stage==='out';i++)updateBeeForager(.05);
   const landed=farmSceneItems().find(i=>i.id==='bee-forager');r.depth&&=landed?.layer===0&&landed.y===b.y+3;
   farm.valleyHerbs[0].readyAt=farm.day+.25;farm.phase=.22;updateBeeForager(.05);
   r.notInstant=b.stage==='sip'&&valleyHerbProgress(farm.valleyHerbs[0])<1&&b.helped===0;
   b=prepare();const old=JSON.parse(farmExportText());delete old.state.beeForager;const parsed=importFarmText(JSON.stringify(old));r.legacy=parsed.state.beeForager.stage==='idle';
   r.invalid=true;for(const bad of [null,{...b,elapsed:2},{...b,day:farm.day+1},{...b,observed:1},{...b,stage:'sip'},{...b,x:WORLD_W+1},{...b,cycles:[null]}]){
    const a=JSON.parse(farmExportText());a.state.beeForager=bad;try{importFarmText(JSON.stringify(a));r.invalid=false;}catch(_){}}
   r.reset=newFarm().beeForager.visits===0;return r;
  }finally{replaceFarmState(original,runtime);}
 })()`);
 for(const [name,ok]of Object.entries(result))assert.ok(ok,'Bee forager '+name+' '+JSON.stringify(result));
 console.log('Bee forager passed: real flower contact, gradual bounded benefit, harvest/weather races, pauses, full saves, original bee/depth, free observation and validation.');
};
