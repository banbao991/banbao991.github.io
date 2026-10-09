'use strict';
const villageQueueButtons=new Map();
let villageQueueUIState=null;
function updateVillageQueueButtons(list) {
  const d=farm.development,ids=d.queue;
  if(villageQueueUIState!==d||!ids.length){
    $('construction-queue-feedback').textContent='';villageQueueUIState=d;
  }
  for(const [id]of villageQueueButtons)if(!ids.includes(id))villageQueueButtons.delete(id);
  const buttons=ids.map((id,index)=>{
    let button=villageQueueButtons.get(id);
    if(!button){
      button=document.createElement('button');button.type='button';button.className='construction-queue-button';
      button.addEventListener('click',()=>{
        const moved=prioritizeVillageProject(id);
        const feedback=$('construction-queue-feedback');
        if(feedback)feedback.textContent=moved?`${VILLAGE_PROJECTS[id].name}已提前到第 ${farm.development.queue.indexOf(id)+1} 位。`
          :farm.development.projects[id].status==='queued'?'该工程已在最早可行位置。':'该工程已不在等待队列中。';
        if(moved)save();updateUI();
      });
      villageQueueButtons.set(id,button);
    }
    const spec=VILLAGE_PROJECTS[id],earliest=villageQueuePriorityIndex(id),movable=earliest!==null&&earliest<index;
    button.textContent=`${index+1}. ${spec.name} · ${spec.price} 金`;
    button.disabled=earliest===null;
    button.title=movable?'点击提前到最早可行位置':'已在最早可行位置';
    button.setAttribute('aria-label',`${spec.name}，${button.title}`);
    return button;
  });
  const children=Array.from(list.children||[]);
  if(buttons.length!==children.length||buttons.some((button,index)=>children[index]!==button)){
    const focused=document.activeElement;list.replaceChildren(...buttons);
    if(buttons.includes(focused))focused.focus?.({preventScroll:true});
  }
  $('construction-queue-help').hidden=!ids.length;
}
function villageNextDevelopmentText() {
  const d=farm.development;
  if(d.active)return `${VILLAGE_PROJECTS[d.active].name} · ${VILLAGE_STAGE_NAMES[d.projects[d.active].stage]}`;
  if(d.queue.length)return `待开工：${VILLAGE_PROJECTS[d.queue[0]].name} · 保留 ${villageReserve()} 金经营储备`;
  const next=VILLAGE_PROJECT_IDS.find(id=>d.projects[id].status==='natural');
  return next?`发展计划：${VILLAGE_PROJECTS[next].name} · 积蓄 ${VILLAGE_PROJECTS[next].minimum} 金`:'村庄主要工程已完成，四季生活继续';
}
function updateVillageDevelopmentUI() {
  const d=farm.development;if(!d)return;
  const status=$('construction-status'),list=$('construction-queue'),future=$('construction-future'),residents=$('resident-list');
  if(!status||!list||!future||!residents)return;
  const p=d.active?d.projects[d.active]:null;
  const moving=Object.entries(d.residents).filter(([,r])=>r.stage==='moving');
  const settling=moving.some(([name])=>!villageResidentReturnsHome(name))?'工程收尾 · 等待居民安顿':'工程收尾 · 等待协助居民回家';
  status.textContent=p?`${VILLAGE_PROJECTS[d.active].name} · ${VILLAGE_STAGE_NAMES[p.stage]} · ${Math.floor(p.work/(VILLAGE_PROJECTS[d.active].days*VILLAGE_WORK_DAY)*100)}%${isFestivalDay()?' · 欢庆日休工':farm.phase>=NIGHT_START?' · 夜间休息':!villageWorkingWeather()?' · 等天气好转':''}`
    :moving.length?settling:d.queue.length?'等待队首工程的资金与经营储备':'施工队暂时休息';
  $('construction-total').textContent=`已完成 ${d.completedCount}/${VILLAGE_PROJECT_IDS.length} 项 · 累计工程支出 ${d.spentTotal} 金`;
  updateVillageMaintenanceUI();
  if(p)status.textContent+=` · 阿梁、阿砚${VILLAGE_PROJECTS[d.active].owner?'、'+VILLAGE_PROJECTS[d.active].owner:''}`;
  const itemFor=id=>{
    const item=document.createElement('p'),spec=VILLAGE_PROJECTS[id],queued=d.projects[id].status==='queued';
    item.textContent=`${queued?'已排队 · ':''}${spec.name} · ${spec.price} 金${queued?'':` · 积蓄 ${spec.minimum} 金`}${!queued&&spec.requires?` · 先建${spec.requires.map(dep=>VILLAGE_PROJECTS[dep].name).join('、')}`:''}${!queued&&spec.shipments?` · 累计送货 ${spec.shipments} 件`:''}`;return item;
  };
  updateVillageQueueButtons(list);
  future.replaceChildren(...VILLAGE_PROJECT_IDS.filter(id=>d.projects[id].status==='natural').map(itemFor));
  const names=[...Object.keys(d.residents),...d.crew.map(a=>a.name),...(villageSiteOpen('traveller')&&farm.town.traveller.mode!=='away'?['阿棠']:[])];
  $('resident-count').textContent=`${names.length} 位`;
  updateVillageResidentRoster(names);
  for(const [id,name]of [['keeper-status','阿森'],['angler-status','阿蓼'],['nursery-keeper-status','阿芽'],['mine-status','阿矿']])
    if(!villageResidentWorking(name))$(id).textContent=villageResidentArrived(name)?`${name} · ${villageResidentDescription(name)}`:`${name}尚未迁入`;
  if(!villageSiteOpen('mine'))$('mine-stock-status').textContent='自然矿坡 · 矿区尚未建设';
  if(!villageSiteOpen('nursery'))$('nursery-status').textContent='湿地草甸 · 苗圃居所尚未建设';
  if(!villageSiteOpen('lake'))$('lake-status').textContent='自然湖泊 · 栈桥与渔场尚未建设';
}
function villageDevelopmentHint(x,y,actorsOnly=false) {
  if(!farm.development)return null;
  const actors=[...farm.development.crew,...Object.values(farm.development.residents).flatMap(r=>r.actor?[r.actor]:[])];
  const actor=actors.find(a=>a.mode!=='home'&&!festivalAtHome(a)&&Math.abs(x-a.x)<17&&y>a.y-28&&y<a.y+23);
  if(actor)return {target:actor,text:`${actor.name} · ${villageConstructionActivity(actor)} · 点击打招呼`};
  const home=VILLAGE_CREW_HOME;
  if(inRect(x,y,home.left,home.top,home.right,home.bottom))return {target:'construction-lodge',text:'施工队小屋 · 工人与新邻居暂住的小家'};
  if(villageSiteOpen('sheep')&&inRect(x,y,PASTURE_WORKER_LAYOUT.cottage.left,PASTURE_WORKER_LAYOUT.cottage.top,PASTURE_WORKER_LAYOUT.cottage.right,PASTURE_WORKER_LAYOUT.cottage.bottom))
    return {target:'pasture-worker-home',text:'阿牧的小屋 · 牧场旁的温暖小家'};
  if(actorsOnly)return null;
  const kind=landmarkAt(x,y),project=villageLandmarkProject(kind);
  if(project&&!villageSiteOpen(project)){
    const p=farm.development.projects[project];
    return {target:`development:${project}`,text:p.status==='active'?`${VILLAGE_PROJECTS[project].name}施工中 · ${VILLAGE_STAGE_NAMES[p.stage]}`
      :p.status==='queued'?`${VILLAGE_PROJECTS[project].name}已列入建设计划`:'未开发的自然地带 · 草木随四季生长'};
  }
  for(const id of VILLAGE_PROJECT_IDS) {
    if(villageSiteOpen(id))continue;
    const s=VILLAGE_PROJECTS[id].site,p=farm.development.projects[id];
    const worksite=p.status==='active'&&VILLAGE_FACILITIES[id].some(f=>inRect(x,y,f.left,f.top,f.right,f.bottom));
    if(worksite||inRect(x,y,s.left,s.top,s.right,s.bottom))return {target:`development:${id}`,
      text:p.status==='active'?`${VILLAGE_PROJECTS[id].name}施工中 · ${VILLAGE_STAGE_NAMES[p.stage]}`
        :p.status==='queued'?`${VILLAGE_PROJECTS[id].name}已列入建设计划`:'未开发的自然地带 · 草木随四季生长'};
  }
  return villageWeedHint(x,y);
}
function villageLandmarkProject(kind) {
  if(/^(fishing-hut|rowboat|lake-dock)/.test(kind))return 'lake';
  if(kind==='forest-cabin')return 'forest';
  if(/^(valley-windmill|valley-worker-home|valley-chair|valley-herbs|valley-garden)/.test(kind))return 'herbs';
  if(/^(valley-tea-house|valley-lookout|mine-tea-table)/.test(kind))return 'scenic';
  if(/^(nursery-home|nursery-bench|wetland-lookout|wetland-bridge)/.test(kind))return 'nursery';
  if(/^mine-/.test(kind)&&kind!=='mine-ridge')return 'mine';
  if(/^(future-pasture|sheep-barn|sheep-pasture|pasture-bench)/.test(kind))return 'sheep';
  if(/^(future-goat|goat-barn|goat-pen)/.test(kind))return 'goats';
  if(/^(traveller-home|traveller-yard|traveller-road|traveller-district)/.test(kind))return 'traveller';
  if(/^(central-stage|central-well|central-bench|central-flowers)/.test(kind))return 'plaza';
  return null;
}
function handleVillageDevelopmentClick(x,y) {
  const hint=villageDevelopmentHint(x,y,true);if(!hint)return false;
  if(typeof hint.target==='object')hint.target.waveUntil=now+2.3;
  record(hint.text.replace(' · 点击打招呼',''));save();return true;
}
