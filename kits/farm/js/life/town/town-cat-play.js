'use strict';
// Bought yarn balls stay inside the clear plaza corner; cat positions remain in runtime.
function townCatPlayAllowed(){const weather=weatherVisual();return !isFestivalDay() && farm.phase>=.06
  && farm.phase<.46 && weather.rain<.25 && weather.snow<.25;}
function townCatToyBalls(){
  const play=farm.town.catPlay;
  return Array.from({length:farm.town.inventory.petToy},(_,id)=>play.balls[id]
    || {id,...TOWN_LAYOUT.catToyYard.spots[id],rolling:false});
}
function townCatToyAt(x,y){return townCatToyBalls().find(ball=>distance(ball,{x,y})<9) || null;}
function townPrepareCatToys(){
  if(!farm.town.inventory.petToy)return;
  const play=farm.town.catPlay;let changed=false;
  while(play.balls.length<farm.town.inventory.petToy){const id=play.balls.length,point=TOWN_LAYOUT.catToyYard.spots[id];
    play.balls.push({id,...point,tx:point.x,ty:point.y,rolling:false});changed=true;}
  if(play.day!==farm.day){
    if(play.active>=0)finishTownCatPlay(false);
    Object.assign(play,{day:farm.day,choices:[0,1].map(index=>hash(farm.day,index,935)<.45),done:[false,false]});changed=true;
  }
  if(changed)save();
}
function updateTownCatToys(dt){
  if(farm.paused)return;
  townPrepareCatToys();const play=farm.town.catPlay;
  if(!townCatPlayAllowed()){
    if(play.active>=0)finishTownCatPlay(false);
    return;
  }
  for(const ball of play.balls)if(ball.rolling){
    const length=Math.hypot(ball.tx-ball.x,ball.ty-ball.y),travel=Math.min(length,65*dt);
    if(length>0){ball.x+=(ball.tx-ball.x)/length*travel;ball.y+=(ball.ty-ball.y)/length*travel;}
    ball.rolling=length>travel+.01;
  }
}
function townCatToyDestination(cat){
  const play=farm.town.catPlay,index=plazaCats.indexOf(cat);
  if(!townCatPlayAllowed() || play.active>=0 || !play.choices[index] || play.done[index])return null;
  return play.balls.find(ball=>plazaCats.every(other=>other===cat || distance(ball,other)>38)) || null;
}
function finishTownCatPlay(completed){
  const play=farm.town.catPlay,cat=plazaCats[play.active];
  if(!cat)return;
  play.done[play.active]=true;
  for(const ball of play.balls){ball.rolling=false;ball.tx=ball.x;ball.ty=ball.y;}
  if(cat.mode==='play'){cat.mode='groom';cat.wait=4;cat.action=0;cat.path=[];}
  play.active=-1;play.ball=-1;play.wait=0;
  if(completed){play.sessions++;townNote(cat.name+'把毛线球拨了三下，追累了，坐下来洗洗脸。');}
  save();
}
function updateTownCatPlay(cat,index,dt,shelter){
  const play=farm.town.catPlay;
  if(play.active===index){
    if(shelter || !townCatPlayAllowed() || cat.mode!=='play'){finishTownCatPlay(false);return false;}
    const ball=play.balls[play.ball];cat.action+=dt;
    if(distance(cat,ball)>18){movePlazaPet(cat,ball,dt,52);play.wait=0;return true;}
    cat.dir=ball.x<cat.x?-1:1;
    if(ball.rolling)return true;
    play.wait+=dt;if(play.wait<.65)return true;
    if(play.bats>=3){finishTownCatPlay(true);return true;}
    const yard=TOWN_LAYOUT.catToyYard,others=plazaCats.filter(other=>other!==cat);
    const choices=[yard.left+4,(yard.left+yard.right)/2,yard.right-4]
      .flatMap(x=>[yard.top+4,(yard.top+yard.bottom)/2,yard.bottom-4].map(y=>({x,y})))
      .filter(point=>distance(point,ball)>26 && others.every(other=>distance(point,other)>32)
        && play.balls.every(other=>other===ball || distance(point,other)>10));
    if(!choices.length){play.wait=.65;return true;}
    const target=choices[Math.floor(townRandom()*choices.length)];
    ball.tx=target.x;ball.ty=target.y;ball.rolling=true;play.wait=0;play.bats++;
    cat.tx=target.x;cat.ty=target.y;return true;
  }
  if(shelter || !townCatPlayAllowed() || play.active>=0 || !play.choices[index] || play.done[index]
    || ['home','return'].includes(cat.mode))return false;
  const yard=TOWN_LAYOUT.catToyYard;
  if(!inRect(cat.x,cat.y,yard.left,yard.top,yard.right,yard.bottom))return false;
  const ball=play.balls.find(item=>distance(cat,item)<26
    && plazaCats.every(other=>other===cat || distance(item,other)>38));
  if(!ball)return false;
  Object.assign(play,{active:index,ball:ball.id,bats:0,wait:0});
  Object.assign(cat,{mode:'play',path:[],action:0,tx:ball.x,ty:ball.y});save();return true;
}
function inviteTownCatPlay(ball){
  townPrepareCatToys();
  const play=farm.town.catPlay;
  if(!townCatPlayAllowed() || play.active>=0){record('毛线球先留在这里，晴朗白天、猫咪有空时再招呼它们。');return false;}
  const cats=plazaCats.map((cat,index)=>({cat,index})).filter(({cat,index})=>plazaCatVisible(cat)
    && cat.mode!=='return' && !play.done[index]).sort((a,b)=>distance(a.cat,ball)-distance(b.cat,ball));
  const chosen=cats[0];
  if(chosen){finishPlazaCatCompany();if(townCatWaterCat(chosen.cat))finishTownCatWater();}
  if(!chosen || !setPlazaCatGoal(chosen.cat,ball)){record('猫咪今天玩够了，或者正在猫屋里歇脚。');return false;}
  play.choices[chosen.index]=true;record(chosen.cat.name+'听见毛线球轻响，沿广场空地过来看看。');save();return true;
}
