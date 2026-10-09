'use strict';
function updateTownTeaPartyUI() {
  const town=farm.town,party=town.teaParty;
  const price=party.chosen && party.visit===town.visits?party.cost:townTeaPartyPrice();
  const status=party.stage==='out'?'阿葵正去赴约，阿棠在茶桌旁等她。'
    :party.stage==='tea'?`两人正分季节点心、喝花茶 · 本次点心 ${party.cost} 金`
    :party.stage==='return'?'茶会已散，阿葵正沿村路返回。'
    :party.paid?`第 ${party.day} 天相聚过 · 累计 ${town.teaParties} 次 / 点心 ${town.spending.gatherings} 金`
    :party.chosen?'本趟邀请已安排，天气或时段不合适时留待下一趟。'
    :`午后阿葵忙完菜圃、阿棠没有委托时可邀请。备好两杯花茶，也许会有一场邻里小聚。`;
  for(const prefix of ['town-','town-map-']){
    $(`${prefix}tea-party-status`).textContent=status;
    const button=$(`${prefix}tea-party-invite`);
    button.textContent=`请阿葵来喝茶 · 点心 ${price} 金`;
    button.disabled=!townCanInviteTeaParty();
    button.title='积蓄 20000 金起，晴好午后 12:14—14:24，两人忙完时可邀请。需要两杯花茶，落座后才付点心费，保留经营储备；每趟一次。';
  }
}
for(const prefix of ['town-','town-map-'])$(`${prefix}tea-party-invite`).addEventListener('click',()=>{
  if(!townInviteTeaParty())record('等两人忙完、午后天气晴好，并留好花茶与经营储备，再邀请喝茶。');
});
