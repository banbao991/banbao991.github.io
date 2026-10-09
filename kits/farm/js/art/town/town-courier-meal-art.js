'use strict';
// Attached to the original courier item, with his original contact depth.
function drawCourierMeal() {
  if(!courierMealEating())return;
  const m=farm.town.courierMeal,x=Math.round(courier.x),y=Math.round(courier.y);
  const lift=Math.round(Math.sin(now*4)*1.5),left=Math.max(3,8-Math.floor(m.elapsed/2.8*5));
  rect(x-8,y-13+lift,5,9,'#e5b990');
  rect(x-6,y-16+lift,left,5,['#ddba78','#d9a78b','#d6a45d','#c49e70'][m.theme]);
  rect(x-5,y-16+lift,Math.max(2,left-2),2,'#f3dab0');
  rect(x-9,y+3,6,8,'#b68c61');rect(x-10,y+2,8,2,'#dec49a');
  if(m.theme===0)rect(x-4,y-14+lift,2,2,'#84995d');
  // Steam is display-only; paused food and hands keep a gentle motion.
  rect(x-4,y-22-Math.round((Math.sin(now*2)+1)*2),2,3,'#e9ddc088');
}
