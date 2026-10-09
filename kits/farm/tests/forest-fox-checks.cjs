module.exports=function checkForestFox(run,assert){
 const result=run(`(() => {
  const old=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
  function setup(day=12){farm=newFarm();farm.day=day;farm.phase=.2;farm.paused=false;farm.weather=farm.weatherFrom='sunny';resetForestFox();}
  function roundTrip(){const before=JSON.stringify(forestFox);const saved=importFarmText(farmExportText());replaceFarmState(saved.state,saved.runtime);return JSON.stringify(forestFox)===before;}
  try{
   setup();const start=foxPosition();updateForestFox(.1);updateForestFox(.5);result.realPath=forestFox.mode==='walk'&&distance(forestFox,start)>0&&forestFox.route.length>0;
   setup();Object.assign(forestFox,{x:1159.6,y:443.1});const offGrid=foxPosition();updateForestFox(.1);updateForestFox(.5);
   result.offGrid=distance(forestFox,offGrid)>0&&forestFox.route.every(p=>forestGroundClear(p.x,p.y));
   result.safePath=forestFox.route.every(p=>forestGroundClear(p.x,p.y));result.partial=roundTrip();
   const freeze=JSON.stringify(forestFox);farm.paused=true;updateForestFox(10);drawForestFox();result.pause=JSON.stringify(forestFox)===freeze;farm.paused=false;
   const day=Array.from({length:24},(_,i)=>i+1).find(d=>hash(d,1151)<.45&&d>2);setup(day);forestFox.mode='sniff';forestFox.wait=.01;updateForestFox(.02);
   result.nap=forestFox.mode==='nap'&&forestFox.wait===4.8;updateForestFox(.5);result.napSave=roundTrip();
   result.depth=farmSceneItems().find(i=>i.id==='fox').y===forestFox.y+13;
   result.hint=describe(forestFox.x,forestFox.y)?.text.includes('打盹');
   const napping=JSON.stringify({x:forestFox.x,y:forestFox.y,wait:forestFox.wait,route:forestFox.route});greetForestFox();
   result.clickKeepsNap=napping===JSON.stringify({x:forestFox.x,y:forestFox.y,wait:forestFox.wait,route:forestFox.route})&&forestFox.observedDay===day;
   for(let i=0;i<90;i++)updateForestFox(.05);result.complete=forestFox.napsTotal===1&&forestFox.napDone;
   for(let i=0;i<300;i++)updateForestFox(.05);result.once=forestFox.napsTotal===1;
   farm.ledgerExpanded=true;updateLedgerUI();result.ledger=$('ledger-fox-naps').textContent==='1 回';
   setup();forestFox.mode='nap';forestFox.napDecided=true;forestFox.wait=2;farm.weather=farm.weatherFrom='rain';updateForestFox(.1);
   result.realReturn=forestFox.mode==='return'&&forestFoxVisible()&&forestFox.napsTotal===0;
   for(let i=0;i<300;i++)updateForestFox(.05);result.home=forestFox.mode==='home'&&!forestFoxVisible()&&distance(forestFox,FOREST_FOX_LAYOUT.home)<.01;
   result.homeSave=roundTrip();farm.weather=farm.weatherFrom='sunny';updateForestFox(.1);result.resume=forestFox.mode==='walk'&&forestFoxVisible();
   setup();farm.weather=farm.weatherFrom='snow';for(let i=0;i<300;i++)updateForestFox(.05);result.snow=forestFox.mode==='home';
   setup();farm.phase=.6;for(let i=0;i<300;i++)updateForestFox(.05);result.night=forestFox.mode==='home';
   setup(28);forestFox.mode='sniff';updateForestFox(.05);result.winter=forestFox.mode!=='nap'&&!forestFox.napDecided;
   setup(10);updateForestFox(.05);result.holiday=forestFox.mode==='walk';
   setup();forestFox.mode='sniff';forestKeeper={...resetForestKeeper(),x:forestFox.x-40,y:forestFox.y};const pos=foxPosition();visitForestAnimals();
   result.forester=forestFox.waveUntil>now&&forestFox.dir===-1&&distance(forestFox,pos)===0;
   setup();const saved=JSON.parse(farmExportText()),clock=saved.runtime.motionNow;delete saved.runtime.forestFox;
   const imported=importFarmText(JSON.stringify(saved));replaceFarmState(imported.state,imported.runtime);
   result.oldLocation=JSON.stringify(foxPosition())===JSON.stringify({x:1190+Math.sin(clock*.34)*55,y:466+Math.sin(clock*.23)*24});
   setup();forestFox=makeForestFox(18);const embedded=foxPosition();farm.phase=.6;for(let i=0;i<300;i++)updateForestFox(.05);
   result.edgeExit=forestFoxRoute({x:1176.1,y:442.1},FOREST_FOX_LAYOUT.home).length>0;
   result.embeddedExit=distance(forestFox,embedded)>0&&forestFox.mode==='home'&&distance(forestFox,FOREST_FOX_LAYOUT.home)<.01;
   result.free=farm.coins===120&&farm.town.spentTotal===0;
   const invalid=JSON.parse(farmExportText());invalid.runtime.forestFox.wait=100;result.invalid=false;try{importFarmText(JSON.stringify(invalid));}catch{result.invalid=true;}
   return result;
  }finally{replaceFarmState(old,runtime);}
 })()`);
 for(const [name,pass]of Object.entries(result))assert.equal(pass,true,'forest fox '+name);
 console.log('Forest fox passed: real dry routes, sniff/nap, once/day, pause/full save, quiet clicks, parent depth, rain/snow/night home, holiday life, forester greetings and legacy clock position.');
};
