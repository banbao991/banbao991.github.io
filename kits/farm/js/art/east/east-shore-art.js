'use strict';
// Water and soft margins are ground; every plant, stone, bench and animal has one depth item.
function drawEastShoreGround(){
 const w=sceneSeason.winter;
 for(const site of [EAST_SHORE.spring,EAST_SHORE.pond]){
  const water=groundTilePainter(),shore=groundTilePainter();
  for(let y=site.y-site.ry-16;y<=site.y+site.ry+16;y+=4)for(let x=site.x-site.rx-16;x<=site.x+site.rx+16;x+=4){
   const d=((x-site.x)/site.rx)**2+((y-site.y)/site.ry)**2,edge=1+(hash(x,y,876)-.5)*.07;
   if(d<edge)water.add(x,y,4,4,blendHex(d>.79?'#8fab8c':d>.55?'#79aaa3':'#689fa7',d>.79?'#bccab1':'#a6c5c4',w));
   else if(d<1.26&&hash(x,y,877)>.35)shore.add(x,y,4,4,`rgba(${colorChannels(blendHex('#8da37a','#bac9ae',w)).join(',')},${(1.26-d)*1.4})`);
  }
  shore.draw();water.draw();
  for(let i=0;i<8;i++){const p={x:site.x-site.rx*.64+i*site.rx*.17,y:site.y+Math.sin(i*3.2+motionNow*.35)*site.ry*.6};if(eastShoreWater(p,site,-10))rect(p.x,p.y,9,2,blendHex('#a7c8be','#d9e0cd',w));}
 }
 const p=EAST_SHORE.spring;circle(p.x+7,p.y-14,4,'#bad0be');
 for(let i=0;i<3;i++){const wave=(motionNow*.5+i/3)%1;ctx.save();ctx.globalAlpha=(1-wave)*.6;ctx.strokeStyle='#cfdec6';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x+7,p.y-14,4+wave*13,0,Math.PI*2);ctx.stroke();ctx.restore();}
 if(now<farm.eastShore.rippleUntil){ctx.save();ctx.strokeStyle='#dfebd6';ctx.globalAlpha=Math.min(1,(farm.eastShore.rippleUntil-now)/2.4);ctx.beginPath();ctx.arc(p.x,p.y,8+(2.4-(farm.eastShore.rippleUntil-now))*10,0,Math.PI*2);ctx.stroke();ctx.restore();}
}
function drawEastShoreScenery(){
 for(const t of EAST_SHORE.trees)drawEastTree(t);drawEastBench(EAST_SHORE.springBench,'east-spring-bench');
 for(const p of EAST_SHORE.flowers)scenePart(`east-shore-flower:${p.x}:${p.y}`,p.y+9,()=>drawEastFlowerCluster(p),0,-1);
 for(const p of EAST_SHORE.stones)scenePart(`east-shore-stone:${p.x}:${p.y}`,p.y+8,()=>{rect(p.x-12,p.y-3,25,9,blendHex('#889484','#b6c3b0',sceneSeason.winter));rect(p.x-8,p.y-8,16,7,'#adb29b');rect(p.x-6,p.y-8,11,2,'#c5c5a8');});
 for(const p of EAST_SHORE.reeds)scenePart(`east-shore-reed:${p.x}:${p.y}`,p.y+8,()=>{for(let i=0;i<4;i++){const xx=p.x-9+i*6,hh=18+i%2*9,sway=Math.sin(now*.7+i)*1.4;rect(xx,p.y-hh,2,hh,blendHex('#839462','#b7bfa0',sceneSeason.winter));rect(xx+sway-1,p.y-hh-6,4,8,'#a48b66');rect(xx-4,p.y-11,6,2,'#aab47b');}});
 for(const [id,p]of EAST_SHORE.hedge.berries.entries())scenePart(`east-shore-berries:${id}`,p.y+7,()=>{
  const berry=farm.eastShore.berries[id],growth=berry.pickedAt===null?1:clamp((farm.day+farm.phase-berry.pickedAt)/2.2,0,1);
  for(const [dx,dy]of [[-13,-5],[0,-12],[12,-4]]){circle(p.x+dx,p.y+dy,11,blendHex('#789263','#b8c4a2',sceneSeason.winter));rect(p.x+dx-5,p.y+dy-5,8,3,'#9eac74');}
  for(let i=0;i<5;i++){ctx.save();ctx.globalAlpha=growth*(1-sceneSeason.winter*.85);rect(p.x-15+i*7,p.y-12+i%2*6,3,3,'#c19770');ctx.restore();}
 });
 const home=EAST_SHORE.hedge.home;scenePart('east-hedge-leaf-nest',home.y+8,()=>{rect(home.x-15,home.y-6,32,12,'#9d9670');rect(home.x-10,home.y-11,21,8,'#b3a276');rect(home.x-5,home.y-3,11,7,'#776e54');});
 for(const b of farm.eastShore.ducks)scenePart(`east-mandarin:${b.id}`,b.y+7,()=>drawEastMandarin(b),10);
 const h=farm.eastShore.hedge;if(h.mode!=='hide')scenePart('east-shore-hedge',h.y+8,()=>drawEastHedge(h),10);
}
function drawEastMandarin(b){
 const x=Math.round(b.x),y=Math.round(b.y),d=b.dir,wave=now<b.waveUntil?Math.sin(now*4)*2:0;
 ctx.save();ctx.translate(x,y+Math.sin(now*1.7+b.id)*.45);ctx.scale(d,1);rect(-17,4,33,2,'#adc9b477');
 rect(-14,-5,24,11,b.id?'#a79679':'#b79066');rect(-10,-9,17,9,b.id?'#b9a888':'#d0ac77');
 rect(-11,-5,10,6,b.id?'#8f8e72':'#738e8b');if(!b.id){rect(-8,-14+wave,8,13,'#c1a071');rect(-6,-13+wave,4,9,'#e0c48a');}
 if(b.mode==='sleep'){rect(2,-7,8,5,'#b29a7b');rect(7,-6,3,1,'#586254');}
 else drawEastMandarinHead(b);
 rect(-19,-2,8,3,b.id?'#9c967a':'#a08860');ctx.restore();
}
function drawEastHedge(h){
 ctx.save();ctx.translate(Math.round(h.x),Math.round(h.y)+Math.sin(now*1.8)*.35);ctx.scale(h.dir,1);
 const curled=now<h.curlUntil;rect(-13,5,27,3,'#60764a44');
 rect(-12,-8,22,14,'#8a8268');rect(-9,-12,15,8,'#a99c79');
 for(let i=0;i<7;i++)rect(-12+i*3,-8-(i%3)*2,2,4,'#d0bd91');
 if(!curled){const sniff=h.mode==='forage'?Math.sin((farm.paused?now:h.step)*4)*1.3:0;rect(7,-4+sniff,11,8,'#c3b189');rect(16,-2+sniff,3,3,'#5c6252');rect(9,-3+sniff,2,2,'#454c3c');rect(-8,5,4,3,'#857659');rect(5,5,4,3,'#857659');}
 ctx.restore();
}
