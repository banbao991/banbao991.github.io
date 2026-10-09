module.exports=function checkTownFireflies(run,assert){
  const checks=run(`(() => {
    const original=farm;
    const result={season:true,choice:true,save:true,weather:true,motion:true,observation:true,pause:true,fade:true,depth:true,validation:true};
    try{
      farm=newFarm();farm.day=13;farm.phase=.07;farm.weather='sunny';farm.weatherFrom='rain';
      farm.town=makeTownState(13);farm.town.seed=1;farm.nursery.level=1;
      farm.town.inventory.butterflySeed=1;farm.town.plantings.butterflySeed=[1];
      updateTownFireflies(0);
      result.choice=farm.town.fireflyChoice.wetland && farm.town.fireflyChoice.meadow;
      const seed=farm.town.seed;updateTownFireflies(0);result.choice &&=farm.town.seed===seed;
      farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});updateTownFireflies(0);
      result.save=farm.town.seed===seed && farm.town.fireflyChoice.wetland && !farm.town.fireflyChoice.appeared;
      farm.phase=.60;farm.weather='rain';farm.weatherFrom='rain';updateTownFireflies(1);
      result.weather=farm.town.fireflies.length===0 && !farm.town.fireflyChoice.appeared;
      farm.weather='sunny';farm.weatherFrom='sunny';const coins=farm.coins;updateTownFireflies(1);
      result.motion=farm.town.fireflies.length===10 && farm.town.fireflies.every(fly=>fly.fade>.5) && farm.coins===coins;
      const before=JSON.stringify(farm.town.fireflies);updateTownFireflies(2);
      result.motion &&=before!==JSON.stringify(farm.town.fireflies);
      for(let i=0;i<500;i++)updateTownFireflies(.05);
      result.motion &&=farm.town.fireflies.every(fly=>{
        const habitat=TOWN_LAYOUT.fireflyHabitats[fly.habitat];
        return ((fly.x-habitat.x)/habitat.rx)**2+((fly.y-habitat.y)/habitat.ry)**2<=1.00001;
      });
      const fly=farm.town.fireflies[0];
      result.depth=farmSceneItems().filter(item=>item.id.startsWith('town-firefly:')).every(item=>item.layer===1)
        && describe(fly.x,fly.y-5)?.target===fly;
      noticeTownFireflies();noticeTownFireflies();
      result.observation=farm.town.observations.firefly===1 && farm.town.fireflyChoice.observed;
      const saved=JSON.stringify(farm.town);farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});
      result.save &&=JSON.stringify(farm.town)===saved;
      farm.paused=true;updateTownFireflies(9);result.pause=JSON.stringify(farm.town)===saved;farm.paused=false;
      const invalid=JSON.parse(JSON.stringify(farm));invalid.town.fireflies[0].habitat='road';
      try{parseFarmSave({version:1,state:invalid});result.validation=false;}catch{}
      farm.phase=.88;updateTownFireflies(.5);
      result.fade=farm.town.fireflies.length===10 && farm.town.fireflies[0].fade>.5 && farm.town.fireflies[0].fade<1;
      updateTownFireflies(2);result.fade &&=farm.town.fireflies.length===0;
      updateTownFireflies(1);result.choice &&=farm.town.fireflies.length===0 && farm.town.fireflyChoice.appeared;
      farm.day=29;farm.phase=.07;farm.town=makeTownState(29);farm.town.seed=1;updateTownFireflies(0);
      farm.phase=.65;updateTownFireflies(1);result.season=farm.town.fireflies.length===0 && !farm.town.fireflyChoice.wetland;
      farm.day=14;farm.phase=.07;farm.nursery.level=0;farm.town=makeTownState(14);farm.town.seed=1;
      updateTownFireflies(0);result.season &&=!farm.town.fireflyChoice.wetland && !farm.town.fireflyChoice.meadow;
      return result;
    }finally{farm=original;updateUI();}
  })()`);
  for(const [name,passed]of Object.entries(checks))assert.ok(passed,`Firefly night failed: ${name}`);
  console.log('Firefly checks passed: warm season, saved choice, rain, actual habitat flight, free group observation, pause, fading, depth and save.');
};
