module.exports=function checkFlowerCare(run,assert){
  const result=run(`(()=>{
    const original=farm,result={route:true,saves:true};
    try{
      farm=newFarm();farm.day=11;farm.phase=.14;farm.coins=100000;farm.town=makeTownState(11);
      farm.town.merchantUnlocked=true;farm.town.budgetMode='off';farm.town.inventory.flowerPot=3;
      farm.town.plantings.flowerPot=[11,11,11];farm.weather=farm.weatherFrom='sunny';
      const actor=farm.town.traveller;Object.assign(actor,{mode:'shop',target:'shop',...TOWN_LAYOUT.counter,day:11,stayUntil:13});
      townPrepareFlowerCare();farm.town.flowerCare.pots.forEach(pot=>pot.damp=.2);
      const coins=farm.coins;result.start=townStartFlowerVisit() && !townStartFlowerVisit();
      const stages=new Set();let travelled=0;
      for(let i=0;i<350&&farm.town.flowerCare.visit.stage!=='done';i++){
        updateTownTraveller(.05);stages.add(farm.town.flowerCare.visit.stage);travelled++;
        const cart=TOWN_LAYOUT.cart;result.route &&=!inRect(actor.x,actor.y,cart.left,cart.top,cart.right,cart.bottom)
          && !inRect(actor.x,actor.y,TOWN_LAYOUT.home.left,TOWN_LAYOUT.home.top,TOWN_LAYOUT.home.right,TOWN_LAYOUT.home.bottom);
        if(i%25===0)result.saves &&=JSON.stringify(parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))}).town)===JSON.stringify(farm.town);
      }
      result.complete=stages.has('water') && stages.has('back') && farm.town.flowerCare.visit.stage==='done'
        && farm.town.flowerCare.waterings===3 && farm.town.flowerCare.pots.every(pot=>pot.damp===1&&pot.boost===.08)
        && distance(actor,TOWN_LAYOUT.counter)<.01 && farm.coins===coins && travelled>30;
      result.once=!townStartFlowerVisit(true);
      const growth=townPlantGrowth('flowerPot',0);result.boost=growth>0 && growth<1;
      farm.phase+=.2;updateTownFlowerCare(1);const dry=farm.town.flowerCare.pots[0].damp;
      farm.phase+=.2;farm.weather=farm.weatherFrom='rain';updateTownFlowerCare(1);
      result.weather=dry<1 && farm.town.flowerCare.pots[0].damp>dry;
      farm.paused=true;const paused=JSON.stringify(farm.town);updateTownFlowerCare(5);updateTownTraveller(5);now+=3;
      result.pause=JSON.stringify(farm.town)===paused;farm.paused=false;
      farm.day=12;farm.phase=.14;farm.weather=farm.weatherFrom='sunny';
      Object.assign(actor,{mode:'shop',target:'shop',...TOWN_LAYOUT.counter});farm.town.flowerCare.pots.forEach(pot=>pot.damp=.1);
      townStartFlowerVisit();for(let i=0;i<15;i++)updateTownTraveller(.05);
      farm.weather=farm.weatherFrom='rain';updateTownTraveller(.05);
      result.cancel=farm.town.flowerCare.visit.stage==='back';
      for(let i=0;i<250&&actor.mode!=='shop';i++)updateTownTraveller(.05);
      result.cancel &&=distance(actor,TOWN_LAYOUT.counter)<.01 && farm.town.flowerCare.waterings===3;
      farm.day=20;farm.phase=.1;updateTownTraveller(.05);
      result.festival=!!actor.festival && farm.town.flowerCare.visit.stage!=='water';
      const bad=JSON.parse(JSON.stringify(farm));bad.town.flowerCare.pots[0].damp=2;
      result.reject=false;try{parseFarmSave({version:1,state:bad});}catch(_){result.reject=true;}
      return result;
    }finally{farm=original;updateUI();}
  })()`);
  for(const [key,value]of Object.entries(result))assert.ok(value,'Morning flower care: '+key);
  console.log('Flower care passed: real watering route, moisture, gradual boost, one daily trip, pause, rain cancellation, festival and saves.');
};
