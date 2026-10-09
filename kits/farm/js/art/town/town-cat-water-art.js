'use strict';
// The bowl has its own ground contact. Water never advances during drawing.
function drawTownCatWater(){
 if(!townCatWaterBuilt())return;
 const {x,y}=TOWN_LAYOUT.catWater.water,amount=farm.town.catWater.water;
 scenePart('town-cat-water',y+5,()=>{
  rect(x-8,y+4,17,3,'#586b4538');rect(x-8,y,17,5,'#9a805b');rect(x-6,y-2,13,5,'#c7b18c');
  rect(x-5,y-1,11,3,'#796d58');
  if(amount>.02){rect(x-5,y-1,Math.max(1,Math.round(11*amount)),2,'#9bbcb7');
   if(amount>.4)rect(x-3,y-1,4,1,'#d6e3cf');}
 });
}
