'use strict';
// Main farm livestock, workers and front fence painting.
function cow(c){
  const x=Math.round(c.x),y=Math.round(c.y),grazing=cowGrazing(c),leg=grazing?0:Math.round(Math.sin(c.step)*3);
  const head=y+(grazing?13+Math.round(Math.sin(now*4+c.x)):0);
  rect(x-27,y+21,59,7,'#65794d66');
  rect(x-21,y+5,6,20+leg,'#e8e2d0');rect(x+10,y+5,6,20-leg,'#e8e2d0');
  rect(x-26,y-17,51,31,'#f7eddb');rect(x-20,y-13,20,16,'#5c5548');rect(x+6,y-4,14,12,'#5c5548');
  rect(x+14,head-19,20,24,'#f7eddb');rect(x+13,head-26,9,9,'#eee1cc');rect(x+28,head-24,9,9,'#eee1cc');
  rect(x+21,head-6,15,8,'#dcac9e');rect(x+23,head-3,2,2,'#8e6860');rect(x+31,head-3,2,2,'#8e6860');
  rect(x+20,head-14,3,3,'#3d4137');rect(x+30,head-14,3,3,'#3d4137');
  if(grazing){rect(x+26,y+17,2,5,'#6b8952');rect(x+29,y+16,2,4,'#83985b');}
  rect(x-31,y-13,7,3,'#efdfc9');rect(x-35,y-16+Math.sin(now*2)*3,5,3,'#5c5548');
  rect(x-3,y+9,12,8,'#dfa99e');
  if(c.milk){circle(x+32,head-27,4,'#f9e8bd');}
}

function chicken(c){
  if(farm.phase>=NIGHT_START && c.x<192 && c.y<89)return;
  const x=Math.round(c.x),y=Math.round(c.y),eating=chickenEating(c),leg=eating?0:Math.sin(c.step)>0?2:0;
  const head=y+(eating?11+Math.round(Math.sin(now*7)):0);
  rect(x-8,y+10,17,3,'#5d774a66');rect(x-7,y-6,15,14,c.color);rect(x-2,head-10,10,9,c.color);
  rect(x+6,head-4,6,3,'#d4964e');rect(x+3,head-8,2,2,'#3d4034');
  rect(x-3,head-12,3,4,'#ca6959');rect(x+1,head-13,3,5,'#d77b64');
  rect(x-9,y-3,5,7,'#d5bb90');rect(x-3,y+8,2,5+leg,'#b68b58');rect(x+4,y+8,2,5-leg,'#b68b58');
  if (farm.paused) rect(x-8,y-3+pausePulse(x,2.8)*2,8,5,'#e5d1ab');
}

function drawCowFenceFront() {
  for (let x = 21; x <= 29; x++) {
    if (x < 29) {
      rect(x*T+8,17*T+8,32,4,'#d0ad7c');
      rect(x*T+8,17*T+20,32,4,'#b7875d');
    }
    fencePost(x*T+4,17*T);
  }
}

function worker(w){
  const celebrating=isFestivalDay() && w.festival?.stage==='gather';
  const gesture=celebrating?festivalGesture(w):null;
  const x=Math.round(w.x),y=Math.round(w.y+(gesture?.bounce||0));
  const leg=celebrating?gesture.leg:Math.round(Math.sin(w.walk)*3);
  const cheer=gesture?.cheer||0;
  rect(x-9,y+19,20,5,'#536c4b66');
  rect(x-6,y+10,5,(gesture?.seated?7:12)+leg,'#4c5c5c');rect(x+3,y+10,5,(gesture?.seated?7:12)-leg,'#4c5c5c');
  if(w.facing==='up'){
    rect(x-9,y-2,18,15,w.shirt);
    rect(x-13,y-1-(celebrating?gesture.raise+cheer:w.gardenTending?3:0),5,11,'#dfb28b');
    rect(x+9,y-1+(celebrating?-gesture.raise+cheer:w.gardenTending?3:0),5,11,'#dfb28b');
    rect(x-7,y-17,14,16,'#9a7050');
    rect(x-9,y-16,18,10,'#76563f');
    rect(x-10,y-20,20,7,w.hat);
    rect(x-6,y+8,12,3,'#6f604a');
    if(farm.paused&&!celebrating)rect(x+9,y+2+pausePulse(x,2)*3,5,9,'#dfb28b');
    return;
  }
  rect(x-9,y-2,18,15,w.shirt);
  rect(x-13,y+(celebrating?-gesture.raise-cheer:w.gardenTending?8:1),5,11,'#dfb28b');
  rect(x+9,y+(celebrating?-gesture.raise+cheer:w.handRaise!==undefined?-w.handRaise:now<(w.waveUntil||0)?-14:w.gardenTending?8:1),5,11,'#dfb28b');
  rect(x-7,y-17,14,16,'#e8bc94');rect(x-10,y-20,20,6,w.hat);rect(x-13,y-16,26,4,'#b28d5f');
  rect(x+(w.dir>0?3:-4),y-10,2,2,'#4a473c');rect(x-4,y+8,8,3,'#6f604a');
  if (farm.paused&&!celebrating&&w.handRaise===undefined) rect(x+9,y+2+pausePulse(x,2)*3,5,9,'#dfb28b');
  if(celebrating)drawFestivalProp(x,y,w);
  if(w.task?.type==='water'&&w.action>0){rect(x+12,y+5,9,8,'#7d9b94');rect(x+21,y+6,5,3,'#7d9b94');rect(x+28,y+12,3,3,'#a9c9ba');}
}
