module.exports=function checkTurtleBask(run,assert){
 const result=run(`(() => {
  const old=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
  const day=Array.from({length:24},(_,i)=>i+1).find(d=>d>2&&hash(d,1171)<.55);
  function setup(d=day){farm=newFarm();farm.day=d;farm.phase=.14;farm.paused=false;farm.weather=farm.weatherFrom='sunny';resetValleyLife();}
  function saveEqual(){const before=JSON.stringify(valleyTurtle);const saved=importFarmText(farmExportText());replaceFarmState(saved.state,saved.runtime);return JSON.stringify(valleyTurtle)===before;}
  function toBask(){for(let i=0;i<600&&!turtleBasking();i++)updateValleyLife(.05);return turtleBasking();}
  try{
   setup();const pos={x:valleyTurtle.x,y:valleyTurtle.y};updateValleyLife(.1);
   result.actual=valleyTurtle.bask.stage==='approach'&&distance(pos,valleyTurtle)>0&&distance(pos,valleyTurtle)<=1.401;
   result.tripSave=saveEqual();result.arrival=toBask()&&distance(valleyTurtle,VALLEY_TURTLE_BASK.rock)<.001&&valleyTurtle.bask.wait===5.2;
   result.land=turtleBaskCorridor()&&!valleyLakeAt(valleyTurtle.x,valleyTurtle.y);
   updateValleyLife(.5);result.halfSave=saveEqual();
   const before=JSON.stringify(valleyTurtle);farm.paused=true;updateValleyLife(10);drawValleyTurtle();result.pause=before===JSON.stringify(valleyTurtle);farm.paused=false;
   const items=farmSceneItems(),turtleIndex=items.findIndex(i=>i.id==='valley-turtle'),rockIndex=items.findIndex(i=>i.id==='valley-turtle-rock');
   result.depth=turtleIndex>rockIndex&&items[turtleIndex].y===valleyTurtle.y+11;
   result.hint=valleyCreatureHint({kind:'turtle'}).includes('晒背');updateWorldStatusUI();result.status=$('valley-life-status').textContent.includes('晒背');
   const wait=valleyTurtle.bask.wait,ripples=valleyRipples.length;interactValleyCreature({kind:'turtle'});updateValleyLife(.5);
   result.click=valleyTurtle.hide>0&&valleyTurtle.bask.wait===wait&&valleyRipples.length<=ripples;
   for(let i=0;i<360;i++)updateValleyLife(.05);result.complete=valleyTurtle.bask.total===1&&valleyTurtle.bask.stage==='idle'&&valleyLakeAt(valleyTurtle.x,valleyTurtle.y);
   for(let i=0;i<600;i++)updateValleyLife(.05);result.once=valleyTurtle.bask.total===1;
   farm.ledgerExpanded=true;updateLedgerUI();result.ledger=$('ledger-turtle-basks').textContent==='1 回';
   setup();toBask();farm.weather=farm.weatherFrom='rain';const rainPos={x:valleyTurtle.x,y:valleyTurtle.y};updateValleyLife(.1);
   result.realRain=valleyTurtle.bask.stage==='descend'&&distance(rainPos,valleyTurtle)>0&&distance(rainPos,valleyTurtle)<=.801;
   result.returnSave=saveEqual();for(let i=0;i<300;i++)updateValleyLife(.05);result.rainReturn=valleyLakeAt(valleyTurtle.x,valleyTurtle.y)&&valleyTurtle.bask.stage==='idle'&&valleyTurtle.bask.total===0;
   setup();toBask();farm.phase=.6;for(let i=0;i<300;i++)updateValleyLife(.05);result.nightReturn=valleyLakeAt(valleyTurtle.x,valleyTurtle.y)&&valleyTurtle.bask.stage==='idle'&&valleyTurtle.bask.total===0;
   setup();toBask();farm.weather=farm.weatherFrom='snow';updateValleyLife(.1);result.snow=valleyTurtle.bask.stage==='descend';
   setup(28);updateValleyLife(.1);result.winter=valleyTurtle.bask.stage==='idle'&&!valleyTurtle.bask.decided;
   const failed=Array.from({length:23},(_,i)=>i+2).find(d=>hash(d,1171)>=.55);setup(failed);updateValleyLife(.1);result.failed=valleyTurtle.bask.decided&&valleyTurtle.bask.stage==='idle'&&saveEqual();
   setup();updateValleyLife(.1);farm.day=10;updateValleyLife(.1);result.holiday=valleyTurtle.bask.stage==='approach';
   result.free=farm.coins===120&&farm.town.spentTotal===0&&farm.fishTotal===0;
   const legacy=JSON.parse(farmExportText());delete legacy.runtime.valleyTurtle.bask;const legacyPos={x:legacy.runtime.valleyTurtle.x,y:legacy.runtime.valleyTurtle.y};
   const saved=importFarmText(JSON.stringify(legacy));replaceFarmState(saved.state,saved.runtime);result.legacy=distance(legacyPos,valleyTurtle)===0&&!valleyTurtle.bask;
   updateValleyLife(.1);result.default=!!valleyTurtle.bask;
   const invalid=JSON.parse(farmExportText());invalid.runtime.valleyTurtle.bask.wait=6;result.invalid=false;try{importFarmText(JSON.stringify(invalid));}catch{result.invalid=true;}
   return result;
  }finally{replaceFarmState(old,runtime);}
 })()`);
 for(const [name,pass]of Object.entries(result))assert.equal(pass,true,'turtle bask '+name);
 console.log('Turtle bask passed: actual swimming/climbing/return, supported rock depth, weather/night, once/day, pause, tucked head, full saves, ledger, old position and free wildlife.');
};
