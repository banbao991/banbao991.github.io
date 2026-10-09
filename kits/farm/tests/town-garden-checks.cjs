module.exports = function checkTownGarden(run,assert) {
  const checks=run(`(() => {
    const originalFarm=farm;
    const result={winter:true,depth:true,observation:true,visitors:true,pause:true,save:true,departure:true,limits:true};
    try{
      farm=newFarm();farm.day=25;farm.phase=.2;farm.weather='sunny';farm.weatherFrom='sunny';
      farm.town=makeTownState(25);farm.town.merchantUnlocked=true;farm.town.seed=1;farm.town.inventory.birdFeed=3;
      updateTownEcology(10);const robin=farm.town.birds[0];
      result.winter=robin.variant===2 && robin.mode==='perch' && farm.town.inventory.birdFeed===2;
      updateTownEcology(10);result.winter &&=robin.mode==='perch' && farm.town.inventory.birdFeed===2;
      const birdItem=farmSceneItems().find(item=>item.id==='town-bird:2');
      result.depth=birdItem.y===TOWN_LAYOUT.feeding.y+6;
      handleTownClick(robin.x,robin.y);handleTownClick(robin.x,robin.y);
      result.observation=farm.town.observations.robin===1 && robin.noticed;
      farm=newFarm();farm.day=17;farm.phase=.2;farm.weather='rain';farm.weatherFrom='rain';
      farm.town=makeTownState(17);farm.town.merchantUnlocked=true;farm.town.seed=1;
      Object.assign(farm.town.improvements.travellerGarden,{level:1,builtAt:14,stages:[14]});
      updateTownGardenLife(.1);result.visitors=farm.town.gardenChoice.snails && farm.town.critters.length===2;
      const beforeChoice=JSON.stringify(farm.town.gardenChoice),beforeSeed=farm.town.seed;
      farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});updateTownGardenLife(.1);
      result.save=JSON.stringify(farm.town.gardenChoice)===beforeChoice && farm.town.seed===beforeSeed;
      farm.phase=.62;updateTownGardenLife(.1);
      result.visitors &&=farm.town.gardenChoice.hedgehog && farm.town.critters.length===3;
      for(let i=0;i<100;i++)updateTownGardenLife(.1);
      result.visitors &&=farm.town.critters.every(animal=>!townRoadAt(animal.x,animal.y));
      const snail=farm.town.critters.find(animal=>animal.kind==='snail');
      noticeTownAnimal(snail,'snail');noticeTownAnimal(snail,'snail');
      result.observation &&=farm.town.observations.snail===1 && snail.shy===2.5;
      farm.paused=true;const frozen=JSON.stringify(farm.town);updateTownGardenLife(20);
      result.pause=JSON.stringify(farm.town)===frozen;
      const saved=JSON.stringify(farm.town);farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});
      result.save &&=JSON.stringify(farm.town)===saved;
      farm.paused=false;farm.phase=.95;for(let i=0;i<1200;i++)updateTownGardenLife(.1);
      result.departure=farm.town.critters.every(animal=>animal.mode==='hide');
      const bad=JSON.parse(JSON.stringify(farm));bad.town.critters[0].kind='unknown';
      try{parseFarmSave({version:1,state:bad});result.limits=false;}catch(_){}
      return result;
    } finally{farm=originalFarm;updateUI();}
  })()`);
  for(const [name,passed] of Object.entries(checks))assert.ok(passed,`Garden visitor failed: ${name}`);
  console.log('Garden visitor checks passed: robin, food, depth, saved daily choices, snail, hedgehog, observations, pause and return.');
};
