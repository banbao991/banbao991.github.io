'use strict';
function townChimeSway(index){const piece=farm.town.chimes.pieces[index];if(!piece)return 0;
 const weather=weatherVisual(),gust=.6+weather.cloud*.7+weather.rain*.3;
 const touch=clamp((piece.touchedUntil-now)/2.8,0,1);
 return Math.sin(now*1.7+index*1.9)*gust+Math.sin((now-piece.touchedUntil+2.8)*7)*touch*3.2;
}
function drawTownChime(index){
 if(!villageSiteOpen(['traveller','herbs','nursery'][index]))return;
 const piece=farm.town.chimes.pieces[index],growth=townChimeGrowth(index);if(!piece||growth<=.02)return;
 const point=TOWN_LAYOUT.chimes[index],x=point.x,y=point.y,sway=townChimeSway(index),color=TOWN_CHIME_PALETTES[piece.palette].color;
 ctx.save();ctx.globalAlpha*=clamp(growth*3,0,1);
 rect(x-1,y,2,8,'#6e6049');rect(x-3,y-1,6,2,'#b59c73');
 const bx=x+sway*.45,by=y+8;
 if(index===0){rect(bx-6,by,12,4,'#99b3a6');rect(bx-4,by+4,8,5,'#7f9a8d');rect(bx-2,by+9,4,3,'#d4bc84');}
 else if(index===1){rect(bx-3,by,6,3,'#c6a26a');rect(bx-5,by+3,10,6,'#b28859');rect(bx-7,by+9,14,3,'#d3b57f');rect(bx-1,by+12,2,3,'#755b42');}
 else{rect(bx-8,by,16,3,'#b99b6b');for(let i=0;i<3;i++){rect(bx-6+i*5,by+5,3,8+i%2*3,'#a58e60');rect(bx-6+i*5,by+7,3,1,'#d2bd8b');}}
 const length=15*growth,tip=x+sway;
 rect(bx-1,by+13,2,5,'#9e8a63');rect(tip-2,by+18,5,length,color);rect(tip-1,by+20,2,Math.max(0,length-3),'#d9c99b');
 ctx.restore();
}
