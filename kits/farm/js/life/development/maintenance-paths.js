'use strict';
// Grass visits use the road network where practical and avoid ponds, buildings and pens.
let villageMaintenanceNavCache=null;
function villageMaintenanceNavigation() {
  const d=farm.development;
  const key=`${d.revision}:${farm.upgrades}:${farm.nursery.beds.filter(b=>b.builtAt!==null).length}:`
    +Object.values(farm.town.improvements).map(p=>p.level).join(',')+':'+Object.values(farm.town.inventory).join(',');
  if(villageMaintenanceNavCache?.state===d&&villageMaintenanceNavCache.key===key)return villageMaintenanceNavCache;
  const context=villagePlantGroundContext(),masks=villageWildPlantClearance();
  const buildings=[VILLAGE_CREW_HOME,...context.buildings,
    ...MARKET_LAYOUT.stalls.filter((_,i)=>villageMarketStallOpen(i)).map(s=>({left:s.x,top:844,right:s.x+118,bottom:934})),
    SHEEP_LAYOUT.pen,GOAT_LAYOUT.pen,...(farm.town.improvements.donkeyInn.level?[TOWN_LAYOUT.donkeyInn.pen]:[]),TOWN_LAYOUT.cart,
    ...NURSERY_LAYOUT.beds.filter((_,i)=>farm.nursery.beds[i].builtAt!==null)
      .map(b=>({left:b.x-30,top:b.y-24,right:b.x+30,bottom:b.y+20})),
    ...MARKET_LAYOUT.lamps.map(l=>({left:l.x-9,top:l.y+16,right:l.x+9,bottom:l.y+33}))];
  const trees=[...regionTrees.map(([x,y])=>({x,y:y+27})),...valleyTrees.map(([x,y])=>({x,y:y+25})),
    ...EAST_WOODS.trees,...EAST_SHORE.trees,
    ...VILLAGE_PROJECT_IDS.flatMap(id=>villageWildPlants(id).filter(p=>p.kind==='tree'&&villagePlantVisible(id,p,masks)))];
  const size=24,cols=Math.ceil(WORLD_W/size),rows=Math.ceil(WORLD_H/size),pass=new Map();
  const clear=(x,y)=>{
    const footY=y+18;
    if(x<9||footY<12||x>WORLD_W-9||footY>WORLD_H-9)return false;
    if(buildings.some(b=>inRect(x,footY,b.left-6,b.top-5,b.right+6,b.bottom+6)))return false;
    if(trees.some(t=>Math.abs(x-t.x)<13&&Math.abs(footY-t.y)<10))return false;
    if(villageRoadAt(x,footY))return true;
    return !riverAt(x,footY,7)&&!pondAt(x,footY)&&!lakeAt(x,footY)&&!valleyLakeAt(x,footY)
      &&!wetlandCreekAt(x,footY,9)&&wetlandMarshDepth(x,footY)>=1.04;
  };
  const point=id=>({x:(id%cols)*size+size/2,y:Math.floor(id/cols)*size+size/2});
  const allowed=id=>{if(!pass.has(id)){const p=point(id);pass.set(id,clear(p.x,p.y));}return pass.get(id);};
  const segment=(a,b)=>{
    const steps=Math.max(1,Math.ceil(distance(a,b)/6));
    for(let i=0;i<=steps;i++)if(!clear(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps))return false;
    return true;
  };
  return villageMaintenanceNavCache={state:d,key,size,cols,rows,clear,point,allowed,segment};
}
function villageMaintenancePath(actor,goal) {
  const nav=villageMaintenanceNavigation(),{size,cols,rows}=nav;
  // A short, unobstructed grass walk does not detour through a distant road junction.
  if(distance(actor,goal)<120&&nav.segment(actor,goal))return [{...goal}];
  const anchor=p=>{
    const cx=Math.floor(p.x/size),cy=Math.floor(p.y/size),choices=[];
    for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){
      const x=cx+dx,y=cy+dy;if(x<0||x>=cols||y<0||y>=rows)continue;
      const id=y*cols+x;if(nav.allowed(id)&&nav.segment(p,nav.point(id)))choices.push(id);
    }
    return choices.sort((a,b)=>distance(p,nav.point(a))-distance(p,nav.point(b)))[0];
  };
  const start=anchor(actor),end=anchor(goal);if(start===undefined||end===undefined)return null;
  const cost=new Map([[start,0]]),previous=new Map(),heap=[];
  const push=item=>{heap.push(item);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=item.f)break;heap[i]=heap[p];i=p;}heap[i]=item;};
  const pop=()=>{const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return first;};
  const heuristic=id=>Math.abs(id%cols-end%cols)+Math.abs(Math.floor(id/cols)-Math.floor(end/cols));
  push({id:start,g:0,f:heuristic(start)});
  while(heap.length){
    const current=pop(),id=current.id;if(current.g!==cost.get(id))continue;if(id===end)break;
    const x=id%cols,y=Math.floor(id/cols);
    for(const n of [x? id-1:-1,x+1<cols?id+1:-1,y?id-cols:-1,y+1<rows?id+cols:-1]){
      if(n<0||!nav.allowed(n)||!nav.segment(nav.point(id),nav.point(n)))continue;
      const p=nav.point(n),g=current.g+(villageRoadAt(p.x,p.y+18)?1:1.65);
      if(g>=(cost.get(n)??Infinity))continue;cost.set(n,g);previous.set(n,id);push({id:n,g,f:g+heuristic(n)});
    }
  }
  if(!cost.has(end))return null;
  const route=[];for(let id=end;id!==undefined;id=previous.get(id)){route.unshift(nav.point(id));if(id===start)break;}
  route.push({...goal});
  // Merge straight grid runs; keep every bend and obstacle avoidance intact.
  return route.filter((p,i)=>!i||i===route.length-1||
    (p.x-route[i-1].x)*(route[i+1].y-p.y)!==(p.y-route[i-1].y)*(route[i+1].x-p.x));
}
function villageMaintenanceMove(actor,goal,dt) {
  const key=`${goal.x}:${goal.y}`;
  if(distance(actor,goal)<2){actor.path=[];actor.goal=key;return true;}
  if(actor.goal!==key||!actor.path.length){
    const path=villageMaintenancePath(actor,goal);if(!path){actor.path=[];actor.goal=null;return false;}
    actor.path=path;actor.goal=key;
  }
  return villageActorMove(actor,goal,dt);
}
