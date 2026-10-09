'use strict';
const townPostcardSignatures={};
let townPostcardAlbumOpen=false;
function closeTownPostcardPanel(){townPostcardAlbumOpen=false;$('town-map-shop').hidden=true;}
function openTownPostcardPanel(){
 townPostcardAlbumOpen=true;$('town-map-lantern').hidden=true;$('town-map-donkey-visit').hidden=true;
 $('town-map-shop').hidden=false;updateUI();$('town-map-postcard-details').open=true;
 $('town-map-postcard-details').scrollIntoView?.({block:'nearest'});$('town-map-shop-close').focus?.({preventScroll:true});
}
function updateTownPostcardUI(){const p=farm.town.postcards,o=p.offer,c=p.cards[p.selected];
 const preview=c||o;
 for(const prefix of ['town-','town-map-']){
  const button=$(`${prefix}postcard-buy`),available=o&&farm.town.traveller.mode!=='away';
  button.hidden=!available;button.textContent=o?`${o.bought?'本趟已购':'收下'}「${townPostcardTitle(o)}」 · ${o.price} 金 · 第 ${o.visit} 趟版戳`:'明信片还在路上';
  button.disabled=!available||o.bought||!townShopOpen()||!townCanSpend(o.price);
  button.title='本趟限购一张；同一风景的新版本也会收费。保留经营储备，打开或翻页免费。';
  $(`${prefix}postcard-status`).textContent=`图册 ${p.cards.length}/32 种 · 已收 ${p.total} 张 · 共花 ${p.spent} 金 · 每趟一张远方风景`;
  $(`${prefix}postcard-caption`).textContent=c?`${p.selected+1}/${p.cards.length} · ${townPostcardTitle(c)} · 初藏第 ${c.day} 天 / 第 ${c.visit} 趟版戳 · 同景 ${c.copies} 张${c.copies>1?`，最近购于第 ${c.lastDay} 天`:''}`
   :o?`本趟待售：${townPostcardTitle(o)} · 尚未收藏。`:'阿棠来访时带来明信片；积蓄越丰厚，能遇见的远方风景越多。';
  const canvas=$(`${prefix}postcard-picture`),signature=JSON.stringify(preview);canvas.hidden=!preview;
  canvas.setAttribute('aria-label',preview?townPostcardTitle(preview)+'旅途明信片':'空白旅途图册');
  if(signature!==townPostcardSignatures[prefix]){const target=canvas.getContext?.('2d');if(target){target.save();target.setTransform(3,0,0,3,0,0);drawTownPostcard(target,preview);target.restore();}townPostcardSignatures[prefix]=signature;}
  for(const direction of ['prev','next'])$(`${prefix}postcard-${direction}`).disabled=p.cards.length<2;
 }
}
for(const prefix of ['town-','town-map-']){
 $(`${prefix}postcard-buy`).addEventListener('click',()=>townBuyPostcard());
 $(`${prefix}postcard-prev`).addEventListener('click',()=>townTurnPostcard(-1));
 $(`${prefix}postcard-next`).addEventListener('click',()=>townTurnPostcard(1));
}
