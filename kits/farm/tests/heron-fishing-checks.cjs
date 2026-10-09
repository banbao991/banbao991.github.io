module.exports=function checkHeronFishing(run,assert){
 const result=run(`(()=>{
 const old=farm,rt=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
 const oldSet=localStorage.setItem;let cached=null;localStorage.setItem=(key,value)=>{cached=value;oldSet.call(localStorage,key,value);};
 const day=Array.from({length:7},(_,i)=>i+2).find(d=>hash(d,1217)<.68);
 function setup(d=day){farm=newFarm();farm.day=d;farm.phase=.14;farm.weather=farm.weatherFrom='sunny';ensureValleyHerbs();spawnForageForDay();spawnFishForDay();resetValleyLife();Object.assign(valleyShoal,{x:230,y:1210,tx:230,ty:1210,scatter:0});Object.assign(valleyOtter,{x:145,y:1195,tx:145,ty:1195});Object.assign(valleyTurtle,{x:155,y:1260,tx:155,ty:1260});}
 function full(){return JSON.stringify({farm,runtime:captureRuntimeState()});}
 function sameSave(){const before=full(),saved=importFarmText(farmExportText());replaceFarmState(saved.state,saved.runtime);return full()===before;}
 function until(stage){for(let i=0;i<700&&valleyHeron.fishing.stage!==stage;i++)updateHeronFishing(.05);return valleyHeron.fishing.stage===stage;}
 try{
  setup();const h=valleyHeron,origin={x:h.x,y:h.y};updateHeronFishing(.1);result.actual=h.fishing.stage==='approach'&&distance(origin,h)>.001&&distance(origin,h)<=.901;
  result.corridor=true;for(let i=0;i<160&&h.fishing.stage==='approach';i++){const pos={x:h.x,y:h.y};updateHeronFishing(.05);result.corridor&&=valleyLakeAt(h.x,h.y)&&distance(pos,h)<=.451;}
  result.arrival=h.fishing.stage==='watch'&&distance(h,h.fishing.spot)<.001;
  result.walkSave=sameSave();result.wait=until('dip')&&valleyHeron.fishing.total===0;
  updateHeronFishing(.25);result.bend=valleyHeron.fishing.bend>.49&&valleyHeron.fishing.bend<.51&&sameSave();
  farm.paused=true;const snapshot=()=>{const runtime=captureRuntimeState();delete runtime.now;return JSON.stringify({farm,runtime});},before=snapshot();tick(last+65);renderCompleteFarmCanvas();result.pause=snapshot()===before;farm.paused=false;
  const rippleCount=valleyRipples.length;updateHeronFishing(.25);result.contact=valleyHeron.fishing.total===1&&valleyShoal.scatter===2.4&&valleyRipples.length===rippleCount+1&&distance(heronBeakPoint(),valleyShoal)<30;
  farm.paused=true;const fullDip=snapshot(),pose=heronFishingHeadPose();tick(last+65);result.pauseAtDip=snapshot()===fullDip&&heronFishingHeadPose().y!==pose.y;farm.paused=false;
  result.partial=sameSave();const count=valleyHeron.fishing.total;updateHeronFishing(.1);result.once=valleyHeron.fishing.total===count;
  centerCamera(VALLEY_LAKE_CENTER.x,VALLEY_LAKE_CENTER.y);const items=farmSceneItems();result.depth=items.filter(i=>i.id==='valley-heron').length===1&&items.find(i=>i.id==='valley-heron').y===valleyHeron.y+11;
  const point=heronBeakPoint();result.hit=valleyCreatureAt(point.x,point.y)?.kind==='heron'&&valleyCreatureHint({kind:'heron'}).includes('试探');
  updateWorldStatusUI();result.status=$('valley-life-status').textContent.includes('试探');farm.ledgerExpanded=true;updateLedgerUI();result.ledger=$('ledger-heron-dips').textContent==='1 回';
  result.return=until('idle')&&distance(valleyHeron,VALLEY_HERON_FISHING.home)<.001&&valleyHeron.fishing.total===1&&valleyHeron.fishing.done;
  for(let i=0;i<500;i++)updateHeronFishing(.05);result.once&&=valleyHeron.fishing.total===1;
  setup();updateHeronFishing(.05);until('watch');valleyShoal.x=180;valleyShoal.tx=180;result.noGhost=until('idle')&&valleyHeron.fishing.total===0;
  setup();updateHeronFishing(.05);until('dip');updateHeronFishing(.25);farm.weather=farm.weatherFrom='rain';const rainPos={x:valleyHeron.x,y:valleyHeron.y},bend=valleyHeron.fishing.bend;updateHeronFishing(.05);
  result.weather=valleyHeron.fishing.stage==='return'&&valleyHeron.fishing.bend<bend&&valleyHeron.fishing.bend>0&&distance(rainPos,valleyHeron)===0&&sameSave();result.weather&&=until('idle')&&valleyHeron.fishing.total===0;
  setup();updateHeronFishing(.05);until('watch');farm.phase=.6;result.night=until('idle')&&valleyHeron.fishing.total===0;
  setup();updateHeronFishing(.05);until('watch');farm.weather=farm.weatherFrom='snow';result.snow=until('idle')&&valleyHeron.fishing.total===0;
  setup();updateHeronFishing(.05);until('watch');scatterValleyShoal();result.playerFish=until('idle')&&valleyHeron.fishing.total===0;
  setup();updateHeronFishing(.05);until('dip');interactValleyCreature({kind:'heron'});result.click=valleyHeron.fishing.stage==='idle'&&valleyHeron.fishing.done&&valleyHeron.flap===2&&valleyHeron.tx===300;result.clickCached=JSON.stringify(JSON.parse(cached).runtime)===JSON.stringify(captureRuntimeState());
  setup();updateHeronFishing(.05);until('watch');valleyOtter.x=valleyHeron.x+10;valleyOtter.y=valleyHeron.y;result.otter=until('idle')&&valleyHeron.fishing.total===0;
  setup(28);updateHeronFishing(.1);result.winter=!valleyHeron.fishing.decided&&valleyHeron.fishing.stage==='idle';
  setup(Array.from({length:7},(_,i)=>i+2).find(d=>hash(d,1217)>=.68));updateHeronFishing(.1);result.failed=valleyHeron.fishing.decided&&!valleyHeron.fishing.chosen&&sameSave();
  const money=farm.coins,fish=JSON.stringify(farm.fishSpots);for(let i=0;i<100;i++)updateHeronFishing(.1);result.free=farm.coins===money&&farm.fishTotal===0&&JSON.stringify(farm.fishSpots)===fish;
  const legacy=JSON.parse(farmExportText());delete legacy.runtime.valleyHeron.fishing;const legacyPos=JSON.stringify(legacy.runtime.valleyHeron),loaded=importFarmText(JSON.stringify(legacy));replaceFarmState(loaded.state,loaded.runtime);result.legacy=JSON.stringify(valleyHeron)===legacyPos;updateHeronFishing(.1);result.legacy&&=!!valleyHeron.fishing;
  result.reject=true;for(const change of [p=>p.bend=2,p=>p.wait=7,p=>p.stage='fly',p=>p.total=-1,p=>p.decided='yes',p=>p.spot={x:999,y:999}]){const archive=JSON.parse(farmExportText());change(archive.runtime.valleyHeron.fishing);try{importFarmText(JSON.stringify(archive));result.reject=false;}catch(_){}}
  return result;
 }finally{localStorage.setItem=oldSet;replaceFarmState(old,rt);}
 })()`);
 for(const [key,value]of Object.entries(result))assert.ok(value,'Heron fishing '+key+': '+JSON.stringify(result));
 console.log('Heron fishing passed: actual shallow-water path/contact, existing fish scatter, one daily attempt, continuous neck/return, full save, pause, player/otter/weather priorities, original depths/hit/status and defaults.');
};
