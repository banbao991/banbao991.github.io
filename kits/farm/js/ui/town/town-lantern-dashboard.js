'use strict';
// The stage click opens a priced panel. Only an explicit launch button spends money.
function updateTownLanternUI() {
  const offer=townLanternOffer();
  for(const prefix of ['town-','town-map-']){
    $(`${prefix}lantern-status`).textContent=townLanternStatus();
    $(`${prefix}lantern-price`).textContent=`按当前积蓄：${offer.count} 盏 / ${offer.cost} 金 · 公共预算之外的手动举办也保留 ${townReserve()} 金经营储备`;
    const button=$(`${prefix}lantern-launch`);
    button.textContent=`举办纸灯小会 · ${offer.cost} 金`;button.disabled=!townCanLaunchLanterns();
  }
}
function openTownLanternPanel() {
  $('town-map-shop').hidden=true;$('town-map-donkey-visit').hidden=true;$('town-map-lantern').hidden=false;
  updateTownLanternUI();$('town-map-lantern-close').focus?.({preventScroll:true});
}
function townLanternAt(x,y) {
  return farm.town.lanternEvent.lanterns.find(lantern=>{
    const p=townLanternPosition(lantern);return inRect(x,y,p.x-14,p.y-27,p.x+14,p.y+2);
  });
}
for(const prefix of ['town-','town-map-'])$(`${prefix}lantern-launch`).addEventListener('click',()=>{
  if(!townLaunchLanterns())record('现在不能点灯：请留意欢庆日散场前的时段、天气、经营储备，以及当天是否已经举办。');
});
$('town-lantern-locate').addEventListener('click',()=>{centerCamera(CENTRAL_PLAZA.stage.x,740);openTownLanternPanel();});
$('town-map-lantern-close').addEventListener('click',()=>{$('town-map-lantern').hidden=true;});
document.addEventListener('keydown',event=>{if(event.key==='Escape')$('town-map-lantern').hidden=true;});
