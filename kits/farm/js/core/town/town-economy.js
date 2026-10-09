'use strict';
// Public money is charged only for an actual purchase, never for allocating a budget.
function townRandom() {
  let seed = farm.town.seed;
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  farm.town.seed = seed >>> 0 || 1;
  return farm.town.seed / 4294967296;
}
function townReserve() { return Math.max(600, farm.plots.length * Math.max(...Object.values(crops).map(crop => crop.cost))); }
function townNote(text, journal = false) {
  farm.town.events.unshift({ day: farm.day, text });
  farm.town.events.length = Math.min(12, farm.town.events.length);
  if (journal) record(text);
}
function townBudgetLeft() { return Math.max(0, farm.town.allowance - farm.town.seasonSpent); }
function townCanSpend(price, automatic = false) {
  return Number.isSafeInteger(price) && price > 0 && farm.coins - price >= townReserve()
    && (!automatic || farm.town.budgetMode !== 'off' && townBudgetLeft() >= price);
}
function townSpend(price, category, automatic = false) {
  if (!townCanSpend(price, automatic)) return false;
  farm.coins -= price;
  farm.town.spentTotal += price;
  farm.town.spending[category] += price;
  if (automatic) farm.town.seasonSpent += price;
  return true;
}
function townSetBudget(mode) {
  if (!Object.hasOwn(TOWN_BUDGET_MODES, mode)) return;
  const town = farm.town;
  if (town.budgetMode === mode) return;
  town.budgetMode = mode;
  // Changing a preference never refunds money or resets money already spent this season.
  town.allowance = Math.max(town.seasonSpent, Math.min(15000,
    Math.floor(Math.max(0, farm.coins - townReserve()) * TOWN_BUDGET_MODES[mode].rate)));
  townNote(`公共预算改为${TOWN_BUDGET_MODES[mode].name}。`);
  updateUI(); save();
}
function townGoodsUseful(id) {
  const good = TOWN_GOODS[id], count = farm.town.inventory[id];
  // Automatic purchases wait for their real place of use. Players may buy ahead.
  const site=good.kind==='curio'?'traveller':({birdFeed:'traveller',firewood:'traveller',flowerPot:'traveller',
    musicBox:'traveller',sketchbook:'traveller',birdNest:'herbs',butterflySeed:'herbs'})[id];
  if(site&&!villageSiteOpen(site))return false;
  if(id==='windchime'&&!villageSiteOpen(['traveller','herbs','nursery'][count]||'traveller'))return false;
  if(id==='lantern'&&!villageSiteOpen(['traveller','forest','mine'][count]||'traveller'))return false;
  if(id==='teaBlend'&&!villageSiteOpen('traveller')
    &&(!villageSiteOpen('scenic')||!farm.town.improvements.teaChimes.level))return false;
  if(id==='snackBox'&&!farm.town.improvements.teaChimes.level&&farm.town.construction?.id!=='teaChimes'&&!farm.town.teaServed)return false;
  if(id==='fodder'&&!farm.town.improvements.donkeyInn.level)return false;
  if(id==='firewood'&&seasonTransition().winter<=.25)return false;
  return count < good.stock && (good.kind !== 'care' && good.kind !== 'supplies' || count <= 2);
}
function townBuy(id, automatic = false) {
  const actor = farm.town.traveller;
  const offer = actor.offers.find(item => item.id === id);
  if (!townShopOpen() || !offer || offer.sold || farm.town.inventory[id] >= TOWN_GOODS[id].stock
    || TOWN_GOODS[id].quantity && farm.town.inventory[id]+TOWN_GOODS[id].quantity>TOWN_GOODS[id].stock
    || automatic && !townGoodsUseful(id)) return false;
  const good = TOWN_GOODS[id];
  if (!townSpend(offer.price, good.kind === 'care' || good.kind === 'supplies' ? 'care' : 'goods', automatic)) return false;
  offer.sold = true;
  const previousCount = farm.town.inventory[id];
  farm.town.inventory[id] = Math.min(good.stock, farm.town.inventory[id]
    + (good.quantity ?? (id === 'birdFeed' || id === 'teaBlend' || id === 'firewood' || id === 'fodder' ? 4 : 1)));
  if(id==='windchime')townInstallChime();
  if(id==='lantern')townInstallPorchLight();
  if(id==='snackBox')townBuySnacks();
  const planted = farm.town.plantings[id];
  if (planted) {
    while (planted.length < previousCount) planted.push(0);
    while (planted.length < farm.town.inventory[id]) planted.push(farm.day + farm.phase);
  }
  if (automatic) actor.boughtDay = farm.day;
  actor.waveUntil = now + 2.5;
  townNote(`${automatic ? '小镇添置' : '你买下'}${good.name}${offer.regularPrice ? '（旅途八折）' : ''}，花费 ${offer.price} 金。`, !automatic);
  updateUI(); save();
  return true;
}
function updateTownPlanning() {
  if (farm.paused) return;
  const town = farm.town;
  if (isFestivalDay()) town.childVisit = null;
  const epoch = Math.floor((farm.day - 1) / 8);
  if (town.season !== epoch) {
    town.season = epoch; town.seasonSpent = 0;
    town.allowance = Math.min(15000,
      Math.floor(Math.max(0, farm.coins - townReserve()) * TOWN_BUDGET_MODES[town.budgetMode].rate));
  }
  if (!town.merchantUnlocked && villageSiteOpen('traveller') && farm.coins >= TOWN_MERCHANT_MIN_COINS) {
    town.merchantUnlocked = true; town.nextVisit = farm.day;
    townNote('积蓄渐渐丰厚，旅行商人阿棠听说了苔谷，准备带着小货车来拜访。', true);
  }
  if (town.day !== farm.day) {
    town.day = farm.day;
    if (isFestivalDay() && town.traveller.mode !== 'away') town.traveller.stayUntil++;
  }
}
function updateTownAutomaticShopping() {
  const actor = farm.town.traveller;
  if (!townShopOpen() || actor.boughtDay === farm.day || farm.phase < .16) return;
  if (townBuySpecialAutomatically()) return;
  if (townBuyPostcardAutomatically()) return;
  const offer = actor.offers.find(item => !item.sold && townGoodsUseful(item.id)
    && townCanSpend(item.price, true));
  if (offer) townBuy(offer.id, true);
}
