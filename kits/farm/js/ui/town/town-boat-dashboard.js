'use strict';
function updateTownBoatUI() {
  const s=farm.town.paperBoats,v=s.visit,activity=townBoatActivity(),cost=townBoatActive()?v.cost:townBoatPrice();
  $('town-boat-status').textContent=activity?`阿宁 · ${activity} · ${v.paid?`已付 ${v.cost} 金`:'尚未取纸'}`
    :`已放 ${s.launched} 只 · 看过 ${s.observed} 只 · 共花 ${s.spent} 金`;
  const b=$('town-boat-invite');b.textContent=`请阿宁去放纸船 · ${cost} 金`;b.disabled=!townCanInviteBoat();
  b.title='积蓄20000金起，晴暖上午09:07—10:19且阿宁有空时可邀请；至少相隔三天。到桥边取纸才付费，保留经营储备。';
}
$('town-boat-invite').addEventListener('click',()=>{if(!townInviteBoat())record('等一个晴暖上午，阿宁有空时再去溪桥看看。');});
$('town-boat-locate').addEventListener('click',()=>centerCamera(TOWN_LAYOUT.paperBoat.bridge.x,TOWN_LAYOUT.paperBoat.bridge.y));
