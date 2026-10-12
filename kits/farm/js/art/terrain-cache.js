'use strict';
// One exact viewport raster, not a resized world texture. Never part of a save.
const baseTerrainCache={key:null,canvas:null,context:null};
function drawCachedBaseTerrain(paletteKey,draw){
  // Full-map export uses a different canvas; keep its original painter and context.
  // Small test/preview contexts may not support raster caching either.
  if(ctx.canvas!==canvas||!ctx.getTransform||!ctx.drawImage){draw();return;}
  const target=ctx,transform=ctx.getTransform();
  const key=`${W}:${H}:${farm.view.x}:${farm.view.y}:${farm.view.zoom}:${transform.a}:${transform.b}:${transform.c}:${transform.d}:${transform.e}:${transform.f}:${paletteKey}`;
  if(baseTerrainCache.key!==key){
    // A failed rebuild must not leave the old key attached to a partial raster.
    baseTerrainCache.key=null;
    if(!baseTerrainCache.canvas){
      const surface=document.createElement('canvas');
      const context=surface.getContext('2d',{alpha:false});
      if(!context){draw();return;}
      baseTerrainCache.canvas=surface;baseTerrainCache.context=context;
    }
    const surface=baseTerrainCache.canvas,context=baseTerrainCache.context;
    if(surface.width!==W)surface.width=W;
    if(surface.height!==H)surface.height=H;
    context.setTransform(1,0,0,1,0,0);
    context.fillStyle='#203328';context.fillRect(0,0,W,H);
    context.imageSmoothingEnabled=false;
    context.setTransform(transform.a,transform.b,transform.c,transform.d,transform.e,transform.f);
    try{ctx=context;draw();}
    finally{ctx=target;}
    // Publish only a completely painted raster; a failed draw never becomes a hit.
    baseTerrainCache.key=key;
  }
  target.save();
  try{
    target.setTransform(1,0,0,1,0,0);
    target.drawImage(baseTerrainCache.canvas,0,0);
  }finally{target.restore();}
}
