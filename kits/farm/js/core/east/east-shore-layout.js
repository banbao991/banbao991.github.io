'use strict';
// Existing roads, mature galleries, garden and donkey pen bound these three clearings.
const EAST_SHORE={
 spring:{x:2480,y:854,rx:56,ry:43},pond:{x:2332,y:1810,rx:108,ry:51},
 springBench:{x:2442,y:668},
 trees:[{x:2516,y:776,kind:'hawthorn'},{x:2506,y:1118,kind:'oak'},
   {x:2488,y:1320,kind:'hawthorn'},{x:2192,y:1724,kind:'oak'},
   {x:2510,y:1780,kind:'spruce'},{x:2192,y:1896,kind:'hawthorn'}],
 flowers:[{x:2468,y:1027},{x:2520,y:1190},{x:2458,y:1220},
   {x:2210,y:1686},{x:2440,y:1696},{x:2500,y:1874}],
 reeds:[{x:2434,y:849},{x:2518,y:823},{x:2504,y:897},
   {x:2246,y:1807},{x:2382,y:1856},{x:2424,y:1795}],
 stones:[{x:2456,y:812},{x:2514,y:878},{x:2260,y:1865},{x:2410,y:1770}],
 nests:[{x:2248,y:1790},{x:2258,y:1831}],
 duckSpots:[[{x:2290,y:1787},{x:2392,y:1794},{x:2344,y:1788}],
   [{x:2300,y:1837},{x:2380,y:1832},{x:2330,y:1837}]],
 hedge:{area:{left:2160,top:1672,right:2540,bottom:1904},home:{x:2270,y:1688},
   berries:[{x:2180,y:1790},{x:2450,y:1732},{x:2470,y:1888}]}
};
function eastShoreWater(point,site,margin=0){return ((point.x-site.x)/(site.rx+margin))**2+((point.y-site.y)/(site.ry+margin))**2<=1;}
function eastHedgeClear(a,b){
 const h=EAST_SHORE.hedge;
 for(let i=0;i<=20;i++){const p={x:a.x+(b.x-a.x)*i/20,y:a.y+(b.y-a.y)*i/20};
  if(!inRect(p.x,p.y,h.area.left,h.area.top,h.area.right,h.area.bottom)
   ||eastShoreWater(p,EAST_SHORE.pond,19)||EAST_SHORE.trees.some(t=>distance(p,{x:t.x,y:t.y+10})<26))return false;}
 return true;
}
