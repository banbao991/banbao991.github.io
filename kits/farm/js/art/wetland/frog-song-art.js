'use strict';
// Throat and small call marks belong to the original frog, never a foreground copy.
function drawWetlandFrogThroat(frog){
 const pulse=wetlandFrogSongPulse();if(pulse<.04)return;
 circle(frog.x+1,frog.y+2,2+pulse*4,'#bad3a0');
 rect(frog.x-2,frog.y+1,6,2,'#d8e0b5');
 if(pulse>.35){rect(frog.x-15,frog.y-2,2,4,'#c3d3a9');rect(frog.x+17,frog.y-2,2,4,'#c3d3a9');}
}
