'use strict';
// Each ball uses its own ground contact, including its rolled position in a full-map PNG.
function drawTownCatToys(){
  for(const ball of townCatToyBalls())scenePart('town-cat-toy:'+ball.id,ball.y+5,()=>{
    const x=Math.round(ball.x),y=Math.round(ball.y);
    rect(x-6,y+3,12,3,'#586b4540');
    circle(x,y,5,ball.id%2?'#bd8e8e':'#c9af73');
    rect(x-1,y-4,2,8,'#ead9b2');rect(x-5,y-1,9,2,'#ead9b2');
    if(ball.rolling){rect(x-3,y-3,5,1,'#f0dfbb');rect(x+3,y+2,3,1,'#b48c65');}
  });
}
