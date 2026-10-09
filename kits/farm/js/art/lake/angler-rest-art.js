'use strict';
// Gear and waving remain attached to the original angler-fishing item/sole depth.
function drawAnglerAtRest(x,y){
 rect(x+9,y+4,5,6,'#d7ad88');
 rect(x+11,y+13,5,8,'#c69a69');rect(x+12,y-12,3,25,'#866044');
 const waving=lakeDuckVisitHello()||angler.waveUntil>now;
 const wave=waving?Math.sin(now*4)*3:pausePulse(9,1.8)*2;
 rect(x-12,y-4-wave,6,10,'#d7ad88');
 if(waving){
  rect(x-15,y-10-wave,6,7,'#dfb78e');rect(x-18,y-11-wave,3,4,'#dfb78e');
 }
}
