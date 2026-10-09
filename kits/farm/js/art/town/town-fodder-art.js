'use strict';
function drawTownFodder(){if(!farm.town.improvements.donkeyInn.level)return;
  const {x,y}=TOWN_LAYOUT.fodder.rack,count=farm.town.inventory.fodder;
  scenePart('town-fodder-rack',y+12,()=>{
    rect(x-16,y+9,32,4,'#687b5055');rect(x-15,y-15,4,27,'#94704d');rect(x+12,y-15,4,27,'#94704d');
    rect(x-18,y-14,37,4,'#c1a16b');rect(x-14,y-8,28,13,'#a78456');
    if(count||farm.town.fodder.eating){
      const height=3+Math.min(8,count+(farm.town.fodder.eating?1:0));
      rect(x-12,y-height-3,25,height,'#c8bb78');
      for(let i=0;i<6;i++)rect(x-11+i*4,y-height-5+i%2,2,height+2,'#e2d299');
    }
    rect(x-16,y+2,33,3,'#b99663');
  });
}
