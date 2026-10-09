'use strict';
// A visit carries a saved edition; looking at the album never shops or rerolls.
function prepareTownPostcard(){
 const t=farm.town,a=t.traveller,p=t.postcards;
 if(a.mode==='away'||!t.visits||p.offer?.visit===t.visits)return;
 const season=seasonIndex(),pool=Array.from({length:2+a.tier*2},(_,i)=>i);
 const unseen=pool.filter(topic=>!p.cards.some(c=>c.topic===topic&&c.season===season));
 const choices=unseen.length?unseen:pool;
 const offer={visit:t.visits,day:farm.day,season,tier:a.tier,topic:choices[Math.floor(hash(t.visits,farm.day,2267)*choices.length)],bought:false,automatic:hash(t.visits,farm.day,2281)<.5};
 offer.price=townPostcardPrice(offer);p.offer=offer;save();
}
function updateTownPostcards(){if(!farm.paused)prepareTownPostcard();}
function townBuyPostcard(automatic=false){
 const t=farm.town,p=t.postcards,o=p.offer,a=t.traveller;
 if(!townShopOpen()||!o||o.visit!==t.visits||o.bought||automatic&&(!o.automatic||farm.day<=o.day||a.boughtDay===farm.day)
  ||!townSpend(o.price,'goods',automatic))return false;
 o.bought=true;let c=p.cards.find(c=>c.topic===o.topic&&c.season===o.season);
 if(!c){c={topic:o.topic,season:o.season,tier:o.tier,day:farm.day,visit:o.visit,lastDay:farm.day,lastVisit:o.visit,copies:0,spent:0};p.cards.push(c);}
 c.copies++;c.spent+=o.price;c.lastDay=farm.day;c.lastVisit=o.visit;p.total++;p.spent+=o.price;p.selected=p.cards.indexOf(c);
 if(automatic)a.boughtDay=farm.day;a.waveUntil=now+2.5;
 townNote(`${automatic?'小镇收下':'你买下'}明信片「${townPostcardTitle(o)}」，第 ${o.visit} 趟版戳，花费 ${o.price} 金。`,!automatic);
 updateUI();save();return true;
}
function townBuyPostcardAutomatically(){
 const a=farm.town.traveller;
 // Daily supplies keep priority; otherwise the saved invitation can use a spare shopping day.
 if(a.offers.some(o=>!o.sold&&['care','supplies'].includes(TOWN_GOODS[o.id].kind)&&townGoodsUseful(o.id)&&townCanSpend(o.price,true)))return false;
 return townBuyPostcard(true);
}
function townTurnPostcard(delta){const p=farm.town.postcards;if(!p.cards.length)return false;
 p.selected=(p.selected+delta+p.cards.length)%p.cards.length;updateUI();save();return true;
}
function townPostcardWallPoint(){return farm.town.postcards.cards.length?TOWN_LAYOUT.postcardWall:null;}
function townPostcardAt(x,y){const p=townPostcardWallPoint();return p&&inRect(x,y,p.x-9,p.y-7,p.x+9,p.y+6)?p:null;}
function townPostcardDescription(){const p=farm.town.postcards,c=p.cards[p.selected];
 return c?`旅途明信片 · ${townPostcardTitle(c)} · ${p.selected+1}/${p.cards.length} 种 · 同景 ${c.copies} 张 · 点击翻看图册`:'旅途明信片 · 阿棠每趟带来一处远方的当季风景，买下后留在驿屋图册。';
}
