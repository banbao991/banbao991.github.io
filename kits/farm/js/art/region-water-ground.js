'use strict';
// Reuse only stationary lake beds and river stripes. The original water/highlight
// groups and submission order stay separate; currents and wildlife are live.
let regionLakeGroundCache=null,regionValleyGroundCache=null,regionRiverGroundCache=null;
function drawRegionLakeGround(colors){
  const key=[SOUTH_LAKE_SHIFT_Y,LAKE_X,LAKE_Y,LAKE_RX,LAKE_RY,...colors].join(':');
  let cache=regionLakeGroundCache;
  if(!cache||cache.key!==key||cache.depth!==lakeDepth||cache.pixel!==lakePixel||cache.hash!==hash){
    const water=groundTilePainter(),highlights=groundTilePainter();
    for(let y=782+SOUTH_LAKE_SHIFT_Y;y<970+SOUTH_LAKE_SHIFT_Y;y+=8)
      for(let x=86;x<400;x+=8)lakePixel(x,y,colors,water,highlights);
    cache=regionLakeGroundCache={key,depth:lakeDepth,pixel:lakePixel,hash,water,highlights};
  }
  cache.water.draw();cache.highlights.draw();
}
function drawRegionValleyGround(){
  const key=[VALLEY_LAKE_CENTER.x,VALLEY_LAKE_CENTER.y].join(':');
  let cache=regionValleyGroundCache;
  if(!cache||cache.key!==key||cache.depth!==valleyLakeDepth||cache.hash!==hash){
    const water=groundTilePainter(),highlights=groundTilePainter();
    for(let y=1152;y<1298;y+=8)for(let x=70;x<325;x+=8){
      const d=valleyLakeDepth(x,y);
      if(d<1.07)water.add(x,y,8,8,d>.79?'#afbc91':d>.65?'#7aaea5':'#679ba3');
      if(d<.62&&hash(x,y,49)>.85)highlights.add(x+2,y+3,5,2,'#acd3c4');
    }
    cache=regionValleyGroundCache={key,depth:valleyLakeDepth,hash,water,highlights};
  }
  cache.water.draw();cache.highlights.draw();
}
function drawRegionRiverGround(){
  let cache=regionRiverGroundCache;
  if(!cache||cache.height!==WORLD_H||cache.center!==riverCenterAt){
    const river=groundTilePainter();
    for(let y=0;y<WORLD_H;y+=8){
      const center=riverCenterAt(y);
      river.add(center-36,y,74,8,'#819d87');river.add(center-28,y,58,8,'#64a2aa');
    }
    cache=regionRiverGroundCache={height:WORLD_H,center:riverCenterAt,river};
  }
  cache.river.draw();
}
