'use strict';
// Northern residents walk between clearings; the woodpecker flies between real trunks.
function eastCanopyRoute(start,end){
  if(eastCanopyClear(start,end))return [{...end}];
  const nodes=[];for(let y=64;y<=240;y+=32)for(let x=2096;x<=2512;x+=32)
    if(eastCanopyClear({x,y},{x,y}))nodes.push({x,y});
  const seen=new Set(),queue=[];
  nodes.forEach((p,i)=>{if(distance(start,p)<66&&eastCanopyClear(start,p)){queue.push({i,path:[p]});seen.add(i);}});
  for(let n=0;n<queue.length;n++){
    const {i,path}=queue[n],p=nodes[i];if(distance(p,end)<66&&eastCanopyClear(p,end))return [...path,{...end}];
    nodes.forEach((q,j)=>{if(!seen.has(j)&&distance(p,q)<33&&eastCanopyClear(p,q)){seen.add(j);queue.push({i:j,path:[...path,q]});}});
  }
  return [];
}
function sendEastChipmunk(a,goal,point){
  const route=eastCanopyRoute(a,point);if(!route.length)return false;
  Object.assign(a,{goal,route,index:0,mode:'walk'});return true;
}
function nextEastChipmunk(a){
  a.turn++;const spots=EAST_CANOPY.spots,start=Math.floor(hash(a.turn,a.id+1102,farm.day)*spots.length);
  for(let i=0;i<spots.length;i++){
    const p=spots[(start+i)%spots.length];
    if(distance(a,p)<25||farm.eastCanopy.chipmunks.some(b=>b!==a&&b.mode!=='home'&&distance(b,p)<45))continue;
    if(sendEastChipmunk(a,'grass',p))return true;
  }
  a.mode='rest';a.wait=1.5;return false;
}
function sendEastWoodpecker(index){
  const b=farm.eastCanopy.woodpecker;b.target=index;b.mode='fly';b.wait=0;
}
function updateEastCanopy(dt){
  if(farm.paused)return;
  const s=farm.eastCanopy,w=weatherVisual(),safe=w.rain<.3&&w.snow<.25&&farm.phase>=.06&&farm.phase<.5;
  for(const a of s.chipmunks){
    a.step+=dt;
    if(a.day!==farm.day){a.day=farm.day;a.decided=false;a.chosen=false;}
    if(!safe&&a.mode!=='home'&&a.goal!=='home')sendEastChipmunk(a,'home',EAST_CANOPY.homes[a.id]);
    if(a.mode==='home'){
      if(safe&&farm.phase<.3&&!a.decided){a.decided=true;a.chosen=hash(farm.day,a.id,1103)<.92-seasonTransition().winter*.35;if(a.chosen)nextEastChipmunk(a);}
      continue;
    }
    if(a.mode==='walk'){
      const p=a.route[a.index];
      if(!p){a.mode=a.goal==='home'?'home':'forage';a.wait=2.6+hash(a.turn,a.id,1104)*2;continue;}
      const d=distance(a,p),travel=Math.min(d,dt*(a.id?32:35));
      if(d>.001){
        const q={x:a.x+(p.x-a.x)/d*travel,y:a.y+(p.y-a.y)/d*travel};
        if(a.id&&s.chipmunks[0].mode!=='home'&&distance(q,s.chipmunks[0])<19)continue;
        a.dir=p.x<a.x?-1:1;a.x=q.x;a.y=q.y;
      }
      if(d<=travel+.001){a.x=p.x;a.y=p.y;a.index++;}
    }else{
      a.wait=Math.max(0,a.wait-dt);
      if(!a.wait){if(a.mode==='forage'&&safe){a.mode='rest';a.wait=1.5;}else if(safe)nextEastChipmunk(a);else sendEastChipmunk(a,'home',EAST_CANOPY.homes[a.id]);}
    }
  }
  const b=s.woodpecker;b.step+=dt;
  if(b.day!==farm.day){b.day=farm.day;b.decided=false;b.chosen=false;}
  if(!safe&&b.mode!=='nest'&&b.target!==EAST_CANOPY.nest)sendEastWoodpecker(EAST_CANOPY.nest);
  if(!safe&&b.mode!=='fly'&&b.perch===EAST_CANOPY.nest)b.mode='nest';
  if(b.mode==='nest'){
    if(safe&&farm.phase<.3&&!b.decided){b.decided=true;b.chosen=hash(farm.day,1105)<.9-seasonTransition().winter*.3;if(b.chosen)sendEastWoodpecker(hash(farm.day,1106)<.5?0:2);}
  }else if(b.mode==='fly'){
    const p=EAST_CANOPY.perches[b.target],d=distance(b,p),travel=Math.min(d,dt*106);
    if(d>.001){b.dir=p.x<b.x?-1:1;b.x+=(p.x-b.x)/d*travel;b.y+=(p.y-b.y)/d*travel;}
    if(d<=travel+.001){b.x=p.x;b.y=p.y;b.perch=b.target;b.mode=!safe&&b.perch===EAST_CANOPY.nest?'nest':'peck';b.wait=4+hash(b.turn,1107)*3;}
  }else{
    b.wait=Math.max(0,b.wait-dt);
    if(!b.wait){
      if(!safe){if(b.perch===EAST_CANOPY.nest)b.mode='nest';else sendEastWoodpecker(EAST_CANOPY.nest);}
      else if(b.mode==='peck'){b.mode='rest';b.wait=2;}
      else{b.turn++;sendEastWoodpecker((b.perch+1+(hash(b.turn,1108)<.5?1:0))%3);}
    }
  }
}
function eastCanopyAnimalAt(x,y){
  const b=farm.eastCanopy.woodpecker;
  if(b.mode!=='nest'&&inRect(x,y,b.x-14,b.y-20,b.x+15,b.y+13))return {actor:b,kind:'woodpecker'};
  const a=farm.eastCanopy.chipmunks.find(a=>a.mode!=='home'&&inRect(x,y,a.x-18,a.y-20,a.x+18,a.y+7));
  return a?{actor:a,kind:'chipmunk'}:null;
}
function eastCanopyActivity(animal){
  const a=animal.actor;
  if(animal.kind==='woodpecker')return a.mode==='fly'?(a.target===EAST_CANOPY.nest?'飞回树洞':'在树梢之间飞行'):a.mode==='peck'?'贴着树干轻轻啄木':'在树干上歇脚';
  return a.goal==='home'?'沿树间草地回窝':a.mode==='walk'?'在落叶间穿行':a.mode==='forage'?'捧着松籽慢慢啃':'抬头梳理脸颊';
}
function greetEastCanopy(animal){
  const a=animal.actor;a.waveUntil=now+2.2;
  if(!a.noticed){a.noticed=true;farm.eastCanopy.observations++;}
  record(animal.kind==='woodpecker'?'啄木鸟停下啄木，歪头看了看你，又轻轻敲了两下树干。':'花栗鼠抱好松籽，竖起小耳朵，轻轻摇了摇蓬松尾巴。');save();
}
function eastCanopyDescription(x,y){
  const hit=eastCanopyAnimalAt(x,y);
  if(hit)return {target:hit.actor,kind:`east-${hit.kind}`,text:`东缘${hit.kind==='woodpecker'?'啄木鸟':'花栗鼠'} · ${eastCanopyActivity(hit)} · 点击安静观察`};
  const home=EAST_CANOPY.homes.find(p=>inRect(x,y,p.x-15,p.y-10,p.x+15,p.y+8));
  if(home)return {target:home,text:'花栗鼠的落叶窝 · 雨雪和夜晚在这里休息'};
  return null;
}
