'use strict';
// Cleared work yards belong to the built location, regardless of which site's
// grass generator placed a clump there. Roads delimit these maintained interiors.
const VILLAGE_WORK_YARDS = {
  lake:{left:340,top:828+SOUTH_LAKE_SHIFT_Y,right:604,bottom:1005},
  herbs:{left:638,top:1038,right:1220,bottom:1191}
};
// Smaller maintained spaces follow their facility's contract, not the whole
// surrounding meadow. Their anchors are shared with art and resident behavior.
const VILLAGE_CLEARING_SITES = {
  forest:[{left:1021,top:257,right:1188,bottom:291},
    {left:FOREST_DEPOT_LAYOUT.box.x-24,top:FOREST_DEPOT_LAYOUT.box.y-24,
      right:FOREST_DEPOT_LAYOUT.box.x+24,bottom:FOREST_DEPOT_LAYOUT.box.y+20}],
  sheep:[{left:PASTURE_WORKER_LAYOUT.rest.x-25,top:PASTURE_WORKER_LAYOUT.rest.y-20,
    right:PASTURE_WORKER_LAYOUT.rest.x+25,bottom:PASTURE_WORKER_LAYOUT.rest.y+20}],
  nursery:[{left:NURSERY_LAYOUT.creekLookout.x-33,top:NURSERY_LAYOUT.creekLookout.y-22,
    right:NURSERY_LAYOUT.creekLookout.x+34,bottom:NURSERY_LAYOUT.creekLookout.y+12},
    {left:NURSERY_LAYOUT.depot.x-24,top:NURSERY_LAYOUT.depot.y-24,
      right:NURSERY_LAYOUT.depot.x+24,bottom:NURSERY_LAYOUT.depot.y+20}],
  scenic:[{left:934,top:1763,right:1030,bottom:1827}], // Pavilion tea table and chair.
  mine:[{left:MINE_LAYOUT.stockpile.x-30,top:MINE_LAYOUT.stockpile.y-25,
    right:MINE_LAYOUT.stockpile.x+30,bottom:MINE_LAYOUT.stockpile.y+22},
    {left:MINE_LAYOUT.cartBay.x-30,top:MINE_LAYOUT.cartBay.y-28,
      right:MINE_LAYOUT.cartBay.x+30,bottom:MINE_LAYOUT.cartBay.y+26}],
  traveller:[TOWN_LAYOUT.dogYard]
};
// Persistent road pieces share one surface; existing coverage is reused across project contracts.
const VILLAGE_ROADS = [];
function registerVillageRoad(id, x, y, w, h, owners = [], bridge = null) {
  const horizontal = w >= h, length = horizontal ? w : h;
  const count = bridge ? 1 : Math.ceil(length / 32);
  for (let i=0;i<count;i++) {
    const size=Math.min(32,length-i*32);
    VILLAGE_ROADS.push({id:`${id}:${i}`,x:x+(horizontal&&!bridge?i*32:0),
      y:y+(!horizontal&&!bridge?i*32:0),w:bridge?w:horizontal?size:w,
      h:bridge?h:horizontal?h:size,owners,bridge});
  }
}
registerVillageRoad('farm-north',192,256,640,32);
registerVillageRoad('farm-west',192,256,32,352);
registerVillageRoad('farm-east',604,256,34,344);
registerVillageRoad('farm-south',192,576,448,32);
// Permanent yard approaches use the same road surface as future construction.
registerVillageRoad('farm-house-yard',352,160,128,96);
registerVillageRoad('farm-barn-yard',736,192,96,64);
registerVillageRoad('farm-coop-access',256,64,32,192);
registerVillageRoad('farm-coop-gate',192,64,64,32);
registerVillageRoad('west-core',604,600,34,438);
registerVillageRoad('west-south',604,1038,34,676,['herbs','sheep','nursery','scenic']);
// The west riverbank branch serves the forest depot and the square, not initial traffic.
registerVillageRoad('east-core',1220,600,32,438,['forest','plaza']);
registerVillageRoad('east-north',1220,291,32,309,['forest']);
registerVillageRoad('east-south',1220,1038,32,184,['herbs','sheep','mine']);
RIVER_BRIDGES.forEach((b,i)=>{
  const owners=i===1?[]:i===0?['forest']:i===2?['herbs','sheep','mine']:['mine'];
  registerVillageRoad(`bridge-${i}-west`,b.westRoad,b.y,b.west-b.westRoad+3,b.height,owners);
  registerVillageRoad(`bridge-${i}`,b.west,b.y,b.east-b.west,b.height,owners,b);
  const eastStart=VILLAGE_ROADS.length;
  registerVillageRoad(`bridge-${i}-east`,b.east-3,b.y,b.eastRoad-b.east+3,b.height,owners);
  // Keep the central crossing through the carrier's stop. Its unused eastern
  // tail joins the quarry approach later; preserve the existing 32px save IDs.
  if(i===1){
    const pieces=VILLAGE_ROADS.slice(eastStart),stopRight=COURIER_TRAILS[9].x+COURIER_TRAILS[9].w;
    for(const r of pieces)if(r.x>=stopRight)r.owners=['mine'];
    // End the initial bend flush with the vertical lane, not 8px beyond it.
    // Transfer the remainder to the next piece so mature roads and save IDs stay intact.
    const corner=pieces.find(r=>r.x<stopRight&&r.x+r.w>stopRight);
    const tail=corner&&pieces[pieces.indexOf(corner)+1];
    if(tail){
      const extra=corner.x+corner.w-stopRight;
      corner.w-=extra;tail.x-=extra;tail.w+=extra;
    }
  }
});
const trailOwners=[[],[],['lake'],['herbs'],['sheep'],['forest'],['forest'],['forest'],['forest'],[]];
COURIER_TRAILS.forEach((r,i)=>registerVillageRoad(`trail-${i}`,r.x,r.y,r.w,r.h,trailOwners[i]||[]));
MINE_LAYOUT.paths.forEach((r,i)=>registerVillageRoad(`mine-${i}`,r.x,r.y,r.w,r.h,['mine']));
TOWN_LAYOUT.paths.forEach((r,i)=>registerVillageRoad(`traveller-${i}`,r.x,r.y,r.w,r.h,i<3?['donkeyRoad']:['traveller']));
SCENIC_PATHS.forEach((r,i)=>{
  // Extend the tea approach's first piece north to fill its elbow, keeping the
  // original saved 32px boundaries and the remaining pieces in place.
  const extension=i===4?14:0,start=VILLAGE_ROADS.length;
  registerVillageRoad(`scenic-${i}`,r.x,r.y+extension,r.w,r.h-extension,i<2?['plaza']:['scenic']);
  if(extension){VILLAGE_ROADS[start].y-=extension;VILLAGE_ROADS[start].h+=extension;}
});
Object.values(NURSERY_LAYOUT.paths).forEach((r,i)=>registerVillageRoad(`nursery-${i}`,r.x,r.y,r.w,r.h,['nursery']));
registerVillageRoad('sheep-gate',638,1378,66,32,['sheep']);
registerVillageRoad('pasture-home',638,1345,84,24,['sheep']);
// Enter the crew lodge from the southern through-road, with no parallel garden-side detour.
registerVillageRoad('camp-north',MARKET_LAYOUT.garden.access.left,1128,32,68);
registerVillageRoad('camp-cross',MARKET_LAYOUT.garden.access.left,1191,172,31);
registerVillageRoad('camp-west',1584,1191,32,163);
registerVillageRoad('camp-door',1584,1322,118,32);
registerVillageRoad('garden-access',MARKET_LAYOUT.garden.access.left,MARKET_LAYOUT.garden.access.top,
  MARKET_LAYOUT.garden.access.width,MARKET_LAYOUT.garden.access.bottom-MARKET_LAYOUT.garden.access.top);
