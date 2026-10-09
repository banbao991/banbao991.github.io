'use strict';
// Warm, damp banks invite three calls; harsh weather and a real jump take priority.
function nurseryFrogBase(){return {x:NURSERY_FROG_HOME.x+Math.sin(motionNow*.36)*NURSERY_FROG_HOME.range,y:NURSERY_FROG_HOME.y};}
function nurseryFrogContact(){return farm.nursery.frogSong?.position||nurseryFrogBase();}
function wetlandFrogCalling(){return farm.nursery.frogSong?.stage==='call';}
function wetlandFrogSongAllowed(minWetness=.58){const w=weatherVisual();return seasonTransition().winter<.65
 &&farm.nursery.wetness>=minWetness&&farm.phase>=.12&&farm.phase<.62&&w.rain<.70&&w.snow<.1;}
function wetlandFrogSongDescription(){return wetlandFrogCalling()?'青蛙在芦苇边鼓腮鸣叫':'';}
function nurseryFrogHint(){return `湿地青蛙 · ${wetlandFrogCalling()?'在潮湿的芦苇边鼓腮鸣叫':farm.nursery.frogJumpUntil>motionNow?'轻轻跳过浅水':'在芦苇旁歇脚'} · 点击看它跳开`;}
function stopWetlandFrogSong(completed=false){
 const s=farm.nursery.frogSong;if(s?.stage!=='call')return;
 if(completed){s.sessions++;record('青蛙在潮湿的芦苇边鼓起喉囊，完成一段三声的小调。');}
 s.stage='back';s.elapsed=0;save();
}
function greetNurseryFrog(){stopWetlandFrogSong();farm.nursery.frogJumpUntil=motionNow+2;
 record('湿地青蛙从芦苇旁轻轻一跃，落进浅水里。');save();}
function updateWetlandFrogSong(dt){
 if(farm.paused)return;
 const s=farm.nursery.frogSong??=makeWetlandFrogSong(farm.day);
 if(s.day!==farm.day){stopWetlandFrogSong();s.day=farm.day;s.decided=s.stage!=='idle';save();}
 if(s.stage==='back'){
  const target=nurseryFrogBase(),d=distance(s.position,target),step=Math.min(d,14*dt);
  if(d>0){s.position.x+=(target.x-s.position.x)/d*step;s.position.y+=(target.y-s.position.y)/d*step;}
  if(d<=step+1e-8){s.stage='idle';s.position=null;s.elapsed=0;save();}return;
 }
 const quiet=farm.nursery.frogJumpUntil<=motionNow&&wetlandStir()<=0;
 if(s.stage==='call'){
  if(!wetlandFrogSongAllowed(.48)||!quiet){stopWetlandFrogSong();return;}
  s.elapsed=Math.min(4.2,s.elapsed+dt);if(s.elapsed>=4.2)stopWetlandFrogSong(true);return;
 }
 if(s.decided||farm.phase>=.52||!quiet||!wetlandFrogSongAllowed())return;
 s.decided=true;
 if(hash(farm.day,0,1297)<.60*(1-seasonTransition().winter)){
  s.position={...nurseryFrogBase()};s.stage='call';s.elapsed=0;
 }save();
}
function wetlandFrogSongPulse(){
 if(!wetlandFrogCalling())return 0;
 const s=farm.nursery.frogSong,part=s.elapsed%1.4;
 return farm.paused?.35+.45*(.5+.5*Math.sin(now*5)):part<.85?Math.sin(part/.85*Math.PI):0;
}
function wetlandWaterhenListening(bird){return wetlandFrogCalling()&&distance(bird,nurseryFrogContact())<170&&wetlandStir()<=0;}
