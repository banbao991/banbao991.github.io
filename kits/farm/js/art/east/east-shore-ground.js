'use strict';
// Keep tile order and original alpha precision. Painters align their edges using
// the current context on every draw, including camera changes and PNG exports.
const eastShoreGroundCache=new WeakMap();
function drawEastShoreWaterGround(site,winter){
 const geometryKey=[site.x,site.y,site.rx,site.ry].join(':');
 let entry=eastShoreGroundCache.get(site);
 if(!entry||entry.geometryKey!==geometryKey){
  const water=[],shore=[];
  for(let y=site.y-site.ry-16;y<=site.y+site.ry+16;y+=4)for(let x=site.x-site.rx-16;x<=site.x+site.rx+16;x+=4){
   const d=((x-site.x)/site.rx)**2+((y-site.y)/site.ry)**2,edge=1+(hash(x,y,876)-.5)*.07;
   if(d<edge)water.push([x,y,d>.79?0:d>.55?1:2]);
   else if(d<1.26&&hash(x,y,877)>.35)shore.push([x,y,(1.26-d)*1.4]);
  }
  entry={geometryKey,water,shore,paletteKey:null};eastShoreGroundCache.set(site,entry);
 }
 const colors=[blendHex('#8fab8c','#bccab1',winter),blendHex('#79aaa3','#a6c5c4',winter),blendHex('#689fa7','#a6c5c4',winter)];
 const shoreRGB=colorChannels(blendHex('#8da37a','#bac9ae',winter)).join(',');
 const paletteKey=colors.join(':')+':'+shoreRGB;
 if(entry.paletteKey!==paletteKey){
  const waterPainter=groundTilePainter(),shorePainter=groundTilePainter();
  for(const [x,y,band]of entry.water)waterPainter.add(x,y,4,4,colors[band]);
  for(const [x,y,alpha]of entry.shore)shorePainter.add(x,y,4,4,`rgba(${shoreRGB},${alpha})`);
  entry.waterPainter=waterPainter;entry.shorePainter=shorePainter;entry.paletteKey=paletteKey;
 }
 entry.shorePainter.draw();entry.waterPainter.draw();
}