registerVillageRoad('garden-aisle',MARKET_LAYOUT.garden.aisle.left,MARKET_LAYOUT.garden.aisle.top,
  MARKET_LAYOUT.garden.aisle.width,MARKET_LAYOUT.garden.aisle.height);
registerVillageRoad('village-south',1432,938,584,32);
registerVillageRoad('village-north',1432,804,584,28);
registerVillageRoad('village-west',1444,804,32,234);
registerVillageRoad('village-middle',1697,804,32,166);
// Paths from the connected road to remote front doors are part of their regional contracts.
registerVillageRoad('forest-door',1121,257,32,50,['forest']);
// Retain saved segment IDs; this connection shares the southern bridge road's footprint.
registerVillageRoad('herb-home',620,1191,395,31,['herbs']);
registerVillageRoad('herb-door',699,1183,32,39,['herbs']);
registerVillageRoad('lake-door',499,962,32,73,['lake']);
registerVillageRoad('nursery-creek',83,1500,72,15,['nursery']);
VILLAGE_ROADS.find(r=>r.id==='nursery-creek:0').footBridge=true;
// The small wetland plank is approached on foot along the existing grass bank.
for(const r of VILLAGE_ROADS.filter(r=>r.id.startsWith('nursery-creek:')))r.footBridge=true;
const VILLAGE_ROAD_BY_ID = Object.fromEntries(VILLAGE_ROADS.map(r=>[r.id,r]));
const VILLAGE_ROAD_COVERERS = new Map(VILLAGE_ROADS.map(r=>[r,VILLAGE_ROADS.filter(b=>
  b!==r&&!b.bridge&&!b.footBridge&&b.x<r.x+r.w&&b.x+b.w>r.x&&b.y<r.y+r.h&&b.y+b.h>r.y)]));
