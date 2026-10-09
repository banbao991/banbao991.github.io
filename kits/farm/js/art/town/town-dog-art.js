'use strict';
function drawTownDog() {
  if(!townDogVisible())return;
  const dog=farm.town.dog;
  scenePart('town-traveller-dog',dog.y+6,()=>{
    const x=Math.round(dog.x),y=Math.round(dog.y),rest=dog.mode==='rest';
    const tail=Math.round(Math.sin(now*(dog.wagUntil>now?9:3))*3);
    const leg=dog.mode==='walk'&&!farm.paused?Math.round(Math.sin(dog.walk)*2):0;
    rect(x-16,y+4,34,4,'#45694d55');ctx.save();ctx.translate(x,y);ctx.scale(dog.dir,1);
    if(rest){
      drawTownDogRest();
    }else{
      rect(-13,-12,25,13,'#c5a578');rect(-11,-9,12,7,'#e4c59a');rect(-10,0,4,6+leg,'#ad8d62');
      rect(7,0,4,6-leg,'#ad8d62');rect(7,-19,14,15,'#d4b183');rect(8,-19,5,10,'#94724e');
      rect(16,-14,2,2,'#554f42');rect(18,-9,6,5,'#e3c69b');rect(22,-9,3,3,'#675d48');
      rect(8,-4,12,3,'#799b92');rect(-18,-10+tail,7,4,'#d3b484');
    }
    if(rest)rect(-18,-4+Math.round(tail*(dog.wagUntil>now?1:.5)),7,3,'#d3b484');
    ctx.restore();
  },10);
}
