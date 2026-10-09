'use strict';
// Paper keeps its original season and edition; it does not recolor with the current world.
function drawTownPostcard(target,c){
 const block=(x,y,w,h,color)=>{target.fillStyle=color;target.fillRect(x,y,w,h);};
 block(0,0,96,60,'#e9d9b9');if(!c)return;
 const sky=['#bdcfbb','#b3c9bf','#d2bc9b','#c3d0cc'][c.season];
 const grass=['#91ad78','#8da377','#bdab74','#d2d7c8'][c.season];
 const tree=['#709065','#688565','#a47e59','#91a99a'][c.season];
 block(5,5,86,46,sky);block(5,31,86,20,grass);block(73,10,7,7,c.season===3?'#e4e5d3':'#e8cf91');
 for(let i=0;i<3;i++)block(12+i*25,13+(i%2)*5,13,2,'#e0dfc9');
 const cabin=(x,y)=>{block(x,y,17,15,'#d6b78b');block(x-2,y-3,21,5,'#a47955');block(x+3,y-6,11,4,'#b78e63');block(x+4,y+4,4,5,'#8ca79b');block(x+11,y+6,4,9,'#957858');};
 const pine=(x,y)=>{block(x-1,y,2,13,'#8a7757');block(x-7,y-4,14,7,tree);block(x-5,y-10,10,7,tree);block(x-3,y-14,6,6,tree);};
 if(c.topic===0){for(let y=27;y<51;y+=4)block(5+Math.round(Math.sin(y*.15)*3),y,86,4,'#8dacac');cabin(16,28);block(44,32,27,5,'#bd9d73');for(let x=44;x<73;x+=7)block(x,26,2,10,'#927a56');}
 if(c.topic===1){cabin(16,28);cabin(48,31);block(35,43,4,8,'#cfba8b');for(const x of [23,60]){block(x,18,5,1,'#647d69');block(x+5,19,3,1,'#647d69');}}
 if(c.topic===2){block(5,36,86,15,'#88a9ac');block(48,31,30,8,'#c4b58b');block(56,16,9,19,'#e2d1aa');block(54,13,13,5,'#9f8159');block(57,12,7,3,'#dbb176');block(58,22,3,3,'#7d9a95');}
 if(c.topic===3){cabin(56,28);for(let i=0;i<18;i++){const x=10+i%6*7,y=36+Math.floor(i/6)*5;block(x,y,1,5,'#7d9665');block(x-1,y-1,3,3,['#d3a189','#dfbe85','#b0a3b2'][i%3]);}}
 if(c.topic===4){cabin(44,30);for(const [x,y]of [[17,35],[30,32],[76,39]])pine(x,y);}
 if(c.topic===5){block(9,25,27,13,'#a4a890');block(17,20,11,7,'#b4b69d');block(58,23,10,22,'#cfbc92');block(54,21,18,4,'#a3835f');block(46,30,34,3,'#e3d4ad');block(61,18,3,26,'#e3d4ad');block(59,28,7,7,'#957b57');}
 if(c.topic===6){block(5,34,86,17,'#85a5a7');cabin(12,23);cabin(34,25);block(43,36,34,4,'#bb9d73');block(65,41,17,4,'#8f795b');block(73,30,1,12,'#967c54');block(74,30,6,7,'#e6d7b6');}
 if(c.topic===7){block(5,31,86,20,'#d8dfd4');cabin(41,29);block(39,26,21,3,'#e4e8dc');pine(20,37);pine(76,39);}
 for(let i=0;i<5;i++)block(8+i*17,47,5,1,c.season===3?'#e8eade':'#aebe91');
 block(70,53,17,3,c.tier===3?'#c5ab6e':'#b49b77');block(10,54,32,1,'#baaa87');
 const stamp=c.visit%5;for(let i=0;i<=stamp;i++)block(72+i*3,54,1,1,'#8d795c');
}
function drawTownPostcardWall(){const point=townPostcardWallPoint();if(!point)return;
 const p=farm.town.postcards,c=p.cards[p.selected];ctx.save();ctx.translate(point.x-8,point.y-5);ctx.scale(1/6,1/6);drawTownPostcard(ctx,c);ctx.restore();
 rect(point.x-1,point.y-7,2,3,'#a4865d');
}
