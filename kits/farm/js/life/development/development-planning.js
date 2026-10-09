'use strict';
function villageProjectEligible(id,state=farm) {
  const p=VILLAGE_PROJECTS[id],d=state.development;
  return !!d&&d.projects[id].status==='natural'&&state.coins>=p.minimum
    &&(!p.shipments||state.shippedTotal>=p.shipments)
    &&(!p.requires||p.requires.every(dep=>villageSiteOpen(dep,state)));
}
function updateVillageQueue() {
  const d=farm.development;if(!d||farm.paused)return;
  for(const id of VILLAGE_PROJECT_IDS)if(villageProjectEligible(id)) {
    Object.assign(d.projects[id],{status:'queued',sequence:++d.sequence,queuedAt:farm.day+farm.phase});
    d.queue.push(id);d.revision++;
    record(`${VILLAGE_PROJECTS[id].name}列入村庄建设计划。`);
  }
}
// Moving one waiting project preserves every other project's relative order.
function villageQueuePriorityIndex(id,state=farm) {
  const d=state.development,index=d?.queue.indexOf(id);
  if(index==null||index<0||d.projects[id]?.status!=='queued')return null;
  const visited=new Set(),visiting=new Set();let earliest=0;
  const check=project=>{
    if(visiting.has(project)||!VILLAGE_PROJECTS[project])return false;
    if(visited.has(project))return true;
    visiting.add(project);
    for(const dep of VILLAGE_PROJECTS[project].requires||[]){
      if(villageSiteOpen(dep,state))continue;
      const position=d.queue.indexOf(dep);
      if(dep!==d.active&&(position<0||position>=index||d.projects[dep]?.status!=='queued'))return false;
      earliest=Math.max(earliest,position+1);
      if(!check(dep))return false;
    }
    visiting.delete(project);visited.add(project);return true;
  };
  return check(id)?earliest:null;
}
function prioritizeVillageProject(id) {
  const d=farm.development,index=d?.queue.indexOf(id),earliest=villageQueuePriorityIndex(id);
  if(earliest===null||earliest>=index)return false;
  d.queue.splice(index,1);d.queue.splice(earliest,0,id);d.revision++;
  record(`${VILLAGE_PROJECTS[id].name}提前到待施工队列第 ${earliest+1} 位。`);
  return true;
}
function startVillageProject() {
  const d=farm.development;if(!d||d.active||!d.queue.length||farm.paused
    ||isFestivalDay()||farm.phase<.1||farm.phase>=.45)return false;
  const id=d.queue[0],p=VILLAGE_PROJECTS[id];
  if(p.requires?.some(dep=>!villageSiteOpen(dep)))return false;
  if(farm.coins-p.price<villageReserve())return false;
  farm.coins-=p.price;d.spentTotal+=p.price;d.active=id;d.queue.shift();d.revision++;
  Object.assign(d.projects[id],{status:'active',paid:p.price,startedAt:farm.day+farm.phase});
  if(p.owner){
    const old=d.residents[p.owner],original=workers.find(w=>w.name===p.owner);
    d.residents[p.owner]={stage:'help',project:id,arrivedAt:old?.arrivedAt||farm.day+farm.phase,
      actor:{...villageMakeActor(p.owner),...(original?{x:original.x,y:original.y}:{})}};
  }
  record(`施工队接下${p.name}，支付 ${p.price} 金材料与人工费。`);
  return true;
}
function finishVillageProject(id) {
  const d=farm.development;if(d.active!==id)return false;
  const p=d.projects[id],owner=VILLAGE_PROJECTS[id].owner;
  Object.assign(p,{status:'complete',stage:'settle',completedAt:farm.day+farm.phase});
  d.active=null;d.completedCount++;d.revision++;
  if(id==='goats'){farm.goatBarnOpen=true;farm.goatMilkReady=true;resetMeadowLife();}
  if(id==='traveller'&&farm.town.traveller.mode!=='away'){
    const a=farm.town.traveller;a.villageSettling=true;a.path=[];a.goal=null;a.mode='walk';
  }
  if(owner&&d.residents[owner]?.stage==='help')d.residents[owner].stage='moving';
  record(`${VILLAGE_PROJECTS[id].name}完工，村庄添了一处新的生活空间。`);
  return true;
}
