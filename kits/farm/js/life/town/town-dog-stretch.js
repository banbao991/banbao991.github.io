'use strict';
// Use a real pause in the original dog's day, without extra travel or waiting.
function townDogStretchConditions(){const d=farm.town.dog,w=weatherVisual(),yard=TOWN_LAYOUT.dogYard;
 return d.present&&d.mode==='rest'&&d.target==='yard'&&!isFestivalDay()
  &&farm.town.traveller.mode!=='away'&&farm.town.traveller.target!=='leave'
  &&farm.phase>=.12&&farm.phase<.4&&w.rain<.25&&w.snow<.25&&seasonTransition().winter<.6
  &&inRect(d.x,d.y,yard.left,yard.top,yard.right,yard.bottom);
}
function townDogStretchActive(){return farm.town.dogStretch.remaining>0&&townDogStretchConditions();}
function townDogStretchPose(){
 const active=townDogStretchActive(),s=farm.town.dogStretch,clock=farm.paused?now:1.8-s.remaining;
 const amount=active?(farm.paused ? .65+.15*Math.sin(clock*2) : Math.sin(clamp(clock/1.8,0,1)*Math.PI)):0;
 return {amount,reach:Math.round(amount*7),head:Math.round(amount*3)};
}
function updateTownDogStretch(dt){
 if(farm.paused)return;
 const s=farm.town.dogStretch,d=farm.town.dog;
 if(s.day!==farm.day)Object.assign(s,{day:farm.day,decided:false,chosen:false,started:false,remaining:0});
 if(s.remaining>0){
  if(!townDogStretchConditions()||d.wait+1e-8<s.remaining){s.remaining=0;return;}
  s.remaining=Math.max(0,s.remaining-dt);
  if(s.remaining===0){s.total++;s.lastDay=farm.day;townNote('豆豆在驿屋草地上伸出前爪，舒舒服服地伸了个懒腰，又继续自己的散步。');save();}
  return;
 }
 if(s.started||!townDogStretchConditions()||d.wait<2.1+dt||d.wagUntil>now)return;
 if(!s.decided){s.decided=true;s.chosen=hash(farm.day,d.visit,1543)<.5*(1-seasonTransition().winter);save();}
 if(s.chosen){s.started=true;s.remaining=1.8;save();}
}
