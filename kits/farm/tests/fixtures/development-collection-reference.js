// Original collection using fresh context per filter call; QA only.
function qaReferenceDevelopmentCollection() {
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
