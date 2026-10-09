'use strict';
function drawHeronFishingHead(){
 const h=valleyHeron,bend=h.fishing?.bend||0;if(bend<=0)return false;
 const {x:hx,y:hy}=heronFishingHeadPose();
 const neckX=h.x+h.dir*4+2,neckY=h.y-18,steps=Math.ceil(Math.hypot(hx-neckX,hy-neckY)/3);
 for(let i=0;i<=steps;i++)rect(neckX+(hx-neckX)*i/steps-2,neckY+(hy-neckY)*i/steps-2,5,5,'#d6d9c8');
 rect(hx-6,hy-4,12,8,'#e6e5d4');rect(hx-17,hy-1,13,3,'#d7af70');rect(hx-3,hy-2,2,2,'#343a37');
 return true;
}
