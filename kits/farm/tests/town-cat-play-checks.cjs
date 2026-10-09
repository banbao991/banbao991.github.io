module.exports=function checkTownCatPlay(run,assert){
 const result=run(`(() => {
  const original=farm,runtime=captureRuntimeState(),result={choice:true,play:true,approach:true,space:true,pause:true,save:true,
    once:true,free:true,click:true,weather:true,night:true,festival:true,depth:true,invalid:true};
  const prepare=()=>{farm=newFarm();farm.day=11;farm.phase=.12;farm.paused=false;farm.weather='sunny';farm.weatherFrom='sunny';
    farm.town.merchantUnlocked=true;farm.town.inventory.petToy=3;resetPlazaLife();
    Object.assign(plazaCats[0],{x:800,y:648,tx:800,ty:648,mode:'groom',path:[],wait:5});
    townPrepareCatToys();farm.town.catPlay.choices=[true,false];};
  const frame=()=>{now+=.05;motionNow+=.05;updatePlazaLife(.05);};
  try{
    prepare();Object.assign(plazaCats[0],{x:850,y:648,tx:850,ty:648});frame();
    result.approach=plazaCats[0].mode!=='play';setPlazaCatGoal(plazaCats[0],farm.town.catPlay.balls[2]);
    for(let i=0;i<50 && plazaCats[0].mode!=='play';i++)frame();
    const yard=TOWN_LAYOUT.catToyYard;
    result.approach &&=plazaCats[0].mode==='play' && inRect(plazaCats[0].x,plazaCats[0].y,yard.left,yard.top,yard.right,yard.bottom);
    prepare();const choices=JSON.stringify(farm.town.catPlay.choices);updateTownCatToys(.05);
    result.choice=JSON.stringify(farm.town.catPlay.choices)===choices;
    frame();result.play=plazaCats[0].mode==='play' && farm.town.catPlay.active===0;
    for(let i=0;i<20;i++)frame();
    result.play &&=farm.town.catPlay.bats>=1 && farm.town.catPlay.balls.some(ball=>ball.x!==TOWN_LAYOUT.catToyYard.spots[ball.id].x);
    const frozen=JSON.stringify({play:farm.town.catPlay,cats:plazaCats});farm.paused=true;updatePlazaLife(2);
    result.pause=frozen===JSON.stringify({play:farm.town.catPlay,cats:plazaCats});farm.paused=false;
    const saved=importFarmText(farmExportText());
    result.save=JSON.stringify(saved.state.town.catPlay)===JSON.stringify(farm.town.catPlay)
      && JSON.stringify(saved.runtime.plazaCats)===JSON.stringify(plazaCats);
    replaceFarmState(saved.state,saved.runtime);
    for(let i=0;i<220 && farm.town.catPlay.active>=0;i++){
      frame();const yard=TOWN_LAYOUT.catToyYard;
      result.space &&=farm.town.catPlay.balls.every(ball=>inRect(ball.x,ball.y,yard.left,yard.top,yard.right,yard.bottom)
        && plazaPetWalkable(ball)) && plazaPetWalkable(plazaCats[0]);
    }
    result.play &&=farm.town.catPlay.sessions===1 && farm.town.catPlay.bats===3 && plazaCats[0].mode==='groom';
    result.free=farm.coins===120 && farm.town.inventory.petToy===3 && farm.town.spentTotal===0;
    const count=farm.town.catPlay.sessions;for(let i=0;i<500;i++)frame();
    result.once=farm.town.catPlay.sessions===count && farm.town.catPlay.done[0];
    farm.town.improvements.catComfort.level=1;
    const ball=farm.town.catPlay.balls[0],items=farmSceneItems();
    result.depth=items.find(item=>item.id==='town-cat-toy:0').y===ball.y+5
      && items.find(item=>item.id==='town-cat-cushion').layer<items.find(item=>item.id==='town-cat-toy:0').layer;
    Object.assign(plazaCats[0],{x:752,y:872});
    Object.assign(plazaCats[1],{x:780,y:617,mode:'home',path:[],wait:15});
    result.click=townDescribe(ball.x,ball.y)?.target===ball;
    prepare();farm.town.catPlay.choices=[false,false];Object.assign(plazaCats[0],{x:752,y:648});plazaCats[1].wait=15;
    result.click &&=handleTownClick(816,648) && plazaCats[0].mode==='move' && farm.town.catPlay.choices[0];
    for(let i=0;i<120 && plazaCats[0].mode!=='play';i++)frame();result.click &&=plazaCats[0].mode==='play';
    prepare();frame();farm.weather='rain';farm.weatherFrom='rain';frame();
    result.weather=farm.town.catPlay.active===-1 && plazaCats[0].mode==='return'
      && farm.town.catPlay.balls.every(ball=>!ball.rolling) && farm.town.catPlay.sessions===0;
    for(let i=0;i<150 && plazaCats[0].mode!=='home';i++)frame();result.weather &&=plazaCats[0].mode==='home';
    prepare();frame();farm.weather='snow';farm.weatherFrom='snow';frame();result.weather &&=farm.town.catPlay.active===-1;
    prepare();frame();farm.phase=.6;frame();result.night=farm.town.catPlay.active===-1 && plazaCats[0].mode==='return';
    prepare();frame();farm.day=20;frame();result.festival=farm.town.catPlay.active===-1 && !townCatPlayAllowed();
    const invalid=JSON.parse(farmExportText());invalid.state.town.catPlay.balls[0].x=10;
    try{importFarmText(JSON.stringify(invalid));result.invalid=false;}catch{}
    return result;
  }finally{replaceFarmState(original,runtime);}
 })()`);
 for(const [name,passed] of Object.entries(result))assert.equal(passed,true,'cat toy '+name);
 console.log('Cat toy checks passed: saved choices, actual batting/chasing, clear space, pause, full restore, daily limits, clicks, rain/snow, night, festival and depth.');
};
