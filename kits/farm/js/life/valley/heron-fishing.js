'use strict';
function heronFishingActive(){return valleyHeron.fishing?.stage!=='idle'&&!!valleyHeron.fishing;}
function heronBeakPoint(){const h=valleyHeron,o=VALLEY_HERON_FISHING.beak;return {x:h.x+o.x,y:h.y+o.y};}
function heronFishingHeadPose(){
 const h=valleyHeron,bend=h.fishing?.bend||0,aim=heronBeakPoint(),nod=pausePulse(h.x,1.4)*(2-bend);
 return {x:(h.x+h.dir*7+1)*(1-bend)+(aim.x+17)*bend,y:(h.y-38)*(1-bend)+(aim.y+1)*bend+nod};
}
function heronFishingHeadHit(x,y){if(!(valleyHeron.fishing?.bend>0))return false;const head=heronFishingHeadPose();return x>=head.x-20&&x<=head.x+7&&y>=head.y-6&&y<=head.y+7;}
function heronFishingActivity(){return {approach:'正走近浅滩的鱼群',watch:'站稳等小鱼游近',dip:'俯身试探水面',return:'收好脖子，沿浅滩返回'}[valleyHeron.fishing?.stage]||'在浅滩觅食';}
function heronFishingSite(){
 const fish=valleyShoal,area=VALLEY_HERON_FISHING.area;
 if(fish.scatter>0||fish.x<211||fish.y<1186||fish.y>1240)return null;
 const spot={x:clamp(fish.x+27,area.left,area.right),y:clamp(fish.y-4,area.top,area.bottom)};
 if(distance(spot,valleyOtter)<40||distance(spot,valleyTurtle)<30)return null;
 const h=valleyHeron;
 for(let i=0;i<=12;i++)if(!valleyLakeAt(h.x+(spot.x-h.x)*i/12,h.y+(spot.y-h.y)*i/12))return null;
 return spot;
}
function heronFishingMove(dt,target,speed){
 const h=valleyHeron,dx=target.x-h.x,dy=target.y-h.y,d=Math.hypot(dx,dy),step=Math.min(d,speed*dt);
 h.tx=target.x;h.ty=target.y;
 if(d>0){h.x+=dx/d*step;h.y+=dy/d*step;if(Math.abs(dx)>.1)h.dir=dx<0?-1:1;}
 return d<=step+.001;
}
function heronFishingReturn(){const p=valleyHeron.fishing;if(!p||p.stage==='idle')return;p.stage='return';p.done=true;p.wait=0;}
function stopHeronFishing(){const p=valleyHeron.fishing;if(!p)return;Object.assign(p,{stage:'idle',spot:null,wait:0,bend:0,done:true});}
function heronFishingBend(time){const t=clamp(time<.5?time/.5:time<.8?1:1-(time-.8)/.6,0,1);return t*t*(3-2*t);}
function updateHeronFishing(dt){
 if(farm.paused)return true;
 const h=valleyHeron,p=h.fishing||(h.fishing=makeHeronFishing()),weather=weatherVisual();
 if(p.day!==farm.day&&p.stage==='idle')Object.assign(p,{day:farm.day,decided:false,chosen:false,done:false,tried:false,wait:0});
 const bad=farm.phase>=.5||weather.rain>=.35||weather.snow>=.2||seasonTransition().winter>=.7;
 if((bad||p.day!==farm.day)&&p.stage!=='idle')heronFishingReturn();
 if(p.stage==='idle'){
  if(!p.decided&&!bad&&farm.phase>=.12&&farm.phase<.38){p.decided=true;p.chosen=hash(farm.day,1217)<.68*(1-seasonTransition().winter);}
  if(!p.chosen||p.done||bad||farm.phase>=.4||h.flap>0)return false;
  const spot=heronFishingSite();if(!spot)return false;
  p.spot=spot;p.stage='approach';p.wait=0;p.bend=0;p.tried=false;h.wait=0;
 }
 if(['approach','watch'].includes(p.stage)&&(valleyShoal.scatter>0||distance(h,valleyOtter)<38))heronFishingReturn();
 if(p.stage==='approach'){
  if(heronFishingMove(dt,p.spot,9)){p.stage='watch';h.dir=-1;h.tx=h.x;h.ty=h.y;p.wait=0;}
 }else if(p.stage==='watch'){
  p.wait=Math.min(6,p.wait+dt);
  if(p.wait>=.8&&distance(heronBeakPoint(),valleyShoal)<28&&valleyShoal.scatter<=0){p.stage='dip';p.wait=0;p.done=true;}
  else if(p.wait>=6)heronFishingReturn();
 }else if(p.stage==='dip'){
  p.wait=Math.min(1.4,p.wait+dt);p.bend=heronFishingBend(p.wait);
  if(p.wait>=.5&&!p.tried){
   p.tried=true;
   if(distance(heronBeakPoint(),valleyShoal)<30&&valleyShoal.scatter<=0&&distance(h,valleyOtter)>=38){
    p.total++;scatterValleyShoal(h);const beak=heronBeakPoint();valleyRipple(beak.x,beak.y);
    record('苍鹭俯身轻啄浅水，小鱼从嘴边散开，又在湖中慢慢聚拢。');
   }
  }
  if(p.wait>=1.4)heronFishingReturn();
 }else if(p.stage==='return'){
  // Raise the neck before walking away, including interrupted half dips.
  if(p.bend>0){p.bend=Math.max(0,p.bend-dt*2.5);return true;}
  if(heronFishingMove(dt,VALLEY_HERON_FISHING.home,12)){stopHeronFishing();h.wait=2;}
 }
 return true;
}
