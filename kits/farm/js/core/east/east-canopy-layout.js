'use strict';
// Northern clearing stays above the existing pheasant habitat and village roads.
const EAST_CANOPY={area:{left:2080,top:48,right:2530,bottom:256},
  homes:[{x:2120,y:231},{x:2504,y:86}],
  spots:[{x:2208,y:222},{x:2288,y:185},{x:2410,y:231},{x:2440,y:104},{x:2230,y:81}],
  // Trunk positions and painter depths always follow their actual carrier trees.
  perches:[0,1,2].map(index=>({tree:EAST_WOODS.trees[index],x:EAST_WOODS.trees[index].x+7,y:EAST_WOODS.trees[index].y-21})),
  nest:1};
function eastCanopyClear(a,b){
  const h=EAST_CANOPY.area;
  for(let i=0;i<=24;i++){
    const p={x:a.x+(b.x-a.x)*i/24,y:a.y+(b.y-a.y)*i/24};
    if(!inRect(p.x,p.y,h.left,h.top,h.right,h.bottom)
      ||EAST_WOODS.trees.some(t=>distance(p,{x:t.x,y:t.y+10})<EAST_WOODS.rootRadius+2))return false;
  }
  return true;
}
