'use strict';
function drawForestFox(){
 if(!forestFoxVisible())return;const actor=forestFox,x=Math.round(actor.x),y=Math.round(actor.y),dir=actor.dir;
 if(sceneQueue)return scenePart('fox',actor.y+13,drawForestFox);
 const nap=actor.mode==='nap',moving=['walk','return'].includes(actor.mode),sniff=actor.mode==='sniff';
 const breath=Math.sin(now*2+x)*.6,leg=moving?Math.sin(actor.step)*2:0;
 ctx.save();ctx.translate(x,y);ctx.scale(dir,1);
 rect(-24,9,47,4,'#3d614e77');
 if(nap){
  rect(-17,-4+breath,33,13,'#c97f52');rect(-18,4,30,6,'#b47751');
  rect(5,-6+breath,15,12,'#d58e5a');rect(7,-11+breath,5,6,'#8b5b42');
  rect(15,0+breath,5,1,'#473e37');rect(-17,1+breath,22,8,'#b47751');rect(-18,2+breath,8,7,'#f4debb');
 }else{
  const dip=sniff?2+Math.sin(now*3)*.6:0;
  rect(-10,-9,23,19,'#c97f52');rect(9,-16+dip,17,17,'#d58e5a');
  rect(7,-19+dip,5,8,'#8b5b42');rect(20,-19+dip,5,8,'#8b5b42');rect(21,-7+dip,3,3,'#473e37');
  rect(-27,-4+Math.sin(now*2.3)*1.2,19,9,'#b47751');rect(-32,-6+Math.sin(now*2.3)*1.2,9,9,'#f4debb');
  rect(-7,7+leg,5,6,'#8b5b42');rect(7,7-leg,5,6,'#8b5b42');
 }
 if(now<actor.waveUntil)rect(8,-24+breath,3,3,'#f1d4a3');ctx.restore();
}
