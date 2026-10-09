module.exports=function checkTownFodder(run,assert){
 const results=run(`(()=>{
  const original=farm,result={};
  function setup(day=11){farm=newFarm();farm.day=day;farm.phase=.2;farm.coins=80000;farm.weather=farm.weatherFrom='sunny';
   farm.town=makeTownState(day);farm.town.merchantUnlocked=true;farm.town.seed=1;
   farm.town.improvements.donkeyInn={level:3,builtAt:1,stages:[1,1,1],wear:0,agedAt:day,lastCare:0};
   farm.town.inventory.fodder=4;farm.town.donkeys=[0,1].map(id=>({...makeTownDonkey(id),x:2250+id*20,y:1550,mode:'graze',wait:50}));}
  function step(){farm.phase+=.05/DAY_SECONDS;updateTownDonkeys(.05);}
  try{
   setup();const coins=farm.coins;step();result.approach=farm.town.fodder.active>=0&&!farm.town.fodder.eating&&farm.town.inventory.fodder===4;
   const active=farm.town.donkeys[farm.town.fodder.active],rack=TOWN_LAYOUT.fodder.rack;
   let actual=true,saved=false,finished=false,separate=true;
   for(let i=0;i<600;i++){step();const meal=farm.town.fodder;
    if(meal.active>=0)separate&&=farm.town.donkeys.filter(b=>distance(b,TOWN_LAYOUT.fodder.stand)<.01).length<=1;
    if(meal.eating){actual&&=distance(farm.town.donkeys[meal.active],TOWN_LAYOUT.fodder.stand)<.01;
     if(!saved){saved=true;const before=JSON.stringify(farm.town);result.save=JSON.stringify(importFarmText(farmExportText()).state.town)===before;
      farm.paused=true;now+=3;updateTownDonkeys(5);result.pause=JSON.stringify(farm.town)===before;farm.paused=false;
      const item=farmSceneItems().find(item=>item.id==='town-fodder-rack');
      const animal=farmSceneItems().find(item=>item.id==='town-donkey:'+meal.active);
      result.depth=item.layer===0&&item.y===rack.y+12&&animal.y>item.y;
     }
    }
    if(meal.served===2&&meal.active<0&&meal.departing<0){finished=true;break;}
   }
   result.meals=actual&&separate&&saved&&finished&&farm.town.inventory.fodder===2&&farm.coins===coins;
   for(let i=0;i<25;i++)step();result.restSpace=distance(farm.town.donkeys[0],farm.town.donkeys[1])>36;
   for(let i=0;i<35;i++)step();result.daily=farm.town.fodder.served===2;
   result.hint=townDescribe(rack.x,rack.y).text.includes('牧草');
   result.buffer=!townRoadAt(rack.x,rack.y,24)&&rack.x+19<TOWN_LAYOUT.fodder.stand.x-14;
   setup();step();farm.weather=farm.weatherFrom='rain';step();result.rain=farm.town.fodder.active===-1&&farm.town.inventory.fodder===4
    &&farm.town.donkeys.every(animal=>animal.target==='home');
   setup();while(!farm.town.fodder.eating)step();const served=farm.town.fodder.served,wood=farm.town.inventory.fodder;
   farm.phase=.5;step();result.night=farm.town.fodder.active===-1&&farm.town.inventory.fodder===wood&&farm.town.fodder.served===served;
   setup();while(farm.town.fodder.departing<0)step();const departing=farm.town.donkeys[farm.town.fodder.departing];
   farm.weather=farm.weatherFrom='rain';step();result.departureRain=departing.route.some(p=>distance(p,TOWN_LAYOUT.donkeyInn.insideGate)<.01)
    &&departing.route.some(p=>p.x===TOWN_LAYOUT.donkeyInn.northGate.x&&p.y===TOWN_LAYOUT.donkeyInn.yardLaneY);
   setup();farm.town.donkeyVisit={...makeTownDonkeyVisit(),day:11,decided:true,chosen:true,donkey:0,cost:15,stage:'out'};
   step();result.visitor=farm.town.fodder.day===0&&farm.town.donkeys[0].target!=='fodder';
   setup();farm.town.construction={id:'donkeyInn',kind:'care',level:3,progress:0,startedAt:11,cost:500};step();result.build=farm.town.fodder.day===0;
   setup();farm.town.inventory.fodder=0;step();result.empty=farm.town.fodder.day===0&&farm.town.donkeys.every(animal=>animal.target==='pen');
   setup();farm.town.inventory.fodder=1;for(let i=0;i<250;i++)step();result.one=farm.town.fodder.served===1&&farm.town.inventory.fodder===0;
   setup();farm.town.seed=12345;step();const choice=farm.town.fodder.chosen,seed=farm.town.seed;
   farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});scheduleTownFodder();result.choice=farm.town.fodder.chosen===choice&&farm.town.seed===seed;
   setup(10);step();result.festival=farm.town.fodder.active>=0;
   setup();farm.town.inventory.fodder=0;Object.assign(farm.town.traveller,TOWN_LAYOUT.counter,{mode:'shop',offers:[{id:'fodder',price:85,sold:false}]});
   result.buy=townBuy('fodder')&&farm.coins===79915&&farm.town.inventory.fodder===4&&farm.town.spending.care===85&&!townBuy('fodder');
   farm.coins=townReserve();farm.town.traveller.offers[0].sold=false;result.reserve=!townBuy('fodder');
   setup();farm.town.inventory.fodder=0;farm.town.allowance=100;Object.assign(farm.town.traveller,TOWN_LAYOUT.counter,{mode:'shop',offers:[{id:'fodder',price:85,sold:false}]});
   result.auto=townBuy('fodder',true)&&farm.town.seasonSpent===85;
   farm.town.improvements.donkeyInn.level=0;result.unbuilt=!townGoodsUseful('fodder');
   setup();const old=JSON.parse(JSON.stringify(farm));delete old.town.fodder;delete old.town.inventory.fodder;
   result.defaults=parseFarmSave({version:1,state:old}).town.fodder.served===0;
   result.reject=true;for(const mutate of [s=>s.town.fodder.active=2,s=>s.town.fodder.wait=4,s=>s.town.fodder.queue=[0,0],s=>s.town.inventory.fodder=-1]){
    const state=JSON.parse(JSON.stringify(farm));mutate(state);try{parseFarmSave({version:1,state});result.reject=false;}catch(_){}}
   return result;
  }finally{farm=original;updateUI();}
 })()`);
 for(const [key,value]of Object.entries(results))assert.ok(value,'Fodder: '+key+' '+JSON.stringify(results));
 console.log('Fodder passed: actual arrival, sequential meals, once/day, stock/cost, pause/save, weather/home/visitor priorities, festivals, reserve/budget, hints/depth and defaults.');
};
