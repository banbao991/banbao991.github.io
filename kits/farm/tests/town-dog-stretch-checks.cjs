module.exports=function checkTownDogStretch(run,assert){
 const result=run(`(()=>{
 const original=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),r={};
 const world=()=>{const x=captureRuntimeState();delete x.now;return JSON.stringify({farm,x});};
 const saved=()=>{const before=world(),s=importFarmText(farmExportText());replaceFarmState(s.state,s.runtime);return before===world();};
 function setup(chosen=true){farm=newFarm();farm.day=Array.from({length:16},(_,i)=>i+1).find(d=>d%10!==0&&(hash(d,1,1543)<.5)===chosen);farm.phase=.2;farm.paused=false;farm.weather=farm.weatherFrom='sunny';prepareFestival();ensureValleyHerbs();spawnForageForDay();spawnFishForDay();farm.town.visits=1;Object.assign(farm.town.traveller,{mode:'shop',target:'shop'});Object.assign(farm.town.dog,{visit:1,present:true,mode:'rest',target:'yard',x:2070,y:1055,wait:4});}
 try{
 setup();const beforeDog=JSON.stringify(farm.town.dog),seed=farm.town.seed,coins=farm.coins;
 updateTownDogStretch(.05);r.start=townDogStretchActive()&&farm.town.dogStretch.remaining===1.8&&beforeDog===JSON.stringify(farm.town.dog)&&farm.town.seed===seed;
 for(let i=0;i<12;i++)updateTownDog(.05);r.half=townDogStretchActive()&&Math.abs(farm.town.dog.wait-3.4)<1e-8&&Math.abs(farm.town.dogStretch.remaining-1.2)<1e-8&&saved();
 r.ui=townDescribe(farm.town.dog.x,farm.town.dog.y).text.includes('伸懒腰');updateUI();r.ui&&=$('town-dog-status').textContent.includes('伸懒腰');const pose=townDogStretchPose(),dog=farm.town.dog;dog.dir=1;r.headHit=townDogAt(dog.x+23+pose.reach,dog.y)&&!townDogAt(dog.x+35,dog.y);dog.dir=-1;r.headHit&&=townDogAt(dog.x-23-pose.reach,dog.y);dog.dir=1;
 greetTownDog();r.click=townDogStretchActive()&&saved()&&farm.coins===coins;
 farm.paused=true;const frozen=world();updateTownDog(5);tick(last+65);renderCompleteFarmCanvas();r.pause=frozen===world();farm.paused=false;
 const items=farmSceneItems().filter(i=>i.id==='town-traveller-dog');r.depth=items.length===1&&items[0].y===farm.town.dog.y+6;
 for(let i=0;i<24;i++)updateTownDog(.05);r.done=farm.town.dogStretch.total===1&&farm.town.dogStretch.remaining===0&&farm.town.dogStretch.lastDay===farm.day&&Math.abs(farm.town.dog.wait-2.2)<1e-8&&farm.town.dog.mode==='rest'&&saved();
 farm.town.dog.wait=5;for(let i=0;i<30;i++)updateTownDog(.05);r.daily=farm.town.dogStretch.total===1;
 farm.ledgerExpanded=true;updateLedgerUI();r.ledger=$('ledger-dog-stretch').textContent==='1 回';
 setup();updateTownDogStretch(.05);farm.weather=farm.weatherFrom='rain';for(let i=0;i<200;i++)updateTownDog(.05);r.rain=farm.town.dog.mode==='home'&&farm.town.dogStretch.remaining===0&&farm.town.dogStretch.total===0&&saved();
 setup();updateTownDogStretch(.05);farm.phase=.6;for(let i=0;i<200;i++)updateTownDog(.05);r.night=farm.town.dog.mode==='home'&&farm.town.dogStretch.total===0;
 setup();updateTownDogStretch(.05);farm.town.traveller.target='leave';farm.town.traveller.mode='leave';for(let i=0;i<200;i++)updateTownDog(.05);r.leave=!farm.town.dog.present&&farm.town.dogStretch.remaining===0&&farm.town.dogStretch.total===0&&saved();
 setup();updateTownDogStretch(.05);farm.day=10;prepareFestival();for(let i=0;i<200;i++)updateTownDog(.05);r.festival=farm.town.dog.mode==='home'&&farm.town.dogStretch.total===0;
 setup(false);updateTownDogStretch(.05);const choice=JSON.stringify(farm.town.dogStretch);for(let i=0;i<20;i++)updateTownDogStretch(.05);r.choice=!farm.town.dogStretch.chosen&&choice===JSON.stringify(farm.town.dogStretch)&&saved();
 setup();farm.town.dog.wait=2;updateTownDogStretch(.05);r.short=!farm.town.dogStretch.decided;
 setup();farm.town.dog.mode='walk';updateTownDogStretch(.05);r.walk=!farm.town.dogStretch.decided;
 setup();farm.town.dog.x=2200;updateTownDogStretch(.05);r.yard=!farm.town.dogStretch.decided;
 setup();farm.day=30;updateTownDogStretch(.05);r.winter=!farm.town.dogStretch.decided;
 setup();const old=JSON.parse(farmExportText());delete old.state.town.dogStretch;const load=importFarmText(JSON.stringify(old));r.old=load.state.town.dogStretch.total===0&&JSON.stringify(load.state.town.dog)===JSON.stringify(farm.town.dog)&&JSON.stringify(load.runtime)===JSON.stringify(captureRuntimeState());
 r.reject=true;for(const change of [s=>s.town.dogStretch.total=-1,s=>s.town.dogStretch.day=s.day+1,s=>s.town.dogStretch.chosen='yes',s=>s.town.dogStretch.remaining=2,s=>Object.assign(s.town.dogStretch,{remaining:1,started:true,chosen:false}),s=>Object.assign(s.town.dogStretch,{total:1,lastDay:0})]){const d=JSON.parse(farmExportText());change(d.state);try{importFarmText(JSON.stringify(d));r.reject=false;}catch(_){}}
 return r;
 }finally{replaceFarmState(original,runtime);updateUI();}
 })()`);
 for(const [k,v]of Object.entries(result))assert.ok(v,'Dog stretch '+k+': '+JSON.stringify(result));
 console.log('Dog stretch passed: original real rest, unchanged wait/route/position/seed, halfway full restoration, pause/click/depth/UI, daily choice, rain/night/festival/leave, winter and validation.');
};
