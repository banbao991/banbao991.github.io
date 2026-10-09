module.exports=function checkTownHearth(run,assert){
  const result=run(`(()=>{
    const original=farm,result={};
    function setup(day=28){farm=newFarm();farm.day=day;farm.phase=.7;farm.coins=20000;
      farm.town=makeTownState(day);farm.town.merchantUnlocked=true;farm.town.seed=1;
      Object.assign(farm.town.traveller,TOWN_LAYOUT.home.door,{mode:'home'});farm.town.inventory.firewood=4;}
    try{
      setup();const coins=farm.coins;updateTownHearth(.1);
      result.fire=farm.town.hearth.active&&farm.town.hearth.nights===1&&farm.town.inventory.firewood===3
        &&farm.town.hearth.glow>0&&farm.town.hearth.glow<1&&farm.coins===coins;
      for(let i=0;i<30;i++)updateTownHearth(.1);
      result.once=farm.town.hearth.nights===1&&farm.town.inventory.firewood===3&&farm.town.hearth.glow===1;
      const snapshot=importFarmText(farmExportText());result.save=JSON.stringify(snapshot.state.town)===JSON.stringify(farm.town);
      const frozen=JSON.stringify(farm.town);farm.paused=true;now+=3;updateTownHearth(3);
      result.pause=JSON.stringify(farm.town)===frozen;farm.paused=false;
      farm.phase=.96;updateTownHearth(.1);result.fade=!farm.town.hearth.active&&farm.town.hearth.glow>0&&farm.town.hearth.glow<1;
      for(let i=0;i<40;i++)updateTownHearth(.1);result.fade &&=farm.town.hearth.glow===0;
      setup();farm.town.traveller.mode='walk';updateTownHearth(.1);result.arrival=farm.town.hearth.day===0&&farm.town.inventory.firewood===4;
      farm.town.traveller.mode='home';farm.town.traveller.x-=20;updateTownHearth(.1);result.arrival &&=farm.town.hearth.day===0;
      setup(11);updateTownHearth(.1);result.warm=!farm.town.hearth.active&&!townGoodsUseful('firewood');
      setup();farm.town.inventory.firewood=0;updateTownHearth(.1);result.empty=farm.town.hearth.nights===0;
      setup();farm.town.seed=12345;updateTownHearth(.1);const seed=farm.town.seed,chosen=farm.town.hearth.chosen;
      farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});updateTownHearth(.1);
      result.choice=farm.town.seed===seed&&farm.town.hearth.chosen===chosen;
      setup(30);farm.town.traveller.mode='walk';farm.town.traveller.festival={day:30,stage:'home',attending:true,index:0};
      updateTownHearth(.1);result.festival=farm.town.hearth.active;
      setup();farm.phase=.2;Object.assign(farm.town.traveller,TOWN_LAYOUT.counter,{mode:'shop',offers:[{id:'firewood',price:95,sold:false}]});
      farm.town.inventory.firewood=0;result.buy=townBuy('firewood')&&farm.town.inventory.firewood===4&&farm.coins===19905
        &&farm.town.spending.care===95&&!townBuy('firewood');
      const wood=farmSceneItems().find(item=>item.id==='town-firewood');result.depth=wood.layer===0&&wood.y===TOWN_LAYOUT.hearth.wood.y+3;
      result.hint=townDescribe(TOWN_LAYOUT.hearth.wood.x,TOWN_LAYOUT.hearth.wood.y).text.includes('木柴 4/8');
      result.buffer=!townRoadAt(TOWN_LAYOUT.hearth.wood.x,TOWN_LAYOUT.hearth.wood.y,8);
      farm.coins=townReserve();farm.town.traveller.offers[0].sold=false;result.reserve=!townBuy('firewood');
      setup();farm.phase=.2;Object.assign(farm.town.traveller,TOWN_LAYOUT.counter,{mode:'shop',offers:[{id:'firewood',price:95,sold:false}]});
      farm.town.inventory.firewood=0;farm.town.allowance=100;result.auto=townBuy('firewood',true)&&farm.town.seasonSpent===95;
      const old=JSON.parse(JSON.stringify(farm));delete old.town.hearth;delete old.town.inventory.firewood;
      const restored=parseFarmSave({version:1,state:old});result.default=restored.town.hearth.nights===0&&restored.town.inventory.firewood===0;
      const bad=JSON.parse(JSON.stringify(farm));bad.town.hearth.glow=1.1;result.reject=false;
      try{parseFarmSave({version:1,state:bad});}catch(_){result.reject=true;}
      return result;
    }finally{farm=original;updateUI();}
  })()`);
  for(const [key,value]of Object.entries(result))assert.ok(value,'Hearth: '+key+' '+JSON.stringify(result));
  console.log('Hearth passed: actual cold-night home arrival, one fuel, smooth glow, pause/save, seasonal supply, purchases/budget/reserve, festival, depth, hints and defaults.');
};
