module.exports = function checkTownSpecialOffers(run, assert) {
  const result = run(`(() => {
    const original = JSON.parse(JSON.stringify(farm)), runtime = captureRuntimeState();
    const result = {};
    try {
      replaceFarmState(newFarm()); farm.coins = 4999; updateTownPlanning(); updateTownTraveller(.05);
      result.threshold = !farm.town.merchantUnlocked && !townSpecialOffer();
      let sample, specials = 0, ordinary = 0, valid = true;
      for (let i = 0; i < 96; i++) {
        replaceFarmState(newFarm()); farm.day = 1 + i; farm.coins = TOWN_WEALTH_LEVELS[i % 4];
        farm.town.visits = i; farm.town.budgetMode = 'off'; townBeginVisit();
        const a = farm.town.traveller, offers = a.offers, deals = offers.filter(o => o.regularPrice);
        specials += deals.length; ordinary += !deals.length;
        valid &&= deals.length <= 1 && offers.every(o => TOWN_GOODS[o.id].tier <= a.tier)
          && deals.every(o => (o.id === 'birdFeed' || TOWN_GOODS[o.id].kind === 'supplies')
            && o.price === Math.round(o.regularPrice * .8) && o.price < o.regularPrice);
        const before = JSON.stringify(offers), seed = farm.town.seed;
        townPrepareSpecialOffer(); updateTownUI(); townSpecialOfferHint(); drawTownCart(TOWN_LAYOUT.cart.x, TOWN_LAYOUT.cart.y);
        valid &&= JSON.stringify(offers) === before && farm.town.seed === seed;
        const loaded = importFarmText(farmExportText());
        valid &&= JSON.stringify(loaded.state) === JSON.stringify(farm);
        if (!sample && deals.length) sample = {state:JSON.parse(JSON.stringify(farm)), runtime:captureRuntimeState()};
      }
      result.packing = valid && specials > 0 && ordinary > 0 && !!sample;
      replaceFarmState(JSON.parse(JSON.stringify(sample.state)), sample.runtime);
      farm.day = 101; farm.phase = .08; farm.weather = farm.weatherFrom = 'sunny';
      farm.town.traveller.stayUntil = 103;
      for (let i = 0; i < 200 && !townShopOpen(); i++) updateTownTraveller(.05);
      const a = farm.town.traveller, offer = townSpecialOffer(), slot = a.offers.indexOf(offer);
      const fixedQuote = JSON.stringify(a.offers); farm.coins = 1000000; updateTownPlanning(); updateTownUI();
      result.display = townShopOpen() && $('town-buy-'+slot).textContent.includes('八折')
        && $('town-map-buy-'+slot).title.includes('原价 '+offer.regularPrice)
        && townSpecialOfferHint().includes(offer.price+' 金')
        && townDescribe(TOWN_LAYOUT.cart.x, TOWN_LAYOUT.cart.y).text.includes('旅途特价')
        && JSON.stringify(a.offers) === fixedQuote;
      const before = {coins:farm.coins,care:farm.town.spending.care,stock:farm.town.inventory[offer.id]};
      result.purchase = townBuy(offer.id) && farm.coins === before.coins-offer.price
        && farm.town.spending.care === before.care+offer.price
        && farm.town.inventory[offer.id] > before.stock && !townBuy(offer.id) && !townSpecialOffer();
      updateTownUI(); result.sold = $('town-buy-'+slot).textContent.includes('八折 · 已购');
      const saved = importFarmText(farmExportText());
      result.saved = JSON.stringify(saved.state) === JSON.stringify(farm);
      replaceFarmState(saved.state, saved.runtime); result.saved &&= JSON.stringify(farm.town.traveller.offers) === JSON.stringify(saved.state.town.traveller.offers);
      const prepare = () => {
        replaceFarmState(JSON.parse(JSON.stringify(sample.state)), sample.runtime); farm.day=101; farm.phase=.18;
        farm.coins=1000000; farm.town.budgetMode='balanced'; farm.town.allowance=5000; farm.town.seasonSpent=0;
        const actor=farm.town.traveller; actor.mode='shop'; actor.cartAttached=false;
        actor.x=TOWN_LAYOUT.counter.x; actor.y=TOWN_LAYOUT.counter.y; actor.route=[]; actor.index=0; actor.target='shop';
        actor.offers=actor.offers.filter(o=>o.regularPrice); actor.boughtDay=0;
        farm.town.inventory[actor.offers[0].id]=0;
        if(actor.offers[0].id==='snackBox')farm.town.teaServed=1;
        return actor.offers[0];
      };
      const auto=prepare(), money=farm.coins; updateTownAutomaticShopping();
      result.automatic = auto.sold && farm.coins===money-auto.price && farm.town.seasonSpent===auto.price
        && farm.town.traveller.boughtDay===farm.day;
      const once=farm.coins; updateTownAutomaticShopping(); result.automatic &&= farm.coins===once;
      const priority=prepare(); farm.town.traveller.offers.unshift({id:'flowerPot',price:120,sold:false});
      farm.town.inventory.flowerPot=0; updateTownAutomaticShopping();
      result.priority=priority.sold && !farm.town.traveller.offers[0].sold && farm.town.inventory.flowerPot===0;
      const blocked=prepare(); farm.town.allowance=blocked.price-1; const capped=farm.coins;
      updateTownAutomaticShopping(); result.budget = !blocked.sold && farm.coins===capped;
      farm.town.allowance=5000; farm.coins=townReserve()+blocked.price-1;
      result.reserve=!townBuy(blocked.id) && !blocked.sold;
      prepare(); farm.paused=true; const frozen=JSON.stringify(farm);
      updateTownTraveller(5); renderCompleteFarmCanvas(); result.paused=JSON.stringify(farm)===frozen;
      farm.paused=false; farm.day=110; result.festival=!townBuy(farm.town.traveller.offers[0].id);
      prepare(); farm.phase=.5; result.night=!townBuy(farm.town.traveller.offers[0].id);
      prepare(); farm.town.traveller.mode='away'; result.away=!townSpecialOffer() && !townSpecialOfferHint();
      prepare(); const archive=JSON.parse(farmExportText()); delete archive.state.town.traveller.offers[0].regularPrice;
      const old=importFarmText(JSON.stringify(archive)); replaceFarmState(old.state,old.runtime);
      result.legacy=!townSpecialOffer() && farm.town.traveller.offers[0].price===archive.state.town.traveller.offers[0].price;
      prepare(); result.invalid=true;
      for (const value of [null,0,-1,1.5,'80',100000]) {
        const bad=JSON.parse(farmExportText()); bad.state.town.traveller.offers[0].regularPrice=value;
        try { importFarmText(JSON.stringify(bad)); result.invalid=false; } catch (_) {}
      }
      const bad=JSON.parse(farmExportText()); bad.state.town.traveller.offers[0].price++;
      try { importFarmText(JSON.stringify(bad)); result.invalid=false; } catch (_) {}
      const duplicate=JSON.parse(farmExportText()); duplicate.state.town.traveller.offers.push({id:'teaBlend',price:64,regularPrice:80,sold:false});
      try { importFarmText(JSON.stringify(duplicate)); result.invalid=false; } catch (_) {}
      return {...result,specials,ordinary};
    } finally { replaceFarmState(original,runtime); }
  })()`);
  for (const [name, passed] of Object.entries(result)) if (!['specials','ordinary'].includes(name))
    assert.ok(passed, 'Town special offer: '+name+' '+JSON.stringify(result));
  console.log('Town special offers passed: saved quotes, purchase, actual automatic entry, budgets, UI, pause, festivals and validation.');
};
