const assert=require('node:assert/strict');
const {run,context2d}=require('./harness.cjs');
// Initial roads serve actual residents, not future facilities. Check the same
// geometry used by the main surface, route planner and minimap.
const deferredPoints=[[1228,620],[1228,856],[1200,870],[934,985],[1850,1021]];
for(const [x,y] of deferredPoints){
  assert.equal(run(`villageRoadAt(${x},${y})`),false);
  assert.equal(run(`villageRoadSurfaceAt(villageRoadPaint().graph,${x},${y})`),false);
}
run('drawVillageDevelopmentMiniMap()');
const miniRoads=context2d.pathRectangles;
for(const [x,y] of deferredPoints){
  const p=run(`({x:${x}*MINI_W/WORLD_W,y:${y}*MINI_H/WORLD_H})`);
  assert.ok(!miniRoads.some(([left,top,w,h])=>p.x>=left&&p.x<left+w&&p.y>=top&&p.y<top+h));
}
assert.equal(run(`(()=>{
  const g=villageRoadGraph(),seen=new Set([0]),queue=[0];
  for(let i=0;i<queue.length;i++)for(const n of g.edges[queue[i]])if(!seen.has(n)){seen.add(n);queue.push(n);}
  return seen.size===g.nodes.length;
})()`),true,'The entire initial road network remains connected');
assert.equal(run(`(()=>{
  const routes=[COURIER_OUTBOUND,[...courierReturnBase(['farm']),...COURIER_DIRECT_RETURN]];
  for(const route of routes)for(let i=0;i<route.length;i++){
    const a=route[Math.max(0,i-1)],b=route[i],steps=Math.max(1,Math.ceil(distance(a,b)/8));
    for(let j=0;j<=steps;j++)if(!courierRoadAt(a.x+(b.x-a.x)*j/steps,a.y+(b.y-a.y)*j/steps))return false;
  }
  return true;
})()`),true,'Initial courier journeys stay on roads, including the retained cart stop');
// One paint operation must cover the whole road union, including touching construction pieces.
const pathFill=context2d.fill;
const fills=[];
context2d.fill=function(){fills.push(this.fillStyle);pathFill.call(this);};
run('drawVillageRoadSurface()');
assert.equal(fills.filter(color=>color==='#d0b586').length,1);
assert.equal(fills.filter(color=>color==='rgba(208,181,134,0.48)').length,1);
assert.equal(fills.filter(color=>color==='rgba(208,181,134,0.52)').length,1);
context2d.fill=pathFill;
function inspectEdges(){
  return run(`(()=>{
    const paint=villageRoadPaint(),seen=new Set(),depths=new Set();
    for(const e of paint.edges)for(let x=e.x;x<e.x+e.w;x++){
      const key=e.y*WORLD_W+x;
      if(seen.has(key))throw Error('Road edges painted twice');seen.add(key);
      if(villageRoadSurfaceAt(paint.graph,x+.5,e.y+.5)||riverAt(x+.5,e.y+.5,0))
        throw Error('Feather painted inside a road junction or river');
      if(e.y<256&&x>=280&&x<410)depths.add(256-e.y);
    }
    const before=JSON.stringify({state:farm,runtime:captureRuntimeState()});drawVillageRoads();drawVillageRoads();
    return {depths:[...depths],unchanged:JSON.stringify({state:farm,runtime:captureRuntimeState()})===before,
      cached:paint===villageRoadPaint(),edgeCount:paint.edges.length};
  })()`);
}
const initial=inspectEdges();
assert.ok(initial.unchanged&&initial.cached);
assert.ok(initial.depths.includes(3)&&initial.depths.some(d=>d>3),'Road edge should have a rough 3–7px grass transition');
assert.equal(run('villageRoadSurfaceAt(villageRoadPaint().graph,620,1699)'),false);
// Build the riverbank from the existing bridge, one saved segment at a time.
run(`const bankPiece=villageNextRoad('forest');
 farm.development.roads.push(bankPiece.id);farm.development.revision++;`);
assert.equal(run('villageRoadAt(1228,990)'),true);
assert.equal(run('villageRoadAt(1228,960)'),false);
assert.equal(run('parseFarmSave(JSON.parse(farmExportText())).development.roads.includes(bankPiece.id)'),true);
run('farm.development=makeVillageDevelopmentState()');
run('farm.upgrades=5;farm.goatBarnOpen=true;farm.development=makeLegacyVillageDevelopment(farm)');
const mature=inspectEdges();
assert.ok(mature.unchanged&&mature.cached);
assert.ok(mature.edgeCount>initial.edgeCount);
assert.equal(run('villageRoadSurfaceAt(villageRoadPaint().graph,620,1699)'),true);
for(const [x,y] of deferredPoints)assert.equal(run(`villageRoadAt(${x},${y})`),true,
  'Developed saves keep all completed connections');
// A newly completed 32px segment changes the painted perimeter without changing its neighbors.
run(`farm.development=makeVillageDevelopmentState();
 const piece=VILLAGE_ROAD_BY_ID['west-south:0'];
 farm.development.roads.push(piece.id);farm.development.revision++;`);
assert.equal(run('villageRoadSurfaceAt(villageRoadPaint().graph,620,1050)'),true);
assert.equal(run('villageRoadSurfaceAt(villageRoadPaint().graph,620,1085)'),false);
assert.ok(inspectEdges().unchanged);
// A project must reuse an existing surface, including pieces with different split offsets.
run('farm.development=makeVillageDevelopmentState()');
assert.equal(run("villageRoadBuilt(VILLAGE_ROAD_BY_ID['bridge-2-east:3'])"),true,
  'The initial crew approach already covers this future bridge-road piece');
