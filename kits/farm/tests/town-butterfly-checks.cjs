module.exports=function checkTownButterflies(run,assert){
 const result=run(`(()=>{
  const original=farm,results={};
  function setup(day=11){farm=newFarm();farm.day=day;farm.phase=.1;farm.weather=farm.weatherFrom='sunny';
   farm.town=makeTownState(day);farm.town.merchantUnlocked=true;farm.town.inventory.butterflySeed=2;
   farm.town.plantings.butterflySeed=[0,0];farm.town.seed=1;}
  function step(){farm.phase+=.05/DAY_SECONDS;updateTownButterflies(.05);}
  try{
   setup();const money=farm.coins,feed=farm.town.inventory.birdFeed;updateTownButterflies(.05);
   results.arrival=farm.town.butterflies.length===3&&farm.town.butterflies.every(b=>b.mode==='fly'&&distance(b,b.target)>1);
   results.scatter=new Set(farm.town.butterflies.map(b=>Math.floor(b.flower/3))).size===3;
   let held=null,validPositions=true,changedCluster=false;
   for(let i=0;i<1500&&farm.town.butterflies.length;i++){
    step();for(const b of farm.town.butterflies){
     if(b.mode==='sip'){
      const flower=townNectarFlower(Math.floor(b.flower/3),b.flower%3);
      validPositions&&=distance(b,{x:flower.x,y:flower.y-2})<.01;
      if(!held){held=b;results.depth=farmSceneItems().find(item=>item.id==='town-butterfly:'+b.id).layer===0
        &&farmSceneItems().find(item=>item.id==='town-butterfly:'+b.id).y===flower.depth;
       results.hint=townDescribe(b.x,b.y).text.includes('吸蜜');
       const state=JSON.stringify(farm.town),snapshot=importFarmText(farmExportText());results.save=JSON.stringify(snapshot.state.town)===state;
       farm.paused=true;now+=3;updateTownButterflies(5);results.pause=JSON.stringify(farm.town)===state;farm.paused=false;
       handleTownClick(b.x,b.y);handleTownClick(b.x,b.y);results.observe=farm.town.observations.butterfly===1;
      }
     }
     if(b.sips&&b.mode==='fly')changedCluster||=Math.floor(b.flower/3)!==Math.floor(b.lastFlower/3);
    }
   }
   results.flow=validPositions&&changedCluster&&farm.town.nectar.sips===9&&!farm.town.butterflies.length;
   updateTownButterflies(.05);results.daily=!farm.town.butterflies.length;
   results.noCharge=farm.coins===money&&farm.town.inventory.birdFeed===feed;
   setup();farm.town.plantings.butterflySeed=[farm.day+farm.phase,farm.day+farm.phase];updateTownButterflies(.05);
   results.sprout=farm.town.nectar.day===0&&!farm.town.butterflies.length;
   setup();farm.town.plantings.butterflySeed=[farm.day+farm.phase,0];updateTownButterflies(.05);
   results.onlyBloom=farm.town.butterflies.every(b=>b.flower%3===1);
   setup();updateTownButterflies(.05);const start=farm.town.butterflies[0],pos={x:start.x,y:start.y};
   farm.weather=farm.weatherFrom='rain';updateTownButterflies(.05);
   results.rain=start.mode==='leave'&&distance(start,pos)<=38*.05+.001&&farm.town.nectar.sips===0;
   for(let i=0;i<400;i++)updateTownButterflies(.05);farm.weather=farm.weatherFrom='sunny';updateTownButterflies(.05);
   results.rainDaily=!farm.town.butterflies.length;
   setup(28);updateTownButterflies(.05);results.winter=!farm.town.butterflies.length;
   setup(10);updateTownButterflies(.05);results.festival=farm.town.butterflies.length===3;
   setup();updateTownButterflies(.05);farm.phase=.46;updateTownButterflies(.05);results.evening=farm.town.butterflies.every(b=>b.mode==='leave');
   setup();updateTownButterflies(.05);const old=JSON.parse(JSON.stringify(farm));delete old.town.nectar;delete old.town.observations.butterfly;
   for(const b of old.town.butterflies)for(const key of ['home','flower','lastFlower','sips','noticed'])delete b[key];
   const restored=parseFarmSave({version:1,state:old});results.defaults=restored.town.nectar.sips===0&&restored.town.butterflies.every(b=>b.home&&b.flower===-1);
   results.reject=true;
   for(const mutate of [s=>s.town.butterflies[0].flower=24,s=>s.town.butterflies[0].sips=4,s=>s.town.butterflies[0].noticed=1,
    s=>s.town.nectar.day=s.day+1,s=>s.town.butterflies[1].id=s.town.butterflies[0].id]){
    const state=JSON.parse(JSON.stringify(farm));mutate(state);try{parseFarmSave({version:1,state});results.reject=false;}catch(_){}}
   return results;
  }finally{farm=original;updateUI();}
 })()`);
 for(const [key,value]of Object.entries(result))assert.ok(value,'Butterfly: '+key+' '+JSON.stringify(result));
 console.log('Butterflies passed: actual flower heads, distinct clusters, three nectar stops, real arrival/departure, once/day, weather/season, pause/save, observation, depth and defaults.');
};
