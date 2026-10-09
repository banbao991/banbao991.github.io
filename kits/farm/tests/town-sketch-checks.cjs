module.exports=function checkTownSketch(run,assert) {
  const result=run(`(() => {
    const original=farm,result={},pictures=['town-sketch-picture','town-map-sketch-picture'].map(id=>({node:$(id),getter:$(id).getContext}));
    for(const entry of pictures)entry.node.getContext=()=>({save(){},restore(){},setTransform(){},fillRect(){}});
    function setup(){
      farm=newFarm();farm.day=11;farm.phase=.29;farm.coins=200000;farm.weather=farm.weatherFrom='sunny';
      farm.town=makeTownState(11);farm.town.merchantUnlocked=true;farm.town.budgetMode='off';
      farm.town.inventory.sketchbook=1;farm.town.seed=1;
      Object.assign(farm.town.traveller,TOWN_LAYOUT.merchantSeat,{mode:'rest',day:11,wait:3.2});
    }
    function roundTrip(){const before=JSON.stringify(farm.town);farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});return JSON.stringify(farm.town)===before;}
    try {
      setup();updateTownSketchUI();result.emptyReader=$('town-sketch-picture').hidden&&$('town-map-sketch-picture').hidden;
      const actor=farm.town.traveller,coins=farm.coins,positions=JSON.stringify(actor);
      updateTownSketch(.2);
      result.realPlaces=farm.town.sketch.seen.join(',')==='yard'&&farm.town.sketch.pending.topic==='yard';
      result.gradual=farm.town.sketch.pending.progress>0&&farm.town.sketch.pending.progress<1&&!farm.town.sketch.pages.length;
      result.noRouteFee=JSON.stringify(actor)===positions&&farm.coins===coins;
      result.partialSave=roundTrip();
      farm.paused=true;const frozen=JSON.stringify(farm.town);now+=2;
      updateTownSketch(2);drawTownSketching(farm.town.traveller);drawTownCartSketch();updateTownSketchUI();
      result.pause=JSON.stringify(farm.town)===frozen;
      farm.paused=false;farm.weather=farm.weatherFrom='rain';updateTownSketch(3);
      result.rain=JSON.stringify(farm.town)===frozen&&!townSketchDrawing();
      result.rainSave=roundTrip();farm.weather=farm.weatherFrom='sunny';
      Object.assign(farm.town.traveller,TOWN_LAYOUT.home.door,{mode:'home'});updateTownSketch(3);
      result.home=!townSketchDrawing()&&!farm.town.sketch.pages.length;
      Object.assign(farm.town.traveller,TOWN_LAYOUT.merchantSeat,{mode:'rest'});
      farm.day=20;updateTownSketch(3);result.festival=!townSketchDrawing()&&!farm.town.sketch.pages.length;
      farm.day=21;updateTownSketch(.2);result.resumed=farm.town.sketch.pending.progress>.2;
      const palette=JSON.stringify(farm.town.sketch.pending.palette);
      for(let i=0;i<10;i++)updateTownSketch(.2);
      result.completed=farm.town.sketch.pages.length===1&&!farm.town.sketch.pending
        &&farm.town.sketch.pages[0].day===11&&farm.town.sketch.pages[0].finished===21
        &&JSON.stringify(farm.town.sketch.pages[0].palette)===palette;
      const done=JSON.stringify(farm.town),seed=farm.town.seed;updateTownSketch(5);updateTownSketchUI();townSketchDescription();
      result.noReroll=JSON.stringify(farm.town)===done&&farm.town.seed===seed;
      result.fullSave=roundTrip();
      setup();farm.town.inventory.sketchbook=0;updateTownSketch(2);
      result.noBook=farm.town.sketch.seen.includes('yard')&&!farm.town.sketch.pending&&farm.town.sketch.day===0;
      const sites=townSketchSites();Object.assign(farm.town.traveller,sites.bridge.point,{mode:'walk'});updateTownSketch(.2);
      Object.assign(farm.town.traveller,sites.pavilion.point);updateTownSketch(.2);
      Object.assign(farm.town.traveller,sites.donkeys.point);updateTownSketch(.2);
      result.unbuilt=!farm.town.sketch.seen.includes('donkeys');
      farm.town.improvements.donkeyInn.level=1;updateTownSketch(.2);
      result.sites=farm.town.sketch.seen.length===4;
      setup();Object.assign(farm.town.traveller,{mode:'shop'});updateTownSketch(2);
      result.notSeated=!farm.town.sketch.pending;
      Object.assign(farm.town.traveller,TOWN_LAYOUT.merchantSeat,{mode:'rest'});
      farm.town.construction={id:'catComfort'};updateTownSketch(2);
      result.work=!farm.town.sketch.pending;farm.town.construction=null;
      farm.town.teaParty.stage='out';updateTownSketch(2);result.party=!farm.town.sketch.pending;
      setup();farm.town.seed=12345;updateTownSketch(.1);
      const choice=JSON.stringify(farm.town.sketch),choiceSeed=farm.town.seed;updateTownSketch(0);
      result.failedSaved=!farm.town.sketch.pending&&farm.town.sketch.day===11&&JSON.stringify(farm.town.sketch)===choice&&farm.town.seed===choiceSeed;
      setup();const p={topic:'yard',season:1,day:11,finished:11,palette:{from:1,to:1,amount:0}};
      farm.town.sketch={...makeTownSketch(),day:11,seen:['yard','bridge'],pages:[p,{...p,topic:'bridge'}],selected:0};
      const seedBefore=farm.town.seed;result.turn=townTurnSketchPage(1)&&farm.town.sketch.selected===1
        &&townTurnSketchPage(1)&&farm.town.sketch.selected===0&&townTurnSketchPage(-1)&&farm.town.sketch.selected===1
        &&farm.town.seed===seedBefore&&farm.coins===200000&&roundTrip();
      const book=townSketchBookPoint();result.hit=townDescribe(book.x,book.y).kind==='sketchbook'
        &&handleTownClick(book.x,book.y)&&!$('town-map-shop').hidden;
      Object.assign(farm.town.traveller,{cartAttached:true,x:2250,y:950});
      const moving=townSketchBookPoint(),cart=townCartPosition();
      result.moving=moving.x===cart.x+TOWN_LAYOUT.sketchOffset.x&&moving.y===cart.y+TOWN_LAYOUT.sketchOffset.y;
      setup();updateTownSketch(.2);const lap=townSketchBookPoint(),items=farmSceneItems();
      result.depth=lap.open&&townDescribe(lap.x,lap.y).kind==='sketchbook'
        &&items.find(i=>i.id==='town-traveller').y===actorDepth(farm.town.traveller)
        &&!items.some(i=>i.id.includes('sketch'));
      setup();farm.town.sketch.seen=[...TOWN_SKETCH_TOPICS];
      for(const day of [2,3,4,5,11,12,13,14,19,21,22,23,26,27,28,29]) {
        farm.day=day;farm.town.seed=1;updateTownSketch(2);
      }
      result.capacity=farm.town.sketch.pages.length===16&&new Set(farm.town.sketch.pages.map(p=>p.topic+':'+p.season)).size===16&&roundTrip();
      const fullSeed=farm.town.seed;farm.day=31;updateTownSketch(2);
      result.finishedAlbum=!farm.town.sketch.pending&&farm.town.sketch.pages.length===16&&farm.town.seed===fullSeed;
      setup();farm.town.inventory.sketchbook=0;Object.assign(farm.town.traveller,TOWN_LAYOUT.counter,{mode:'shop'});
      farm.town.traveller.offers=[{id:'sketchbook',price:1680,sold:false}];
      result.purchase=townBuy('sketchbook')&&farm.coins===198320&&farm.town.inventory.sketchbook===1
        &&farm.town.spending.goods===1680&&!townBuy('sketchbook')&&!townGoodsUseful('sketchbook');
      setup();farm.town.inventory.sketchbook=0;farm.coins=townReserve()+1679;
      Object.assign(farm.town.traveller,TOWN_LAYOUT.counter,{mode:'shop',offers:[{id:'sketchbook',price:1680,sold:false}]});
      result.reserve=!townBuy('sketchbook');farm.coins=200000;farm.town.budgetMode='balanced';farm.town.allowance=1679;
      result.budget=!townBuy('sketchbook',true);farm.town.allowance=1680;
      result.budget &&=townBuy('sketchbook',true)&&farm.town.seasonSpent===1680;
      setup();updateTownSketch(.2);const valid=JSON.parse(JSON.stringify(farm));
      result.invalid=true;for(const mutate of [s=>s.town.sketch.pending.progress=1,s=>s.town.sketch.seen=['yard','yard'],
        s=>s.town.sketch.pending.topic='lake',s=>s.town.sketch.pending.palette.amount=-.1,
        s=>s.town.sketch.selected=0,s=>s.town.inventory.sketchbook=0,s=>s.town.inventory.sketchbook=2,
        s=>s.town.sketch.pending.day=12,s=>s.town.sketch.day=0,s=>s.town.sketch.pending.season=3,s=>s.town.sketch.pages=[{...s.town.sketch.pending,finished:10}]]) {
        const bad=JSON.parse(JSON.stringify(valid));mutate(bad);
        try{parseFarmSave({version:1,state:bad});result.invalid=false;}catch(_){}
      }
      const legacy=JSON.parse(JSON.stringify(farm));delete legacy.town.sketch;delete legacy.town.inventory.sketchbook;
      const old=parseFarmSave({version:1,state:legacy});result.defaults=JSON.stringify(old.town.sketch)===JSON.stringify(makeTownSketch())&&old.town.inventory.sketchbook===0;
      return result;
    }finally{farm=original;for(const entry of pictures)entry.node.getContext=entry.getter;updateUI();}
  })()`);
  for(const [key,value]of Object.entries(result))assert.ok(value,'Town sketch failed: '+key);
  console.log('Sketchbook passed: real places, gradual drawing, partial/full saves, pause/weather/festival/home/party/work, no rerolls, page browsing, parent depth, moving cart and purchases.');
};
