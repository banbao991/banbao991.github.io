module.exports=function checkTownTeaParty(run,assert){
  const checks=run(`(() => {
    const original=farm,runtime=captureRuntimeState(),result={eligibility:true,arrival:true,payment:true,paths:true,
      pause:true,save:true,depth:true,return:true,choice:true,cancel:true,night:true,festival:true,invalid:true};
    const prepare=(coins=100000)=>{
      farm=newFarm();farm.day=11;farm.phase=.27;farm.coins=coins;farm.paused=false;
      farm.weather='sunny';farm.weatherFrom='sunny';
      Object.assign(farm.town,{visits:1,merchantUnlocked:true,budgetMode:'off'});farm.town.inventory.teaBlend=4;
      Object.assign(farm.town.traveller,{mode:'shop',...TOWN_LAYOUT.counter,day:11,stayUntil:12});
      Object.assign(orderKeeper,{...EAST_GARDEN_NOTICE,routine:null,festival:null,
        gardenWork:{day:11,stage:'done',routeIndex:0,targets:[],targetIndex:0,action:0}});
    };
    const frame=()=>{farm.phase+=.05/DAY_SECONDS;now+=.05;motionNow+=.05;
      updateTownTeaParty(.05);updateTownTraveller(.05);updateOrderKeeper(.05);};
    const clearPath=()=>{
      const p=orderKeeper,home=TOWN_LAYOUT.home,cart=TOWN_LAYOUT.cart;
      return !MARKET_LAYOUT.homes.some(h=>inRect(p.x,p.y,h.x,h.y+13,h.x+117,h.y+116))
        && !MARKET_LAYOUT.stalls.some(s=>inRect(p.x,p.y,s.x-45,852,s.x+100,934))
        && !MARKET_LAYOUT.lamps.some(l=>distance(p,{x:l.x,y:l.y+26})<14)
        && !inRect(p.x,p.y,home.left,home.top,home.right,home.bottom)
        && !inRect(p.x,p.y,cart.left,cart.top,cart.right,cart.bottom);
    };
    try{
      prepare(19999);result.eligibility=!townCanInviteTeaParty();farm.coins=20000;
      result.eligibility &&=townTeaPartyPrice()===45 && townCanInviteTeaParty() && !townCanInviteTeaParty(true);
      orderKeeper.gardenWork.stage='beds';result.eligibility &&=!townCanInviteTeaParty();orderKeeper.gardenWork.stage='done';
      farm.town.inventory.teaBlend=1;result.eligibility &&=!townCanInviteTeaParty();farm.town.inventory.teaBlend=4;
      farm.weather='snow';farm.weatherFrom='snow';result.eligibility &&=!townCanInviteTeaParty();
      farm.weather='sunny';farm.weatherFrom='sunny';farm.phase=.35;result.eligibility &&=!townCanInviteTeaParty();
      prepare();const garden=JSON.stringify(orderKeeper.gardenWork);result.arrival=townInviteTeaParty();
      result.payment=farm.coins===100000 && farm.town.inventory.teaBlend===4 && !farm.town.teaParty.paid;
      for(let i=0;i<160 && farm.town.teaParty.stage!=='tea';i++){frame();result.paths &&=clearPath();}
      result.arrival &&=farm.town.teaParty.stage==='tea'
        && distance(orderKeeper,TOWN_LAYOUT.childSeat)<.01 && distance(farm.town.traveller,TOWN_LAYOUT.merchantSeat)<.01;
      result.activity=villageResidentDescription('阿葵').includes('喝花茶');
      result.payment &&=farm.coins===99935 && farm.town.inventory.teaBlend===2 && farm.town.teaParties===1
        && farm.town.spending.gatherings===65 && farm.town.teaServed===1 && farm.town.selfTea===1;
      const state=JSON.stringify(farm.town),person=JSON.stringify(orderKeeper);farm.paused=true;
      updateTownTeaParty(4);updateTownTraveller(4);updateOrderKeeper(4);
      result.pause=state===JSON.stringify(farm.town) && person===JSON.stringify(orderKeeper);farm.paused=false;
      const saved=importFarmText(farmExportText());
      result.save=JSON.stringify(saved.state.town)===state && JSON.stringify(saved.runtime.orderKeeper)===person;
      const items=farmSceneItems(),seat=items.find(i=>i.id==='traveller-child-seat'),back=items.find(i=>i.id==='traveller-child-seat-back');
      const guest=items.find(i=>i.id==='order-keeper');result.depth=back.y<guest.y && guest.y<seat.y;
      for(let i=0;i<240 && farm.town.teaParty.stage!=='done';i++){frame();result.paths &&=clearPath();}
      result.return=farm.town.teaParty.stage==='done' && distance(orderKeeper,EAST_GARDEN_NOTICE)<.01
        && farm.town.traveller.mode===(farm.phase>=.46?'home':'shop') && JSON.stringify(orderKeeper.gardenWork)===garden;
      result.payment &&=farm.coins===99935 && farm.town.inventory.teaBlend===2 && !townCanInviteTeaParty();
      prepare();farm.town.budgetMode='balanced';farm.town.allowance=500;farm.town.seed=1;
      updateTownTeaParty(.05);result.choice=farm.town.teaParty.chosen && farm.town.teaParty.automatic;
      const seed=farm.town.seed;updateTownTeaParty(.05);result.choice &&=farm.town.seed===seed;
      for(let i=0;i<160 && farm.town.teaParty.stage!=='tea';i++)frame();
      result.choice &&=farm.town.seasonSpent===65;
      prepare();townInviteTeaParty();for(let i=0;i<25;i++)frame();
      farm.weather='rain';farm.weatherFrom='rain';updateTownTeaParty(.05);
      for(let i=0;i<180 && farm.town.teaParty.stage!=='done';i++){frame();result.paths &&=clearPath();}
      result.cancel=farm.town.teaParty.stage==='done' && !farm.town.teaParty.paid
        && farm.coins===100000 && farm.town.inventory.teaBlend===4 && distance(orderKeeper,EAST_GARDEN_NOTICE)<.01;
      prepare();townInviteTeaParty();for(let i=0;i<160 && farm.town.teaParty.stage!=='tea';i++)frame();
      farm.phase=.60;for(let i=0;i<240 && (farm.town.teaParty.stage!=='home'||farm.town.traveller.mode!=='home');i++){frame();result.paths &&=clearPath();}
      result.night=farm.town.teaParty.stage==='home' && distance(orderKeeper,ORDER_KEEPER_HOME)<.01
        && farm.town.traveller.mode==='home' && farm.town.teaParties===1;
      prepare();townInviteTeaParty();farm.day=20;farm.phase=.1;updateTownTeaParty(.05);updateTownTraveller(.05);updateOrderKeeper(.05);
      result.festival=farm.town.teaParty.stage==='done' && orderKeeper.festival?.attending
        && farm.town.traveller.festival?.attending && farm.coins===100000;
      const invalid=JSON.parse(farmExportText());invalid.state.town.teaParty.cost=-1;
      try{importFarmText(JSON.stringify(invalid));result.invalid=false;}catch(_){}
      return result;
    }finally{replaceFarmState(original,runtime);}
  })()`);
  for(const [name,passed]of Object.entries(checks))assert.ok(passed,`Neighborhood tea party failed: ${name}`);
  console.log('Tea party checks passed: completed garden tasks, real arrivals, one payment, public budget, paths, pause, save, chair depth, return, rain, night and festival.');
};
