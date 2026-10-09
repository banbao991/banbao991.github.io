'use strict';
function drawTownPorchLight(index){const growth=townPorchLightGrowth(index);if(!villageSiteOpen(['traveller','forest','mine'][index])||growth<=.02)return;
 const point=TOWN_LAYOUT.porchLights[index],x=point.x,y=point.y;
 const warmth=nightStrength()*townPorchLightLevel(index),paper=blendHex(['#d6b375','#bdc1a0','#cfb787'][index],'#ffe3a8',warmth);
 ctx.save();ctx.globalAlpha*=growth;
 rect(x-1,y-11,3,12,'#6f573f');rect(x-4,y-13,9,3,'#8e7251');
 if(index===1){rect(x-5,y-1,10,2,'#7d6850');rect(x-8,y+2,16,12,paper);rect(x-5,y+14,10,4,paper);rect(x-7,y+4,2,8,'#94a084');rect(x+5,y+4,2,8,'#94a084');}
 else{rect(x-7,y,14,18,'#aa8057');rect(x-5,y+3,10,12,paper);rect(x-2,y+3,2,12,'#dcc598');}
 rect(x-8,y+18,16,3,'#75563f');rect(x-2,y+21,4,2,'#b69664');
 ctx.restore();
}
function drawTownPorchLightGlow(night){for(const [index,point]of TOWN_LAYOUT.porchLights.entries()){
 const growth=townPorchLightGrowth(index);if(villageSiteOpen(['traveller','forest','mine'][index])&&growth>.02)
  drawLightGlow(point.x,point.y+9,35,night*.38*growth*townPorchLightLevel(index));
}}
