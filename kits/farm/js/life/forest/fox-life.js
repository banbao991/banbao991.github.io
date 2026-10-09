'use strict';
let forestFox=makeForestFox();
function resetForestFox(clock=0){forestFox=makeForestFox(clock);}
function foxPosition(){return {x:forestFox.x,y:forestFox.y};}
function forestFoxVisible(){return forestFox.mode!=='home';}
function foxAt(x,y){return forestFoxVisible()&&Math.abs(x-forestFox.x)<34&&y>=forestFox.y-22&&y<=forestFox.y+15;}
function forestFoxSheltering(){const w=weatherVisual();return farm.phase>=NIGHT_START||w.rain>=.72||w.snow>=.4;}
function forestFoxDepartureClear(from,to){
 if(forestGroundClear(from.x,from.y))return forestSegmentClear(from,to);
 // The former sine route sometimes started inside a trunk. Permit only its first exit.
 if(from.x<1135||from.x>1245||from.y<442||from.y>490||riverAt(from.x,from.y,10))return false;
 let clear=false;const steps=Math.max(1,Math.ceil(distance(from,to)/2));
 for(let i=1;i<=steps;i++){
  const safe=forestGroundClear(from.x+(to.x-from.x)*i/steps,from.y+(to.y-from.y)*i/steps);
  if(!safe&&clear)return false;if(safe)clear=true;
 }
 return clear;
}
function forestFoxRoute(from,to){
 let route=forestWalkingRoute(from,to);if(route.length)return route;
 // An old clock-based position can be clear while its rounded grid cell hits a trunk.
 const candidates=[];
 for(const dx of [-16,0,16])for(const dy of [-16,0,16]){
  const p={x:Math.round(from.x/16)*16+dx,y:Math.round(from.y/16)*16+dy};
  if(distance(from,p)<=32&&forestGroundClear(p.x,p.y)&&forestFoxDepartureClear(from,p))candidates.push(p);
 }
 for(const start of candidates.sort((a,b)=>distance(from,a)-distance(from,b))){
  route=forestWalkingRoute(start,to);if(route.length)return route;
 }
 return [];
}
function setForestFoxGoal(point,mode){
 const route=forestFoxRoute(forestFox,point);if(!route.length)return false;
 forestFox.route=route;forestFox.index=0;forestFox.mode=mode;forestFox.wait=0;return true;
}
function moveForestFox(dt){
 const actor=forestFox,target=actor.route[actor.index];if(!target)return true;
 const dx=target.x-actor.x,dy=target.y-actor.y,length=Math.hypot(dx,dy),travel=Math.min(length,dt*(actor.mode==='return'?35:22));
 if(length>0){actor.x+=dx/length*travel;actor.y+=dy/length*travel;if(Math.abs(dx)>.1)actor.dir=dx<0?-1:1;actor.step+=dt*7;}
 if(length<=travel+.01){actor.x=target.x;actor.y=target.y;actor.index++;}
 return actor.index>=actor.route.length;
}
function updateForestFox(dt){
 if(farm.paused)return;const actor=forestFox,home=FOREST_FOX_LAYOUT.home;
 if(actor.day!==farm.day){actor.day=farm.day;actor.napDecided=false;actor.napDone=false;actor.goalNumber=0;
  if(actor.mode==='nap'){actor.mode='sniff';actor.wait=1;} }
 if(forestFoxSheltering()){
  if(distance(actor,home)<.1){actor.mode='home';actor.route=[];actor.index=0;actor.wait=0;return;}
  if(actor.mode!=='return'&&!setForestFoxGoal(home,'return'))return;
  if(moveForestFox(dt)){actor.mode='home';actor.route=[];actor.index=0;save();}return;
 }
 if(actor.mode==='walk'||actor.mode==='return'){
  if(moveForestFox(dt)){actor.mode='sniff';actor.wait=1.4;actor.route=[];actor.index=0;save();}return;
 }
 if(actor.mode==='nap'){
  actor.wait=Math.max(0,actor.wait-dt);
  if(actor.wait===0){actor.napDone=true;actor.napsTotal++;actor.mode='sniff';actor.wait=.8;save();}return;
 }
 if(actor.mode==='sniff'&&(actor.wait=Math.max(0,actor.wait-dt))>0)return;
 if(actor.mode==='sniff'&&!actor.napDecided&&farm.phase>=.18&&farm.phase<.4&&seasonTransition().winter<.7){
  actor.napDecided=true;
  if(hash(farm.day,1151)<.45){actor.mode='nap';actor.wait=4.8;save();return;}save();
 }
 const choices=FOREST_FOX_LAYOUT.spots.filter(p=>distance(actor,p)>24),offset=Math.floor(hash(farm.day,actor.goalNumber++,1152)*choices.length);
 for(let i=0;i<choices.length;i++)if(setForestFoxGoal(choices[(offset+i)%choices.length],'walk'))return;
 actor.mode='sniff';actor.wait=1.4;
}
function forestFoxActivity(){return ({idle:'准备沿林间空地散步',walk:'沿松林空地散步',sniff:'停下闻闻草地',nap:'蜷着尾巴打盹',return:'正走回林间藏身处',home:'在林间藏身处休息'}[forestFox.mode]);}
function greetForestFox(){
 if(!forestFoxVisible())return false;forestFox.waveUntil=now+2;
 if(forestFox.observedDay!==farm.day){forestFox.observedDay=farm.day;
  record(forestFox.mode==='nap'?'你安静看了看打盹的狐狸，它轻轻动了动耳朵。':'狐狸朝你竖了竖耳朵，又低头闻了闻草地。');}
 save();return true;
}
