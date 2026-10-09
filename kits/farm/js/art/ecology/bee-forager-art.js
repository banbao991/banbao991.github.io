'use strict';
function beeHiveActivityAlpha() {
  return clamp((farm.phase-.02)/.04,0,1)*clamp((.54-farm.phase)/.08,0,1)
    *clamp(1-seasonTransition().winter/.55,0,1)*(1-weatherVisual().rain)*(1-weatherVisual().snow);
}
function drawBeeForager() {
  if(farm.upgrades<2)return;
  const b=farm.beeForager,air=b.stage==='out'||b.stage==='back';
  const fade=b.stage==='idle'?beeHiveActivityAlpha():1;
  if(fade<=0)return;
  scenePart('bee-forager',b.y+3,()=>{
    const x=Math.round(b.x),y=Math.round(b.y),wing=Math.round(Math.sin(now*17));
    ctx.save();ctx.globalAlpha=fade;
    rect(x-2,y-3+wing,3,3,'#f0e7c2');rect(x+2,y-3-wing,3,3,'#f5eac9');
    rect(x-3,y,7,4,'#e5bf60');rect(x-1,y,2,4,'#6c6345');rect(x+3,y+1,2,2,'#605b43');
    if(b.stage==='back'&&b.elapsed>=1.8)rect(x-3,y+4,2,2,'#b99552');ctx.restore();
  },0,air?1:0);
}
