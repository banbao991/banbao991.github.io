'use strict';
// Shared deterministic plant locations and land-clearance masks; no painting or simulation.
const VILLAGE_FACILITIES = {
  lake:[{left:455,top:899,right:536,bottom:962}],
  greenhouse:[VILLAGE_PROJECTS.greenhouse.site],forest:[VILLAGE_PROJECTS.forest.site],
  herbs:[{left:671,top:1074,right:758,bottom:1183},{left:786,top:1046,right:876,bottom:1185}],
  plaza:[{left:860,top:660,right:1010,bottom:750},{left:1043,top:665,right:1109,bottom:719}],
  sheep:[SHEEP_LAYOUT.barn,PASTURE_WORKER_LAYOUT.cottage],goats:[GOAT_LAYOUT.barn],nursery:[NURSERY_LAYOUT.home],
  scenic:[VALLEY_GARDEN_LAYOUT.teaHouse,VALLEY_GARDEN_LAYOUT.lookout],
  mine:[MINE_LAYOUT.home,{left:1718,top:1340,right:1800,bottom:1410},
    {left:1692,top:1608,right:1740,bottom:1646},
    {left:MARKET_LAYOUT.stalls[1].x,top:844,right:MARKET_LAYOUT.stalls[1].x+118,bottom:916}],
  traveller:[TOWN_LAYOUT.home],donkeyRoad:[]
};
// Trees keep their dispersed anchors; grass grows in irregular clumps with open
// ground between them. Anchors stay fixed; the life layer stores growth and upkeep.
const villageWildPlantCache=new Map();
function villageWildPlantArea(id) {
  if(id==='herbs')return {...VILLAGE_PROJECTS[id].site,right:VALLEY_GARDEN_LAYOUT.herbs.right};
  if(id==='nursery')return {...NURSERY_LAYOUT.area,bottom:1648};
  if(id==='traveller')return {...TOWN_LAYOUT.district,right:TOWN_LAYOUT.showcases.at(-1).right};
  if(id==='donkeyRoad')return {...TOWN_LAYOUT.donkeyInn.area,right:TOWN_LAYOUT.donkeyInn.pen.right,bottom:TOWN_LAYOUT.donkeyInn.pen.bottom};
  return VILLAGE_PROJECTS[id].site;
}
function villageWildPlantCandidates(id) {
  if(villageWildPlantCache.has(id))return villageWildPlantCache.get(id);
  const s=villageWildPlantArea(id),width=s.right-s.left-20,height=s.bottom-s.top-20;
  const columns=Math.max(1,Math.ceil(width/44)),rows=Math.max(1,Math.ceil(height/44));
  const salt=VILLAGE_PROJECT_IDS.indexOf(id),positions=[],nearby=new Map();
  for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
    const seed=row*columns+column;
    for(let attempt=0;attempt<4;attempt++){
      const x=Math.round(s.left+10+(column+.1+hash(seed,1721+salt,attempt)*.8)*width/columns);
      const y=Math.round(s.top+10+(row+.1+hash(seed,1781+salt,attempt)*.8)*height/rows);
      const bx=Math.floor(x/20),by=Math.floor(y/20);let crowded=false;
      for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)
        if((nearby.get(`${bx+dx}:${by+dy}`)||[]).some(p=>Math.hypot(p.x-x,p.y-y)<20))crowded=true;
      if(crowded)continue;
      const plant={x,y,seed,kind:'grass',shape:Math.floor(hash(seed,1831+salt)*4),tone:hash(seed,1841+salt),
        size:hash(seed,1851+salt),lean:hash(seed,1861+salt)>.5?1:-1};
      positions.push(plant);const key=`${bx}:${by}`;
      if(!nearby.has(key))nearby.set(key,[]);nearby.get(key).push(plant);break;
    }
  }
  // Tree density follows area too; spread anchors, then choose nearby fixed points.
  if(id!=='mine'){
    const trees=[],limit=Math.min(7,Math.round(width*height/26000));
    const established=[...regionTrees.map(([x,y])=>({x,y:y+27})),...valleyTrees.map(([x,y])=>({x,y:y+25})),
      ...EAST_WOODS.trees,...EAST_SHORE.trees];
    const candidates=positions.filter(p=>p.y>s.top+60&&established.every(tree=>distance(tree,p)>76));
    const cols=Math.max(1,Math.ceil(Math.sqrt(limit*width/height))),rows=Math.max(1,Math.ceil(limit/cols));
    for(let i=0;i<limit;i++){
      const target={x:s.left+10+(i%cols+.25+hash(i,1813+salt)*.5)*width/cols,
        y:s.top+10+(Math.floor(i/cols)+.25+hash(i,1819+salt)*.5)*height/rows};
      const choices=candidates.filter(p=>p.kind==='grass'&&trees.every(tree=>distance(tree,p)>96));
      const plant=choices.reduce((best,p)=>!best||distance(p,target)<distance(best,target)?p:best,null);
      if(plant){plant.kind='tree';plant.treeShape=Math.floor(hash(plant.seed,1823+salt)*3);trees.push(plant);}
    }
  }
  const plants=villageWildGrassCandidates(id,positions.filter(p=>p.kind==='tree'));
  villageWildPlantCache.set(id,plants);return plants;
}
function villageWildGrassCandidates(id,trees) {
  const s=villageWildPlantArea(id),width=s.right-s.left-20,height=s.bottom-s.top-20;
  const salt=VILLAGE_PROJECT_IDS.indexOf(id),plants=[...trees],buckets=new Map();
  const remember=p=>{
    const key=`${Math.floor(p.x/12)}:${Math.floor(p.y/12)}`;
    if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(p);
  };
  trees.forEach(remember);
  const add=(x,y,seed,patch)=>{
    x=Math.round(x);y=Math.round(y);
    if(x<8||y<14||x>WORLD_W-8||y>WORLD_H-8)return;
    const bx=Math.floor(x/12),by=Math.floor(y/12);
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)
      if((buckets.get(`${bx+dx}:${by+dy}`)||[]).some(p=>Math.hypot(p.x-x,p.y-y)<12))return;
    const p={x,y,seed,patch,kind:'grass',shape:Math.floor(hash(seed,1831+salt)*4),
      tone:hash(seed,1841+salt),size:hash(seed,1851+salt),lean:hash(seed,1861+salt)>.5?1:-1};
    plants.push(p);remember(p);
  };
  const patch=(center,rx,ry,seed,bounds=null)=>{
    const count=5+Math.floor(hash(seed,1941+salt)*7);
    for(let i=0;i<count;i++){
      const key=seed+i,angle=hash(key,1951+salt)*Math.PI*2;
      const radius=Math.sqrt(hash(key,1961+salt))*(i<3?.48:1);
      const x=center.x+Math.cos(angle)*radius*rx,y=center.y+Math.sin(angle)*radius*ry;
      if(bounds&&!inRect(x,y,bounds.left+8,bounds.top+14,bounds.right-8,bounds.bottom-8))continue;
      add(x,y,key,seed);
    }
  };
  const count=Math.max(1,Math.round(width*height/14500));
  const cols=Math.max(1,Math.ceil(Math.sqrt(count*width/height))),rows=Math.ceil(count/cols);
  // Shuffle the occupied cells so a short final row never leaves one edge bare.
  const cells=Array.from({length:cols*rows},(_,i)=>i).sort((a,b)=>hash(a,1921+salt)-hash(b,1921+salt));
  for(let i=0;i<count;i++){
    const cell=cells[i],seed=10000+i*32;
    const center={x:s.left+10+(cell%cols+.16+hash(i,1927+salt)*.68)*width/cols,
      y:s.top+10+(Math.floor(cell/cols)+.16+hash(i,1931+salt)*.68)*height/rows};
    patch(center,28+hash(i,1937+salt)*30,20+hash(i,1939+salt)*20,seed,s);
  }
  // A few isolated blades bridge the gaps without filling them evenly again.
  for(let i=0;i<Math.round(width*height/24000);i++)
    add(s.left+10+hash(i,1981+salt)*width,s.top+14+hash(i,1987+salt)*(height-4),50000+i,null);
  // Future roads are natural ground too. Give shared pieces one owner so their
  // clumps are drawn once; built-road filtering removes them as paving advances.
  for(const [i,r]of VILLAGE_ROADS.entries()){
    if(r.owners[0]!==id||r.bridge||r.footBridge||hash(r.x,r.y,1991)<.72)continue;
    const horizontal=r.w>=r.h,center={x:r.x+r.w*(.2+hash(i,1993)*.6),y:r.y+r.h*(.2+hash(i,1997)*.6)};
    // Spread across the neighboring meadow as well, so grass cannot trace the
    // straight outline of a road that has not been built yet.
    if(horizontal)center.y+=(hash(i,1999)-.5)*76;
    else center.x+=(hash(i,1999)-.5)*76;
    patch(center,horizontal?30:19,horizontal?19:30,100000+i*32);
  }
  return plants;
}
function villageWildPlants(id) {
  const context=villagePlantGroundContext();
  return villageWildPlantCandidates(id).filter(plant=>villagePlantGroundAllowed(id,plant,context));
}
function villagePlantGroundContext() {
  const graph=villageRoadGraph();
  // Roadside clumps can extend beyond their project's site. Existing homes and
  // completed neighboring buildings must stay clear even before this road opens.
  const buildings=[VILLAGE_CREW_HOME,...MARKET_LAYOUT.homes.map(h=>
    ({left:h.x,top:h.y,right:h.x+117,bottom:h.y+116})),
    ...VILLAGE_PROJECT_IDS.filter(project=>villageSiteOpen(project)).flatMap(project=>VILLAGE_FACILITIES[project])];
  return {graph,buildings};
}
function villagePlantGroundAllowed(id,plant,context=villagePlantGroundContext()) {
    const {graph,buildings}=context;
    const {x,y}=plant,padding=plant.kind==='tree'?20:14;
    for(let bx=Math.floor((x-padding)/64);bx<=Math.floor((x+padding)/64);bx++)
      for(let by=Math.floor((y-padding)/64);by<=Math.floor((y+padding)/64);by++)
        if((graph.buckets.get(`${bx}:${by}`)||[]).some(r=>x>=r.x-padding&&x<=r.x+r.w+padding
          &&y>=r.y-padding&&y<=r.y+r.h+padding))return false;
    if(buildings.some(b=>inRect(x,y,b.left-padding,b.top-padding,b.right+padding,b.bottom+padding)))return false;
    if(riverAt(x,y,10)||pondAt(x,y)||lakeAt(x,y)||valleyLakeAt(x,y))return false;
    if(id==='nursery'&&(wetlandCreekAt(x,y,18)||wetlandMarshDepth(x,y)<1.08))return false;
    return true;
}
function villageProjectPlantFootprints(id) {
  const footprints=[...VILLAGE_FACILITIES[id],...(VILLAGE_CLEARING_SITES[id]||[])];
  if(id==='sheep')footprints.push(SHEEP_LAYOUT.pen);
  if(id==='goats')footprints.push(GOAT_LAYOUT.pen);
  if(id==='herbs')footprints.push(VALLEY_GARDEN_LAYOUT.herbs,
    {left:VALLEY_WORKER_LAYOUT.chair.x-23,top:VALLEY_WORKER_LAYOUT.chair.y-25,right:VALLEY_WORKER_LAYOUT.chair.x+23,bottom:VALLEY_WORKER_LAYOUT.chair.y+25});
  if(id==='traveller'){
    footprints.push(TOWN_LAYOUT.yard,TOWN_LAYOUT.teaYard);
    for(const shelf of TOWN_LAYOUT.showcases)if(shelf.slots.some(slot=>farm.town.inventory[slot.id]))footprints.push(shelf);
    if(farm.town.improvements.travellerGarden.level){
      const garden=TOWN_LAYOUT.garden;
      footprints.push({left:garden.x-60,top:garden.y-35,right:garden.x+65,bottom:garden.y+60},
        TOWN_LAYOUT.gardenHabitat);
      for(const bed of EAST_GARDEN_EXTENSION.beds)if(farm.town.improvements.travellerGarden.level>bed.stage)
        footprints.push({left:bed.x-30,top:bed.y-24,right:bed.x+30,bottom:bed.y+12});
      if(farm.town.improvements.travellerGarden.level>1){const b=EAST_GARDEN_EXTENSION.bench;
        footprints.push({left:b.x-32,top:b.y-15,right:b.x+33,bottom:b.y+17});}
    }
  }
  if(id==='plaza')footprints.push(CENTRAL_PLAZA);
  if(id==='mine')footprints.push({left:1690,top:1460,right:2048,bottom:1920});
  return footprints.map(s=>({left:s.left-18,top:s.top-12,right:s.right+18,bottom:s.bottom+14}))
    .concat(VILLAGE_WORK_YARDS[id]?[VILLAGE_WORK_YARDS[id]]:[]);
}
function villageWildPlantClearance() {
  const masks=[];
  for(const id of VILLAGE_PROJECT_IDS){
    const p=farm.development.projects[id];
    const clear=p.status==='complete'?1:p.status==='active'&&p.stage!=='road'
      ?clamp((p.work/(VILLAGE_PROJECTS[id].days*VILLAGE_WORK_DAY)-.3)/.1,0,1):0;
    if(clear)for(const bounds of villageProjectPlantFootprints(id))masks.push({bounds,clear});
  }
  // Restored beds and small facilities clear every generator's clumps as well.
  const restRow=NURSERY_LAYOUT.bedWalkways.rows[1];
  if(farm.nursery.level){
    masks.push({bounds:{left:NURSERY_LAYOUT.rest.x-40,top:NURSERY_LAYOUT.rest.y-20,
      right:NURSERY_LAYOUT.rest.x+40,bottom:NURSERY_LAYOUT.rest.y+20},clear:1});
    masks.push({bounds:{left:NURSERY_LAYOUT.aisle.x-12,top:restRow-10,
      right:NURSERY_LAYOUT.rest.x+14,bottom:NURSERY_LAYOUT.rest.y+14},clear:1});
  }
  const restored=NURSERY_LAYOUT.beds.filter((bed,i)=>farm.nursery.beds[i].builtAt!==null);
  for(const bed of restored){
    masks.push({bounds:{left:bed.x-35,top:bed.y-30,right:bed.x+35,bottom:bed.y+25},clear:1});
    const lane=NURSERY_LAYOUT.bedWalkways.columns.find(x=>x>bed.x);
    masks.push({bounds:{left:lane-20,top:Math.min(bed.y,restRow)-14,right:lane+20,
      bottom:Math.max(bed.y,NURSERY_LAYOUT.aisle.y)+14},clear:1});
    masks.push({bounds:{left:bed.x-12,top:bed.y-14,right:lane+20,bottom:bed.y+14},clear:1});
  }
  if(restored.length){
    const left=Math.min(...restored.map(b=>NURSERY_LAYOUT.bedWalkways.columns.find(x=>x>b.x)));
    for(const y of NURSERY_LAYOUT.bedWalkways.rows)if(y>=Math.min(...restored.map(b=>b.y))-32
      &&y<=Math.max(...restored.map(b=>b.y))+32)
      masks.push({bounds:{left:left-20,top:y-14,right:NURSERY_LAYOUT.rest.x+14,bottom:y+14},clear:1});
    masks.push({bounds:{left:left-20,top:restRow-14,right:NURSERY_LAYOUT.rest.x+14,bottom:restRow+14},clear:1});
  }
  const comfort=TOWN_LAYOUT.projects.catComfort;
  if(farm.town.improvements.catComfort.level)masks.push({bounds:{left:comfort.x-35,top:comfort.y-36,
    right:comfort.x+43,bottom:comfort.y+30},clear:1});
  if(villageSiteOpen('herbs')&&farm.town.inventory.birdNest){const b=TOWN_LAYOUT.birdhouse;
    masks.push({bounds:{left:b.x-29,top:b.y-62,right:b.x+48,bottom:b.y+22},clear:1});}
  if(farm.town.improvements.donkeyInn.level){
    const area=TOWN_LAYOUT.donkeyInn;
    masks.push({bounds:{left:Math.min(area.stable.left,area.pen.left)-20,top:area.stable.top-20,
      right:area.pen.right+20,bottom:area.pen.bottom+20},clear:1});
    masks.push({bounds:{left:area.notice.x-25,top:area.notice.y-24,
      right:area.notice.x+25,bottom:area.notice.y+40},clear:1});
  }
  return masks;
}
function villagePlantVisible(id,plant,clearance=villageWildPlantClearance()) {
  // `id` identifies deterministic artwork, never the owner of land clearance.
  const sample=hash(plant.seed,1917);
  return !clearance.some(({bounds:s,clear})=>(clear===1||sample<clear)
    &&inRect(plant.x,plant.y,s.left,s.top,s.right,s.bottom));
}
