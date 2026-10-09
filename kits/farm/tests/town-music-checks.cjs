module.exports=function checkTownMusic(run,assert){
 const results=run(`(()=>{
  const original=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),result={};
  function setup(day=11){farm=newFarm();farm.day=day;farm.phase=.28;farm.paused=false;farm.coins=80000;
   farm.weather=farm.weatherFrom='sunny';farm.town.merchantUnlocked=true;farm.town.seed=1;farm.town.inventory.musicBox=1;
   Object.assign(farm.town.traveller,TOWN_LAYOUT.merchantSeat,{mode:'rest',target:'tea',wait:3.2,festival:null});}
  function step(dt=.1){now+=dt;motionNow+=dt;farm.phase+=dt/DAY_SECONDS;updateTownMusic(dt);}
  function equalSave(){const before=JSON.stringify({town:farm.town,actors:[villageWalker,orderKeeper]}),loaded=importFarmText(farmExportText());
   replaceFarmState(loaded.state,loaded.runtime);return before===JSON.stringify({town:farm.town,actors:[villageWalker,orderKeeper]});}
  try{
   setup();const coins=farm.coins,tea=farm.town.inventory.teaBlend,position={...farm.town.traveller};step();
   result.automatic=townMusicPlaying()&&farm.town.music.automatic&&townMusicListening('merchant');
   step(.5);result.partial=equalSave();result.hint=townDescribe(TOWN_LAYOUT.music.x,TOWN_LAYOUT.music.y+5).kind==='music-box';
   updateTownUI();result.status=$('town-music-status').textContent.includes('小调');now=.3;result.pose=townMusicHeadLift('merchant')!==0;
   const before=JSON.stringify({town:farm.town,actors:[villageWalker,orderKeeper]});farm.paused=true;now+=2;updateTownMusic(10);
   farmSceneItems();drawTownTeaTable();drawTownTraveller();updateTownUI();result.pause=before===JSON.stringify({town:farm.town,actors:[villageWalker,orderKeeper]});farm.paused=false;
   const parts=farmSceneItems();result.depth=parts.filter(item=>item.id==='traveller-tea-table').length===1
    &&parts.find(item=>item.id==='traveller-tea-table').y===TOWN_LAYOUT.tea.y+16;
   for(let i=0;i<30;i++)step();result.complete=farm.town.music.plays===1&&!townMusicPlaying()
    &&farm.coins===coins&&farm.town.inventory.teaBlend===tea&&distance(farm.town.traveller,position)===0
    &&farm.town.traveller.wait===position.wait;
   result.completeSave=equalSave();farm.ledgerExpanded=true;updateLedgerUI();result.ledger=$('ledger-town-music').textContent==='1 回';
   result.once=!startTownMusic()&&farm.town.music.startedDay===farm.day;
   setup();farm.town.traveller.x+=20;step();result.actualSeat=!farm.town.music.decided&&!townMusicPlaying();
   setup();farm.town.traveller.wait=1;step();result.enoughTime=!farm.town.music.decided;
   setup();farm.phase=.45;step();result.late=!farm.town.music.decided&&!startTownMusic();
   setup();farm.town.inventory.musicBox=0;step();result.unowned=!townMusicPlaying()&&!startTownMusic();
   setup();farm.town.traveller.mode='away';step();result.noAudience=!farm.town.music.decided;
   result.manual=startTownMusic()&&!farm.town.music.automatic&&farm.town.music.listeners.length===0;
   while(townMusicPlaying())step();result.manual&&=farm.town.music.plays===1;
   setup();step();farm.town.traveller.mode='walk';step();result.leave=!townMusicPlaying()&&farm.town.music.plays===0;
   setup();step();farm.weather=farm.weatherFrom='rain';step();result.rain=!townMusicPlaying()&&farm.town.music.plays===0&&!startTownMusic();
   setup();step();farm.weather=farm.weatherFrom='snow';step();result.snow=!townMusicPlaying();
   setup();step();farm.phase=.47;step();result.night=!townMusicPlaying();
   setup(10);step();result.festival=!townMusicPlaying()&&!farm.town.music.decided&&!startTownMusic();
   setup();step();farm.day++;farm.phase=.01;step();result.day=farm.town.music.startedDay===farm.day-1&&farm.town.music.day===farm.day&&farm.town.music.plays===0;
   setup();farm.town.seed=12345;step();const seed=farm.town.seed;result.failure=farm.town.music.decided&&!townMusicPlaying();
   step();result.failure&&=farm.town.seed===seed&&startTownMusic()&&!farm.town.music.automatic;
   setup();farm.town.traveller.mode='shop';Object.assign(villageWalker,TOWN_LAYOUT.childSeat,{festival:null});
   farm.town.childVisit={day:farm.day,stage:'tea',wait:0,index:0,route:[]};step();result.child=townMusicListening('child')&&!townMusicListening('merchant');
   setup();Object.assign(orderKeeper,TOWN_LAYOUT.childSeat,{festival:null});
   farm.town.teaParty={...makeTownTeaParty(),day:farm.day,stage:'tea',wait:0};step();result.keeper=townMusicListening('keeper')&&townMusicListening('merchant');
   setup();const old=JSON.parse(JSON.stringify(farm)),actor=JSON.stringify(old.town.traveller);delete old.town.music;
   const loaded=parseFarmSave({version:1,state:old});result.legacy=loaded.town.music.plays===0&&JSON.stringify(loaded.town.traveller)===actor;
   result.themes=true;for(const [theme,day]of [3,11,19,27].entries()){setup(day);result.themes&&=startTownMusic()&&farm.town.music.theme===theme;}
   result.reject=true;setup();step();for(const mutate of [s=>s.town.music.elapsed=-1,s=>s.town.music.elapsed=3,
    s=>s.town.music.listeners=['child','child'],s=>s.town.music.startedDay=0,s=>s.town.music.theme=4,s=>s.town.music.decided=false,
    s=>s.town.inventory.musicBox=0,s=>s.town.music.plays=-1]){const state=JSON.parse(JSON.stringify(farm));mutate(state);
    try{parseFarmSave({version:1,state});result.reject=false;}catch(_){}}
   return result;
  }finally{replaceFarmState(original,runtime);updateUI();}
 })()`);
 for(const [key,value]of Object.entries(results))assert.ok(value,'Music box '+key+': '+JSON.stringify(results));
 console.log('Music box passed: real seated audience, four-season saved tune, daily choice, player winding, pause/full save, no extra costs/tasks, weather/night/festival priorities, depth/hints/ledger and defaults.');
};
