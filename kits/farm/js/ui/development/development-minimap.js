'use strict';
function drawVillageDevelopmentMiniMap() {
  const clearance=villageWildPlantClearance();
  const sx=MINI_W/WORLD_W,sy=MINI_H/WORLD_H;
  const area=(x,y,w,h,c)=>{mini.fillStyle=c;mini.fillRect(x*sx,y*sy,w*sx,h*sy);};
  const blob=(x,y,rx,ry,c)=>{for(let py=y-ry;py<y+ry;py+=8){const reach=rx*Math.sqrt(Math.max(0,1-((py+4-y)/ry)**2));area(x-reach,py,reach*2,8,c);}};
  const season=seasonTransition();area(0,0,WORLD_W,WORLD_H,season.palette.grass);
  area(960,0,WORLD_W-960,625,blendHex('#658d60','#b7cbc1',season.winter));
  for(let i=0;i<45;i++)area(980+hash(i,31)*1550,35+hash(i,32)*555,24,26,'#608260');
  blob(134,190,84,80,'#78aaa4');blob(242,865+SOUTH_LAKE_SHIFT_Y,146,95,'#79aaa0');blob(195,1220,121,70,'#79aaa0');
  for(const lobe of NURSERY_LAYOUT.wetlandLobes)blob(lobe.x,lobe.y,lobe.rx,lobe.ry,'#759e7a');
  for(const pool of [NURSERY_LAYOUT.wetlandPool,...NURSERY_LAYOUT.wetlandPuddles])blob(pool.x,pool.y,pool.rx,pool.ry,'#80aaa1');
  for(let y=NURSERY_LAYOUT.creek[0].y;y<NURSERY_LAYOUT.creek.at(-1).y;y+=8)area(wetlandCreekCenter(y)-9,y,18,8,'#85aaa0');
  for(let y=0;y<WORLD_H;y+=8)area(riverCenterAt(y)-29,y,58,8,'#76aeb0');
  const roads=villageRoadGraph().nodes;
  mini.beginPath();
  for(const r of roads)if(!r.bridge&&!r.footBridge)mini.rect(r.x*sx,r.y*sy,r.w*sx,r.h*sy);
  mini.fillStyle='#d0b586';mini.fill();
  for(const r of roads)if(r.bridge||r.footBridge)area(r.x,r.y,r.w,r.h,'#c49b68');
  for(const p of farm.plots)area(p.x*T,p.y*T,T,T,'#8b5e43');
  area(312,126,195,130,'#c88b65');area(710,105,175,150,'#ab654d');area(155,15,135,85,'#c59469');
  area(COURIER_COTTAGE.x,COURIER_COTTAGE.y+8,91,112,'#ae7152');area(680,286,260,280,'#9db77e');
  for(const home of MARKET_LAYOUT.homes)area(home.x,home.y+13,117,103,home.roof);
  area(MARKET_LAYOUT.fountain.x-17,MARKET_LAYOUT.fountain.y-17,34,34,'#80aba6');
  area(MARKET_LAYOUT.garden.left,MARKET_LAYOUT.garden.top,420,83,'#d4b783');
  const camp=VILLAGE_CREW_HOME;area(camp.left,camp.top,camp.right-camp.left,camp.bottom-camp.top,'#b49168');
  const cat=PLAZA_PET_LAYOUT.house;area(cat.left,cat.top,cat.right-cat.left,cat.bottom-cat.top,'#b98c62');
  if(villageSiteOpen('plaza'))for(let y=CENTRAL_PLAZA.top;y<CENTRAL_PLAZA.bottom;y+=8)area(CENTRAL_PLAZA.left,y,plazaRightAt(y)-CENTRAL_PLAZA.left,8,'#d3b88a');
  for(const id of VILLAGE_PROJECT_IDS){
    const p=farm.development.projects[id];
    if(villageSiteOpen(id)||p.status==='active'&&p.stage!=='road')for(const s of VILLAGE_FACILITIES[id])area(s.left,s.top,s.right-s.left,s.bottom-s.top,p.status==='active'?'#c9aa72':'#b98560');
    for(const plant of villageWildPlants(id))if(villagePlantVisible(id,plant,clearance)
      &&(plant.kind==='tree'||villageGrassGrowth(`${id}:${plant.seed}`)>.2))area(plant.x-5,plant.y-4,10,8,'#698953');
  }
  for(const plant of villageVisibleWeeds(clearance,true))if(villageGrassGrowth(plant.id)>.2)
    area(plant.x-3,plant.y-3,6,6,'#698953');
  for(const [i,stall]of MARKET_LAYOUT.stalls.entries())if(villageMarketStallOpen(i))area(stall.x,844,118,72,stall.color);
  for(let i=0;i<nurseryActiveBeds();i++){const b=NURSERY_LAYOUT.beds[i];area(b.x-21,b.y-12,42,24,'#927351');}
  for(const id of DEPOT_IDS)if(villageDepotOpen(id)){const s=DEPOT_SITES[id];area(s.x-9,s.y-7,18,14,'#bd9261');}
  for(const w of [...workers.filter(w=>villageResidentWorking(w.name)),courier,villageWalker,orderKeeper,...farm.development.crew,
    ...Object.values(farm.development.residents).flatMap(r=>r.actor?[r.actor]:[])])
    if(w.mode!=='home'&&!festivalAtHome(w))area(w.x,w.y,14,14,'#edd59d');
  for(const name of ['阿蓼','阿芽','阿矿','阿森'])if(villageResidentWorking(name)){const a=villageResidentActor(name);if(!festivalAtHome(a))area(a.x,a.y,14,14,'#f0cf97');}
  if(villageSiteOpen('traveller')&&farm.town.traveller.mode!=='away'){const c=townCartPosition();area(c.x,c.y,58,44,'#c7976c');}
  if(farm.goatBarnOpen)for(const a of meadowGoats)area(a.x,a.y,9,9,'#f4e4cb');
  if(villageSiteOpen('sheep'))for(const a of sheep)area(a.x,a.y,9,9,'#f4e4cb');
  for(const a of cows)area(a.x,a.y,10,10,'#f8f2d2');
  mini.strokeStyle='#fff9d3';mini.lineWidth=1.5;
  mini.strokeRect(farm.view.x*sx,farm.view.y*sy,Math.min(WORLD_W,W/farm.view.zoom)*sx,Math.min(WORLD_H,H/farm.view.zoom)*sy);
}
