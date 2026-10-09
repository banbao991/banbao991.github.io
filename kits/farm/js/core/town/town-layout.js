'use strict';
// The eastward extension leaves the released world's buildings, roads and routes in place.
const TOWN_LAYOUT = {
  // Inside the original coop paddock, clear of the nest, posts and front rail.
  henMeal:{tray:{x:230,y:87},spot:{x:218,y:80}},
  // Use the original middle bridge; the river carries paper south of its front rail.
  paperBoat:{bridge:{x:1412,y:1019},launchY:1021},
  northLaneY:824,
  flowerLaneY:812,cartLaneX:2272,
  catToyYard:{left:788,top:638,right:834,bottom:678,spots:[{x:800,y:648},{x:814,y:648},{x:828,y:648}]},
  district: {left:2024,top:640,right:2304,bottom:1180},
  yard: { left: 2032, top: 786, right: 2288, bottom: 1035 },
  home: { left: 2072, top: 682, right: 2192, bottom: 786, door: { x: 2155, y: 790 } },
  cart: { x: 2180, y: 868, left: 2122, top: 822, right: 2244, bottom: 909 },
  cartHitch: { x: 40, y: -36 },
  rainHookOffset:{x:-47,y:8},
  sketchOffset:{x:0,y:16},
  postcardWall:{x:2129,y:750},
  counter: { x: 2180, y: 926 }, gate: { x: 2290, y: 950 },
  porch: { x: 2098, y: 798 }, tea: { x: 2064, y: 874 }, childSeat: { x: 2046, y: 896 },
  merchantSeat:{x:2090,y:891},teaAccess:{x:2036,y:928},
  teaYard:{left:2024,top:850,right:2112,bottom:923},
  flowerPots: [{x:2090,y:794},{x:2109,y:794},{x:2128,y:794}],
  showcase:{left:2209,top:710,right:2275,bottom:783,
    slots:[{id:'riverPlate',x:2225,y:739},{id:'forestCarving',x:2258,y:739},{id:'crystalCase',x:2241,y:773}]},
  dogYard:{left:2050,top:1036,right:2117,bottom:1084},
  flowerSites: Array.from({length:8},(_,i)=>({x:408+i%4*34,y:1244+Math.floor(i/4)*42})),
  // Retired slots 8/9 were the tea-yard's redundant southern loop. Keep them
  // unused: saved construction IDs are discarded in save-migrations.js.
  paths: [{x:2288,y:938,w:120,h:32},{x:2376,y:938,w:32,h:710},{x:2336,y:1480,w:72,h:32},
    {x:2020,y:928,w:32,h:24}, { x: 1996, y: 938, w: 308, h: 32 }, { x: 2008, y: 804, w: 280, h: 28 },
    { x: 2256, y: 804, w: 32, h: 166 }, { x: 2139, y: 786, w: 32, h: 46 }],
  feeding: { x: 2082, y: 1012 },
  garden: { x: 2178, y: 1048 }, birdhouse: { x: 394, y: 1340 }, flowerPatch: { x: 459, y: 1248 },
  gardenHabitat: { left:2140,top:1110,right:2230,bottom:1150,home:{x:2238,y:1143} },
  pavilionTea: {x:923,y:1842},
  ridge:{left:2048,top:1384,originY:1264,first:2,right:2120,bottom:1920},
  donkeyInn:{area:{left:2120,top:1240,right:2432,bottom:1704},
    stable:{left:2160,top:1264,right:2304,bottom:1384},
    doors:[{x:2200,y:1384},{x:2264,y:1384}],
    pen:{left:2152,top:1440,right:2336,bottom:1632},
    yardLaneY:1416,insideGate:{x:2232,y:1472},greetSpot:{x:2320,y:1496},visitor:{x:2356,y:1496},
    gate:{x:2336,y:1496},notice:{x:2352,y:1444},northGate:{x:2232,y:1440},lane:{x:2392,y:1496},
    trough:{x:2308,y:1458}},
  fireflyHabitats:{wetland:{x:264,y:1748,rx:181,ry:84},meadow:{x:458,y:1255,rx:82,ry:57}},
  projects: {
    catComfort: { x: 833, y: 607, cushion: { x: 832, y: 615 }, work: { x: 861, y: 632 }, materials: { x: 884, y: 604 } },
    wetlandNest: { x: 394, y: 1340, work: { x: 413, y: 1350 }, materials: { x: 394, y: 1375 } },
    meadowFlowers: { x: 459, y: 1248, work: { x: 549, y: 1270 }, materials: { x: 563, y: 1320 } },
    teaChimes: { x: 861, y: 1780, work: { x: 777, y: 1788 }, materials: { x: 818, y: 1730 } },
    travellerGarden: { x: 2178, y: 1048, work: { x: 2193, y: 1027 }, materials: { x: 2231, y: 1010 } },
    donkeyInn:{x:2232,y:1472,work:{x:2360,y:1496},materials:{x:2360,y:1408}}
  }
};
TOWN_LAYOUT.showcases=[TOWN_LAYOUT.showcase,{left:2330,top:710,right:2396,bottom:783,
  slots:[{id:'pressedLeaves',x:2346,y:739},{id:'pheasantClay',x:2379,y:739},{id:'seedJar',x:2362,y:773}]}];
