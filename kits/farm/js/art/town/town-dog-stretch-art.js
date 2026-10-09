'use strict';
// This replaces the original rest body inside its original contact-depth item.
function drawTownDogRest(){
 const active=townDogStretchActive(),{amount,reach,head}=townDogStretchPose();
 rect(-13,-6,25,11,'#c5a578');rect(-12,3,25,3,'#e2c49a');
 if(active){rect(-10,-7,9,3,'#e4c59a');rect(5,2,15+reach,3,'#d9bd90');rect(15+reach,2,5,3,'#ad8d62');}
 rect(7+reach,-10+head,14,12,'#d4b183');rect(8+reach,-10+head,4,7,'#94724e');
 rect(18+reach,-3+head,5,4,'#695f4c');
 rect(15+reach,-7+head,2,active||Math.sin(now*.7)>.96?1:2,'#655b46');
 if(amount>.65)rect(19+reach,head,2,3,'#c69483');
}
