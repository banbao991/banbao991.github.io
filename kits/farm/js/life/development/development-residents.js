'use strict';
// Read-only resident lookup and activities shared by portraits, maps and tooltips.
function villageResidentActor(name) {
  return farm.development.residents[name]?.actor||workers.find(w=>w.name===name)
    ||({'阿运':courier,'阿宁':villageWalker,'阿葵':orderKeeper,'阿蓼':angler,'阿芽':nurseryKeeper,'阿森':forestKeeper,'阿矿':miner,'阿棠':farm.town.traveller})[name]
    ||farm.development.crew.find(a=>a.name===name);
}
function villageResidentDescription(name) {
  const r=farm.development.residents[name],a=villageResidentActor(name);
  if(r?.stage==='help')return (name==='阿牧'&&villageSiteOpen('sheep')?'住在牧场 · 协助':'暂住村口 · 协助')+VILLAGE_PROJECTS[r.project].name;
  if(r?.stage==='moving')return villageResidentReturnsHome(name)?'完成协助 · 正在回家':'新居已备好 · 正在搬家';
  if(name==='阿梁'||name==='阿砚')return villageConstructionActivity(a);
  const activity=({'阿运':courierActivity,'阿宁':()=>festivalActivity(villageWalker)||townBoatActivity()||townChildTeaActivity()||plazaEavesChildActivity()||townDonkeyVisitActivity()||(villageWalkerAtHome()?'在家休息':farm.phase>=NIGHT_START?'正回家休息':'在村里散步'),'阿葵':()=>festivalActivity(orderKeeper)||(farm.phase>=NIGHT_START&&distance(orderKeeper,ORDER_KEEPER_HOME)<12?'在家休息':eastGardenKeeperActivity()),
    '阿蓼':anglerActivity,'阿芽':nurseryKeeperActivity,'阿森':forestKeeperActivity,'阿矿':minerActivity,'阿棠':townTravellerActivity})[name];
  if(activity)return activity();
  const celebration=a?festivalActivity(a):null;if(celebration)return celebration;
  if(a&&WORKER_ROLES[name]){
    const jobs={harvest:'采收作物',plant:'播种',water:'浇水',eggs:'收鸡蛋',milk:'挤牛奶',fruit:'采摘果实',honey:'收蜂蜜',wool:'梳羊毛',goatMilk:'挤山羊奶',herb:'采收香草'};
    const resting=farm.phase>=NIGHT_START&&distance(a,workerHome(a))<=20?'在家休息':
      a.task?jobs[a.task.type]||'照料农场':a.route?.length?(farm.phase>=NIGHT_START?'正回家休息':'沿路去下一处'):'暂时歇脚';
    return WORKER_ROLES[name]+' · '+resting;
  }
  return '在村里生活';
}
