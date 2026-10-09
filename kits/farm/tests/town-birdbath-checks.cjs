module.exports=function checkTownBirdBath(run,assert){
  const result=run(`(()=>{
    const original=farm,result={saves:true,paths:true};
    function setup(){farm=newFarm();farm.day=11;farm.phase=.2;farm.coins=100000;
      farm.town=makeTownState(11);farm.town.merchantUnlocked=true;farm.town.inventory.birdNest=1;
      farm.weather=farm.weatherFrom='sunny';farm.town.seed=1;}
    function step(dt=.05){farm.phase+=dt/DAY_SECONDS;updateTownBirdBath(dt);}
    try{
      setup();const untouched=farm.town.inventory.birdFeed,coins=farm.coins;updateTownBirdBath(.05);
      result.install=farm.town.birdBath.ready&&farm.town.birdBath.water===.55&&farm.town.birdBath.bird?.mode==='arrive';
      const seen=new Set();for(let i=0;i<200&&farm.town.birdBath.bird;i++){
        const before={...farm.town.birdBath.bird};step();const bird=farm.town.birdBath.bird;
        if(bird){seen.add(bird.mode);result.paths &&=distance(before,bird)<=90*.05+.01;}
        const restored=importFarmText(farmExportText());result.saves &&=JSON.stringify(restored.state.town)===JSON.stringify(farm.town);
        if(bird?.mode==='bathe'){
          const item=farmSceneItems().find(item=>item.id==='town-bath-wagtail');
          result.depth=item.layer===0&&item.y===TOWN_LAYOUT.birdhouse.y+10;
          result.hint=townDescribe(bird.x,bird.y).text.includes('白鹡鸰');
          handleTownClick(bird.x,bird.y);handleTownClick(bird.x,bird.y);
        }
        if(bird?.mode==='leave'){const item=farmSceneItems().find(item=>item.id==='town-bath-wagtail');result.flight=item.layer===1;}
      }
      result.cycle=seen.has('perch')&&seen.has('bathe')&&seen.has('dry')&&seen.has('leave')
        &&!farm.town.birdBath.bird&&farm.town.birdBath.visits===1&&farm.town.birdBath.baths===3;
      result.free=farm.coins===coins&&farm.town.inventory.birdFeed===untouched&&farm.town.spentTotal===0;
      result.observation=farm.town.observations.wagtail===1;
      const seed=farm.town.seed;for(let i=0;i<10;i++)step();result.once=farm.town.seed===seed&&!farm.town.birdBath.bird;
      setup();farm.town.seed=123456;updateTownBirdBath(.05);const chosen=farm.town.birdBath.chosen,decisionSeed=farm.town.seed;
      farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});for(let i=0;i<20;i++)step();
      result.choice=!chosen&&!farm.town.birdBath.chosen&&farm.town.seed===decisionSeed;
      setup();updateTownBirdBath(.05);for(let i=0;i<50&&farm.town.birdBath.bird?.mode!=='bathe';i++)step();
      result.pause=farm.town.birdBath.bird?.mode==='bathe';farm.paused=true;const beforePause=JSON.stringify(farm.town.birdBath);
      now+=3;updateTownBirdBath(3);result.pause &&=JSON.stringify(farm.town.birdBath)===beforePause;
      farm.paused=false;farm.weather=farm.weatherFrom='rain';step();result.rain=farm.town.birdBath.bird.mode==='leave';
      for(let i=0;i<50&&farm.town.birdBath.bird;i++)step();result.rain &&=!farm.town.birdBath.bird;
      setup();farm.town.birdBath={...makeTownBirdBath(11),ready:true,water:.05};updateTownBirdBath(.05);
      result.dry=!farm.town.birdBath.bird&&farm.town.birdBath.day===0;
      farm.weather=farm.weatherFrom='rain';const startWater=farm.town.birdBath.water;
      farm.phase+=.2;updateTownBirdBath(.05);result.water=farm.town.birdBath.water>startWater+.15&&!farm.town.birdBath.bird;
      farm.weather=farm.weatherFrom='sunny';const wet=farm.town.birdBath.water;farm.phase+=.1;updateTownBirdBath(.05);
      result.water &&=farm.town.birdBath.water<wet;
      setup();farm.day=28;farm.town=makeTownState(28);farm.town.inventory.birdNest=1;updateTownBirdBath(.05);
      result.winter=!farm.town.birdBath.bird&&farm.town.birdBath.day===0;
      setup();farm.day=10;farm.town=makeTownState(10);farm.town.inventory.birdNest=1;farm.town.seed=1;
      updateTownBirdBath(.05);result.festival=!!farm.town.birdBath.bird;
      for(let i=0;i<50&&farm.town.birdBath.bird?.mode==='arrive';i++)step();
      farm.phase=.43;step();result.night=farm.town.birdBath.bird?.mode==='leave';
      setup();updateTownBirdBath(.05);const bad=JSON.parse(JSON.stringify(farm));bad.town.birdBath.water=1.1;
      result.reject=false;try{parseFarmSave({version:1,state:bad});}catch(_){result.reject=true;}
      return result;
    }finally{farm=original;updateUI();}
  })()`);
  for(const [key,value]of Object.entries(result))assert.ok(value,'Bird bath: '+key+' '+JSON.stringify(result));
  console.log('Bird bath passed: continuous water, actual flight/baths/departure, saved daily choice, no fees/feed, pause, weather, winter, festivals, depth, hints, one observation and full saves.');
};
