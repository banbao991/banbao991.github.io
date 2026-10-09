'use strict';
// Chimney/window stay attached to the house; smoke alone belongs to the air layer.
function drawTownHearthChimney(){const {x,y}=TOWN_LAYOUT.hearth.chimney;
  rect(x-4,y-12,10,29,'#977e68');rect(x-6,y-14,14,4,'#b8a08a');
  rect(x-3,y-6,7,2,'#bfa58c');rect(x-3,y+4,7,2,'#bfa58c');
}
function drawTownHearthWindow(){const amount=farm.town.hearth.glow;if(amount<.001)return;
  const home=TOWN_LAYOUT.home,x=home.left+26,y=home.top+66;
  ctx.save();try{ctx.globalAlpha=amount;
    rect(x,y,19,18,'#d3a76c');rect(x+2,y+10,15,6,'#eac079');
    rect(x+5,y+10-Math.round((Math.sin(now*3)+1)*2),4,6,'#f2d697');
    rect(x+8,y-1,3,20,'#c8ad7b');
  }finally{ctx.restore();}
}
function drawTownHearth(){const town=farm.town,site=TOWN_LAYOUT.hearth;
  if(!town.merchantUnlocked||!villageSiteOpen('traveller'))return;
  if(town.inventory.firewood)scenePart('town-firewood',site.wood.y+3,()=>{
    const count=Math.ceil(town.inventory.firewood/2);
    for(let i=0;i<count;i++){const x=site.wood.x+(i%2)*10,y=site.wood.y-Math.floor(i/2)*5;
      rect(x-9,y-5,12,5,'#91714f');rect(x-8,y-4,10,2,'#b89a70');rect(x+1,y-4,3,3,'#d0b58a');}
  });
  if(town.hearth.glow>.01)scenePart('town-hearth-smoke',site.chimney.y-14,()=>{
    ctx.save();try{
      for(let i=0;i<3;i++){
        const age=(now*.16+i/3)%1;
        ctx.globalAlpha=town.hearth.glow*(1-age)*.22;
        const x=site.chimney.x+Math.sin(now*.6+i)*4+age*10,y=site.chimney.y-16-age*35;
        rect(x,y,5+age*6,4+age*5,'#d5d6c0');
      }
    }finally{ctx.restore();}
  },0,1);
}
function drawTownHearthGlow(night){const site=TOWN_LAYOUT.home;
  if(!villageSiteOpen('traveller'))return;
  if(farm.town.hearth.glow>.01)drawLightGlow(site.left+35,site.top+74,43,
    night*farm.town.hearth.glow*.24);
}
