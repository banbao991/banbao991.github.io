'use strict';
// Two saved forest residents use grass routes that avoid roots and the village.
function eastWoodsClear(a,b){
 const h=EAST_WOODS.habitat;
 for(let i=0;i<=16;i++){const p={x:a.x+(b.x-a.x)*i/16,y:a.y+(b.y-a.y)*i/16};
  if(!inRect(p.x,p.y,h.left,h.top,h.right,h.bottom)||EAST_WOODS.trees.some(t=>distance(p,{x:t.x,y:t.y+10})<EAST_WOODS.rootRadius))return false;}
 return true;
}
function eastWoodsRoute(start,end){
 if(eastWoodsClear(start,end))return [{...end}];
 const nodes=[];for(let y=288;y<=608;y+=32)for(let x=2112;x<=2528;x+=32)if(eastWoodsClear({x,y},{x,y}))nodes.push({x,y});
 const seen=new Set(),queue=[];
 for(let i=0;i<nodes.length;i++)if(distance(start,nodes[i])<=64&&eastWoodsClear(start,nodes[i])){queue.push({i,path:[nodes[i]]});seen.add(i);}
 for(let q=0;q<queue.length;q++){const entry=queue[q],p=nodes[entry.i];
  if(distance(p,end)<=64&&eastWoodsClear(p,end))return [...entry.path,{...end}];
  for(let i=0;i<nodes.length;i++)if(!seen.has(i)&&distance(p,nodes[i])<=33&&eastWoodsClear(p,nodes[i])){seen.add(i);queue.push({i,path:[...entry.path,nodes[i]]});}}
 return [];
}
function eastWoodsSend(bird,goal,point){const route=eastWoodsRoute(bird,point);if(!route.length)return false;
 bird.goal=goal;bird.route=route;bird.index=0;bird.mode='walk';return true;}
function eastWoodsNext(bird){
 bird.turn++;const spots=EAST_WOODS.spots;
 for(let i=0;i<spots.length;i++){const p=spots[(Math.floor(hash(bird.turn,bird.id+712,farm.day)*spots.length)+i)%spots.length];
  if(distance(p,bird)<25||farm.eastWoods.birds.some(other=>other!==bird&&distance(p,other)<40))continue;
  if(eastWoodsSend(bird,'grass',p))return true;}
 bird.mode='rest';bird.wait=1;return false;
}
function updateEastWoods(dt){
 if(farm.paused)return;
 const weather=weatherVisual(),safe=weather.rain<.3&&weather.snow<.25&&farm.phase>=.07&&farm.phase<.5;
 for(const bird of farm.eastWoods.birds){
  const home=EAST_WOODS.homes[bird.id];bird.step+=dt;
  if(bird.day!==farm.day){bird.day=farm.day;bird.decided=false;bird.chosen=false;}
  if(!safe&&bird.mode!=='home'&&bird.goal!=='home')eastWoodsSend(bird,'home',home);
  if(bird.mode==='home'){
   if(safe&&farm.phase<.3&&!bird.decided){bird.decided=true;bird.chosen=hash(farm.day,bird.id,761)<.8-seasonTransition().winter*.45;if(bird.chosen)eastWoodsNext(bird);}
   continue;
  }
  if(bird.mode==='walk'){
   const p=bird.route[bird.index];if(!p){bird.mode=bird.goal==='home'?'home':'forage';bird.wait=2+hash(bird.turn,bird.id,762)*2;continue;}
   const d=distance(bird,p),travel=Math.min(d,dt*19);
   if(bird.id===1&&d>.001){const next={x:bird.x+(p.x-bird.x)/d*travel,y:bird.y+(p.y-bird.y)/d*travel};if(distance(next,farm.eastWoods.birds[0])<28)continue;}
   if(d>.001){bird.dir=p.x<bird.x?-1:1;bird.x+=(p.x-bird.x)/d*travel;bird.y+=(p.y-bird.y)/d*travel;}
   if(d<=travel+.001){bird.x=p.x;bird.y=p.y;bird.index++;}
  }else{bird.wait=Math.max(0,bird.wait-dt);if(!bird.wait){if(safe)eastWoodsNext(bird);else eastWoodsSend(bird,'home',home);}}
 }
}
function eastPheasantAt(x,y){return farm.eastWoods.birds.find(b=>b.mode!=='home'&&inRect(x,y,b.x-23,b.y-23,b.x+24,b.y+10));}
function eastPheasantActivity(b){return b.goal==='home'?'沿林间空隙回灌丛':b.mode==='walk'?'在树间慢慢散步':b.mode==='forage'?'低头寻找草籽':'在林荫下歇脚';}
function greetEastPheasant(bird){bird.waveUntil=now+2.4;if(!bird.noticed){bird.noticed=true;farm.eastWoods.observations++;}record(`${bird.id?'雌山雉':'雄山雉'}抬头看了看你，轻轻抖动尾羽，又低头找起草籽。`);save();}
function eastSceneryDescription(x,y){
 const bird=eastPheasantAt(x,y);if(bird)return {target:bird,kind:'east-pheasant',text:`东缘${bird.id?'雌山雉':'雄山雉'} · ${eastPheasantActivity(bird)} · 点击安静观察`};
 const tree=eastTreeAt(x,y);if(tree)return {target:tree,text:`${tree.kind==='oak'?'栎树':tree.kind==='spruce'?'山地云杉':'山楂树'} · ${tree.kind==='spruce'?'四季常青，冬天枝上留着薄雪':'枝叶随四季慢慢变色'}`};
 if(inRect(x,y,EAST_CANOPY.area.left,EAST_CANOPY.area.top,EAST_CANOPY.area.right,EAST_CANOPY.area.bottom))return {target:EAST_CANOPY,text:'东缘林梢 · 花栗鼠在落叶间觅食，啄木鸟沿树干找虫'};
 const garden=EAST_GARDEN_EXTENSION;
 if(farm.town.improvements.travellerGarden.level&&inRect(x,y,garden.area.left,garden.area.top,garden.area.right,garden.area.bottom))return {target:garden,text:'旅人花园 · 四季花簇与林荫小径'};
 const picnic=EAST_PICNIC;if(inRect(x,y,picnic.area.left,picnic.area.top,picnic.area.right,picnic.area.bottom))return {target:picnic,text:'栎树休憩角 · 草坡长椅与野花'};
 if(inRect(x,y,EAST_WOODS.area.left,EAST_WOODS.area.top,EAST_WOODS.area.right,EAST_WOODS.area.bottom))return {target:EAST_WOODS,text:`东部森林 · 东缘林地 · 栎树、山楂和云杉之间住着两只山雉 · 当前外出 ${farm.eastWoods.birds.filter(b=>b.mode!=='home').length}/2`};
 return null;
}