function villageRoadRecorded(r,state=farm) {
  return !state.development||!r.owners.length||r.owners.some(id=>villageSiteOpen(id,state))
    ||state.development.roads.includes(r.id);
}
function villageRoadBuilt(r,state=farm) {
  if(villageRoadRecorded(r,state))return true;
  if(r.bridge||r.footBridge)return false;
  // Shared contracts may split the same surface at different offsets. Only fully
  // covered pieces count as built; a crossing or a partly built neighbor is insufficient.
  const covering=VILLAGE_ROAD_COVERERS.get(r).filter(b=>villageRoadRecorded(b,state));
  if(!covering.length)return false;
  const xs=[...new Set([r.x,r.x+r.w,...covering.flatMap(b=>
    [Math.max(r.x,b.x),Math.min(r.x+r.w,b.x+b.w)])])].sort((a,b)=>a-b);
  for(let i=1;i<xs.length;i++){
    const spans=covering.filter(b=>b.x<=xs[i-1]&&b.x+b.w>=xs[i])
      .map(b=>[Math.max(r.y,b.y),Math.min(r.y+r.h,b.y+b.h)]).sort((a,b)=>a[0]-b[0]);
    let bottom=r.y;
    for(const [top,end]of spans){if(top>bottom)return false;bottom=Math.max(bottom,end);}
    if(bottom<r.y+r.h)return false;
  }
  return true;
}
function villageRoadAt(x,y,state=farm,padding=0) {
  if(state===farm&&padding===0){
    const graph=villageRoadGraph(),bucket=graph.buckets.get(`${Math.floor(x/64)}:${Math.floor(y/64)}`)||[];
    return bucket.some(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);
  }
  return VILLAGE_ROADS.some(r=>villageRoadBuilt(r,state)&&x>=r.x-padding&&x<=r.x+r.w+padding
    &&y>=r.y-padding&&y<=r.y+r.h+padding);
}
function villageProjectRoads(id) { return VILLAGE_ROADS.filter(r=>r.owners.includes(id)); }
function villageRoadCenter(r) { return {x:r.x+r.w/2,y:r.y+r.h/2}; }
function villageRoadAdjacent(a,b) {
  return a.x<=b.x+b.w+2&&a.x+a.w+2>=b.x&&a.y<=b.y+b.h+2&&a.y+a.h+2>=b.y;
}
// Cached graph contains only built connections. A bridge is an indivisible crossing.
let villageRoadCache=null;
function villageRoadGraph() {
  const d=farm.development,key=d?`${d.revision}:${d.roads.length}`:'legacy';
  if(villageRoadCache?.state===d&&villageRoadCache.key===key)return villageRoadCache;
  const nodes=VILLAGE_ROADS.filter(r=>villageRoadBuilt(r)),edges=nodes.map(()=>[]);
  nodes.forEach((a,i)=>{for(let j=i+1;j<nodes.length;j++)if(villageRoadAdjacent(a,nodes[j])){
    edges[i].push(j);edges[j].push(i);
  }});
  const buckets=new Map();
  for(const r of nodes)for(let x=Math.floor(r.x/64);x<=Math.floor((r.x+r.w)/64);x++)
    for(let y=Math.floor(r.y/64);y<=Math.floor((r.y+r.h)/64);y++){
      const k=`${x}:${y}`;if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(r);
    }
  return villageRoadCache={state:d,key,nodes,edges,buckets};
}
function villageWalkingPath(actor,goal) {
  const {nodes,edges}=villageRoadGraph();
  // The wetland plank is reached over the grass bank, not connected to the
  // village road network. Do not attach either end of a road journey to it.
  const entrances=nodes.map((r,i)=>r.footBridge?-1:i).filter(i=>i>=0);
  if(!entrances.length)return null;
  const closest=p=>entrances.reduce((best,i)=>distance(p,villageRoadCenter(nodes[i]))<distance(p,villageRoadCenter(nodes[best]))?i:best,entrances[0]);
  const start=closest(actor),end=closest(goal),queue=[start],previous=new Map([[start,null]]);
  for(let i=0;i<queue.length&&!previous.has(end);i++)for(const n of edges[queue[i]])
    if(!previous.has(n)){previous.set(n,queue[i]);queue.push(n);}
  if(!previous.has(end))return null;
  const path=[];for(let n=end;n!==null;n=previous.get(n))path.unshift(villageRoadCenter(nodes[n]));
  return [...path,{...goal}];
}
function villageDepotOpen(id) {
  return id==='farm'||villageSiteOpen(({lake:'lake',forest:'forest',valley:'herbs',pasture:'sheep',nursery:'nursery'})[id]);
}
