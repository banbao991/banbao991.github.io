'use strict';
// Ground paws sort by contact; trunk birds belong in front of their carrier tree.
function drawEastCanopy(){
  EAST_CANOPY.homes.forEach((p,i)=>scenePart(`chipmunk-nest:${i}`,p.y+8,()=>{
    rect(p.x-13,p.y+2,27,4,'#8f9661');rect(p.x-10,p.y-3,21,5,'#a6996b');
    rect(p.x-5,p.y-1,10,5,'#667752');rect(p.x-12,p.y,5,2,'#bbaa77');
  }));
  const nest=EAST_CANOPY.perches[EAST_CANOPY.nest];
  scenePart('woodpecker-nest',nest.tree.y+22,()=>{rect(nest.x-4,nest.y-7,8,11,'#685e45');rect(nest.x-2,nest.y-5,5,7,'#48523d');},25);
  for(const a of farm.eastCanopy.chipmunks)if(a.mode!=='home')scenePart(`east-chipmunk:${a.id}`,a.y+7,()=>drawEastChipmunk(a),10);
  const b=farm.eastCanopy.woodpecker;
  if(b.mode!=='nest')scenePart('east-woodpecker',b.mode==='fly'?b.y:EAST_CANOPY.perches[b.perch].tree.y+22,
    ()=>drawEastWoodpecker(b),30,b.mode==='fly'?1:0);
}
function drawEastChipmunk(a){
  const active=a.mode==='walk',clock=farm.paused?now:a.step;
  const bob=active&&!farm.paused?Math.sin(a.step*17)*1.2:Math.sin(now*3+a.id)*.4;
  const munch=a.mode==='forage'||now<a.waveUntil;
  ctx.save();ctx.translate(Math.round(a.x),Math.round(a.y));ctx.scale(a.dir,1);
  rect(-13,3,26,4,'#4f6b4838');
  const tail=Math.sin(now*3+a.id)*(now<a.waveUntil?3:1);
  rect(-15,-12+tail,7,13,'#9c7953');rect(-18,-17+tail,7,11,'#b29463');rect(-15,-16+tail,3,8,'#d2b37b');
  rect(-10,-9+bob,20,13,'#bc9865');rect(-9,-8+bob,18,3,'#eee0af');rect(-9,-5+bob,17,2,'#765c42');rect(-8,-2+bob,17,2,'#e6d3a0');
  rect(5,-15+bob,10,11,'#cda777');rect(7,-19+bob,4,6,'#ae885a');rect(12,-12+bob,2,2,'#3d4938');rect(15,-9+bob,3,2,'#72573d');
  if(munch){rect(8,-3+bob,5,5,'#97744b');rect(7,-4+bob,3,3,'#e0bf87');rect(12,-4+bob,3,3,'#e0bf87');}
  else if(a.mode==='rest')rect(9,-10+Math.sin(clock*5),3,4,'#e0bf87');
  rect(-8,3,5,3,'#977347');rect(6,3+(active&&!farm.paused?Math.sin(clock*17):0),5,3,'#977347');ctx.restore();
}
function drawEastWoodpecker(b){
  const peck=b.mode==='peck'?Math.max(0,Math.sin((farm.paused?now:b.step)*8))*2:0;
  const d=b.mode==='fly'?-b.dir:1,flap=Math.sin((farm.paused?now:b.step)*19);
  ctx.save();ctx.translate(Math.round(b.x),Math.round(b.y));ctx.scale(d,1);
  rect(-6,-8,11,19,'#515d4c');rect(-4,-5,7,14,'#eadfb6');rect(0,-8,5,17,'#59654e');
  rect(1,-5,4,3,'#e9dcb6');rect(1,2,4,2,'#e9dcb6');rect(-1,8,4,7,'#a47b62');
  rect(-6-peck,-17,10,10,'#ede4c3');rect(-5-peck,-19,8,3,'#b57961');
  rect(-7-peck,-13,3,3,'#55604a');rect(-5-peck,-15,2,2,'#364332');rect(-12-peck,-12,5,2,'#8a7952');
  if(b.mode==='fly'){rect(3,-8+flap*5,14,5,'#63705b');rect(9,-7+flap*5,6,2,'#e1d8b4');}
  else{rect(-7,7,4,2,'#8b7250');if(now<b.waveUntil)rect(-6-peck,-16,2,2,'#fcf0cc');}
  ctx.restore();
}
