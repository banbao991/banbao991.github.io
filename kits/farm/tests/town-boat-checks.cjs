module.exports=function checkTownBoats(run,assert) {
  const result=run(`(() => {
    const original=JSON.parse(JSON.stringify(farm)),runtime=captureRuntimeState(),r={};
    try {
      const prepare=()=>{
        replaceFarmState(newFarm());farm.day=3;farm.phase=.14;farm.coins=100000;
        farm.weather=farm.weatherFrom='sunny';farm.town.merchantUnlocked=true;
        farm.town.allowance=1000;farm.town.budgetMode='balanced';
        villageWalker.y=VILLAGE_WALKER_LAYOUT.promenade.y;return farm.town.paperBoats;
      };
      let s=prepare();farm.coins=19999;r.threshold=!townCanInviteBoat();
      farm.coins=20000;r.quote=townBoatPrice()===18;farm.coins=100000;r.quote&&=townBoatPrice()===35;
      farm.coins=500000;r.quote&&=townBoatPrice()===60;farm.coins=100000;
      const money=farm.coins; r.start=townInviteBoat(true)&&farm.coins===money&&s.visit.cost===35;
      const route=JSON.stringify(s.visit.route),v=s.visit;let safe=true,walk=true;
      for(let i=0;i<600&&v.stage==='out';i++){
        const previous={x:villageWalker.x,y:villageWalker.y};updateVillageWalker(.05);
        walk&&=distance(villageWalker,previous)<=VILLAGE_STROLL_SPEED*.05+.001;
        safe&&=courierRoadAt(villageWalker.x,villageWalker.y,2);
        safe&&=!MARKET_LAYOUT.stalls.some(stall=>inRect(villageWalker.x,villageWalker.y,stall.x-11,822,stall.x+129,939));
        if(v.stage==='out')safe&&=farm.coins===money;
      }
      r.arrival=safe&&walk&&v.stage==='fold'&&distance(villageWalker,TOWN_LAYOUT.paperBoat.bridge)<.01
        &&farm.coins===money-35&&s.spent===35&&farm.town.spending.outings===35&&farm.town.seasonSpent===35;
      updateVillageWalker(.6);const half=importFarmText(farmExportText());
      r.half=JSON.stringify(half.state)===JSON.stringify(farm)&&JSON.stringify(half.runtime)===JSON.stringify(captureRuntimeState());
      replaceFarmState(half.state,half.runtime);s=farm.town.paperBoats;
      farm.paused=true;const frozen=JSON.stringify({state:farm,runtime:captureRuntimeState()});
      updateTownBoatVisit(5);updateTownPaperBoats(5);drawTownFoldingBoat(villageWalker.x,villageWalker.y);renderCompleteFarmCanvas();
      r.pause=JSON.stringify({state:farm,runtime:captureRuntimeState()})===frozen;
      farm.paused=false;for(let i=0;i<50&&s.visit.stage==='fold';i++)updateVillageWalker(.05);
      r.launch=s.launched===1&&s.boats.length===1&&s.visit.stage==='watch'&&farm.coins===money-35;
      updateTownPaperBoats(1.5);let b=s.boats[0],point={x:b.x,y:b.y};r.flow=riverAt(b.x,b.y)&&b.y===1051;
      const coin=farm.coins;townObservePaperBoat(b);townObservePaperBoat(b);
      r.observe=s.observed===1&&farm.coins===coin&&townPaperBoatAt(b.x,b.y)===b;
      const current=JSON.stringify({state:farm,runtime:captureRuntimeState()});drawMiniMap();describe(b.x,b.y);renderCompleteFarmCanvas();
      r.readOnly=JSON.stringify({state:farm,runtime:captureRuntimeState()})===current;
      const queue=farmSceneItems();r.depth=queue.find(item=>item.id==='river-paper-boat')?.y===b.y+4;
      const floated=importFarmText(farmExportText());r.floatSave=JSON.stringify(floated.state)===JSON.stringify(farm);
      updateTownPaperBoats(3);r.flow&&=b.y>point.y&&riverAt(b.x,b.y)&&Math.abs(b.x-riverCenterAt(b.y))<1;
      updateTownPaperBoats(4);r.expire=s.boats.length===0;
      for(let i=0;i<1000&&s.visit.stage!=='home';i++)updateVillageWalker(.05);
      r.home=s.visit.stage==='home'&&villageWalkerAtHome()&&!villagerAt(villageWalker.x,villageWalker.y);
      farm.day=4;const home={x:villageWalker.x,y:villageWalker.y};updateVillageWalker(.05);
      r.nextMorning=distance(villageWalker,home)>0&&distance(villageWalker,home)<3&&!townCanInviteBoat();
      farm.ledgerExpanded=true;updateLedgerUI();r.ledger=$('ledger-town-boats').textContent==='1 只 / 1 只 / 35 金'
        &&$('ledger-town-outings').textContent==='0 次 / 0 金';
      s=prepare();townInviteBoat(true);farm.town.allowance=0;
      for(let i=0;i<600&&s.visit.stage==='out';i++)updateVillageWalker(.05);
      r.budget=s.visit.stage==='back'&&!s.visit.paid&&s.spent===0&&s.boats.length===0;
      s=prepare();townInviteBoat();farm.coins=townReserve()+34;
      for(let i=0;i<600&&s.visit.stage==='out';i++)updateVillageWalker(.05);
      r.reserve=!s.visit.paid&&s.spent===0;
      s=prepare();townInviteBoat();farm.weather=farm.weatherFrom='rain';updateVillageWalker(.05);
      r.rain=s.visit.stage==='back'&&!s.visit.paid&&s.spent===0;
      s=prepare();townInviteBoat();farm.phase=NIGHT_START;updateVillageWalker(.05);
      for(let i=0;i<1000&&s.visit.stage!=='home';i++)updateVillageWalker(.05);
      r.night=s.visit.stage==='home'&&villageWalkerAtHome()&&!s.visit.paid;
      s=prepare();townInviteBoat();farm.day=10;updateVillageWalker(.05);
      r.festival=s.visit.stage==='done'&&villageWalker.festival?.day===10&&!townCanInviteBoat();
      prepare();farm.town.childVisit={day:3,stage:'tea',route:[],index:0,wait:0};r.busy=!townCanInviteBoat();
      farm.town.childVisit=null;farm.town.budgetMode='off';r.manual=townCanInviteBoat()&&!townCanInviteBoat(true);
      const old=JSON.parse(farmExportText());delete old.state.town.paperBoats;
      r.legacy=importFarmText(JSON.stringify(old)).state.town.paperBoats.launched===0;
      r.invalid=true;
      for(const change of [x=>x.visit.wait=3,x=>x.visit.day=4,x=>x.spent=100,x=>x.observed=1,
        x=>x.visit.stage='fold',x=>x.boats=[{x:0,y:1021,age:0,day:3,color:0,noticed:false}]]){
        const bad=JSON.parse(farmExportText());change(bad.state.town.paperBoats);
        try{importFarmText(JSON.stringify(bad));r.invalid=false;}catch(_){}
      }
      return r;
    }finally{replaceFarmState(original,runtime);}
  })()`);
  for(const [key,passed]of Object.entries(result))assert.ok(passed,'Paper boat '+key+' '+JSON.stringify(result));
  console.log('Paper boats passed: actual road/bridge arrival, quote/payment, river flow, pause/full saves, homes/festivals, observations and budget.');
};
