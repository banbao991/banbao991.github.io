'use strict';
// Only fixed ground groups are retained. Draw them against the current context
// so fractional camera alignment and full-map exports use the original painter.
let villageYardGroundCache=null,villagePlazaGroundCache=null;
function drawCachedVillageGround(){
 const district=MARKET_LAYOUT.district,homes=MARKET_LAYOUT.homes,stalls=MARKET_LAYOUT.stalls,fountain=MARKET_LAYOUT.fountain;
 const open=stalls.map((_,index)=>villageMarketStallOpen(index));
 const key=[district.left,district.top,district.right,district.bottom,fountain.x,fountain.y,
  ...homes.map(home=>home.x),...stalls.flatMap((stall,index)=>[stall.x,open[index]])].join(':');
 if(villageYardGroundCache?.key!==key){
  const yards=groundTilePainter(),flecks=[];
  for(let y=district.top;y<district.bottom;y+=8)for(let x=district.left;x<district.right;x+=8){
   const homeYard=homes.some(home=>x>=home.x-12&&x<=home.x+130&&y<832);
   const stallYard=stalls.some((stall,index)=>open[index]&&x>=stall.x-16&&x<=stall.x+134&&y>=826&&y<946);
   const fountainYard=Math.hypot(x-fountain.x,y-fountain.y)<57;
   const lane=(y>=804&&y<832)||(y>=938&&y<962)||(x>=1697&&x<1729&&y>=815&&y<951);
   if(homeYard||stallYard||fountainYard||lane){
    const alpha=.54+hash(x,y,77)*.2;
    yards.add(x,y,8,8,`rgba(189,169,121,${alpha.toFixed(2)})`);
   }
  }
  for(let i=0;i<115;i++){
   const x=district.left+18+hash(i,74)*(district.right-district.left-36);
   const y=district.top+18+hash(i,75)*(district.bottom-district.top-36);
   flecks.push([x,y]);
  }
  villageYardGroundCache={key,yards,flecks};
 }
 villageYardGroundCache.yards.draw();
 for(const [x,y]of villageYardGroundCache.flecks)rect(x,y,7,3,'#d0ba87');
 if(!villageSiteOpen('plaza'))return;
 const square=CENTRAL_PLAZA,plazaKey=[square.left,square.top,square.right,square.bottom].join(':');
 if(villagePlazaGroundCache?.key!==plazaKey){
  const plaza=groundTilePainter(),grains=groundTilePainter();
  for(let y=square.top;y<square.bottom;y+=8)for(let x=square.left;x<square.right;x+=8){
   const edge=Math.min(x-square.left,plazaRightAt(y)-x,y-square.top,square.bottom-y);
   const alpha=smoothRange(0,29,edge+(hash(x,y,601)-.5)*9);
   if(alpha>.02)plaza.add(x,y,8,8,`rgba(207,185,139,${(alpha*.9).toFixed(2)})`);
   if(edge>27&&hash(x,y,602)>.84)grains.add(x+2,y+3,4,2,'#e7d3a7');
  }
  villagePlazaGroundCache={key:plazaKey,plaza,grains};
 }
 villagePlazaGroundCache.plaza.draw();villagePlazaGroundCache.grains.draw();
}
