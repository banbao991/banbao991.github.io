'use strict';
// An existing morning tea visit may use one pastry, only after real arrival.
function townChildSnackSeated(){const visit=farm.town.childVisit;
 return !isFestivalDay()&&!villageWalker.festival&&visit?.day===farm.day&&visit.stage==='tea'
  &&distance(villageWalker,TOWN_LAYOUT.childSeat)<2&&farm.phase<TOWN_CHILD_TEA_RETURN_PHASE;
}
function townChildSnackEating(){const m=farm.town.childSnack.meal;return !!m&&m.day===farm.day&&townChildSnackSeated();}
function updateTownChildSnack(dt){
 if(farm.paused)return;
 const s=farm.town.childSnack,weather=weatherVisual();
 if(s.meal){
  if(!townChildSnackEating()||weather.rain>=.25||weather.snow>=.25){s.meal=null;save();return;}
  s.meal.elapsed=Math.min(2.4,s.meal.elapsed+dt);
  if(s.meal.elapsed>=2.4){s.finished++;townNote(`阿宁吃完${TOWN_SNACK_NAMES[s.meal.theme]}，把小碟收好，准备沿村路回家。`);s.meal=null;save();}
  return;
 }
 if(!townChildSnackSeated()||s.decidedDay===farm.day||!farm.town.snacks.stock.length
  ||weather.rain>=.25||weather.snow>=.25||3.5-farm.town.childVisit.wait<2.4+dt
  ||(TOWN_CHILD_TEA_RETURN_PHASE-farm.phase)*DAY_SECONDS<2.4+dt)return;
 s.decidedDay=farm.day;
 if(hash(farm.day,313,967)>=.65){save();return;}
 const theme=farm.town.snacks.stock.shift();farm.town.inventory.snackBox=farm.town.snacks.stock.length;
 s.taken++;s.meal={day:farm.day,theme,elapsed:0};
 townNote(`阿宁坐在驿屋茶桌旁，取了一份${TOWN_SNACK_NAMES[theme]}配花茶。`);save();
}
function townChildSnackDescription(){const s=farm.town.childSnack;
 return townChildSnackEating()?`阿宁茶点 · 正在品尝${TOWN_SNACK_NAMES[s.meal.theme]} · ${Math.floor(s.meal.elapsed/2.4*100)}%`
  :`驿屋茶点 · 阿宁已吃完 ${s.finished} 份 · 每天最多一份`;
}
function townChildTeaActivity(){const v=farm.town.childVisit;if(!v)return null;
 return v.stage==='out'?'沿村路去驿屋喝花茶':v.stage==='tea'?townChildSnackEating()?`在驿屋品尝${TOWN_SNACK_NAMES[farm.town.childSnack.meal.theme]}`:'在驿屋喝花茶、听旅途故事':'从驿屋沿村路回家';
}
