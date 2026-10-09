'use strict';
function drawTownPaperBoats() {
  for(const b of farm.town.paperBoats.boats)scenePart('river-paper-boat',b.y+4,()=>{
    const x=Math.round(b.x),y=Math.round(b.y+Math.sin(now*2+b.color)*.8);
    ctx.save();ctx.globalAlpha=Math.min(1,(8-b.age)/3);
    rect(x-13,y+5,25,2,'#b9d7c5');rect(x-8,y+1,17,3,['#d9b188','#b6c1a7','#d4b5ac'][b.color]);
    rect(x-6,y-2,13,4,'#f0ddbc');rect(x-4,y-5,9,3,'#ead1a5');rect(x-2,y-8,5,5,'#f5e7c9');
    rect(x,y-6,2,7,'#c4aa7f');ctx.restore();
  });
}
function drawTownFoldingBoat(x,y) {
  if(farm.town.paperBoats.visit.stage!=='fold')return;
  const bob=Math.round(Math.sin(now*4));
  rect(x-8,y+2+bob,17,4,'#efdbb8');rect(x-3,y-1+bob,8,5,'#f5e7c9');rect(x-11,y+3+bob,4,3,'#f0cba7');
}
