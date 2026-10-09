'use strict';
// Water residents and a dusk forager never borrow villagers, cargo or the town random stream.
function eastHedgeRoute(start,end){
 if(eastHedgeClear(start,end))return [{...end}];
 const nodes=[];for(let y=1680;y<=1900;y+=20)for(let x=2170;x<=2530;x+=20)if(eastHedgeClear({x,y},{x,y}))nodes.push({x,y});
 const queue=[],seen=new Set();for(let i=0;i<nodes.length;i++)if(distance(start,nodes[i])<42&&eastHedgeClear(start,nodes[i])){queue.push({i,path:[nodes[i]]});seen.add(i);}
 for(let q=0;q<queue.length;q++){const {i,path}=queue[q],p=nodes[i];if(distance(p,end)<42&&eastHedgeClear(p,end))return [...path,{...end}];
  for(let j=0;j<nodes.length;j++)if(!seen.has(j)&&distance(p,nodes[j])<21&&eastHedgeClear(p,nodes[j])){seen.add(j);queue.push({i:j,path:[...path,nodes[j]]});}}
 return [];
}
function eastHedgeSend(goal,point,berry=-1){const h=farm.eastShore.hedge,route=eastHedgeRoute(h,point);if(!route.length)return false;
 Object.assign(h,{mode:'walk',goal,route,index:0,berry});return true;}
