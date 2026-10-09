'use strict';
// Infrastructure is independent from farm chores and 阿棠's small improvements.
const VILLAGE_CREW_HOME = { left:1634, top:1240, right:1738, bottom:1332,
  door:{x:1686,y:1338}, beds:[{x:1668,y:1338},{x:1704,y:1338}] };
const VILLAGE_INITIAL_RESIDENTS = ['阿满','小禾','阿青','阿运','阿葵','阿宁'];
const VILLAGE_PROJECTS = {
  lake:{name:'西湖渔场',minimum:1500,price:800,days:6,owner:'阿蓼',
    site:{left:348,top:835+SOUTH_LAKE_SHIFT_Y,right:536,bottom:925+SOUTH_LAKE_SHIFT_Y}},
  greenhouse:{name:'主场温室',minimum:2200,price:1100,days:4,
    site:{left:514,top:92,right:666,bottom:259}},
  forest:{name:'森林居所',minimum:3200,price:1500,days:4,owner:'阿森',
    site:{left:1021,top:132,right:1188,bottom:257}},
  herbs:{name:'山谷香草居所',minimum:5000,price:2200,days:5,owner:'阿栀',
    site:{left:671,top:1046,right:880,bottom:1185}},
  plaza:{name:'村庄广场',minimum:7500,price:3000,days:6,
    site:{left:CENTRAL_PLAZA.left,top:CENTRAL_PLAZA.top,right:CENTRAL_PLAZA.right,bottom:CENTRAL_PLAZA.bottom}},
  sheep:{name:'南部羊牧场',minimum:10000,price:4200,days:7,owner:'阿牧',
    site:{left:PASTURE_WORKER_LAYOUT.cottage.left,top:PASTURE_WORKER_LAYOUT.cottage.top,right:SHEEP_LAYOUT.pen.right,bottom:SHEEP_LAYOUT.pen.bottom}},
  goats:{name:'山羊牧场',minimum:15000,price:5500,days:5,owner:'阿牧',ownerReturnsHome:true,requires:['sheep'],
    site:{left:GOAT_LAYOUT.pen.left,top:GOAT_LAYOUT.barn.top,right:GOAT_LAYOUT.pen.right,bottom:GOAT_LAYOUT.pen.bottom}},
  nursery:{name:'湿地苗圃居所',minimum:18000,price:5000,days:6,owner:'阿芽',shipments:100,
    site:{...NURSERY_LAYOUT.home}},
  scenic:{name:'南方山谷',minimum:22000,price:6500,days:6,
    site:{left:VALLEY_GARDEN_LAYOUT.teaHouse.left,top:1726,right:VALLEY_GARDEN_LAYOUT.lookout.right,bottom:1845}},
  mine:{name:'河东矿坡',minimum:32000,price:10000,days:8,owner:'阿矿',requires:['scenic'],
    site:{...MINE_LAYOUT.area}},
  traveller:{name:'旅人驿屋',minimum:45000,price:6000,days:5,
    site:{...TOWN_LAYOUT.home}},
  donkeyRoad:{name:'驴驿配套道路',minimum:50000,price:2000,days:3,requires:['traveller'],roadOnly:true,
    site:{left:2336,top:938,right:2408,bottom:1648}}
};
const VILLAGE_PROJECT_IDS = Object.keys(VILLAGE_PROJECTS);
const VILLAGE_STAGE_NAMES = {road:'铺路搭桥',clear:'整理场地',build:'搭建设施',settle:'工程收尾'};
const VILLAGE_WORK_DAY = DAY_SECONDS * (NIGHT_START - .1);
function villageSiteOpen(id, state = farm) {
  if (state.development) return state.development.projects[id]?.status === 'complete';
  if(id==='greenhouse')return state.upgrades>=3;
  if(id==='sheep')return state.upgrades>=4;
  if(id==='goats')return !!state.goatBarnOpen;
  return true; // Old callers before migration keep their previous visible infrastructure.
}
function villageResidentArrived(name, state = farm) {
  return !state.development || !!state.development.residents[name];
}
function villageMarketStallOpen(index, state = farm) {
  return index===0 ? state.upgrades>=5 : index===1 && villageSiteOpen('mine',state);
}
function villageResidentWorking(name, state = farm) {
  return !state.development || state.development.residents[name]?.stage === 'home';
}
// Helping extend an existing workplace does not move its owner into a new home.
function villageResidentReturnsHome(name, state = farm) {
  const project = state.development?.residents[name]?.project;
  return !!VILLAGE_PROJECTS[project]?.ownerReturnsHome;
}
function villageReserve(state = farm) {
  return Math.max(600,state.plots.length*Math.max(...Object.values(crops).map(c=>c.cost)));
}
