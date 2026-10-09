'use strict';
// The original plaza paths and ground-depth cats own this small shared activity.
function plazaCatsBadWeather() { const w=weatherVisual();return w.rain>=.25||w.snow>=.25; }
function plazaCatsSheltering() { return plazaCatsBadWeather()||farm.phase>=NIGHT_START||farm.phase<.04; }
function plazaCatCompanyActive() { return ['out','groom','nap'].includes(farm.town.catCompany.stage); }
function plazaCatCompanyClear(targets) {
  return targets.length===2&&targets.every(target=>plazaPetWalkable(target)
    &&plazaNeighbours().every(actor=>distance(actor,target)>45));
}
function finishPlazaCatCompany(completed=false) {
  const plan=farm.town.catCompany;
  if(!plazaCatCompanyActive())return;
  for(const cat of plazaCats)if(cat.mode==='company')Object.assign(cat,{mode:'groom',path:[],wait:2.5,action:0});
  plan.stage='done';plan.wait=0;
  if(completed){plan.sessions++;townNote('橘子和墨点一起洗了脸，在广场并排晒了会儿太阳。');}
  save();
}
function updatePlazaCatCompanyPlan(dt) {
  if(farm.paused)return;
  const plan=farm.town.catCompany;
  if(plan.day!==farm.day){finishPlazaCatCompany();Object.assign(plan,{day:farm.day,decided:false,chosen:false,flipped:false,stage:'idle',spot:-1,wait:0});}
  if(plazaCatCompanyActive()){
    const targets=plazaCatCompanyTargets();
    if(isFestivalDay()||plazaCatsSheltering()||farm.phase>=.48||!plazaCatCompanyClear(targets)
      ||farm.town.catPlay.active>=0||plazaCats.some(cat=>cat.mode!=='company')){finishPlazaCatCompany();return;}
    plan.wait+=dt;
    if(plan.stage==='out'){
      if(plazaCats.every((cat,index)=>!cat.path.length&&distance(cat,targets[index])<.1)){
        plan.stage='groom';plan.wait=0;save();
      }else if(plan.wait>=14)finishPlazaCatCompany();
    }else if(plan.stage==='groom'&&plan.wait>=2.4){plan.stage='nap';plan.wait=0;save();}
    else if(plan.stage==='nap'&&plan.wait>=4.8)finishPlazaCatCompany(true);
    return;
  }
  if(plan.decided||farm.phase<.15||farm.phase>=.30||isFestivalDay()||plazaCatsSheltering()
    ||farm.town.catPlay.active>=0||distance(...plazaCats)<50
    ||plazaCats.some(cat=>!['sleep','groom','stretch','watch'].includes(cat.mode)))return;
  const cost=targets=>targets.reduce((n,p,i)=>n+distance(p,plazaCats[i]),0);
  const choices=PLAZA_PET_LAYOUT.restSpots.map((point,spot)=>{
    const left=plazaCatCompanyTargets(spot,false),right=plazaCatCompanyTargets(spot,true),flipped=cost(right)<cost(left);
    return {spot,flipped,targets:flipped?right:left};
  }).filter(choice=>plazaCatCompanyClear(choice.targets)).map(choice=>{
    // Two disjoint corridors prevent the cats from crossing through each other.
    const first=plazaPetPath(plazaCats[0],choice.targets[0],{exact:true,avoid:[plazaCats[1],choice.targets[1]]});
    const second=first.length?plazaPetPath(plazaCats[1],choice.targets[1],{exact:true,avoid:[plazaCats[0],...first]}):[];
    return {...choice,paths:[first,second]};
  }).filter(choice=>choice.paths.every(path=>path.length))
    .sort((a,b)=>cost(a.targets)-cost(b.targets));
  if(!choices.length){plan.decided=true;plan.stage='done';save();return;}
  plan.decided=true;
  const chance=.5+.08*farm.town.improvements.catComfort.level-.15*seasonTransition().winter;
  if(townRandom()>=chance){plan.stage='done';save();return;}
  // Nearby destinations keep the outing short; choose once and retain it through refresh.
  const choice=choices[Math.floor(townRandom()*Math.min(3,choices.length))];
  Object.assign(plan,{chosen:true,stage:'out',spot:choice.spot,flipped:choice.flipped,wait:0});
  for(const [index,cat] of plazaCats.entries())Object.assign(cat,{path:choice.paths[index],mode:'company',action:0,
    tx:choice.targets[index].x,ty:choice.targets[index].y});
  save();
}
function updatePlazaCatCompanyCat(cat,index,dt) {
  if(!plazaCatCompanyActive()||cat.mode!=='company')return false;
  if(cat.path.length){if(movePlazaPet(cat,cat.path[0],dt,42))cat.path.shift();}
  if(!cat.path.length)cat.dir=plazaCats[1-index].x<cat.x?-1:1;
  cat.action+=dt;return true;
}
function plazaCatCompanyPose(cat) {
  if(cat.mode!=='company'||!plazaCatCompanyActive())return null;
  if(cat.path.length)return 'move';
  const plan=farm.town.catCompany;
  if(plan.stage==='nap')return 'sleep';
  return plan.stage==='groom'&&(plan.wait<1.2?0:1)===plazaCats.indexOf(cat)?'groom':'watch';
}
function plazaCatCompanyHint(cat) {
  if(cat.mode!=='company'||!plazaCatCompanyActive())return '';
  const other=plazaCats.find(item=>item!==cat),plan=farm.town.catCompany;
  return cat.path.length?'正去和'+other.name+'作伴':plan.stage==='out'?'等'+other.name+'过来'
    :plan.stage==='groom'?'和'+other.name+'轮流洗脸':'和'+other.name+'一起晒太阳';
}
function plazaCatCompanyDescription() {
  const plan=farm.town.catCompany;
  return plazaCatCompanyActive()?({out:'正在相约作伴',groom:'两只猫轮流洗脸',nap:'两只猫一起晒太阳'}[plan.stage])
    :plan.day===farm.day&&plan.chosen?'今天的作伴已结束':'晴好时偶尔相约作伴';
}
