'use strict';
// The original keeper greets real foraging birds at a real patrol stop, once a day.
function visitEastPheasants(actor){
 const woods=farm.eastWoods,weather=weatherVisual();
 if(farm.paused||actor!==forestKeeper||actor.mode!=='watching'||isFestivalDay()
   ||farm.phase<.07||farm.phase>=.5||weather.rain>=.3||weather.snow>=.25
   ||woods.keeperVisitDay===farm.day)return false;
 const birds=woods.birds.filter(b=>['forage','rest'].includes(b.mode)&&b.goal==='grass'&&distance(actor,b)<90);
 if(!birds.length)return false;
 for(const bird of birds){bird.dir=actor.x<bird.x?-1:1;bird.wait=Math.max(bird.wait,1.8);bird.waveUntil=now+2.3;}
 actor.waveUntil=now+2.3;woods.keeperVisits++;woods.keeperVisitDay=farm.day;
 record(`阿森沿林间草地来到东缘，停下向${birds.length===2?'两只山雉':'一只山雉'}挥手；小来客转头抖了抖尾羽。`);save();return true;
}
