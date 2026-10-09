'use strict';
// Visibility is shared by the painter, inspection and minimap, rather than covering finished sprites.
function villageSceneProject(id) {
  if(id===`village-stall:${MARKET_LAYOUT.stalls[1].x}`)return 'mine';
  if(/^(fishing-|pier-|lake-boat|angler-)/.test(id))return 'lake';
  if(id==='forest-cabin'||id==='forest-keeper')return 'forest';
  if(/^(valley-windmill|valley-worker-home|valley-rocking-chair|herb-|worker:阿栀|valley-garden-air)/.test(id))return 'herbs';
  if(/^(tea-|valley-lookout)/.test(id))return 'scenic';
  if(/^(nursery-home|nursery-bench|nursery-bed|nursery-keeper|wetland-lookout|wetland-bridge|valley-sign|valley-posts)/.test(id))return 'nursery';
  if(/^(mine-|miner$)/.test(id))return 'mine';
  if(/^(sheep-|pasture-bench|worker:阿牧)/.test(id))return 'sheep';
  if(id==='pasture-worker-home')return 'sheep';
  if(/^goat-/.test(id))return 'goats';
  if(/^(traveller-|town-showcase)/.test(id)&&id!=='traveller-cart')return 'traveller';
  if(/^plaza-(stage|well|bench|flower|shrub)/.test(id))return 'plaza';
  if(/^(town-garden|town-firewood|town-hearth|east-garden)/.test(id))return 'traveller';
  if(id==='town-tea-chimes'||id==='town-pavilion-tea-box')return 'scenic';
  if(id==='east-picnic-bench')return 'donkeyRoad';
  if(id==='east-spring-bench')return 'forest';
  return null;
}
function villageSceneItemVisible(id) {
  if(!farm.development)return true;
  if(id==='sheep-site'||/^goat-site|goat-building-site/.test(id))return false;
  const person=({'angler-walking':'阿蓼','angler-fishing':'阿蓼','forest-keeper':'阿森',
    'nursery-keeper':'阿芽',miner:'阿矿','worker:阿栀':'阿栀','worker:阿牧':'阿牧'})[id];
  if(person&&!villageResidentWorking(person))return false;
  const project=villageSceneProject(id);
  return !project||villageSiteOpen(project);
}
function drawVillageRoads() {
  drawVillageRoadSurface();
  const id=farm.development.active,p=id&&farm.development.projects[id];
  if(p?.stage==='road'){
    const target=villageWorkTarget(id),r=target?.road;
    if(r?.bridge){
      const share=VILLAGE_PROJECTS[id].days*VILLAGE_WORK_DAY*.3/villageProjectRoads(id).length;
      const columns=Math.floor(clamp((p.chunkWork||0)/share,0,1)*Math.ceil(r.w/11));
      const fromWest=target.point.x<r.x+r.w/2;
      for(let i=0;i<columns;i++){
        const x=fromWest?r.x+i*11:r.x+r.w-Math.min((i+1)*11,r.w);
        rect(x,r.y,Math.min(8,r.w-i*11),r.h,'#cda56e');
        scenePart(`construction-bridge:${r.id}:${i}`,r.y+r.h+15,()=>{
          rect(x,r.y+r.h,4,14,'#8d6c4a');
        });
      }
    }
  }
}
function drawVillageWildGrass(plant) {
  const {x,y,shape,lean}=plant,growth=plant.growth??1;
  const height=Math.max(2,Math.round((5+plant.size*7)*(.2+.8*growth))),width=Math.max(2,Math.round((5+plant.size*4)*(.25+.75*growth)));
  const leaf=blendHex(blendHex('#708854','#8f9d64',plant.tone),'#c3ceba',sceneSeason.winter);
  const light=blendHex(blendHex('#92a96e','#b2ab76',plant.tone),'#d4dccb',sceneSeason.winter);
  const dry=blendHex('#adac77','#d8d9bf',sceneSeason.winter);
  rect(x-width,y,2*width+2,2,leaf);
  rect(x-1,y-height,2,height+1,leaf);
  rect(x-width+1,y-Math.max(3,height-3),2,Math.max(3,height-2),leaf);
  rect(x+width-2,y-height+2,2,height-1,light);
  if(growth>.5&&shape===0){rect(x+lean*3,y-height+3,4,2,light);rect(x-lean*5,y-5,3,2,leaf);}
  if(growth>.7&&shape===1){rect(x+lean*2,y-height-2,2,height+3,dry);rect(x+lean*2-2,y-height-3,5,2,dry);}
  if(growth>.4&&shape===2){rect(x-width-3,y-3,5,2,light);rect(x+width,y-4,4,2,leaf);}
  if(growth>.6&&shape===3){rect(x+lean*3,y-height+1,2,height,light);rect(x+lean*3-1,y-height-1,4,3,dry);}
}
function drawVillageWildTree(id,plant) {
  scenePart(`natural-tree:${id}:${plant.seed}`,plant.y,()=>{
    const {x,y,treeShape}=plant,h=43+Math.round(plant.size*15),winter=sceneSeason.winter;
    const leaf=treeShape===0?blendHex('#4e805f','#9bb4a5',winter):sceneSeason.palette.tree;
    const light=treeShape===0?blendHex('#7fa36c','#c1d1bc',winter):sceneSeason.palette.tree2;
    const shade=blendHex(leaf,'#496849',.22);
    rect(x-12,y-2,26,4,'#56704844');rect(x-3,y-h+20,6,h-20,'#806347');rect(x,y-h+25,2,h-26,'#b08c5e');
    if(treeShape===0){
      rect(x-14,y-h+23,29,18,shade);rect(x-11,y-h+11,23,21,leaf);rect(x-7,y-h,15,18,leaf);
      rect(x-5,y-h+4,5,17,light);rect(x-9,y-h+19,9,6,light);
    }else if(treeShape===1){
      rect(x-18,y-h+14,37,20,shade);rect(x-13,y-h+4,27,25,leaf);rect(x-8,y-h,16,8,light);
      rect(x-15,y-h+15,27,14,leaf);rect(x-11,y-h+7,12,9,light);rect(x+5,y-h+17,9,7,light);
    }else{
      rect(x-10,y-h+21,12,4,'#806347');rect(x+2,y-h+14,10,4,'#806347');
      rect(x-14,y-h+9,17,15,leaf);rect(x+2,y-h+2,15,16,leaf);rect(x-6,y-h-2,14,15,leaf);
      rect(x-11,y-h+9,9,5,light);rect(x+5,y-h+3,8,5,light);rect(x-4,y-h-2,7,5,light);
    }
    if(winter>.01)rect(x-5,y-h,11,3,`rgba(239,243,226,${(winter*.7).toFixed(2)})`);
  });
}
function drawVillagePastureHome() {
  if(!villageSiteOpen('sheep'))return;
  const s=PASTURE_WORKER_LAYOUT.cottage,x=s.left,y=s.top;
  scenePart('pasture-worker-home',s.bottom,()=>{
    rect(x+4,y+24,52,52,'#d6bd8c');rect(x-3,y+17,66,13,'#927157');
    rect(x+4,y+8,52,11,'#b89065');rect(x+13,y,34,10,'#caa073');
    rect(x+9,y+37,14,15,windowColor('#8da9a0'));rect(x+29,y+37,19,39,'#836447');
    rect(x+33,y+42,11,31,'#b49365');rect(x+40,y+59,3,3,'#ddc69a');
    rect(x+27,y+74,23,4,'#c5a77a');
  });
}
function drawVillageConstructionFrame(id,p) {
  const total=VILLAGE_PROJECTS[id].days*VILLAGE_WORK_DAY,ratio=p.work/total;
  if(p.stage==='road')return;
  if(id==='lake'&&ratio>=.5){
    const count=Math.floor(clamp((ratio-.5)/.35,0,1)*8);
    for(let i=0;i<count;i++)rect(443-i*14,846+SOUTH_LAKE_SHIFT_Y,11,29,'#c99b65');
  }
  if((id==='sheep'||id==='goats')&&ratio>=.55){
    const pen=id==='sheep'?SHEEP_LAYOUT.pen:GOAT_LAYOUT.pen,posts=[];
    for(let x=pen.left;x<pen.right-5;x+=27)posts.push({x,y:pen.top},{x,y:pen.bottom-28});
    for(let y=pen.top+20;y<pen.bottom-34;y+=27)posts.push({x:pen.left,y},{x:pen.right-8,y});
    for(const post of posts.slice(0,Math.floor(posts.length*clamp((ratio-.55)/.35,0,1))))fencePost(post.x,post.y);
  }
  for(const [i,s]of VILLAGE_FACILITIES[id].entries()){
    const width=s.right-s.left,height=s.bottom-s.top,x=s.left,y=s.bottom;
    const clear=clamp((ratio-.3)/.1,0,1);
    for(let gx=x;gx<s.right;gx+=12)for(let gy=s.top;gy<y;gy+=12)
      if(hash(gx,gy,1871)<clear)rect(gx,gy,Math.min(12,s.right-gx),Math.min(12,y-gy),'#b4a07945');
    if(ratio<.4)continue;
    scenePart(`construction-building:${id}:${i}`,y,()=>{
      rect(x+3,y-9,width-6,9,'#8d7960');rect(x+7,y-7,width-14,4,'#c4ad82');
      if(ratio>=.5){
        for(const px of [x+10,s.right-14])rect(px,y-height*.7,5,height*.7-7,'#8c6648');
        rect(x+8,y-height*.7,width-16,5,'#b88e5b');
        rect(x+8,y-height*.4,width-16,4,'#b88e5b');
      }
      if(ratio>=.65){
        const wall=Math.min(height*.62,height*(ratio-.6)*2);
        rect(x+12,y-wall,width-24,wall-9,'#d7bd8d');
        rect(x+width*.6,y-30,Math.max(12,width*.17),23,'#795a43');
        if(ratio>=.78)rect(x+width*.18,y-height*.4,17,15,'#87a5a0');
      }
      if(ratio>=.85){
        rect(x+5,y-height*.74,width-10,14,'#ac7754');
        rect(x+16,y-height*.84,width-32,14,'#c18d63');
      }
      rect(s.right+5,y-12,18,10,'#b18b5b');rect(s.right+8,y-16,12,5,'#d5b777');
    });
  }
}
function drawVillageCrewHome() {
  const s=VILLAGE_CREW_HOME,x=s.left,y=s.top;
  scenePart('construction-lodge',s.bottom,()=>{
    rect(x+6,y+30,92,62,'#d1bd95');rect(x,y+20,104,20,'#8d7155');
    rect(x+13,y+9,78,15,'#b68d60');rect(x+23,y,58,12,'#caa574');
    rect(x+16,y+49,20,19,windowColor('#85a3a0'));rect(x+66,y+49,20,19,windowColor('#85a3a0'));
    rect(x+42,y+49,22,43,'#826248');rect(x+46,y+54,14,36,'#ad8960');
    rect(x+8,y+76,16,12,'#a47f50');rect(x+76,y+78,21,10,'#b59665');
    rect(x+42,y+31,22,11,'#e4d0a2');rect(x+47,y+34,12,3,'#8d7155');
  });
}
function drawVillageDevelopment() {
  if(!farm.development)return;
  const clearance=villageWildPlantClearance();
  drawVillageCrewHome();
  drawVillagePastureHome();
  for(const id of VILLAGE_PROJECT_IDS){
    const p=farm.development.projects[id];
    for(const plant of villageWildPlants(id)){
      if(!villagePlantVisible(id,plant,clearance))continue;
      if(plant.kind==='tree')drawVillageWildTree(id,plant);
      else {const growth=villageGrassGrowth(`${id}:${plant.seed}`);
        if(growth>0)scenePart(`natural-site:${id}:${plant.seed}`,plant.y+2,()=>drawVillageWildGrass({...plant,growth}));}
    }
    if(p.status==='active')drawVillageConstructionFrame(id,p);
  }
  for(const plant of villageVisibleWeeds(clearance,true))
    scenePart(`natural-growth:${plant.id}`,plant.y+2,()=>drawVillageWildGrass({...plant,growth:villageGrassGrowth(plant.id)}));
  const actors=[...farm.development.crew,...Object.values(farm.development.residents).flatMap(r=>r.actor?[r.actor]:[])];
  for(const a of actors)if(a.mode!=='home'&&!festivalAtHome(a))scenePart(`construction-actor:${a.name}`,actorDepth(a),()=>{
    worker(a);
    if(a.mode==='moving'&&!villageResidentReturnsHome(a.name)){
      rect(a.x+10,a.y+9,12,12,'#9b724b');rect(a.x+13,a.y+6,6,4,'#d4b782');
      rect(a.x+15,a.y+10,2,10,'#d4b782');
    }
    if(a.mode==='work'){
      if(farm.development.maintenance.job?.targets[a.name]){
        const swing=farm.paused?Math.sin(now*.8):Math.sin(a.action*8)*3;
        rect(a.x+9,a.y+6+swing,9,4,'#d8ad7c');rect(a.x+15,a.y+9+swing,3,10,'#91714b');
        rect(a.x+15,a.y+17+swing,9,3,'#a4b4a0');rect(a.x+23,a.y+12+swing,3,7,'#c8d1b8');
      }else{
        const bob=Math.sin(now*3+a.x)*2;rect(a.x+12,a.y+5+bob,3,15,'#95724e');
        rect(a.x+9,a.y+3+bob,10,4,'#8c9891');
      }
    }
  },10);
}
