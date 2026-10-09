'use strict';
function drawTownPaperLantern(lantern) {
  const {x,y}=townLanternPosition(lantern),alpha=townLanternOpacity(lantern);
  const colors=['#e1b276','#d39677','#c5bc8c'];
  ctx.save();ctx.globalAlpha=alpha;
  rect(x-9,y-25,18,3,'#b08760');rect(x-12,y-22,24,18,colors[lantern.variant]);
  rect(x-8,y-21,16,16,'#f2d7a0');rect(x-12,y-7,24,4,'#c09565');
  rect(x-9,y-3,18,2,'#8e704e');rect(x-2,y-5,4,5,'#e8a858');
  rect(x-1,y-8-Math.round(Math.sin(now*5+lantern.id)),2,5,'#fff0bf');
  ctx.restore();
}
function drawTownLanterns() {
  for(const lantern of farm.town.lanternEvent.lanterns)
    scenePart(`town-paper-lantern:${lantern.id}`,lantern.y+1,()=>drawTownPaperLantern(lantern),10,lantern.age>0?1:0);
}
function drawTownLanternGlow(night) {
  for(const lantern of farm.town.lanternEvent.lanterns){
    const p=townLanternPosition(lantern);
    drawLightGlow(p.x,p.y-12,30,night*.46*townLanternOpacity(lantern));
  }
}
