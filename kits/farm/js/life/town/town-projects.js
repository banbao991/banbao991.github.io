'use strict';
// A paid commission has one saved job, visible progress and an ordinary afternoon work shift.
function townImprovementGrowth(id, stage = farm.town.improvements[id].level - 1) {
  const built = farm.town.improvements[id];
  const plantedAt = built.stages[stage] ?? (stage === built.level - 1 ? built.builtAt : 0);
  return built.level ? clamp((farm.day + farm.phase - plantedAt) / 1.2, 0, 1) : 0;
}
function townProjectPrice(id) {
  return Math.round(TOWN_PROJECTS[id].price * (1 + farm.town.improvements[id].level * .7));
}
function townProjectMinimum(id) {
  return TOWN_PROJECTS[id].minimum * (1 + farm.town.improvements[id].level * 2);
}
function townCanCommission(id, automatic = false) {
  if(!villageTownProjectReady(id))return false;
  return Object.hasOwn(TOWN_PROJECTS, id) && !farm.town.construction && townShopOpen()
    && farm.town.improvements[id].level < 3 && farm.coins >= townProjectMinimum(id)
    && townCanSpend(townProjectPrice(id), automatic);
}
function townCommission(id, automatic = false) {
  if (!townCanCommission(id, automatic)) return false;
  const cost = townProjectPrice(id), level = farm.town.improvements[id].level + 1;
  if (!townSpend(cost, 'projects', automatic)) return false;
  if (automatic) farm.town.autoCareStreak = 0;
  farm.town.construction = { kind:'build', id, level, cost, progress: 0, startedAt: farm.day + farm.phase };
  farm.town.traveller.commissioned = true;
  farm.town.constructionCount++;
  townNote(`${automatic ? '小镇委托' : '你请'}阿棠修建${TOWN_PROJECTS[id].name}第 ${level} 阶段，付了 ${cost} 金材料与手工费。`, true);
  updateUI(); save(); return true;
}
function townProjectRoute(id) {
  const work = TOWN_LAYOUT.projects[id].work;
  if(id==='donkeyInn')return [{...TOWN_LAYOUT.counter},{x:2180,y:950},
    {x:TOWN_LAYOUT.donkeyInn.lane.x,y:950},{...TOWN_LAYOUT.donkeyInn.lane},{...work}];
  if (id === 'travellerGarden') return [{ ...TOWN_LAYOUT.counter }, { x: 2180, y: 950 },
    { x: work.x, y: 950 }, { ...work }];
  const road = [{ ...TOWN_LAYOUT.counter }, { x: 2180, y: 950 },
    { x: 1988, y: 950 }, { x: 1988, y: 1021 }, { x: 620, y: 1021 }];
  if (id === 'catComfort') return [...road, { x: 620, y: 592 }, { x: work.x, y: 592 }, { ...work }];
  if (id === 'teaChimes') return [...road, { x: 620, y: 1699 }, { x: 788, y: 1699 },
    { x: 788, y: 1760 }, { x: work.x, y: 1760 }, { ...work }];
  if (id === 'wetlandNest') return [...road, { x: 620, y: 1325 }, { x: work.x, y: 1325 }, { ...work }];
  return [...road, { x: 620, y: 1325 }, { x: 565, y: 1325 }, { x: 565, y: work.y }, { ...work }];
}
function townProjectStop(id) { return id === 'teaChimes' ? .35 : id === 'travellerGarden' ? .44 : .39; }
function townReturnFromProject(actor, home = false) {
  const back = actor.route.slice(0, actor.index).reverse();
  const route = [...back, { ...TOWN_LAYOUT.counter }, ...(home ? townHomeRoute(TOWN_LAYOUT.counter) : [])];
  actor.mode = 'walk'; townSetRoute(actor, route, home ? 'home' : 'shop');
}
function townStartWork(actor) {
  const job = farm.town.construction;
  // The southern pavilion needs a morning start so travel leaves time to actually build.
  if (!job || farm.phase < (job.id === 'teaChimes' ? .11 : .18) || farm.phase > .30) return false;
  townPrepareTeaParcel(actor);
  actor.mode = 'walk'; townSetRoute(actor, townProjectRoute(job.id), 'work');
  if(actor.carriedTea||farm.town.snacks.carried.length)save();
  return true;
}
function updateTownProjectWork(actor, dt) {
  const job = farm.town.construction;
  if (!job) { townReturnFromProject(actor); return; }
  if (farm.phase >= townProjectStop(job.id)) { townReturnFromProject(actor, true); return; }
  if(job.id==='teaChimes')townDeliverTeaParcel(actor);
  const weather = weatherVisual();
  const effort = job.kind === 'care' ? .45 + job.level * .15 : TOWN_PROJECTS[job.id].workload;
  job.progress = Math.min(1, job.progress + dt * (1 - weather.rain * .45 - weather.snow * .3)
    / (effort * DAY_SECONDS * .12));
  if (job.progress < 1) return;
  const id = job.id;
  const previous = farm.town.improvements[id];
  if (job.kind === 'care') {
    previous.wear=0;previous.agedAt=farm.day;previous.lastCare=farm.day+farm.phase;
    farm.town.maintenanceCount++;farm.town.construction=null;
    if(job.id==='catComfort'&&previous.level>=3){farm.town.catWater.ready=true;farm.town.catWater.water=1;farm.town.catWater.agedAt=farm.day+farm.phase;}
    if(job.id==='donkeyInn'&&previous.level>=2)refillTownDonkeyWater(false);
    townReturnFromProject(actor,farm.phase>.30);
    townNote(`阿棠整理好${TOWN_PROJECTS[id].name}，木作与花草又清爽了。`,true);
    save();return;
  }
  while (previous.stages.length < previous.level) previous.stages.push(0);
  farm.town.improvements[id] = { level: job.level, builtAt: farm.day + farm.phase,
    stages: [...previous.stages, farm.day + farm.phase],wear:0,agedAt:farm.day,lastCare:farm.day+farm.phase };
  if (id === 'wetlandNest') farm.town.inventory.birdNest = Math.max(farm.town.inventory.birdNest, job.level);
  if (id === 'meadowFlowers') {
    const previousCount = farm.town.inventory.butterflySeed;
    while (farm.town.plantings.butterflySeed.length < previousCount) farm.town.plantings.butterflySeed.push(0);
    farm.town.inventory.butterflySeed = Math.max(previousCount, job.level);
    while (farm.town.plantings.butterflySeed.length < farm.town.inventory.butterflySeed)
      farm.town.plantings.butterflySeed.push(farm.day + farm.phase);
  }
  farm.town.construction = null;
  townReturnFromProject(actor, farm.phase > .30);
  townNote(`阿棠收好工具，${TOWN_PROJECTS[id].name}第 ${job.level} 阶段完工了。`, true);
  save();
}
