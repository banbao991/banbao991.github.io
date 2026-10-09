'use strict';
// Sparse eastward additions share anchors with art, paths, inspection and export.
const EAST_WOODS={area:{left:2050,top:40,right:2540,bottom:632},
  habitat:{left:2080,top:264,right:2530,bottom:612},rootRadius:24,watch:{x:2410,y:500},
  trees:[{x:2160,y:142,kind:'oak'},{x:2340,y:110,kind:'spruce'},{x:2480,y:210,kind:'hawthorn'},
    {x:2108,y:398,kind:'hawthorn'},{x:2296,y:432,kind:'oak'},{x:2460,y:568,kind:'spruce'},
    {x:2160,y:595,kind:'oak'}],
  homes:[{x:2496,y:340},{x:2496,y:374}],
  spots:[{x:2200,y:310},{x:2370,y:330},{x:2470,y:450},{x:2180,y:505},{x:2350,y:562}]};
const EAST_GARDEN_EXTENSION={beds:[{x:2158,y:1189,stage:0},{x:2242,y:1209,stage:0},
  {x:2314,y:1188,stage:1},{x:2220,y:1240,stage:2}],bench:{x:2310,y:1251},
  area:{left:2128,top:1165,right:2350,bottom:1259}};
const EAST_PICNIC={tree:{x:2490,y:1430,kind:'oak'},bench:{x:2490,y:1570},
  flowers:{x:2510,y:1658},area:{left:2440,top:1350,right:2540,bottom:1700}};
function eastTreeAt(x,y){return [...EAST_WOODS.trees,EAST_PICNIC.tree].find(t=>inRect(x,y,t.x-41,t.y-87,t.x+41,t.y+22));}
