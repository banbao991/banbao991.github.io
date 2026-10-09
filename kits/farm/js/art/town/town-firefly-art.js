'use strict';
function townFireflyGlow(fly) { return (.28+.72*Math.pow((Math.sin(now*1.8+fly.id*2.3)+1)/2,2))*fly.fade; }
function drawTownFireflies() {
  for(const fly of farm.town.fireflies)scenePart(`town-firefly:${fly.id}`,fly.y,()=>{
    const glow=townFireflyGlow(fly),x=Math.round(fly.x),y=Math.round(fly.y-5);
    ctx.save();ctx.globalAlpha=fly.fade;
    rect(x-1,y-2,2,3,'#788866');rect(x-3,y-1,2,1,'#b7caa0');rect(x+1,y-1,2,1,'#b7caa0');
    ctx.globalAlpha=glow;rect(x-1,y+1,3,2,'#e2e6a1');ctx.restore();
  },10,1);
}
function drawTownFireflyLight(night) {
  for(const fly of farm.town.fireflies)drawLightGlow(fly.x,fly.y-4,11,night*.28*townFireflyGlow(fly));
}
