'use strict';
const TOWN_SNACK_NAMES=['青团','莓果方糕','栗子酥','姜香饼'];
function townBuySnacks(){while(farm.town.snacks.stock.length<farm.town.inventory.snackBox)farm.town.snacks.stock.push(seasonIndex());}
function townPrepareSnackParcel(){const town=farm.town,s=town.snacks;
 if(town.construction?.id!=='teaChimes'||s.carried.length)return;
 const count=Math.min(2,4-s.pantry.length,s.stock.length);if(!count)return;
 s.carried=s.stock.splice(0,count);town.inventory.snackBox=s.stock.length;
 townNote(`阿棠包好 ${count} 份四季茶点，准备带去南谷茶亭。`);
}
function townDeliverSnackParcel(actor){const s=farm.town.snacks;
 if(actor.mode!=='work'||farm.town.construction?.id!=='teaChimes'||distance(actor,TOWN_LAYOUT.projects.teaChimes.work)>3)return;
 const count=Math.min(s.carried.length,4-s.pantry.length);if(!count)return;
 s.pantry.push(...s.carried.splice(0,count));townNote(`阿棠把 ${count} 份茶点收进南谷茶亭的小茶箱。`);save();
}
function townReturnSnackParcel(){const s=farm.town.snacks,count=Math.min(s.carried.length,8-s.stock.length);if(!count)return;
 s.stock.push(...s.carried.splice(0,count));farm.town.inventory.snackBox=s.stock.length;
 townNote(`阿棠把尚未送到的 ${count} 份茶点带回驿屋，留给下次修缮。`);save();
}
function townSnackSeated(){return !isFestivalDay()&&miner.mode==='teaRest'&&miner.deliveryDay>0&&distance(miner,MINE_TEA_SEAT)<3&&farm.phase<NIGHT_START;}
function townSnackEating(){const meal=farm.town.snacks.meal;return !!meal&&townSnackSeated()&&meal.trip===miner.deliveryDay;}
function updateTownSnacks(dt){if(farm.paused)return;const s=farm.town.snacks,weather=weatherVisual();
 if(s.meal){
  if(!townSnackEating()||weather.rain>=.45||weather.snow>=.25){s.meal=null;save();return;}
  s.meal.elapsed=Math.min(2.4,s.meal.elapsed+dt);
  if(s.meal.elapsed>=2.4){s.finished++;townNote(`阿矿慢慢吃完${TOWN_SNACK_NAMES[s.meal.theme]}，收好小碟，歇一会儿再回家。`);s.meal=null;save();}
  return;
 }
 if(!townSnackSeated()||s.decidedTrip===miner.deliveryDay||!s.pantry.length||weather.rain>=.25||weather.snow>=.25
  ||7.2-miner.action<2.4||(NIGHT_START-farm.phase)*DAY_SECONDS<2.4)return;
 s.decidedTrip=miner.deliveryDay;
 if(hash(miner.deliveryDay,211,967)>=.7){save();return;}
 const theme=s.pantry.shift();s.taken++;s.meal={trip:miner.deliveryDay,theme,elapsed:0};
 townNote(`阿矿坐在茶桌边，取了一份${TOWN_SNACK_NAMES[theme]}配花茶。`);save();
}
function townSnackCounts(list){return TOWN_SNACK_NAMES.map((name,i)=>{const n=list.filter(theme=>theme===i).length;return n?`${name} ${n} 份`:'';}).filter(Boolean).join('、')||'暂无';}
function townSnackDescription(){const s=farm.town.snacks;
 return `南谷四季茶点 · 茶箱 ${s.pantry.length}/4 份（${townSnackCounts(s.pantry)}）· 驿屋 ${s.stock.length}/8 份 · 随身 ${s.carried.length}/2 份 · ${townSnackEating()?`阿矿正在品尝${TOWN_SNACK_NAMES[s.meal.theme]}`:`已吃完 ${s.finished} 份`}`;
}
