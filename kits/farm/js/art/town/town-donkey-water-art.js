'use strict';
function drawTownDonkeyTroughWater(x,y){
 const b=farm.town.donkeyWater,water=b.ready?b.water:.75;
 rect(x-15,y+1,30,3,'#a59c79');
 if(water>.01){const width=Math.max(2,Math.round(30*water));rect(x-15,y+1,width,3,'#8bb6af');
  if(b.stage==='drink')rect(x-10+Math.round(Math.sin(now*3)*2),y+1,Math.min(9,width),1,'#d4e2c5');
 }
}