assert.equal(run("villageRoadBuilt(VILLAGE_ROAD_BY_ID['bridge-2-east:7'])"),false,
  'Partial coverage must not open the unfinished end of a road');
assert.equal(run("villageRoadBuilt(VILLAGE_ROAD_BY_ID['mine-0:0'])"),true,
  'The quarry contract must reuse the existing village junction');
assert.equal(run("villageRoadBuilt(VILLAGE_ROAD_BY_ID['mine-0:1'])"),false);
assert.equal(run('villageRoadAt(1520,1180)'),false,'Remove the parallel detour south of the vegetable garden');
assert.equal(run('villageRoadAt(1520,1206)&&villageRoadAt(1600,1280)'),true);
assert.ok(run('villageWalkingPath(COURIER_VILLAGE_DOOR,VILLAGE_CREW_HOME.door)')?.length,
  'The crew lodge remains reachable on the initial road graph');
run("farm.development.roads.push('bridge-2-west:0');farm.development.revision++");
assert.equal(run("villageRoadBuilt(VILLAGE_ROAD_BY_ID['herb-home:0'])"),true);
assert.equal(run("villageRoadBuilt(VILLAGE_ROAD_BY_ID['herb-home:1'])"),false);
run("farm.development.roads.push('herb-home:1');farm.development.revision++");
assert.equal(run("villageRoadBuilt(VILLAGE_ROAD_BY_ID['bridge-2-west:1'])"),true,
  'Shared-road reuse works from either saved segment identifier');
// The main farm must not paint legacy road tiles over the development road surface.
const {colors}=require('./harness.cjs');colors.length=0;
run('paths()');
assert.ok(!colors.includes('#d0b586'));
assert.ok(colors.includes('#d9c69d'),'Keep the orchard stepping stones');
run('farm.upgrades=5;farm.goatBarnOpen=true;farm.development=makeLegacyVillageDevelopment(farm)');
assert.equal(run('villageRoadAt(800,1206)'),true);
assert.equal(run('villageRoadAt(800,1228)'),false,'The herb frontage does not widen the southern main road');
assert.equal(run(`(()=>{
  const groups=new Map();
  for(const r of VILLAGE_ROADS){
    const id=r.id.split(':')[0],a=groups.get(id);
    if(!a)groups.set(id,{x:r.x,y:r.y,right:r.x+r.w,bottom:r.y+r.h});
    else{a.x=Math.min(a.x,r.x);a.y=Math.min(a.y,r.y);a.right=Math.max(a.right,r.x+r.w);a.bottom=Math.max(a.bottom,r.y+r.h);}
  }
  const roads=[...groups.values()].map(r=>({...r,w:r.right-r.x,h:r.bottom-r.y}));
  for(let i=0;i<roads.length;i++)for(let j=i+1;j<roads.length;j++){
    const a=roads[i],b=roads[j],horizontal=a.w>=a.h;
    if(horizontal!==(b.w>=b.h)||Math.max(a.w,a.h)<2*Math.min(a.w,a.h)||Math.max(b.w,b.h)<2*Math.min(b.w,b.h))continue;
    const length=Math.min(horizontal?a.right:a.bottom,horizontal?b.right:b.bottom)-Math.max(horizontal?a.x:a.y,horizontal?b.x:b.y);
    const across=Math.min(horizontal?a.bottom:a.right,horizontal?b.bottom:b.right)-Math.max(horizontal?a.y:a.x,horizontal?b.y:b.x);
    if(length>2*Math.max(horizontal?a.h:a.w,horizontal?b.h:b.w)&&across>0&&(horizontal?a.y!==b.y:a.x!==b.x))return false;
  }
  return true;
})()`),true,'Audit every road ribbon for long, offset parallel overlaps');
assert.equal(run('JSON.stringify(parseFarmSave(JSON.parse(farmExportText())).development)===JSON.stringify(farm.development)'),true);
// Tea approach: the east leg starts at the crosspath's top, with no missing elbow.
for(let x=942;x<974;x++)for(let y=1726;y<1754;y++)
  assert.equal(run(`villageRoadSurfaceAt(villageRoadPaint().graph,${x}+.5,${y}+.5)`),true);
assert.deepEqual(Array.from(run("['scenic-4:0','scenic-4:1','scenic-4:2'].map(id=>{const r=VILLAGE_ROAD_BY_ID[id];return [r.y,r.h];})"),r=>Array.from(r)),
  [[1726,46],[1772,32],[1804,8]],'Keep saved segment boundaries after extending the first piece');
run("const completedScenicDevelopment=farm.development;farm.development=makeVillageDevelopmentState()");
assert.equal(run('villageRoadAt(966,1730)'),false,'The corrected corner stays grass before construction');
run("farm.development.roads.push('scenic-4:0');farm.development.revision++");
assert.equal(run('villageRoadAt(966,1730)'),true,'The first saved piece includes the complete elbow');
assert.equal(run('villageRoadAt(966,1780)'),false,'The next segment is not shown prematurely');
assert.equal(run('JSON.stringify(parseFarmSave(JSON.parse(farmExportText())).development)===JSON.stringify(farm.development)'),true);
run('farm.development=completedScenicDevelopment');
console.log('Road art passed: union painting, shared construction, initial lodge access, aligned mature roads, saved segment IDs and read-only rendering.');
