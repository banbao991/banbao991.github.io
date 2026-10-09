module.exports=(run,assert)=>{
 const result=run(`(()=>{
 const original=farm,runtime=captureRuntimeState(),r={};
 function world(){const rt=captureRuntimeState();delete rt.now;return JSON.stringify({state:farm,runtime:rt});}
 function saved(){const d=importFarmText(farmExportText());return JSON.stringify(d.state)===JSON.stringify(farm)&&JSON.stringify(d.runtime)===JSON.stringify(captureRuntimeState());}
 function setup(){replaceFarmState(newFarm());farm.day=3;farm.phase=.2;farm.coins=600000;prepareFestival();ensureValleyHerbs();spawnForageForDay();spawnFishForDay();const t=farm.town;t.merchantUnlocked=true;t.visits=1;t.allowance=15000;t.season=Math.floor((farm.day-1)/8);Object.assign(t.traveller,{mode:'shop',target:'shop',tier:3,day:3,stayUntil:4});prepareTownPostcard();}
 try{
 setup();const o={...farm.town.postcards.offer},seed=farm.town.seed;
 r.preview=farm.town.postcards.cards.length===0&&!townPostcardWallPoint()&&saved();
 for(let i=0;i<20;i++){prepareTownPostcard();updateUI();renderCompleteFarmCanvas();}r.fixed=JSON.stringify(o)===JSON.stringify(farm.town.postcards.offer)&&seed===farm.town.seed;
 const coins=farm.coins,goods=farm.town.spending.goods;
 r.buy=townBuyPostcard()&&farm.coins===coins-o.price&&farm.town.spending.goods===goods+o.price&&farm.town.postcards.total===1&&saved();
 r.once=!townBuyPostcard()&&farm.coins===coins-o.price;
 const p=farm.town.postcards,c={...p.cards[0]},wall=townPostcardWallPoint();
 r.wall=wall.x===2129&&wall.y===750&&townDescribe(wall.x,wall.y).kind==='postcard';
 const items=farmSceneItems();r.depth=items.filter(i=>i.id==='traveller-home').length===1&&items.find(i=>i.id==='traveller-home').y===TOWN_LAYOUT.home.bottom&&!items.some(i=>i.id.includes('postcard'));
 farm.town.traveller.mode='away';handleTownClick(wall.x,wall.y);updateUI();r.away=!$('town-map-shop').hidden&&townPostcardAlbumOpen&&$('town-map-postcard-buy').hidden;
 closeTownPostcardPanel();r.close=$('town-map-shop').hidden&&!townPostcardAlbumOpen;
 farm.paused=true;const frozen=world();tick(last+50);renderCompleteFarmCanvas();updateTownPostcards();r.readonly=frozen===world();farm.paused=false;
 farm.town.visits++;Object.assign(farm.town.traveller,{mode:'shop',target:'shop',tier:3,day:3});prepareTownPostcard();r.unseen=p.offer.topic!==o.topic;
 const prior=farm.coins;townBuyPostcard();townTurnPostcard(-1);r.browse=farm.coins===prior-p.offer.price&&p.selected===0&&JSON.stringify(c)===JSON.stringify(p.cards[0])&&saved();
 farm.ledgerExpanded=true;updateLedgerUI();r.ui=$('town-postcard-status').textContent.includes('2/32')&&$('ledger-town-postcards').textContent.includes('2 张');
 const empty=JSON.parse(farmExportText());delete empty.state.town.postcards;const old=importFarmText(JSON.stringify(empty));r.old=old.state.town.postcards.total===0&&JSON.stringify(old.state.town.traveller)===JSON.stringify(farm.town.traveller);
 r.reject=true;for(const change of [s=>s.town.postcards.total++,s=>s.town.postcards.spent++,s=>s.town.postcards.selected=32,s=>s.town.postcards.offer.price++,s=>s.town.postcards.cards.push({...s.town.postcards.cards[0]}),s=>s.town.postcards.cards[0].lastVisit=999,s=>s.town.postcards.offer.automatic='yes']){const d=JSON.parse(farmExportText());change(d.state);try{importFarmText(JSON.stringify(d));r.reject=false;}catch(_){}}
 setup();farm.town.postcards.offer.automatic=true;farm.day=4;farm.town.traveller.boughtDay=0;prepareFestival();farm.town.budgetMode='off';r.off=!townBuyPostcard(true)&&farm.town.postcards.total===0;
 farm.town.budgetMode='balanced';farm.town.allowance=0;r.budget=!townBuyPostcard(true);farm.town.allowance=15000;farm.coins=townReserve();r.reserve=!townBuyPostcard(true);
 farm.coins=600000;farm.town.traveller.offers=[{id:'teaBlend',price:100,sold:false}];r.supplies=!townBuyPostcardAutomatically();farm.town.traveller.offers=[];
 const autoPrice=farm.town.postcards.offer.price;updateTownAutomaticShopping();r.auto=farm.town.postcards.total===1&&farm.town.seasonSpent===autoPrice&&farm.town.traveller.boughtDay===4&&!townBuyPostcardAutomatically()&&saved();
 setup();farm.town.postcards.offer.automatic=true;farm.day=4;prepareFestival();farm.town.traveller.offers=[{id:'flowerPot',price:200,sold:false}];r.manual=townBuy('flowerPot')&&farm.town.inventory.flowerPot===1&&farm.town.postcards.total===0;
 setup();farm.town.postcards.offer.automatic=true;r.arrival=!townBuyPostcard(true);farm.day=10;prepareFestival();r.festival=!townBuyPostcard();farm.day=4;prepareFestival();farm.phase=.7;r.night=!townBuyPostcard();farm.phase=.2;farm.town.traveller.mode='rest';r.rest=!townBuyPostcard();
 setup();for(let tier=0;tier<4;tier++){farm.town.visits++;farm.town.traveller.tier=tier;prepareTownPostcard();const q=farm.town.postcards.offer;r['tier'+tier]=q.topic<2+tier*2&&q.price>=TOWN_POSTCARD_PRICES[tier]*.9&&q.price<=TOWN_POSTCARD_PRICES[tier]*1.1;}
 setup();for(let season=0;season<4;season++){farm.day=65+8*season;prepareFestival();for(let i=0;i<8;i++){farm.town.visits++;prepareTownPostcard();if(!townBuyPostcard())throw Error('card capacity purchase');}}r.capacity=farm.town.postcards.cards.length===32&&farm.town.postcards.total===32&&saved();
 farm.day=97;prepareFestival();farm.town.visits++;prepareTownPostcard();const key=farm.town.postcards.offer.topic,first=farm.town.postcards.cards.find(c=>c.topic===key&&c.season===0).day;townBuyPostcard();r.duplicate=farm.town.postcards.cards.length===32&&farm.town.postcards.total===33&&farm.town.postcards.cards.find(c=>c.topic===key&&c.season===0).day===first&&saved();
 return r;
 }finally{closeTownPostcardPanel();replaceFarmState(original,runtime);updateUI();}
 })()`);
 for(const[k,v]of Object.entries(result))assert.ok(v,'Postcard '+k+': '+JSON.stringify(result));
 console.log('Postcards passed: saved visit editions, wealth tiers, payment/once, original supplies and budget/reserve priority, free album after departure, parent wall/depth, pause/PNG/UI, full saves and validation.');
};
