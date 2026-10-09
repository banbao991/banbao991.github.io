module.exports=function checkTownTea(run,assert){
  const checks=run(`(() => {
    const originalFarm=farm,originalMiner=miner;
    const result={parcel:true,route:true,save:true,delivery:true,drink:true,pause:true,festival:true,return:true,depth:true};
    try{
      farm=newFarm();farm.day=9;farm.phase=.11;farm.coins=200000;farm.town=makeTownState(9);
      farm.town.budgetMode='off';farm.town.merchantUnlocked=true;farm.town.inventory.teaBlend=4;
      const actor=farm.town.traveller;Object.assign(actor,{...TOWN_LAYOUT.counter,mode:'shop',day:9,stayUntil:10});
      townCommission('teaChimes');const paid=farm.coins;townStartWork(actor);
      result.parcel=actor.carriedTea===2 && farm.town.inventory.teaBlend===2 && farm.town.pavilion.tea===0;
      const travelling=JSON.stringify(farm.town);
      result.save=JSON.stringify(parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))}).town)===travelling;
      for(let i=0;i<500&&farm.town.pavilion.tea===0;i++){
        farm.phase+=.05/DAY_SECONDS;updateTownTraveller(.05);
      }
      result.route=actor.mode==='work' && farm.town.construction?.progress>0;
      result.delivery=farm.town.pavilion.tea===2 && actor.carriedTea===0 && farm.coins===paid;
      townDeliverTeaParcel(actor);result.delivery &&=farm.town.pavilion.tea===2;
      miner=resetMiner();Object.assign(miner,{mode:'teaRest',deliveryDay:9,...MINE_TEA_SEAT});
      updateTownPavilionTea();updateTownPavilionTea();
      result.drink=farm.town.pavilion.tea===1 && farm.town.pavilion.served===1 && farm.town.teaServed===1;
      farm.paused=true;miner.deliveryDay=10;updateTownPavilionTea();result.pause=farm.town.pavilion.tea===1;
      farm.paused=false;farm.day=10;updateTownPavilionTea();result.festival=farm.town.pavilion.tea===1;
      farm.day=11;miner.deliveryDay=11;updateTownPavilionTea();result.drink &&=farm.town.pavilion.tea===0 && farm.town.pavilion.served===2;
      farm.town.pavilion.tea=4;townDeliverTeaParcel(actor);result.delivery &&=farm.town.pavilion.tea===4;
      farm.town.construction=null;Object.assign(actor,{mode:'home',target:'home',route:[],index:0,carriedTea:2});
      townReturnTeaParcel(actor);townReturnTeaParcel(actor);
      result.return=farm.town.inventory.teaBlend===4 && actor.carriedTea===0 && farm.coins===paid;
      actor.carriedTea=2;farm.town.inventory.teaBlend=7;townReturnTeaParcel(actor);
      result.return &&=farm.town.inventory.teaBlend===8 && actor.carriedTea===1;
      const saved=JSON.stringify(farm.town);farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});
      result.save &&=JSON.stringify(farm.town)===saved;
      const item=farmSceneItems().find(item=>item.id==='town-pavilion-tea-box');
      result.depth=item.y===TOWN_LAYOUT.pavilionTea.y+6
        && townDescribe(TOWN_LAYOUT.pavilionTea.x,TOWN_LAYOUT.pavilionTea.y)?.target===TOWN_LAYOUT.pavilionTea;
      return result;
    }finally{farm=originalFarm;miner=originalMiner;updateUI();}
  })()`);
  for(const [name,passed]of Object.entries(checks))assert.ok(passed,`Pavilion tea failed: ${name}`);
  console.log('Pavilion tea checks passed: carried parcel, actual route, arrival, saved stock, per-trip cup, pause, festival and refund.');
};
