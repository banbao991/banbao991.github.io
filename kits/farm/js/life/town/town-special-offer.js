'use strict';
// Decide only while packing a new visit; the quoted price lives in the saved offer.
function townPrepareSpecialOffer() {
  const town = farm.town, actor = town.traveller;
  if (hash(town.visits, actor.day, 2291) >= .4) return;
  const choices = actor.offers.filter(offer => offer.id === 'birdFeed'
    || TOWN_GOODS[offer.id].kind === 'supplies');
  if (!choices.length) return;
  const offer = choices[Math.floor(hash(town.visits, actor.day, 2292) * choices.length)];
  if (Object.hasOwn(offer, 'regularPrice')) return;
  offer.regularPrice = offer.price;
  offer.price = Math.max(1, Math.round(offer.regularPrice * .8));
}
function townSpecialOffer() {
  const actor = farm.town.traveller;
  return actor.mode === 'away' ? null : actor.offers.find(offer => offer.regularPrice && !offer.sold) || null;
}
function townSpecialOfferHint() {
  const offer = townSpecialOffer();
  return offer ? `旅途特价 · ${TOWN_GOODS[offer.id].name}八折 ${offer.price} 金（原价 ${offer.regularPrice} 金）` : '';
}
function townBuySpecialAutomatically() {
  const offer = townSpecialOffer();
  return !!offer && townGoodsUseful(offer.id) && townBuy(offer.id, true);
}
