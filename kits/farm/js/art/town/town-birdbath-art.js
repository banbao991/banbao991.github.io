'use strict';
// Water, bird and splashes belong to the existing dish/support; flight uses the air layer.
function drawTownBirdBathWater(){const {x,y}=TOWN_LAYOUT.birdBath.water,bath=farm.town.birdBath;
  rect(x-8,y-2,16,3,'#b4aa85');
  const width=bath.water*16;
  if(width>.3){rect(x-width/2,y-2,width,3,blendHex('#8eafa6','#dce2d2',seasonTransition().winter));
    if(bath.water>.35)rect(x-4,y-2,5,1,'#d1e0cb');}
}
function drawTownBathBird(){const bird=farm.town.birdBath.bird;if(!bird)return;
  const grounded=['perch','bathe','dry'].includes(bird.mode),nest=TOWN_LAYOUT.birdhouse;
  scenePart('town-bath-wagtail',grounded?nest.y+10:bird.y,()=>{
    ctx.save();try{
      ctx.translate(Math.round(bird.x),Math.round(bird.y));ctx.scale(bird.dir===1?-1:1,1);
      const t=farm.paused?now*7:bird.step,shake=bird.mode==='bathe'?Math.round(Math.sin(t)*1):0;
      rect(5,-2+Math.round(Math.sin(now*2)*1),12,2,'#56665d');rect(9,-1,9,1,'#b6bfb0');
      rect(-6,-6+shake,13,7,'#edead8');rect(-2,-7+shake,10,4,'#89958a');
      rect(-9,-11+shake,8,7,'#ebead7');rect(-7,-12+shake,7,3,'#526158');
      rect(-8,-5+shake,6,3,'#54655b');rect(-13,-7+shake,4,2,'#77816d');rect(-7,-9+shake,2,2,'#354c44');
      if(grounded){rect(-3,1,1,3,'#8c8969');rect(2,1,1,3,'#8c8969');}
      if(!grounded||bird.mode==='bathe'){
        const wing=Math.round(Math.sin(t)*5);rect(-2,-8-wing,10,3,'#bcc7b5');rect(0,-7-wing,6,2,'#76887b');
      }
      if(bird.mode==='bathe')for(let i=0;i<4;i++){
        const wave=(t*.17+i*.25)%1;
        rect(-13+i*8,-3-wave*12,2,2,'#bdd9ca');
      }
    }finally{ctx.restore();}
  },35,grounded?0:1);
}
