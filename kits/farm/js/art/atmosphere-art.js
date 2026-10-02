'use strict';
// Screen atmosphere, moving clouds, rain, snow and continuous day/night light.
function weatherAndLight(){
  const weather=weatherVisual();
  // Particle motion follows real animation time, while weather strength follows farm time.
  if(weather.cloud>.001) {
    rect(0,0,WORLD_W,WORLD_H,`rgba(82,104,119,${(weather.cloud*.16).toFixed(3)})`);
    for(let i=0;i<9;i++){
      const x=(hash(i,79)*WORLD_W+now*(5+i%3))%WORLD_W,y=55+hash(i,80)*(WORLD_H-100);
      const glow=ctx.createRadialGradient(x,y,6,x,y,95);
      glow.addColorStop(0,`rgba(47,67,74,${(weather.cloud*.055).toFixed(3)})`);
      glow.addColorStop(1,'rgba(47,67,74,0)');
      ctx.fillStyle=glow;ctx.fillRect(x-95,y-95,190,190);
    }
  }
  if(weather.rain>.001){
    rect(0,0,WORLD_W,WORLD_H,`rgba(80,100,119,${(weather.rain*.09).toFixed(3)})`);
    ctx.save();ctx.globalAlpha=weather.rain;
    ctx.strokeStyle='#d8e8df8c';ctx.lineWidth=2;ctx.beginPath();
    rain.forEach(r=>{const y=(r.y+now*r.speed)%WORLD_H,x=(r.x+now*42)%WORLD_W;ctx.moveTo(x,y);ctx.lineTo(x-5,y+14);});ctx.stroke();
    ctx.restore();
  }
  if(weather.snow>.001){
    ctx.save();ctx.globalAlpha=weather.snow;
    for(let i=0;i<125;i++){
      const speed=16+hash(i,203)*27;
      const y=(hash(i,204)*WORLD_H+now*speed)%WORLD_H;
      const x=(hash(i,205)*WORLD_W+Math.sin(now*.7+i)*9+now*4)%WORLD_W;
      const size=i%5===0?4:i%3===0?3:2;
      rect(x,y,size,size,i%4===0?'#fff9e9':'#eaf2ed');
      if(i%7===0)rect(x+size+2,y-2,2,2,'#dbe9e8');
    }
    ctx.restore();
  }
  const p=farm.phase;
  const night=nightStrength();
  if(p>.47&&p<.67)rect(0,0,WORLD_W,WORLD_H,`rgba(219,129,71,${(Math.sin((p-.47)/.20*Math.PI)*.12).toFixed(2)})`);
  if(night>0){
    rect(0,0,WORLD_W,WORLD_H,`rgba(29,43,82,${(night*.66).toFixed(2)})`);
    const glow=(x,y,r)=>{const g=ctx.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,`rgba(255,207,113,${night*.45})`);g.addColorStop(1,'rgba(255,207,113,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);};
    for(const [x,y,r] of [[363,190,52],[450,190,52],[742,187,33],[272,280,38],[657,289,38]])glow(x,y,r);
    for(let i=0;i<22;i++){
      const fx=50+hash(i,61)*850+Math.sin(motionNow*.8+i)*10,fy=68+hash(i,62)*500+Math.cos(motionNow*1.1+i)*9;
      if((fx>260&&fx<620&&fy>300)||(fx>685&&fy>270))continue;
      circle(fx,fy,1.2+hash(i,63)*1.2,`rgba(255,239,163,${night*(.38+.3*Math.sin(now*2+i))})`);
    }
    for(let i=0;i<17;i++){const sx=23+hash(i,70)*910,sy=12+hash(i,71)*245;rect(sx,sy,2,2,`rgba(251,244,208,${night*.65})`);}
      rect(132+Math.sin(now*.6)*6,179,38,2,`rgba(239,235,192,${night*.32})`);
      drawRegionNight(night);
  }
}
