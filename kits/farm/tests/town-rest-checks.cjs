module.exports=function checkTownRest(run,assert){
  const checks=run(`(() => {
    const original=farm,result={choice:true,arrival:true,consume:true,pause:true,save:true,depth:true,return:true,night:true,weather:true};
    try{
      farm=newFarm();farm.coins=100000;farm.phase=.27;farm.town.budgetMode='off';farm.town.merchantUnlocked=true;
      farm.town.inventory.teaBlend=3;farm.town.seed=1;
      const actor=farm.town.traveller;Object.assign(actor,{mode:'shop',...TOWN_LAYOUT.counter});
      result.choice=townChooseMerchantRest(actor) && actor.restDay===farm.day && farm.town.inventory.teaBlend===3;
      for(let i=0;i<100&&actor.mode!=='rest';i++)updateTownTraveller(.05);
      result.arrival=actor.mode==='rest' && distance(actor,TOWN_LAYOUT.merchantSeat)<.01 && !townShopOpen();
      result.consume=farm.town.inventory.teaBlend===2 && farm.town.selfTea===1 && actor.drinking && farm.coins===100000;
      const saved=JSON.stringify(farm.town);farm.paused=true;updateTownTraveller(3);
      result.pause=JSON.stringify(farm.town)===saved;farm.paused=false;
      result.save=JSON.stringify(parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))}).town)===saved;
      const items=farmSceneItems(),back=items.find(i=>i.id==='traveller-merchant-seat-back'),front=items.find(i=>i.id==='traveller-merchant-seat');
      const person=items.find(i=>i.id==='town-traveller');result.depth=back.y<person.y && person.y<front.y;
      for(let i=0;i<150&&actor.mode!=='shop';i++)updateTownTraveller(.05);
      result.return=actor.mode==='shop' && distance(actor,TOWN_LAYOUT.counter)<.01 && !actor.drinking;
      const seed=farm.town.seed;for(let i=0;i<10;i++)updateTownTraveller(.05);
      result.choice &&=actor.mode==='shop' && farm.town.seed===seed && farm.town.selfTea===1;
      farm.phase=.47;townBeginMerchantRest(actor);const cups=farm.town.selfTea;
      for(let i=0;i<200&&actor.mode!=='home';i++)updateTownTraveller(.05);
      result.night=actor.mode==='home' && !actor.drinking && farm.town.selfTea===cups;
      farm.phase=.27;Object.assign(actor,{mode:'shop',target:'shop',...TOWN_LAYOUT.counter,restDay:0});
      farm.weather='rain';farm.weatherFrom='rain';
      const rainSeed=farm.town.seed;
      result.weather=!townChooseMerchantRest(actor) && farm.town.seed===rainSeed;
      farm.weather='sunny';farm.weatherFrom='sunny';farm.town.seed=1;farm.town.inventory.teaBlend=2;
      result.weather &&=townChooseMerchantRest(actor);
      farm.weather='rain';farm.weatherFrom='rain';updateTownTraveller(.05);
      result.weather &&=actor.target==='shop' && farm.town.inventory.teaBlend===2;
      Object.assign(actor,{...TOWN_LAYOUT.merchantSeat,target:'tea'});townBeginMerchantRest(actor);
      const beforeRain=farm.town.selfTea;updateTownTraveller(.05);
      result.weather &&=actor.mode==='walk' && actor.target==='shop' && !actor.drinking
        && farm.town.selfTea===beforeRain && farm.town.inventory.teaBlend===1;
      return result;
    }finally{farm=original;updateUI();}
  })()`);
  for(const [name,passed]of Object.entries(checks))assert.ok(passed,`Merchant tea break failed: ${name}`);
  console.log('Merchant rest checks passed: daily choice, arrival, one cup, no extra charge, pause, save, chair depth, return, night and weather cancellation.');
};
