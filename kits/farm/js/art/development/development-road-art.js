'use strict';
// Paint completed road pieces as one ribbon. Construction chunks are not visual tiles.
let villageRoadPaintCache=null;
function villageRoadSurfaceAt(graph,x,y,includeBridges=true) {
  const roads=graph.buckets.get(`${Math.floor(x/64)}:${Math.floor(y/64)}`)||[];
  return roads.some(r=>(includeBridges||(!r.bridge&&!r.footBridge))
    &&x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
}
function villageRoadPaint() {
  const graph=villageRoadGraph();
  if(villageRoadPaintCache?.graph===graph)return villageRoadPaintCache;
  const pixels=new Map(),flecks=new Map();
  const edgePixel=(x,y,alpha)=>{
    if(x<0||y<0||x>=WORLD_W||y>=WORLD_H
      ||villageRoadSurfaceAt(graph,x+.5,y+.5)||riverAt(x+.5,y+.5,0))return;
    const key=y*WORLD_W+x;
    // Intersecting edges contribute once, rather than stacking translucent rectangles.
    pixels.set(key,Math.max(pixels.get(key)||0,alpha));
  };
  for(const r of graph.nodes){
    if(r.bridge||r.footBridge)continue;
    for(let gx=Math.floor(r.x/8)*8;gx<r.x+r.w;gx+=8){
      const from=Math.max(gx,r.x),to=Math.min(gx+8,r.x+r.w);
      for(const [edge,direction,alpha]of [[r.y,-1,52],[r.y+r.h,1,48]]){
        const rough=3+Math.round(hash(gx,edge,90)*4);
        for(let x=from;x<to;x++)for(let offset=0;offset<rough;offset++)
          edgePixel(x,direction<0?edge-1-offset:edge+offset,alpha);
      }
    }
    for(let gy=Math.floor(r.y/8)*8;gy<r.y+r.h;gy+=8){
      const from=Math.max(gy,r.y),to=Math.min(gy+8,r.y+r.h);
      for(const [edge,direction,alpha]of [[r.x,-1,52],[r.x+r.w,1,48]]){
        const rough=3+Math.round(hash(edge,gy,92)*4);
        for(let y=from;y<to;y++)for(let offset=0;offset<rough;offset++)
          edgePixel(direction<0?edge-1-offset:edge+offset,y,alpha);
      }
    }
    // Scattered grains use world coordinates, so their spacing never restarts at a chunk seam.
    for(let x=Math.floor(r.x/16)*16;x<r.x+r.w;x+=16)
      for(let y=Math.floor(r.y/16)*16;y<r.y+r.h;y+=16){
        if(hash(x,y,91)<=.72)continue;
        const px=x+2,py=y+3;
        if(villageRoadSurfaceAt(graph,px,py,false)
          &&villageRoadSurfaceAt(graph,px+3,py+2,false))flecks.set(`${px}:${py}`,{x:px,y:py});
      }
  }
  const sorted=[...pixels.entries()].sort((a,b)=>a[0]-b[0]),edges=[];
  for(const [key,alpha]of sorted){
    const x=key%WORLD_W,y=Math.floor(key/WORLD_W),last=edges[edges.length-1];
    if(last&&last.y===y&&last.x+last.w===x&&last.alpha===alpha)last.w++;
    else edges.push({x,y,w:1,alpha});
  }
  return villageRoadPaintCache={graph,edges,flecks:[...flecks.values()]};
}
function drawVillageRoadSurface() {
  const paint=villageRoadPaint();
  const left=farm.view.x-8,top=farm.view.y-8,
    right=farm.view.x+W/farm.view.zoom+8,bottom=farm.view.y+H/farm.view.zoom+8;
  // Fill touching rectangles in one path: separate fillRect calls expose anti-aliased
  // internal edges at fractional zoom levels, even when their world coordinates touch.
  for(const alpha of [48,52]){
    ctx.beginPath();
    for(const edge of paint.edges){
      if(edge.alpha!==alpha||edge.x+edge.w<left||edge.x>right||edge.y<top||edge.y>bottom)continue;
      ctx.rect(edge.x,edge.y,edge.w,1);
    }
    ctx.fillStyle=`rgba(208,181,134,0.${alpha})`;ctx.fill();
  }
  ctx.beginPath();
  for(const r of paint.graph.nodes){
    if(r.bridge||r.footBridge)continue;
    ctx.rect(r.x,r.y,r.w,r.h);
  }
  ctx.fillStyle='#d0b586';ctx.fill();
  for(const grain of paint.flecks)rect(grain.x,grain.y,3,2,'#ead3a3');
  // Bridge decks cover the soil at their approaches and keep their original wood palette.
  for(const r of paint.graph.nodes){
    if(r.bridge)drawRiverBridge(r.bridge);
    else if(r.footBridge)rect(r.x,r.y,r.w,r.h,'#bd9566');
  }
}
