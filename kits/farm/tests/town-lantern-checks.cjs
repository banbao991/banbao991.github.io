module.exports=function checkTownLanterns(run,assert){
  const checks=run(`(() => {
    const original=farm;
    const result={choice:true,weather:true,budget:true,payment:true,pause:true,save:true,depth:true,finish:true,panel:true,validation:true};
    try{
      farm=newFarm();farm.day=10;farm.phase=.1;farm.coins=20000;farm.town=makeTownState(10);
      farm.town.seed=1;updateTownPlanning();updateTownLanterns(0);
      const seed=farm.town.seed;
      result.choice=farm.town.lanternEvent.chosen && farm.town.lanternEvent.day===10;
      updateTownLanterns(0);result.choice &&=farm.town.seed===seed;
      const morning=JSON.stringify(farm.town);
      farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});updateTownLanterns(0);
      result.save=JSON.stringify(farm.town)===morning;
      farm.phase=.4;
      for(const weather of ['rain','snow']){
        farm.weather=weather;farm.weatherFrom=weather;
        result.weather &&=!townLaunchLanterns() && !farm.town.lanternEvent.launched;
      }
      farm.weather='sunny';farm.weatherFrom='sunny';farm.town.budgetMode='off';
      result.budget=!townLaunchLanterns(true);
      const coins=farm.coins;openTownLanternPanel();
      result.panel=!$('town-map-lantern').hidden && farm.coins===coins && !farm.town.lanternEvent.launched;
      result.payment=townLaunchLanterns() && farm.coins===coins-140 && farm.town.spending.lanterns===140
        && farm.town.spentTotal===140 && farm.town.lanternCount===1;
      result.payment &&=!townLaunchLanterns() && !townLaunchLanterns(true) && farm.coins===coins-140;
      updateTownLanterns(1);
      const lights=JSON.stringify(farm.town.lanternEvent);farm.paused=true;updateTownLanterns(5);
      result.pause=JSON.stringify(farm.town.lanternEvent)===lights;
      farm.paused=false;
      const items=farmSceneItems().filter(item=>item.id.startsWith('town-paper-lantern:'));
      result.depth=items.length===4 && items.every(item=>item.layer===Number(farm.town.lanternEvent.lanterns.find(l=>item.id.endsWith(':'+l.id)).age>0));
      const moving=JSON.stringify(farm.town);farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});
      result.save &&=JSON.stringify(farm.town)===moving;
      const light=farm.town.lanternEvent.lanterns[0],p=townLanternPosition(light);
      result.depth &&=townLanternAt(p.x,p.y-12)===light && describe(p.x,p.y-12)?.target===light;
      const invalid=JSON.parse(JSON.stringify(farm));invalid.town.lanternEvent.lanterns[0].age=NaN;
      try{parseFarmSave({version:1,state:invalid});result.validation=false;}catch{}
      farm.phase=.43-.00001;
      // Even the latest permissible, eight-light launch must fade before the next dawn.
      farm.town.lanternEvent=makeTownLanternEvent();farm.coins=600000;
      result.finish=townLaunchLanterns() && farm.town.lanternEvent.lanterns.length===8;
      for(let i=0;i<620;i++){farm.phase+=.05/DAY_SECONDS;updateTownLanterns(.05);}
      result.finish &&=farm.phase<1 && farm.town.lanternEvent.lanterns.length===0 && farm.town.lanternEvent.launched;
      farm.day=11;farm.phase=.5;updateTownLanterns(0);
      result.choice &&=!farm.town.lanternEvent.chosen && !townLaunchLanterns();
      farm.day=20;farm.phase=.4;farm.town.lanternEvent=makeTownLanternEvent();farm.coins=townReserve()+104;
      result.budget &&=!townLaunchLanterns();farm.coins=6000;farm.town.budgetMode='balanced';
      farm.town.allowance=104;farm.town.seasonSpent=0;result.budget &&=!townLaunchLanterns(true);
      farm.town.allowance=105;result.budget &&=townLaunchLanterns(true) && farm.town.seasonSpent===105;
      return result;
    }finally{farm=original;$('town-map-lantern').hidden=true;updateUI();}
  })()`);
  for(const [name,passed]of Object.entries(checks))assert.ok(passed,`Festival lantern failed: ${name}`);
  console.log('Lantern checks passed: saved daily choice, weather, reserve, automatic budget, one payment, pause, flight depth, panel, fading and save.');
};
