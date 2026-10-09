module.exports=function checkTownSocial(run,assert){
  const checks=run(`(() => {
    const originalFarm=farm,originalWorkers=workers;
    const result={story:true,greeting:true,daily:true,pause:true,save:true,work:true,holiday:true};
    try{
      farm=newFarm();farm.day=21;farm.phase=.1;farm.coins=25000;farm.town=makeTownState(21);
      farm.town.budgetMode='off';farm.town.merchantUnlocked=true;townBeginVisit();
      const actor=farm.town.traveller,index=actor.storyIndex,coins=farm.coins;
      result.story=TOWN_STORIES[index].season===seasonIndex();
      Object.assign(actor,{...TOWN_LAYOUT.counter,mode:'shop',cartAttached:false,route:[],index:0});
      result.story &&=townReadStory() && !townReadStory() && farm.coins===coins && actor.storyHeard;
      // Use an actual worker with a preserved task; other residents are far from this isolated spot.
      workers=[{name:'阿满',x:2185,y:930,dir:1,walk:3,action:.4,task:{type:'harvest',index:0}}];
      const task=JSON.stringify(workers[0].task),position=JSON.stringify({x:workers[0].x,y:workers[0].y});
      updateTownGreetings(.1);const notes=farm.town.events.length;
      updateTownGreetings(9);updateTownGreetings(9);
      result.greeting=actor.greetings.names.includes('阿满') && actor.greetings.names.length===1
        && farm.town.events.length===notes && workers[0].waveUntil>now;
      result.work=JSON.stringify(workers[0].task)===task && JSON.stringify({x:workers[0].x,y:workers[0].y})===position;
      farm.paused=true;const frozen=JSON.stringify(farm.town);updateTownGreetings(100);
      result.pause=JSON.stringify(farm.town)===frozen;farm.paused=false;
      const before=JSON.stringify(farm.town);farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});
      result.save=JSON.stringify(farm.town)===before && farm.town.traveller.storyIndex===index && farm.town.traveller.storyHeard;
      farm.day++;updateTownGreetings(.1);
      result.daily=farm.town.traveller.greetings.day===22 && farm.town.traveller.greetings.names.includes('阿满');
      farm.day=30;const holiday=JSON.stringify(farm.town);updateTownGreetings(10);
      result.holiday=JSON.stringify(farm.town)===holiday && !townReadStory();
      return result;
    }finally{farm=originalFarm;workers=originalWorkers;updateUI();}
  })()`);
  for(const [name,passed]of Object.entries(checks))assert.ok(passed,`Town social failed: ${name}`);
  console.log('Town social checks passed: seasonal story, repeat limits, saved greetings, tasks, pause and festival.');
};
