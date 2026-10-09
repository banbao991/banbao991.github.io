module.exports=function checkWetlandFrogSong(run,assert){
 const result=run(`(()=>{
  const old=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
  const day=Array.from({length:8},(_,i)=>12+i).find(d=>hash(d,0,1297)<.60);
  function setup(d=day){farm=newFarm();farm.day=d;farm.phase=.2;farm.paused=false;farm.weather=farm.weatherFrom='cloud';farm.nursery.wetness=.7;farm.nursery.frogSong=makeWetlandFrogSong(d);motionNow=3;}
  function advance(dt){motionNow+=dt;now+=dt;updateWetlandFrogSong(dt);}
  function equalSave(){const before=JSON.stringify({n:farm.nursery,p:nurseryFrogPosition(),b:wetlandWaterhenPosition()});const memory=importFarmText(farmExportText());replaceFarmState(memory.state,memory.runtime);return before===JSON.stringify({n:farm.nursery,p:nurseryFrogPosition(),b:wetlandWaterhenPosition()});}
  try{
   setup();const before=nurseryFrogPosition(),money=farm.coins;updateWetlandFrogSong(.1);result.start=wetlandFrogCalling()&&distance(before,nurseryFrogPosition())===0;advance(.4);
   result.hold=distance(before,nurseryFrogPosition())===0&&farm.nursery.frogSong.sessions===0;result.partial=equalSave();result.pulse=wetlandFrogSongPulse()>.1;
   const bird=wetlandWaterhenPosition();result.listen=wetlandWaterhenListening(bird)&&bird.dir===(before.x<bird.x?-1:1)&&wetlandCreatureHint({kind:'waterhen'}).includes('留意');
   result.hints=nurseryFrogHint().includes('鼓腮')&&nurseryFrogAt(before.x,before.y);updateWorldStatusUI();result.status=$('nursery-status').textContent.includes('鼓腮');
   farm.paused=true;const held=JSON.stringify({n:farm.nursery,p:nurseryFrogPosition(),b:wetlandWaterhenPosition()});now+=1;updateNurseryLife(10);farmSceneItems();result.pause=held===JSON.stringify({n:farm.nursery,p:nurseryFrogPosition(),b:wetlandWaterhenPosition()});
   const item=farmSceneItems().find(i=>i.id==='nursery-frog');result.depth=item.y===NURSERY_FROG_HOME.y+8;farm.paused=false;
   advance(3.8);result.complete=farm.nursery.frogSong.sessions===1&&farm.nursery.frogSong.stage==='back';result.finishedSave=equalSave();
   let smooth=true;for(let i=0;i<90&&farm.nursery.frogSong.stage!=='idle';i++){const p={...nurseryFrogContact()};advance(.05);smooth&&=distance(p,nurseryFrogContact())<=14*.05+.001;}
   result.rejoin=smooth&&farm.nursery.frogSong.stage==='idle'&&distance(nurseryFrogContact(),nurseryFrogBase())===0;advance(4.2);result.once=farm.nursery.frogSong.sessions===1;
   farm.ledgerExpanded=true;updateLedgerUI();result.ledger=$('ledger-frog-song').textContent.includes('1');result.free=farm.coins===money&&farm.fishTotal===0&&farm.nursery.harvestTotal===0;
   setup();updateWetlandFrogSong(.1);advance(.4);const p={...nurseryFrogContact()};greetNurseryFrog();result.click=farm.nursery.frogSong.stage==='back'&&farm.nursery.frogJumpUntil===motionNow+2&&farm.nursery.frogSong.sessions===0&&distance(p,nurseryFrogContact())===0;advance(.1);result.jump=nurseryFrogPosition().y<NURSERY_FROG_HOME.y&&farmSceneItems().find(i=>i.id==='nursery-frog').y===NURSERY_FROG_HOME.y+8;result.clickSave=equalSave();
   for(const [name,change]of [['rain',()=>farm.weather=farm.weatherFrom='rain'],['snow',()=>farm.weather=farm.weatherFrom='snow'],['night',()=>farm.phase=.7],['dry',()=>farm.nursery.wetness=.3],['stir',()=>interactWetlandCreature({kind:'waterhen'})]]){setup();updateWetlandFrogSong(.1);change();advance(.1);result[name]=farm.nursery.frogSong.stage==='back'&&farm.nursery.frogSong.sessions===0;}
   setup();updateWetlandFrogSong(.1);farm.nursery.wetness=.55;advance(.1);result.drying=wetlandFrogCalling()&&farm.nursery.frogSong.elapsed===.1;
   setup(28);farm.nursery.wetness=.8;updateWetlandFrogSong(.1);result.winter=!wetlandFrogCalling();
   setup();farm.nursery.wetness=.3;updateWetlandFrogSong(.1);result.noDry=!farm.nursery.frogSong.decided;
   const failed=Array.from({length:8},(_,i)=>12+i).find(d=>hash(d,0,1297)>=.60);setup(failed);updateWetlandFrogSong(.1);result.failure=farm.nursery.frogSong.decided&&!wetlandFrogCalling()&&equalSave();
   setup();updateWetlandFrogSong(.1);farm.day++;advance(.1);result.newDay=farm.nursery.frogSong.day===farm.day&&farm.nursery.frogSong.stage!=='call'&&farm.nursery.frogSong.decided&&farm.nursery.frogSong.sessions===0;
   setup(20);updateWetlandFrogSong(.1);result.holiday=wetlandFrogCalling()===(hash(20,0,1297)<.60*(1-seasonTransition().winter));
   setup();delete farm.nursery.frogSong;const legacy=nurseryFrogPosition(),n=JSON.stringify(farm.nursery);const memory=importFarmText(farmExportText());result.legacy=JSON.stringify(memory.state.nursery)===n&&distance(legacy,nurseryFrogPosition())===0;
   setup();farm.phase=.57;updateWetlandFrogSong(.1);result.late=!farm.nursery.frogSong.decided;
   setup();farm.nursery.frogSong.position={x:99,y:1786};farm.nursery.frogSong.stage='back';farm.nursery.frogSong.decided=true;farm.nursery.frogSong.elapsed=1;try{importFarmText(farmExportText());result.badBack=false;}catch(e){result.badBack=/青蛙/.test(e.message);}
   setup();farm.nursery.frogSong.position={x:10,y:100};farm.nursery.frogSong.stage='call';farm.nursery.frogSong.decided=true;try{importFarmText(farmExportText());result.bad=false;}catch(e){result.bad=/青蛙/.test(e.message);}
  }finally{replaceFarmState(old,runtime);}
  return result;
 })()`);
 for(const [name,passed]of Object.entries(result))assert.equal(passed,true,'Wetland frog song: '+name);
 console.log('Wetland frog song passed: actual held position, three pulses/completion, slow rejoin, existing bird response, weather/dampness/winter, pause/full save, clicks, depth/hints/ledger and legacy state.');
};
