'use strict';
function updateTownDonkeyVisitUI(){const town=farm.town,visit=town.donkeyVisit;
  const activity=townDonkeyVisitActivity();
  const status=activity?`阿宁 · ${activity}${visit.paid?` · 本趟已付 ${visit.cost} 金`:' · 尚未取零食'}`
    :town.improvements.donkeyInn.level?`已完成 ${town.donkeyVisits} 次探访 · 晴暖清晨偶尔去看小驴，至少相隔三天`
      :'小驴驿建成后，阿宁会偶尔沿村路去认识新朋友。';
  const cost=townDonkeyVisitActive()?visit.cost:townDonkeyVisitPrice();
  const price=`小袋胡萝卜 ${cost} 金 · 阿宁和小驴都到门边后才支付，保留经营储备；未取零食便取消则不收费`;
  for(const prefix of ['town-','town-map-']){
    $(`${prefix}donkey-visit-status`).textContent=status;
    $(`${prefix}donkey-visit-price`).textContent=price;
    const button=$(`${prefix}donkey-invite`);button.textContent=`请阿宁去看看小驴 · ${cost} 金`;
    button.disabled=!townCanInviteDonkeyVisit();
    button.title='晴暖清晨 06:58—08:24，阿宁和小驴有空时可邀请。双方见面后才付胡萝卜钱，保留经营储备；探访至少相隔三天。';
  }
}
function openTownDonkeyVisitPanel(){
  $('town-map-shop').hidden=true;$('town-map-lantern').hidden=true;
  $('town-map-donkey-visit').hidden=false;$('town-map-donkey-close').focus?.({preventScroll:true});updateTownDonkeyVisitUI();
}
for(const id of ['town-donkey-invite','town-map-donkey-invite'])$(id).addEventListener('click',()=>{
  if(!townInviteDonkeyVisit())record('现在先让阿宁或小驴按自己的日程休息；晴暖清晨、没有别的探访且间隔满三天时再来。');
});
$('town-map-donkey-close').addEventListener('click',()=>{$('town-map-donkey-visit').hidden=true;});
document.addEventListener('keydown',event=>{if(event.key==='Escape')$('town-map-donkey-visit').hidden=true;});
