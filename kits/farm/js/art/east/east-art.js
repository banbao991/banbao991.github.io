'use strict';
// Every tree, seat, flower cluster and pheasant owns one contact-depth item.
function drawEastTree(t){
 scenePart(`east-tree:${t.x}:${t.y}`,t.y+22,()=>{
 const x=t.x,y=t.y,w=sceneSeason.winter,a=sceneSeason.autumn;
 const dark=blendHex('#658055','#a6b9a0',w),leaf=blendHex(blendHex('#8bab67','#bdad72',a),'#c5cfb4',w);
 rect(x-23,y+16,46,7,'#49694e44');rect(x-5,y-54,11,76,'#816449');rect(x+1,y-45,4,62,'#ae8b60');
 if(t.kind==='spruce'){
  for(let i=0;i<4;i++){const yy=y-83+i*18,ww=14+i*10;rect(x-ww,yy,ww*2,17,dark);rect(x-ww+5,yy,ww*2-12,11,blendHex('#78978a','#b6c9bc',w));if(w>.01)rect(x-ww+7,yy,ww*2-16,3,`rgba(238,241,220,${w*.8})`);}
 }else{
  // Joined stepped leaf lobes use shade inside the canopy, without boxed outlines.
  const lobes=t.kind==='hawthorn'?[[-16,-48,23],[13,-48,25],[0,-66,19]]:[[-17,-48,23],[13,-47,27],[0,-64,22]];
  for(let row=-86;row<=-22;row+=4){let left=Infinity,right=-Infinity;
   for(const [cx,cy,r]of lobes){const dy=row+2-cy;if(Math.abs(dy)<r){const half=Math.sqrt(r*r-dy*dy);left=Math.min(left,cx-half);right=Math.max(right,cx+half);}}
   if(Number.isFinite(left)){left=Math.round(left/4)*4;right=Math.round(right/4)*4;rect(x+left,y+row,right-left,4,row>-38?dark:leaf);}}
  const light=blendHex(blendHex('#abc07e','#d0bb83',a),'#d9dfc5',w);
  for(const [dx,dy,ww,hh]of [[-17,-70,17,5],[2,-76,12,4],[-28,-49,14,5],[5,-53,18,5],[19,-39,8,4]])rect(x+dx,y+dy,ww,hh,light);
  for(let i=0;i<13;i++){const dx=-27+hash(i,21)*50,dy=-63+hash(i,22)*33;rect(x+dx,y+dy,3+i%2,3,dark);}
  if(t.kind==='hawthorn')for(let i=0;i<7;i++){const fx=x-27+hash(i,17)*51,fy=y-68+hash(i,18)*32;const bloom=(1-w)*(sceneSeason.from===0?1-sceneSeason.amount:sceneSeason.to===0?sceneSeason.amount:.15);ctx.save();ctx.globalAlpha=bloom;rect(fx,fy,3,3,'#f0d9b5');ctx.restore();}
  if(w>.01){ctx.save();ctx.globalAlpha=w*.8;rect(x-23,y-80,45,4,'#e7eddb');rect(x+12,y-46,18,3,'#e7eddb');ctx.restore();}
 }
 });
}
function drawEastFlowerCluster(site,growth=1){
 const x=site.x,y=site.y;
 for(let i=0;i<7;i++){const xx=x-22+i*7,yy=y+(i%3)*3,height=5+growth*(9+i%2*4);
 rect(xx-4,yy+1,9,2,'#708a5a');rect(xx,yy-height,2,height,'#718e58');rect(xx-3,yy-7,5,2,'#a2b479');
 const bloom=clamp((growth-.4)/.5,0,1)*(1-sceneSeason.winter*.75);if(bloom>.01)circle(xx+1,yy-height,3*bloom,blendHex('#e2c184','#c79c80',sceneSeason.autumn));}
}
function drawEastBench(site,id){scenePart(id,site.y+17,()=>{const x=site.x,y=site.y;
 rect(x-31,y+10,64,5,'#59724b44');rect(x-29,y-14,4,26,'#8a6c4c');rect(x+26,y-14,4,26,'#8a6c4c');
 rect(x-30,y-13,60,6,'#b49266');rect(x-29,y-5,60,4,'#c2a277');rect(x-29,y+3,60,7,'#b28c5f');rect(x-25,y+10,4,7,'#765c43');rect(x+22,y+10,4,7,'#765c43');});}
function drawEastScenery(){
 for(const t of EAST_WOODS.trees)drawEastTree(t);
 for(const [id,home]of EAST_WOODS.homes.entries())scenePart(`east-pheasant-cover:${id}`,home.y+8,()=>{
  const color=blendHex('#66895b','#aec5b7',sceneSeason.winter);rect(home.x-22,home.y+4,44,5,'#496a4a55');
  for(const [dx,dy]of [[-12,-5],[3,-13],[16,-4]]){circle(home.x+dx,home.y+dy,12,color);rect(home.x+dx-5,home.y+dy-6,9,3,'#9cb583');}
 });
 for(const bird of farm.eastWoods.birds)if(bird.mode!=='home')scenePart(`east-pheasant:${bird.id}`,bird.y+12,()=>drawEastPheasant(bird),10);
 const level=farm.town.improvements.travellerGarden.level;
 for(const bed of EAST_GARDEN_EXTENSION.beds)if(level>bed.stage)scenePart(`east-garden:${bed.x}:${bed.y}`,bed.y+9,()=>drawEastFlowerCluster(bed,townImprovementGrowth('travellerGarden',bed.stage)),0,-1);
 if(level>1)drawEastBench(EAST_GARDEN_EXTENSION.bench,'east-garden-bench');
 drawEastTree(EAST_PICNIC.tree);drawEastBench(EAST_PICNIC.bench,'east-picnic-bench');scenePart('east-picnic-flowers',EAST_PICNIC.flowers.y+9,()=>drawEastFlowerCluster(EAST_PICNIC.flowers),0,-1);
}
function drawEastPheasant(b){
 const x=Math.round(b.x),y=Math.round(b.y),d=b.dir,female=b.id===1;
 const micro=Math.sin(now*3+b.id),peck=b.mode==='forage'?Math.max(0,Math.sin((farm.paused?now:b.step)*3))*4:0;
 ctx.save();ctx.translate(x,y);ctx.scale(d,1);
 rect(-16,-5,24,11,female?'#b09a75':'#bb8e5e');rect(-11,-8,16,6,female?'#c4ad86':'#d0a16b');
 for(let i=0;i<5;i++)rect(-13+i*4,-3+(i%2)*3,2,2,female?'#897353':'#866648');
 rect(5,-14+peck,7,12,female?'#b39d78':'#587969');rect(4,-21+peck,11,9,female?'#c5ad85':'#54736c');
 if(!female){rect(5,-13+peck,8,3,'#e5d2a8');rect(12,-18+peck,4,5,'#b87965');}
 rect(10,-18+peck,2,2,'#3f473a');rect(14,-16+peck,6,2,'#cfb27b');
 const tail=now<b.waveUntil?micro*2:micro*.5;rect(-32,-6+tail,20,3,female?'#998262':'#a98b61');rect(-42,-9+tail,21,2,female?'#a08b69':'#c3a578');
 rect(-7,5,2,6,'#aa8c60');rect(2,5,2,6,'#aa8c60');rect(-8,10,5,2,'#887054');rect(1,10,5,2,'#887054');ctx.restore();
}