function eastHedgeNext(){const s=farm.eastShore,h=s.hedge,clock=farm.day+farm.phase;
 const candidates=s.berries.map((b,i)=>i).filter(i=>s.berries[i].readyAt<=clock).sort((a,b)=>distance(h,EAST_SHORE.hedge.berries[a])-distance(h,EAST_SHORE.hedge.berries[b]));
 for(const id of candidates)if(eastHedgeSend('berries',EAST_SHORE.hedge.berries[id],id))return true;
 if(h.mode!=='hide')eastHedgeSend('home',EAST_SHORE.hedge.home);return false;
}
function updateEastShore(dt){
 if(farm.paused)return;
 const s=farm.eastShore,weather=weatherVisual(),winter=seasonTransition().winter;
 const clear=weather.rain<.35&&weather.snow<.25;
 for(const b of s.ducks){
  b.step+=dt;if(b.day!==farm.day){b.day=farm.day;b.chosen=hash(farm.day,b.id,871)<.95-winter*.5;}
  const active=clear&&b.chosen&&farm.phase>=.07&&farm.phase<.57;
  if(!active&&b.goal!=='nest'){b.goal='nest';b.target={...EAST_SHORE.nests[b.id]};b.mode='swim';}
  if(b.mode==='sleep'&&active){b.mode='rest';b.wait=.5+b.id;}
  if(b.mode==='swim'){
   const d=distance(b,b.target),travel=Math.min(d,dt*14);if(d>.001){b.dir=b.target.x<b.x?-1:1;b.x+=(b.target.x-b.x)/d*travel;b.y+=(b.target.y-b.y)/d*travel;}
   if(d<=travel+.001){b.x=b.target.x;b.y=b.target.y;b.mode=b.goal==='nest'?'sleep':'rest';b.wait=3+hash(b.turn,b.id,873)*4;}
  }else if(b.mode==='rest'){
   b.wait=Math.max(0,b.wait-dt);if(!b.wait&&active){b.turn++;b.goal='water';b.target={...EAST_SHORE.duckSpots[b.id][b.turn%3]};b.mode='swim';}
  }
 }
 updateEastDuckCompany(dt);
 const h=s.hedge;h.step+=dt;
 if(h.day!==farm.day){h.day=farm.day;h.chosen=hash(farm.day,0,874)<.8*(1-winter);}
 const dusk=clear&&h.chosen&&winter<.65&&farm.phase>=.46&&farm.phase<.79;
 if(!dusk&&h.mode!=='hide'&&h.goal!=='home')eastHedgeSend('home',EAST_SHORE.hedge.home);
 if(h.mode==='hide'){if(dusk)eastHedgeNext();return;}
 if(h.mode==='walk'){
  const p=h.route[h.index];if(!p){h.mode=h.goal==='home'?'hide':'forage';h.wait=2.4;return;}
  const d=distance(h,p),travel=Math.min(d,dt*25);if(d>.001){h.dir=p.x<h.x?-1:1;h.x+=(p.x-h.x)/d*travel;h.y+=(p.y-h.y)/d*travel;}
  if(d<=travel+.001){h.x=p.x;h.y=p.y;h.index++;}
 }else{
  h.wait=Math.max(0,h.wait-dt);if(h.wait)return;
  if(h.mode==='forage'&&dusk&&h.berry>=0){const berry=s.berries[h.berry],clock=farm.day+farm.phase;
   if(berry.readyAt<=clock){berry.pickedAt=clock;berry.readyAt=clock+2.2;s.meals++;} }
  if(dusk)eastHedgeNext();else eastHedgeSend('home',EAST_SHORE.hedge.home);
 }
}
function eastShoreAnimalAt(x,y){
 const h=farm.eastShore.hedge;if(h.mode!=='hide'&&inRect(x,y,h.x-19,h.y-17,h.x+19,h.y+8))return {animal:h,type:'hedge'};
 const b=farm.eastShore.ducks.find(b=>inRect(x,y,b.x-21,b.y-22,b.x+21,b.y+7));return b?{animal:b,type:'duck'}:null;
}
function greetEastShore(found){const s=farm.eastShore,a=found.animal;
 if(!a.noticed){a.noticed=true;s.observations++;}
 if(found.type==='hedge')a.curlUntil=now+2.4;else a.waveUntil=now+2.4;
 record(found.type==='hedge'?'山脚刺猬轻轻缩成一个小球，随后又去寻找野果。':'小塘鸳鸯转过头，轻轻抖了抖羽毛。');save();
}
function eastShoreDescription(x,y){
 const hit=eastShoreAnimalAt(x,y);if(hit){const a=hit.animal;return {target:a,text:hit.type==='duck'?`山脚${a.id?'雌鸳鸯':'雄鸳鸯'} · ${eastDuckCompanyActive()?'和同伴转头理羽':a.mode==='sleep'?'在芦苇边合眼休息':a.mode==='swim'?'缓缓划过水面':'在水上整理羽毛'} · 点击安静观察`:`山脚刺猬 · ${a.goal==='home'?'回落叶窝休息':a.mode==='forage'?'低头吃落下的野果':'沿岸边草地觅食'} · 点击轻声打招呼`};}
 for(const site of [EAST_SHORE.spring,EAST_SHORE.pond])if(eastShoreWater({x,y},site,12))return {target:site,text:site===EAST_SHORE.spring?'东缘林泉 · 泉眼缓缓冒水，岸石与水草随季节变色 · 点击看看水纹':'山脚小塘 · 芦苇之间住着一对鸳鸯，傍晚刺猬沿草地觅食'};
 for(const [id,p]of EAST_SHORE.hedge.berries.entries())if(inRect(x,y,p.x-24,p.y-24,p.x+24,p.y+12))return {target:p,text:`山脚野果丛 · ${farm.eastShore.berries[id].readyAt<=farm.day+farm.phase?'有落果，留给刺猬觅食':'落果已吃完，野果慢慢长回'}`};
 for(const t of EAST_SHORE.trees)if(inRect(x,y,t.x-41,t.y-87,t.x+41,t.y+22))return {target:t,text:`${t.kind==='oak'?'山脚栎树':t.kind==='spruce'?'山脚云杉':'东岸山楂'} · 枝叶随四季变色，树下有凉凉的林荫`};
 const bench=EAST_SHORE.springBench;if(inRect(x,y,bench.x-31,bench.y-15,bench.x+31,bench.y+18))return {target:bench,text:'林泉长椅 · 坐下来听听泉水'};
 if(inRect(x,y,2440,1000,2540,1350))return {target:EAST_SHORE.flowers,text:'东岸四季花坡 · 栎树、山楂与随季节开放的野花'};
 if(inRect(x,y,2160,1668,2540,1904))return {target:EAST_SHORE.hedge,text:`山脚果林 · 刺猬傍晚沿岸觅食，已吃 ${farm.eastShore.meals} 份野果；天亮、雨雪或寒冬回落叶窝`};
 if(inRect(x,y,2416,640,2540,925))return {target:EAST_SHORE.spring,text:'东缘林泉休憩地 · 林间长椅、山楂与小小的泉眼'};
 return null;
}
function handleEastShoreClick(x,y){const a=eastShoreAnimalAt(x,y);if(a){greetEastShore(a);return true;}
 if(eastShoreWater({x,y},EAST_SHORE.spring,12)){farm.eastShore.rippleUntil=now+2.4;record('你在东缘林泉旁停下，泉眼的细小水纹一圈圈散开。');save();return true;}return false;}
