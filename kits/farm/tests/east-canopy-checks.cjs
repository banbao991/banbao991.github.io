module.exports=function checkCanopy(run,assert){
 const result=run(`(()=>{
  const original=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),r={};
  const snapshot=()=>JSON.stringify({farm,runtime:captureRuntimeState()});
  try{
   replaceFarmState(newFarm());farm.day=Array.from({length:8},(_,i)=>i+1).find(day=>hash(day,0,1103)<.85&&hash(day,1,1103)<.85&&hash(day,1105)<.85);
   farm.phase=.15;farm.weather=farm.weatherFrom='sunny';const coins=farm.coins;
   r.routes=true;
   for(const start of [...EAST_CANOPY.homes,...EAST_CANOPY.spots])for(const end of [...EAST_CANOPY.homes,...EAST_CANOPY.spots]){
    const path=eastCanopyRoute(start,end);let previous=start;
    r.routes&&=!!path.length;for(const p of path){r.routes&&=eastCanopyClear(previous,p)&&!riverAt(p.x,p.y)&&!townRoadAt(p.x,p.y,32);previous=p;}
   }
   let flights=0,pecks=0,foraging=0;r.movement=true;
   for(let i=0;i<1600;i++){
    const before=farm.eastCanopy.chipmunks.map(a=>({x:a.x,y:a.y}));updateEastCanopy(.05);
    for(const [id,a]of farm.eastCanopy.chipmunks.entries())r.movement&&=eastCanopyClear(a,a)&&distance(a,before[id])<=1.751;
    if(farm.eastCanopy.woodpecker.mode==='fly')flights++;if(farm.eastCanopy.woodpecker.mode==='peck')pecks++;
    foraging+=farm.eastCanopy.chipmunks.filter(a=>a.mode==='forage').length;
    if(i%100===0)validateEastCanopy(farm);
   }
   r.living=flights>0&&pecks>0&&foraging>0&&farm.coins===coins;
   const a=farm.eastCanopy.chipmunks[0],hit=eastCanopyAnimalAt(a.x,a.y-5);
   r.hint=hit?.actor===a&&describe(a.x,a.y-5).target===a&&describe(a.x,a.y-5).text.includes('花栗鼠');
   greetEastCanopy(hit);greetEastCanopy(hit);r.observed=farm.eastCanopy.observations===1&&farm.coins===coins;
   const save=importFarmText(farmExportText()),before=snapshot();replaceFarmState(save.state,save.runtime);r.restore=before===snapshot();
   farm.paused=true;const frozen=snapshot();updateEastCanopy(30);renderCompleteFarmCanvas();drawMiniMap();updateTownUI();r.pauseReadonly=frozen===snapshot();
   const waterBefore=now,waterFarm=JSON.stringify(farm),waterWorld=motionNow;now+=.7;drawVillageFountain();r.fountainReadonly=JSON.stringify(farm)===waterFarm&&motionNow===waterWorld;now=waterBefore;
   const items=farmSceneItems(),chip=items.find(i=>i.id==='east-chipmunk:0');r.groundDepth=chip.y===farm.eastCanopy.chipmunks[0].y+7&&chip.layer===0;
   farm.paused=false;
   for(let i=0;i<300&&farm.eastCanopy.woodpecker.mode==='fly';i++)updateEastCanopy(.05);
   const b=farm.eastCanopy.woodpecker,perchItems=farmSceneItems();
   const tree=EAST_CANOPY.perches[b.perch].tree,item=perchItems.find(i=>i.id==='east-woodpecker'),carrier=perchItems.find(i=>i.id==='east-tree:'+tree.x+':'+tree.y);
   r.perchDepth=item?.layer===0&&item.y===carrier.y&&perchItems.indexOf(item)>perchItems.indexOf(carrier);
   greetEastCanopy({actor:b,kind:'woodpecker'});r.birdHint=describe(b.x,b.y-8).text.includes('啄木鸟');
   sendEastWoodpecker((b.perch+1)%3);r.flightDepth=farmSceneItems().find(i=>i.id==='east-woodpecker').layer===1;
   const midway=importFarmText(farmExportText()),full=snapshot();replaceFarmState(midway.state,midway.runtime);r.flightRestore=full===snapshot();
   farm.weather=farm.weatherFrom='rain';for(let i=0;i<2000;i++)updateEastCanopy(.05);
   r.rain=farm.eastCanopy.chipmunks.every(a=>a.mode==='home'&&distance(a,EAST_CANOPY.homes[a.id])===0)&&farm.eastCanopy.woodpecker.mode==='nest';
   farm.day++;farm.phase=.16;farm.weather=farm.weatherFrom='sunny';for(let i=0;i<400;i++)updateEastCanopy(.05);
   farm.phase=.7;for(let i=0;i<2000;i++)updateEastCanopy(.05);
   r.night=farm.eastCanopy.chipmunks.every(a=>a.mode==='home')&&farm.eastCanopy.woodpecker.mode==='nest';
   r.reject=true;
   for(const mutate of [s=>s.eastCanopy.chipmunks[0].x=100,s=>s.eastCanopy.chipmunks[0].route=[{x:2160,y:152}],
    s=>s.eastCanopy.woodpecker.target=99,s=>s.eastCanopy.woodpecker.day=s.day+1,s=>s.eastCanopy.observations=3]){
    const file=JSON.parse(farmExportText());mutate(file.state);try{importFarmText(JSON.stringify(file));r.reject=false;}catch(_){}
   }
   const old=JSON.parse(farmExportText());delete old.state.eastCanopy;const adapted=importFarmText(JSON.stringify(old));
   r.defaults=adapted.state.eastCanopy.observations===0&&adapted.state.day===farm.day;
   replaceFarmState(newFarm());r.reset=farm.eastCanopy.observations===0&&farm.eastCanopy.chipmunks.every(a=>a.mode==='home');
   return r;
  }finally{replaceFarmState(original,runtime);updateUI();}
 })()`);
 for(const [key,value]of Object.entries(result))assert.ok(value,'East canopy '+key+': '+JSON.stringify(result));
 console.log('Canopy checks passed: clear actual routes, chipmunk foraging, real trunk flights/depth, pauses, rain/night homes, hints, free observations, full saves, defaults and validation; fountain stays read-only.');
};
