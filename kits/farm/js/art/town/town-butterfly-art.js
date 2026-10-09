'use strict';
function drawTownButterflies(){
  for(const butterfly of farm.town.butterflies){
    const flower=butterfly.flower>=0?townNectarFlower(Math.floor(butterfly.flower/3),butterfly.flower%3):null;
    const resting=butterfly.mode==='sip';
    scenePart(`town-butterfly:${butterfly.id}`,resting&&flower?flower.depth:butterfly.y,()=>{
      const x=butterfly.x,y=butterfly.y+(resting?0:Math.sin(now*1.3+butterfly.id)*2);
      const wing=farm.paused?now*(resting?1.3:2)+butterfly.id:butterfly.step;
      const width=(resting?2:3)+Math.abs(Math.sin(wing))*(resting?3:4);
      const color=['#e6bd7e','#bba3c4','#e0a68f'][butterfly.variant];
      rect(x-width,y-3,width,6,color);rect(x+2,y-3,width,6,color);
      rect(x-width+1,y-2,2,2,'#efdbb2');rect(x+width-1,y-2,2,2,'#efdbb2');
      rect(x,y-4,2,8,'#80734f');rect(x-1,y-6,1,3,'#80734f');rect(x+3,y-6,1,3,'#80734f');
      if(resting)rect(x+2,y+3,1,2,'#977d51');
    },30,resting?0:1);
  }
}