function townCurioSlots(){return TOWN_LAYOUT.showcases.flatMap(shelf=>shelf.slots);}
TOWN_LAYOUT.catWater={water:{x:TOWN_LAYOUT.projects.catComfort.x+29,y:TOWN_LAYOUT.projects.catComfort.y+10},
  stand:{x:TOWN_LAYOUT.projects.catComfort.x+45,y:TOWN_LAYOUT.projects.catComfort.y+5}};
TOWN_LAYOUT.birdBath={water:{x:TOWN_LAYOUT.birdhouse.x+24,y:TOWN_LAYOUT.birdhouse.y+3},
  perch:{x:TOWN_LAYOUT.birdhouse.x+24,y:TOWN_LAYOUT.birdhouse.y+3},
  home:{x:TOWN_LAYOUT.birdhouse.x-66,y:TOWN_LAYOUT.birdhouse.y-60}};
TOWN_LAYOUT.chimes=[
 {id:0,name:'旅人驿屋檐下',type:'陶铃',x:TOWN_LAYOUT.home.left+115,y:TOWN_LAYOUT.home.top+48,parent:'traveller-home',depth:TOWN_LAYOUT.home.bottom},
 {id:1,name:'阿栀小屋檐下',type:'铜铃',x:VALLEY_WORKER_LAYOUT.home.left+84,y:VALLEY_WORKER_LAYOUT.home.top+44,parent:'valley-worker-home',depth:VALLEY_WORKER_LAYOUT.home.top+114},
 {id:2,name:'阿芽小屋檐下',type:'竹铃',x:NURSERY_LAYOUT.home.left+44,y:NURSERY_LAYOUT.home.top+39,parent:'nursery-home',depth:NURSERY_LAYOUT.home.top+90}
];
TOWN_LAYOUT.porchLights=[
 {id:0,name:'旅人驿屋门边',x:TOWN_LAYOUT.home.left+9,y:TOWN_LAYOUT.home.top+60,parent:'traveller-home',depth:TOWN_LAYOUT.home.bottom},
 {id:1,name:'阿森林间木屋门边',x:1107,y:193,parent:'forest-cabin',depth:257},
 {id:2,name:'阿矿小屋门边',x:MINE_LAYOUT.home.left+50,y:MINE_LAYOUT.home.top+40,parent:'mine-home',depth:MINE_LAYOUT.home.bottom+1}
];
TOWN_LAYOUT.snackPlate={x:1006,y:1782,parent:'tea-table',depth:1808};
TOWN_LAYOUT.childSnackPlate={x:TOWN_LAYOUT.tea.x+9,y:TOWN_LAYOUT.tea.y+4,parent:'traveller-tea-table',depth:TOWN_LAYOUT.tea.y+16};
TOWN_LAYOUT.music={x:TOWN_LAYOUT.tea.x-13,y:TOWN_LAYOUT.tea.y-13};
TOWN_LAYOUT.donkeyBond={left:2200,top:1560,right:2302,bottom:1606};
TOWN_LAYOUT.fodder={rack:{x:TOWN_LAYOUT.donkeyInn.pen.left+28,y:TOWN_LAYOUT.donkeyInn.pen.top+92},
  stand:{x:TOWN_LAYOUT.donkeyInn.pen.left+68,y:TOWN_LAYOUT.donkeyInn.pen.top+91}};
TOWN_LAYOUT.donkeyWater={stand:{x:TOWN_LAYOUT.donkeyInn.trough.x-24,y:TOWN_LAYOUT.donkeyInn.trough.y+12},
 approach:{x:TOWN_LAYOUT.donkeyInn.trough.x-54,y:TOWN_LAYOUT.donkeyInn.trough.y+52},
 exits:[[{x:TOWN_LAYOUT.donkeyInn.trough.x-12,y:TOWN_LAYOUT.donkeyInn.trough.y+82}],
 [{x:TOWN_LAYOUT.donkeyInn.trough.x-76,y:TOWN_LAYOUT.donkeyInn.trough.y+36},{x:TOWN_LAYOUT.donkeyInn.trough.x-76,y:TOWN_LAYOUT.donkeyInn.trough.y+118}]]};
function townDonkeyWaterPointClear(v){const p=TOWN_LAYOUT.donkeyInn.pen,rack=TOWN_LAYOUT.fodder.rack;
 return inRect(v.x,v.y,p.left+20,p.top+26,p.right-20,p.bottom-20)
  &&!inRect(v.x,v.y,rack.x-32,rack.y-29,rack.x+32,rack.y+25);
}
TOWN_LAYOUT.hearth={chimney:{x:TOWN_LAYOUT.home.left+96,y:TOWN_LAYOUT.home.top+6},
  wood:{x:TOWN_LAYOUT.home.left-15,y:TOWN_LAYOUT.home.bottom-3}};
function townRoadAt(x, y, margin = 0) {
  return TOWN_LAYOUT.paths.some(path => inRect(x, y, path.x - margin, path.y - margin,
    path.x + path.w + margin, path.y + path.h + margin));
}
