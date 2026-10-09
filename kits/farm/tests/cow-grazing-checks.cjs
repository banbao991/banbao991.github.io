module.exports = function checkCowGrazing(run, assert) {
  const result = run(`(() => {
    const original=JSON.parse(JSON.stringify(farm)), runtime=JSON.parse(JSON.stringify(captureRuntimeState()));
    const answer={};
    try {
      const prepare=()=>{
        replaceFarmState(newFarm()); farm.phase=.2; farm.weather=farm.weatherFrom='sunny';
        workers.forEach(w=>{w.task=null;});
        const day=Array.from({length:8},(_,i)=>i+1).find(day=>hash(day,0,2301)<.6);
        farm.day=day; const c=cows[0];c.tx=c.x;c.ty=c.y;return c;
      };
      let c=prepare(); const point={x:c.x,y:c.y},stock=JSON.stringify(farm.depots),coins=farm.coins,milk=farm.milkTotal;
      updateFarmAnimals(.05); answer.start=cowGrazing(c) && distance(c,point)===0;
      const frozen=JSON.stringify(c);farm.paused=true;updateFarmAnimals(3);updateCowGrazing(c,0,3);
      answer.pause=JSON.stringify(c)===frozen;
      farm.paused=false; updateFarmAnimals(.6);
      const archive=importFarmText(farmExportText()); const current=JSON.stringify(captureRuntimeState());
      answer.halfSave=JSON.stringify(archive.state)===JSON.stringify(farm) && JSON.stringify(archive.runtime)===current;
      replaceFarmState(archive.state,archive.runtime); c=cows[0];const progress=c.grazing.elapsed;
      const before=JSON.stringify({state:farm,runtime:captureRuntimeState()});drawCowFenceFront();cow(c);describe(c.x,c.y);renderCompleteFarmCanvas();
      answer.readOnly=JSON.stringify({state:farm,runtime:captureRuntimeState()})===before && cowActivity(c).includes('吃草');
      for(let i=0;i<120&&cowGrazing(c);i++)updateFarmAnimals(.05);
      answer.complete=!cowGrazing(c)&&c.grazing.total===1&&c.grazing.elapsed===0&&progress>0
        &&distance(c,point)===0&&JSON.stringify(farm.depots)===stock&&farm.coins===coins&&farm.milkTotal===milk;
      // Original wandering may choose a target within its arrival radius before moving again.
      for(let i=0;i<60&&distance(c,point)===0;i++)updateFarmAnimals(.05);
      answer.resume=!cowGrazing(c)&&c.grazing.total===1&&distance(c,point)>0;
      c.tx=c.x;c.ty=c.y;updateFarmAnimals(.05);answer.once=!cowGrazing(c)&&c.grazing.total===1;
      farm.ledgerExpanded=true;updateLedgerUI();answer.ledger=$('ledger-cow-grazing').textContent.includes('奶糖 1');
      c=prepare();updateFarmAnimals(.05);farm.weather=farm.weatherFrom='rain';updateFarmAnimals(.05);
      answer.weather=!cowGrazing(c)&&c.grazing.total===0;
      c=prepare();updateFarmAnimals(.05);workers[0].task={type:'milk',index:0};workers[0].x=c.x;workers[0].y=c.y+12;
      updateFarmAnimals(.05); answer.milking=!cowGrazing(c)&&c.grazing.total===0;
      finishTask(workers[0].task,workers[0]);answer.milking &&=farm.milkTotal===1&&!c.milk&&farm.depots.farm.milk===1;
      c=prepare();updateFarmAnimals(.05);farm.phase=NIGHT_START;updateFarmAnimals(.05);
      answer.night=!cowGrazing(c)&&c.grazing.total===0&&c.tx===742&&c.ty===331;
      for(let i=0;i<500&&distance(c,{x:742,y:331})>4;i++)updateFarmAnimals(.05);
      answer.night &&=distance(c,{x:742,y:331})<=4;
      c=prepare();farm.day=10;updateFarmAnimals(.05);answer.festival=cowGrazing(c)=== (hash(10,0,2301)<.6);
      c=prepare();updateFarmAnimals(.05);const bads=[null,{day:0,elapsed:0,duration:1,total:0},{day:1,elapsed:5,duration:4,total:0},
        {day:1,elapsed:0,duration:8,total:0},{day:1,elapsed:0,duration:0,total:-1}];answer.invalid=true;
      for(const value of bads){const snap=JSON.parse(JSON.stringify(captureRuntimeState()));snap.cows[0].grazing=value;
        try{validateRuntimeSnapshot(snap);answer.invalid=false;}catch(_){}}
      const old=JSON.parse(farmExportText());old.runtime.cows.forEach(c=>{delete c.grazing;});
      const loaded=importFarmText(JSON.stringify(old));replaceFarmState(loaded.state,loaded.runtime);
      answer.legacy=!cows[0].grazing;replaceFarmState(newFarm());answer.reset=cows.every(c=>!c.grazing);
      return answer;
    }finally{replaceFarmState(original,runtime);}
  })()`);
  for (const [key, passed] of Object.entries(result)) assert.ok(passed,'Cow grazing '+key+' '+JSON.stringify(result));
  console.log('Cow grazing passed: real arrival, pause, complete-only counts, milking, weather/night, saves, UI and read-only image.');
};
