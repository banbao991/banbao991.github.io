module.exports=function checkEastLayout(run,assert){
  const result=run(`(()=>{
    const original=farm,result={movement:true,saves:true,depth:true};
    try{
      farm=newFarm();farm.day=11;farm.phase=.15;farm.town=makeTownState(11);farm.town.merchantUnlocked=true;
      farm.weather=farm.weatherFrom='sunny';farm.town.budgetMode='off';farm.coins=50000;
      const site=TOWN_LAYOUT.donkeyInn,actor=farm.town.traveller;
      Object.assign(actor,{mode:'shop',target:'shop',...TOWN_LAYOUT.counter});
      result.threshold=townCanCommission('donkeyInn');farm.coins=49999;result.threshold &&=!townCanCommission('donkeyInn');
      farm.coins=50000;result.payment=townCommission('donkeyInn') && farm.coins===47800 && !townCommission('donkeyInn');
      const road=townProjectRoute('donkeyInn');result.route=road.slice(0,-1).every(point=>townRoadAt(point.x,point.y)||distance(point,TOWN_LAYOUT.counter)<.01);
      farm.town.construction=null;Object.assign(actor,{mode:'away',target:'shop'});
      Object.assign(farm.town.improvements.donkeyInn,{level:1,stages:[9],builtAt:9});updateTownDonkeys(.05);
      result.one=farm.town.donkeys.length===1;
      Object.assign(farm.town.improvements.donkeyInn,{level:3,stages:[9,10,11],builtAt:11});updateTownDonkeys(.05);
      result.two=farm.town.donkeys.length===2;
      const seen=new Set();
      for(let i=0;i<1700;i++){
        updateTownDonkeys(.05);
        for(const animal of farm.town.donkeys){seen.add(animal.mode);result.movement &&=animal.x>=site.pen.left+15 && animal.x<=site.pen.right-10
          && animal.y>=site.stable.bottom && animal.y<site.pen.bottom-20;}
        if(i%200===0)result.saves &&=JSON.stringify(parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))}).town)===JSON.stringify(farm.town);
      }
      result.life=seen.has('walk')&&seen.has('graze')&&seen.has('rest');
      const donkey=farm.town.donkeys[0];greetTownDonkey(donkey);const noteCount=farm.town.events.length;greetTownDonkey(donkey);
      result.click=townDescribe(donkey.x,donkey.y)?.target===donkey && donkey.greetedDay===11 && farm.town.events.length===noteCount;
      farm.paused=true;const frozen=JSON.stringify(farm.town);updateTownDonkeys(20);now+=10;
      result.pause=JSON.stringify(farm.town)===frozen;farm.paused=false;
      farm.weather=farm.weatherFrom='rain';for(let i=0;i<800;i++)updateTownDonkeys(.05);
      result.rain=farm.town.donkeys.every(animal=>animal.mode==='home'&&distance(animal,site.doors[animal.id])<.01);
      farm.weather=farm.weatherFrom='sunny';farm.day=20;farm.phase=.2;updateTownDonkeys(.05);
      result.festival=farm.town.donkeys.every(animal=>animal.mode==='walk');
      farm.phase=.65;for(let i=0;i<800;i++)updateTownDonkeys(.05);
      result.night=farm.town.donkeys.every(animal=>animal.mode==='home');
      farm.day=21;farm.phase=.2;for(let i=0;i<800;i++)updateTownDonkeys(.05);
      farm.town.construction={kind:'care',id:'donkeyInn',level:3,cost:1188,startedAt:21.2,progress:0};
      Object.assign(actor,{mode:'work',target:'work',...TOWN_LAYOUT.projects.donkeyInn.work});
      for(let i=0;i<800;i++)updateTownDonkeys(.05);
      result.neighbor=farm.town.donkeys.some(animal=>animal.friendDay===21);
      const items=farmSceneItems();result.depth=new Set(items.map(item=>item.id)).size===items.length;
      for(const animal of farm.town.donkeys){const item=items.find(item=>item.id==='town-donkey:'+animal.id);
        result.depth &&=item.y===animal.y+14 && item.y<items.find(item=>item.id==='town-donkey-south').y;}
      const tea=TOWN_LAYOUT.tea,child=TOWN_LAYOUT.childSeat,seat=TOWN_LAYOUT.merchantSeat;
      result.courtyard=[tea,child,seat].every(point=>!townRoadAt(point.x,point.y)&&point.x+20<TOWN_LAYOUT.cart.left)
        && tea.y+16<938 && child.y+23<938 && seat.y+23<938;
      result.hints=landmarkAt(tea.x,tea.y)==='traveller-yard' && landmarkAt(2180,950)==='traveller-road'
        && landmarkAt(2084,1540)==='mine-ridge' && landmarkAt(2250,1580)==='donkey-inn';
      const before=JSON.stringify(MINE_LAYOUT);result.boundary=MINE_LAYOUT.area.right===2048
        && site.stable.left-TOWN_LAYOUT.ridge.right>=32 && TOWN_LAYOUT.paths.find(path=>path.x===2376).w===32
        && JSON.stringify(MINE_LAYOUT)===before;
      let max=-Infinity;const fill=ctx.fillRect;ctx.fillRect=(x,y,w)=>{max=Math.max(max,x+w);};
      const view={...farm.view};farm.view={x:1600,y:1300,zoom:1};drawMineGround();farm.view=view;ctx.fillRect=fill;
      result.terrain=max<2060;
      result.reject=true;
      for(const mutate of [s=>s.town.donkeys[0].mode='fly',s=>s.town.donkeys[0].x=1828,
        s=>s.town.donkeys[0].route=[{x:1828,y:1550}]]){
        const bad=JSON.parse(JSON.stringify(farm));mutate(bad);
        try{parseFarmSave({version:1,state:bad});result.reject=false;}catch(_){}
      }
      farm.town.construction=null;farm.phase=.27;farm.town.inventory.teaBlend=4;farm.town.selfTea=1;
      Object.assign(actor,{x:2138,y:942,mode:'rest',target:'tea',restDay:farm.day,wait:3,drinking:true,
        route:[{x:2180,y:950},{x:2138,y:950},{x:2138,y:942}],index:3});
      updateTownTraveller(.05);result.oldSeat=actor.mode==='walk'&&actor.target==='shop';
      for(let i=0;i<100&&actor.mode!=='shop';i++)updateTownTraveller(.05);
      result.oldSeat &&=distance(actor,TOWN_LAYOUT.counter)<.01&&farm.town.selfTea===1&&farm.town.inventory.teaBlend===4;
      return result;
    }finally{farm=original;updateUI();}
  })()`);
  for(const [key,value]of Object.entries(result))assert.ok(value,'East courtyard and donkey inn: '+key);
  console.log('East layout passed: clear courtyard, roads, bounded mine terrain, project spending, donkey life, shelter, pause, greetings, depth, hints and saves.');
};
