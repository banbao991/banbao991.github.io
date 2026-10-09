module.exports=function checkLakeDuckVisit(run,assert){
 const result=run(`(() => {
  const old=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
  const day=Array.from({length:20},(_,i)=>i+3).find(d=>hash(d,1211)<.4);
  function setup(d=day){farm=newFarm();farm.day=d;farm.phase=.2;farm.paused=false;farm.weather=farm.weatherFrom='sunny';spawnFishForDay();resetLake();angler=resetAngler();angler.fishing={day:d,quota:1,caught:1,targetId:null,action:0};}
  function saveEqual(){const before=JSON.stringify({angler,lakeDucks});const saved=importFarmText(farmExportText());replaceFarmState(saved.state,saved.runtime);return JSON.stringify({angler,lakeDucks})===before;}
  function toHello(){for(let i=0;i<400&&!lakeDuckVisitHello();i++)updateLake(.05);return lakeDuckVisitHello();}
  try{
   setup();const before=lakeDucks.map(d=>({x:d.x,y:d.y}));updateLake(.1);
   const plan=angler.duckVisit,selected=plan.duck,other=1-selected;
   result.actual=plan.stage==='out'&&distance(before[selected],lakeDucks[selected])>0&&distance(before[selected],lakeDucks[selected])<=1.801;
   result.companion=distance(before[other],lakeDucks[other])===0;
   result.water=lakeDuckVisitRouteClear(plan.origin,LAKE_DUCK_VISIT_POINT,lakeDucks[other]);result.tripSave=saveEqual();
   result.hello=toHello()&&distance(lakeDucks[selected],LAKE_DUCK_VISIT_POINT)<.001&&angler.duckVisit.total===1;
   result.quiet=anglerQuietAtPier()&&anglerActivity().includes('水鸭')&&angler.fishing.caught===1;
   result.hint=describe(lakeDucks[selected].x,lakeDucks[selected].y)?.text.includes('阿蓼');updateWorldStatusUI();result.status=$('angler-status').textContent.includes('水鸭');
   const held=JSON.stringify({angler,lakeDucks});farm.paused=true;updateLake(10);drawSouthernLakeLife();result.pause=held===JSON.stringify({angler,lakeDucks});farm.paused=false;
   updateLake(.5);result.helloSave=saveEqual();
   const items=farmSceneItems(),person=items.findIndex(i=>i.id==='angler-fishing'),rear=items.findIndex(i=>i.id==='pier-back'),front=items.findIndex(i=>i.id==='pier-front');
   result.depth=rear<person&&person<front&&items[person].y===actorDepth(angler);
   const origin={...angler.duckVisit.origin};for(let i=0;i<350&&lakeDuckVisitActive();i++)updateLake(.05);
   result.back=!lakeDuckVisitActive()&&distance(lakeDucks[selected],origin)<.001;
   for(let i=0;i<400;i++)updateLake(.05);result.once=angler.duckVisit.total===1;
   farm.ledgerExpanded=true;updateLedgerUI();result.ledger=$('ledger-duck-visits').textContent==='1 次';
   setup();toHello();const position={x:lakeDucks[angler.duckVisit.duck].x,y:lakeDucks[angler.duckVisit.duck].y};greetDuck(lakeDucks[angler.duckVisit.duck]);
   result.click=angler.duckVisit.stage==='back'&&distance(lakeDucks[angler.duckVisit.duck],position)===0&&angler.duckVisit.total===1;
   result.backSave=saveEqual();
   setup();toHello();farm.weather=farm.weatherFrom='rain';updateLake(.1);result.rain=angler.duckVisit.stage==='back';
   setup();toHello();farm.weather=farm.weatherFrom='snow';updateLake(.1);result.snow=angler.duckVisit.stage==='back';
   setup();toHello();farm.phase=.6;updateLake(.1);result.night=angler.duckVisit.stage==='back';
   setup();toHello();farm.day=10;updateLake(.1);result.holiday=angler.duckVisit.stage==='back';
   setup();toHello();angler.fishing.caught=0;updateLake(.1);result.resumeWork=angler.duckVisit.stage==='back';
   updateAnglerFishing(.1);result.fishingContinues=!!angler.fishing.targetId&&angler.fishing.action>0;
   setup();updateLake(.1);farm.weather=farm.weatherFrom='rain';updateLake(.1);result.noPhantom=['back','idle'].includes(angler.duckVisit.stage)&&angler.duckVisit.total===0&&angler.duckVisit.decided;
   setup();angler.fishing.caught=0;updateLake(.1);result.workPriority=!lakeDuckVisitActive()&&!angler.duckVisit.decided;
   farm.fishSpots=[];updateLake(.1);result.emptyLake=angler.duckVisit.stage==='out';
   setup(28);updateLake(.1);result.winter=!lakeDuckVisitActive()&&!angler.duckVisit.decided;
   const fail=Array.from({length:15},(_,i)=>i+3).find(d=>hash(d,1211)>=.4);setup(fail);updateLake(.1);result.failed=angler.duckVisit.decided&&!lakeDuckVisitActive()&&saveEqual();
   setup();lakeDucks[0].x=lakeDucks[1].x=LAKE_DUCK_VISIT_POINT.x;lakeDucks[0].y=lakeDucks[1].y=LAKE_DUCK_VISIT_POINT.y;updateLakeDuckVisitPlan(.1);result.noCrowd=!lakeDuckVisitActive();
   result.free=farm.coins===120&&farm.fishTotal===0&&farm.town.spentTotal===0;
   const legacy=JSON.parse(farmExportText());delete legacy.runtime.angler.duckVisit;const actor=JSON.stringify(legacy.runtime.angler),ducks=JSON.stringify(legacy.runtime.lakeDucks);
   const saved=importFarmText(JSON.stringify(legacy));replaceFarmState(saved.state,saved.runtime);result.legacy=JSON.stringify(angler)===actor&&JSON.stringify(lakeDucks)===ducks;
   updateLake(.1);result.default=!!angler.duckVisit;
   const invalid=JSON.parse(farmExportText());invalid.runtime.angler.duckVisit.duck=9;result.invalid=false;try{importFarmText(JSON.stringify(invalid));}catch{result.invalid=true;}
   return result;
  }finally{replaceFarmState(old,runtime);}
 })()`);
 for(const [name,pass]of Object.entries(result))assert.equal(pass,true,'lake duck visit '+name);
 console.log('Lake duck visit passed: quiet fisherman, actual clear-water encounter/return, companion spacing, pause/full save, once/day, weather/night/festival/work priority, click, depth/hints/ledger and legacy actors.');
};
