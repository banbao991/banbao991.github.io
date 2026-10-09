'use strict';
// Water uses the display clock: pause freezes the town, not its flowing fountain.
// All drops land inside the existing basin; the original depth item owns them.
function drawVillageFountain() {
  const {x,y}=MARKET_LAYOUT.fountain;
  circle(x,y,39,'#e1cf9e');circle(x,y,29,'#719fa2');circle(x,y,24,'#83b2ae');
  for(let i=0;i<4;i++){
    const t=(now*.44+i*.25)%1, r=5+t*21;
    ctx.save();ctx.translate(x,y+5);ctx.scale(1,.52);
    ctx.strokeStyle=`rgba(214,240,221,${(1-t)*.42})`;ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  rect(x-5,y-30,10,31,'#d1bb8d');rect(x+1,y-25,3,25,'#e2d2a5');
  circle(x,y-32,9,'#a9d2c5');rect(x-2,y-40,4,9,'#c8e8db');
  for(const side of [-1,1])for(let i=0;i<8;i++){
    const t=(now*.82+i/8)%1;
    const xx=x+side*(3+21*t), yy=y-34-18*Math.sin(t*Math.PI)+41*t*t;
    rect(Math.round(xx),Math.round(yy),2,t>.65?5:3,i%2?'#bddcd0':'#e0eee0');
    const splash=(now*1.2+i*.17)%1;
    if(i<3)rect(x+side*22+(i-1)*3,y+6-splash*4,2,2,`rgba(225,242,224,${1-splash})`);
  }
  for(let i=0;i<5;i++){
    const xx=x-19+hash(i,906)*38,yy=y-8+hash(i,907)*25;
    if(Math.sin(now*2.5+i*2)>.45)rect(xx,yy,3,1,'#c9e7d7');
  }
}
