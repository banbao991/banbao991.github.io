'use strict';
// An umbrella belongs to the owner's existing foot-depth item, including its hand and ribs.
function drawTownRainUmbrella(owner) {
  const canopy=townRainCanopy(owner);if (!canopy) return;
  const {actor,x,y,opening,radius,height}=canopy;
  const colour=TOWN_RAIN_PALETTES[farm.town.rainGear.palette][owner];
  const sway=Math.round(Math.sin(now*1.4+actor.x)*.7),cx=x+sway;
  ctx.save();ctx.globalAlpha*=opening;
  rect(x, y, 2, Math.round(actor.y)+4-y, '#8b7054');
  rect(x, actor.y+2, 5, 3, '#e2b990');
  const outline=blendHex(colour,'#4d5546',.55);
  rect(cx-radius*.58,y-height+1,radius*1.16,4,outline);
  rect(cx-radius*.9,y-height+4,radius*1.8,4,outline);
  rect(cx-radius-1,y-4,radius*2+2,6,outline);
  rect(cx-3,y-height,6,3,'#d3c49b');
  rect(cx-radius*.55,y-height+2,radius*1.1,3,blendHex(colour,'#efe3bd',.25));
  rect(cx-radius*.85,y-height+5,radius*1.7,3,colour);
  rect(cx-radius,y-3,radius*2,4,colour);
  for (const ratio of [-.65,0,.65]) rect(cx+radius*ratio,y-3,2,5,'#dccdab');
  rect(cx-1,y-height+3,2,height-2,blendHex(colour,'#4d6553',.22));
  rect(cx-radius,y+1,radius*2,2,outline);
  ctx.restore();
}
function drawTownFoldedRainGear(cartX,cartY) {
  if (!farm.town.inventory.rainGear) return;
  const {x:dx,y:dy}=TOWN_LAYOUT.rainHookOffset,x=cartX+dx,y=cartY+dy;
  rect(x-3,y-10,15,3,'#72573f');
  ['merchant','child'].forEach((owner,i)=>{
    if (farm.town.rainGear[owner]>.1) return;
    const xx=x+i*8,colour=TOWN_RAIN_PALETTES[farm.town.rainGear.palette][owner];
    rect(xx,y-9,2,24,'#d5bb8a');rect(xx-2,y-6,6,17,colour);
    rect(xx-1,y-4,2,12,blendHex(colour,'#eee0b9',.2));
    rect(xx,y+12,5,3,'#795e44');
  });
}
