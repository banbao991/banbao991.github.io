// Run against the same page-script VM as smoke.cjs; leave the surrounding farm untouched.
module.exports = function checkTown(run, assert) {
  const result = run(`(() => {
    const originalFarm=farm, originalWalker=villageWalker;
    const answer={};
    try {
      farm=newFarm(); villageWalker=resetVillageWalker(); farm.town.budgetMode='off';
      farm.coins=4999; updateTownPlanning(); updateTownTraveller(.05);
      answer.threshold=!farm.town.merchantUnlocked && farm.town.traveller.mode==='away';
      farm.coins=5000; farm.paused=true; updateTownPlanning();
      answer.pauseUnlock=!farm.town.merchantUnlocked;
      farm.paused=false; updateTownPlanning(); updateTownTraveller(.05);
      const merchant=farm.town.traveller, beforeOffers=JSON.stringify(merchant.offers);
      answer.firstStock=merchant.mode==='arrive' && merchant.tier===0 && merchant.offers.length===5
        && merchant.offers.every(offer=>TOWN_GOODS[offer.id].tier===0);
      for(let i=0;i<100 && merchant.mode!=='shop';i++)updateTownTraveller(.05);
      answer.arrival=townShopOpen() && distance(merchant,TOWN_LAYOUT.counter)<.01 && !merchant.cartAttached;
      const offer=merchant.offers[0], beforeCoins=farm.coins;
      answer.purchase=townBuy(offer.id) && farm.coins===beforeCoins-offer.price
        && farm.town.spentTotal===offer.price && !townBuy(offer.id);
      const purchasedOffers=JSON.stringify(merchant.offers);
      farm.coins=1000000; updateTownPlanning();
      answer.snapshot=merchant.tier===0 && JSON.stringify(merchant.offers)===purchasedOffers;
      const restored=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});
      answer.save=JSON.stringify(restored.town)===JSON.stringify(farm.town) && beforeOffers!==purchasedOffers;
      answer.rejectBad=true;
      for(const mutate of [s=>s.town.seed=0,s=>s.town.traveller.x=WORLD_W+100,
        s=>s.town.traveller.cartAttached='yes',s=>s.town.inventory.birdFeed=-1]) {
        const state=JSON.parse(JSON.stringify(farm)); mutate(state);
        try { parseFarmSave({version:1,state}); answer.rejectBad=false; } catch(_){}
      }
      farm.coins=townReserve()+44;
      merchant.offers=[{id:'birdFeed',price:45,sold:false}];farm.town.inventory.birdFeed=0;
      answer.reserve=!townBuy('birdFeed') && farm.coins===townReserve()+44;
      farm.coins=20000; townSetBudget('balanced');
      const allowance=farm.town.allowance, money=farm.coins;
      updateTownPlanning(); updateTownPlanning();
      answer.budget=allowance>0 && farm.town.allowance===allowance && farm.coins===money;
      farm.town.seasonSpent=farm.town.allowance;
      answer.budgetLimit=!townBuy('birdFeed',true);
      farm.town.seasonSpent=0;
      farm.coins=1000000;farm.town.seasonSpent=10000;townSetBudget('off');townSetBudget('generous');
      answer.budgetCap=farm.town.allowance===15000 && townBudgetLeft()===5000;
      farm.town.seasonSpent=0;townSetBudget('off');
      farm.phase=.6;for(let i=0;i<200;i++)updateTownTraveller(.05);
      answer.night=merchant.mode==='home' && distance(merchant,TOWN_LAYOUT.home.door)<.01;
      farm.day=10;farm.phase=.001;updateTownPlanning();
      for(let i=0;i<600;i++){farm.phase+=.05/DAY_SECONDS;updateTownTraveller(.05);}
      answer.festival=merchant.festival.stage==='gather' && townTravellerVisible()
        && festivalParticipants().includes(merchant) && !townShopOpen();
      answer.festivalSave=JSON.stringify(parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))}).town)
        ===JSON.stringify(farm.town);
      farm.paused=true;const frozen=JSON.stringify(farm.town);
      updateTownPlanning();updateTownTraveller(5);updateTownEcology(5);farmSceneItems();
      answer.pause=JSON.stringify(farm.town)===frozen;farm.paused=false;
      farm.phase=.46;for(let i=0;i<500;i++)updateTownTraveller(.05);
      answer.festivalHome=merchant.festival.stage==='home' && !townTravellerVisible()
        && distance(merchant,TOWN_LAYOUT.home.door)<.01;
      farm.day=11;farm.phase=.05;updateTownPlanning();
      const homePosition={x:merchant.x,y:merchant.y};updateTownTraveller(.05);
      answer.morning=merchant.mode==='walk' && distance(merchant,homePosition)<.01;
      for(let i=0;i<200;i++)updateTownTraveller(.05);
      farm.town.budgetMode='off';
      merchant.offers=[{id:'teaBlend',price:80,sold:false}];farm.town.inventory.teaBlend=4;
      farm.town.inventory.birdFeed=4;farm.town.inventory.birdNest=1;farm.town.inventory.butterflySeed=2;
      farm.phase=.08;farm.weather='sunny';updateTownEcology(.05);updateTownButterflies(.05);
      const afterFeed=farm.town.inventory.birdFeed;
      for(let i=0;i<200;i++){updateTownEcology(.05);updateTownButterflies(.05);}
      answer.ecology=afterFeed===4 && farm.town.inventory.birdFeed===3
        && farm.town.birds.some(b=>b.variant===0) && farm.town.butterflies.length===3;
      answer.ecologySave=JSON.stringify(parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))}).town)
        ===JSON.stringify(farm.town);
      let checkedVisit=false,tea=false,collision=false;
      for(let day=12;day<20&&!tea;day++) {
        farm.day=day;farm.phase=.05;merchant.mode='shop';merchant.chatDay=0;
        villageWalker=resetVillageWalker();farm.town.childVisit=null;
        // The connected eastern lane lengthens the visit. Let the child finish
        // the real return before checking that the whole outing has ended.
        for(let i=0;i<1000;i++) {
          farm.phase+=.05/DAY_SECONDS;updateVillageWalker(.05);
          const visit=farm.town.childVisit;
          if(visit){checkedVisit=true;collision||=MARKET_LAYOUT.lamps.some(lamp=>
            Math.abs(villageWalker.x-lamp.x)<14 && Math.abs(villageWalker.y-(lamp.y+13))<18);
            collision||=MARKET_LAYOUT.stalls.some(stall=>inRect(villageWalker.x,villageWalker.y,stall.x,844,stall.x+118,917));}
          tea ||= farm.town.teaServed>0;
        }
      }
      answer.tea=tea && checkedVisit && !collision && !farm.town.childVisit;
      const items=farmSceneItems();
      answer.depth=new Set(items.map(item=>item.id)).size===items.length;
      const host=items.find(item=>item.id==='town-birdhouse');
      let king=farm.town.birds.find(b=>b.variant===1);
      if(!king){king=makeTownBird(1);farm.town.birds.push(king);}
      king.mode='perch';Object.assign(king,townBirdPerch(king));
      const bird=farmSceneItems().find(item=>item.id==='town-bird:1');
      answer.perch=bird && bird.layer===0 && bird.y>host.y;
      return answer;
    } finally {farm=originalFarm;villageWalker=originalWalker;updateUI();}
  })()`);
  for (const [name, passed] of Object.entries(result)) assert.ok(passed, `Town rule failed: ${name}`);
  console.log('Town checks passed: threshold, stock snapshots, spending, save, festivals, tea routes, wildlife and depth.');
};
