'use strict';
function turtleBaskCorridor(actor=valleyTurtle){
 if(!['climb','bask','descend'].includes(actor.bask?.stage))return false;
 const a=VALLEY_TURTLE_BASK.water,b=VALLEY_TURTLE_BASK.rock,dx=b.x-a.x,dy=b.y-a.y;
 const t=clamp(((actor.x-a.x)*dx+(actor.y-a.y)*dy)/(dx*dx+dy*dy),0,1);
 return Math.hypot(actor.x-a.x-dx*t,actor.y-a.y-dy*t)<.01;
}
function turtleBasking(){return valleyTurtle.bask?.stage==='bask';}
function turtleBaskOnLand(){return ['climb','bask','descend'].includes(valleyTurtle.bask?.stage)&&!valleyLakeAt(valleyTurtle.x,valleyTurtle.y);}
function turtleBaskActivity(){
 return {approach:'正游向岸边',climb:'慢慢爬上岸石',bask:'在暖石上晒背',descend:'沿岸石爬回水边',swimBack:'重新游回湖里'}[valleyTurtle.bask?.stage]||'缓慢巡游';
}
function turtleBaskMove(dt,target,speed){
 const turtle=valleyTurtle,dx=target.x-turtle.x,dy=target.y-turtle.y,d=Math.hypot(dx,dy);
 turtle.tx=target.x;turtle.ty=target.y;
 const step=Math.min(d,speed*dt);
 if(d>0){turtle.x+=dx/d*step;turtle.y+=dy/d*step;if(Math.abs(dx)>.1)turtle.dir=dx<0?-1:1;}
 return d<=step+.001;
}
function updateTurtleBask(dt){
 if(farm.paused)return true;
 const turtle=valleyTurtle,plan=turtle.bask||(turtle.bask=makeTurtleBask()),site=VALLEY_TURTLE_BASK;
 if(plan.day!==farm.day){plan.day=farm.day;plan.decided=false;}
 const weather=weatherVisual(),bad=farm.phase>=.48||weather.rain>=.4||weather.snow>=.2;
 if(bad&&['approach','climb','bask'].includes(plan.stage)){
  plan.wait=0;plan.stage=plan.stage==='approach'?'idle':'descend';
 }
 if(plan.stage==='idle'){
  if(!plan.decided&&farm.phase>=.14&&farm.phase<=.25&&weather.rain<.1&&weather.snow<.1&&seasonTransition().winter<.65){
   plan.decided=true;
   if(hash(farm.day,1171)<.55*(1-seasonTransition().winter)){plan.stage='approach';turtle.wait=0;}
  }
  if(plan.stage==='idle')return false;
 }
 if(plan.stage==='approach'&&turtleBaskMove(dt,site.water,14))plan.stage='climb';
 else if(plan.stage==='climb'&&turtleBaskMove(dt,site.rock,8)){
  plan.stage='bask';plan.wait=5.2;turtle.tx=turtle.x;turtle.ty=turtle.y;turtle.dir=1;
 }else if(plan.stage==='bask'){
  // A click briefly tucks the head; the basking clock resumes after the old hide action.
  if(turtle.hide<=0)plan.wait=Math.max(0,plan.wait-dt);
  if(plan.wait===0){plan.total++;plan.stage='descend';}
 }else if(plan.stage==='descend'&&turtleBaskMove(dt,site.water,8)){
  plan.stage='swimBack';valleyRipple(turtle.x,turtle.y);
 }else if(plan.stage==='swimBack'&&turtleBaskMove(dt,site.inside,14)){
  plan.stage='idle';turtle.wait=1.5;turtle.tx=turtle.x;turtle.ty=turtle.y;
 }
 return true;
}
