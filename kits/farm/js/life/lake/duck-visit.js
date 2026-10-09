'use strict';
function anglerQuietAtPier(){
 return !isFestivalDay()&&!angler.festival&&!angler.routine&&farm.phase<NIGHT_START
  &&distance(angler,ANGLER_PIER)<2&&((angler.fishing?.day===farm.day&&angler.fishing.caught>=angler.fishing.quota)
   ||!farm.fishSpots.length&&!angler.fishing?.targetId);
}
function lakeDuckVisitActive(){return !!angler.duckVisit&&angler.duckVisit.stage!=='idle';}
function lakeDuckVisitHello(){return angler.duckVisit?.stage==='hello';}
function lakeDuckVisitCompanion(duck){return lakeDuckVisitActive()&&lakeDucks.indexOf(duck)!==angler.duckVisit.duck;}
function lakeDuckVisitHint(duck){
 if(!lakeDuckVisitActive())return '在湖里缓缓游动';
 if(lakeDuckVisitCompanion(duck))return '在一旁理羽，等同伴回来';
 return {out:'游向栈桥旁',hello:'在栈桥旁和阿蓼打招呼',back:'游回原来的水面'}[angler.duckVisit.stage];
}
function lakeDuckVisitRouteClear(from,to,other){
 const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy),steps=Math.max(1,Math.ceil(length/4));
 for(let i=0;i<=steps;i++){
  const p={x:from.x+dx*i/steps,y:from.y+dy*i/steps};
  if(!lakeAt(p.x,p.y)||distance(p,other)<52)return false;
 }
 return true;
}
function stopLakeDuckVisit(){
 if(!lakeDuckVisitActive())return false;
 angler.duckVisit.stage='back';angler.duckVisit.wait=0;return true;
}
function updateLakeDuckVisitPlan(dt){
 if(farm.paused)return;
 const plan=angler.duckVisit||(angler.duckVisit=makeLakeDuckVisit()),weather=weatherVisual();
 if(plan.day!==farm.day){stopLakeDuckVisit();plan.day=farm.day;plan.decided=false;}
 if(!anglerQuietAtPier()||farm.phase>=.5||weather.rain>=.45||weather.snow>=.2)stopLakeDuckVisit();
 if(plan.stage==='hello'){
  plan.wait=Math.max(0,plan.wait-dt);
  if(plan.wait===0)plan.stage='back';
 }
 if(plan.stage!=='idle'||plan.decided||!anglerQuietAtPier()||farm.phase<.18||farm.phase>.45
  ||weather.rain>=.1||weather.snow>=.1||seasonTransition().winter>=.65)return;
 const candidates=[0,1].filter(i=>distance(lakeDucks[i],LAKE_DUCK_VISIT_POINT)<140
  &&lakeDuckVisitRouteClear(lakeDucks[i],LAKE_DUCK_VISIT_POINT,lakeDucks[1-i]));
 if(!candidates.length)return;
 plan.decided=true;
 if(hash(farm.day,1211)>=.4)return;
 candidates.sort((a,b)=>distance(lakeDucks[a],LAKE_DUCK_VISIT_POINT)-distance(lakeDucks[b],LAKE_DUCK_VISIT_POINT));
 plan.duck=candidates[0];plan.origin={x:lakeDucks[plan.duck].x,y:lakeDucks[plan.duck].y};plan.stage='out';
}
function updateLakeDuckVisitDuck(duck,dt){
 if(!lakeDuckVisitActive())return false;
 if(lakeDuckVisitCompanion(duck))return true;
 const plan=angler.duckVisit;
 if(plan.stage==='hello')return true;
 const target=plan.stage==='out'?LAKE_DUCK_VISIT_POINT:plan.origin,dx=target.x-duck.x,dy=target.y-duck.y,d=Math.hypot(dx,dy);
 duck.tx=target.x;duck.ty=target.y;
 const step=Math.min(d,18*dt);
 if(d>0){duck.x+=dx/d*step;duck.y+=dy/d*step;if(Math.abs(dx)>.1)duck.dir=dx<0?-1:1;}
 if(d<=step+.001){
  if(plan.stage==='out'){
   plan.stage='hello';plan.wait=2.8;plan.total++;duck.dir=1;
   lakeRipples.push({x:duck.x,y:duck.y,age:0});
   record('阿蓼收起鱼竿，向游到栈桥旁的水鸭挥了挥手。');
  }else{plan.stage='idle';plan.duck=-1;plan.origin=null;plan.wait=0;duck.tx=duck.x;duck.ty=duck.y;duck.wait=1;}
 }
 return true;
}
