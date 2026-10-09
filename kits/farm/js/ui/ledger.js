'use strict';
// Ledger number formatting, full account details and per-depot freight rows.
function compactLedgerNumber(value) {
  if (!Number.isFinite(value) || Math.abs(value) < 1000000) return String(value);
  const amount = Math.abs(value), sign = value < 0 ? '-' : '';
  if (amount < 100000000) return `${sign}${Math.floor(amount / 10000)}万`;
  const yi = (Math.floor(amount / 1000000) / 100).toFixed(2).replace(/\.?0+$/, '');
  return `${sign}${yi}亿`;
}
function setLedgerNumbers(target, parts, compact = false) {
  const node = typeof target === 'string' ? $(target) : target;
  const withUnit = ([value, unit = ''], shorten) =>
    `${shorten ? compactLedgerNumber(value) : value}${unit ? ` ${unit}` : ''}`;
  node.textContent = parts.map(part => withUnit(part, compact)).join(' / ');
  node.title = compact ? parts.map(part => withUnit(part, false)).join(' / ') : '';
}
function setLedgerNumber(target, value, unit = '') { setLedgerNumbers(target, [[value, unit]]); }
function setOverviewNumber(target, value) { setLedgerNumbers(target, [[value]], true); }
function updateLedgerUI() {
  const expanded = farm.ledgerExpanded;
  ui.ledgerToggle.textContent = expanded ? '收起完整账本' : '查看完整账本';
  ui.ledgerToggle.setAttribute('aria-expanded', String(expanded));
  ui.ledgerDetails.hidden = !expanded;
  if (!expanded) return;
  const cropCounts = { wheat: 0, carrot: 0, strawberry: 0, corn: 0, pumpkin: 0 };
  let ripe = 0;
  for (const plot of farm.plots) {
    if (!plot.crop) continue;
    cropCounts[plot.crop]++;
    if (plot.age >= crops[plot.crop].days) ripe++;
  }
  setLedgerNumber('ledger-planted', Object.values(cropCounts).reduce((sum, count) => sum + count, 0), '格');
  setLedgerNumber('ledger-ripe', ripe, '格');
  setLedgerNumbers('ledger-crops-a', [[cropCounts.wheat], [cropCounts.carrot], [cropCounts.strawberry]]);
  setLedgerNumbers('ledger-crops-b', [[cropCounts.corn], [cropCounts.pumpkin]]);
  setLedgerNumber('ledger-milk-total', farm.milkTotal, '份');
  $('ledger-cow-grazing').textContent = cows.map(c => `${c.name} ${c.grazing?.total || 0}`).join(' / ') + ' 回';
  setLedgerNumber('ledger-eggs-total', farm.eggTotal, '枚');
  setLedgerNumbers('ledger-hen-meal',[[farm.town.inventory.henGrain],[farm.town.henMeal.served],[farm.town.henMeal.finished,'份']]);
  setLedgerNumber('ledger-fruit', farm.fruitTotal, '篮');
  setLedgerNumber('ledger-wool', farm.woolTotal, '次');
  setLedgerNumber('ledger-goat-milk', farm.goatMilkTotal, '瓶');
  setLedgerNumber('ledger-herbs', farm.herbTotal, '株');
  setLedgerNumbers('ledger-friendship', [[farm.cowLove], [farm.chickenLove]]);
  setLedgerNumber('ledger-forage-total', farm.forageTotal, '处');
  setLedgerNumber('ledger-berries', farm.berries, '份');
  setLedgerNumber('ledger-berry-total', farm.berryPickedTotal, '份');
  setLedgerNumber('ledger-mushroom-total', farm.mushroomPickedTotal, '朵');
  setLedgerNumber('ledger-acorn-total', farm.acornPickedTotal, '枚');
  setLedgerNumber('ledger-acorn-left', farm.forage.filter(site => site.kind === 'acorn').length, '枚');
  setLedgerNumber('ledger-forage-left', farm.forage.length, '处');
  setLedgerNumber('ledger-squirrel', farm.squirrelTrust);
  setLedgerNumber('ledger-squirrel-meals',farm.town.squirrelMeal.total,'簇');
  setLedgerNumber('ledger-fox-naps',forestFox.napsTotal,'回');
  setLedgerNumber('ledger-turtle-basks',valleyTurtle.bask?.total||0,'回');
  setLedgerNumber('ledger-heron-dips',valleyHeron.fishing?.total||0,'回');
  setLedgerNumber('ledger-duck-visits',angler.duckVisit?.total||0,'次');
  setLedgerNumber('ledger-fish-total', farm.fishTotal, '尾');
  setLedgerNumber('ledger-carp-total', farm.carpTotal, '尾');
  setLedgerNumber('ledger-gold-fish-total', farm.goldFishTotal, '尾');
  setLedgerNumber('ledger-fish-left', farm.fishSpots.length, '处');
  setLedgerNumber('ledger-shipped', farm.shippedTotal, '件');
  setLedgerNumbers('ledger-courier-meal',[[farm.town.courierMeal.bought,'份'],[farm.town.courierMeal.finished,'份'],[farm.town.courierMeal.spent,'金']]);
  setLedgerNumbers('ledger-town-postcards',[[farm.town.postcards.cards.length,'种'],[farm.town.postcards.total,'张'],[farm.town.postcards.spent,'金']]);
  setLedgerNumber('ledger-town-total', farm.town.spentTotal, '金');
  setLedgerNumbers('ledger-town-lanterns',[[farm.town.lanternCount,'次'],[farm.town.spending.lanterns,'金']]);
  setLedgerNumbers('ledger-town-categories', [[farm.town.spending.goods],[farm.town.spending.care],[farm.town.spending.projects,'金']]);
  setLedgerNumbers('ledger-town-visits', [[farm.town.visits,'次'],[farm.town.teaServed,'杯']]);
  setLedgerNumber('ledger-town-self-tea',farm.town.selfTea,'杯');
  setLedgerNumbers('ledger-town-gatherings',[[farm.town.teaParties,'次'],[farm.town.spending.gatherings,'金']]);
  setLedgerNumber('ledger-town-music',farm.town.music.plays,'回');
  setLedgerNumber('ledger-town-chimes',farm.town.chimes.pieces.length,'件');
  setLedgerNumber('ledger-town-porch-lights',farm.town.porchLights.pieces.length,'盏');
  setLedgerNumber('ledger-dog-stretch',farm.town.dogStretch.total,'回');
  setLedgerNumber('ledger-donkey-bond',farm.town.donkeyBond.sessions,'回');
  setLedgerNumber('ledger-donkey-water',farm.town.donkeyWater.drinks,'回');
  setLedgerNumbers('ledger-town-fodder',[[farm.town.inventory.fodder,'份'],[farm.town.fodder.served,'份']]);
  setLedgerNumbers('ledger-town-outings',[[farm.town.donkeyVisits,'次'],[farm.town.spending.outings-farm.town.paperBoats.spent,'金']]);
  setLedgerNumbers('ledger-town-boats',[[farm.town.paperBoats.launched,'只'],[farm.town.paperBoats.observed,'只'],[farm.town.paperBoats.spent,'金']]);
  setLedgerNumbers('ledger-bee-forager',[[farm.beeForager.visits,'回'],[farm.beeForager.observed,'回']]);
  setLedgerNumbers('ledger-town-projects', [[Object.values(farm.town.improvements).reduce((sum,built)=>sum+built.level,0)],
    [farm.town.maintenanceCount,'次']]);
  setLedgerNumbers('ledger-town-pavilion',[[farm.town.pavilion.tea,'包'],[farm.town.pavilion.served,'杯']]);
  const childSnack=farm.town.childSnack;
  $('ledger-town-child-snacks').textContent=`已取 ${childSnack.taken} / 吃完 ${childSnack.finished} 份`;
  const snacks=farm.town.snacks;
  $('ledger-town-snacks').textContent=`驿屋 ${snacks.stock.length} / 随身 ${snacks.carried.length} / 茶箱 ${snacks.pantry.length} 份 · 已取 ${snacks.taken} / 吃完 ${snacks.finished} 份`;
  const observations=farm.town.observations;
  setLedgerNumbers('ledger-town-nectar',[[farm.town.nectar.sips,'回'],[observations.butterfly,'次']]);
  setLedgerNumbers('ledger-town-hearth',[[farm.town.inventory.firewood,'份'],[farm.town.hearth.nights,'夜']]);
  setLedgerNumber('ledger-plaza-eaves',farm.town.eavesVisit.encounters,'次');
  setLedgerNumber('ledger-plaza-company',farm.town.catCompany.sessions,'回');
  setLedgerNumber('ledger-cat-water',farm.town.catWater.drinks,'次');
  setLedgerNumber('ledger-frog-song',farm.nursery.frogSong?.sessions||0,'回');
  $('ledger-town-sketch').textContent=farm.town.inventory.sketchbook?`${farm.town.sketch.pages.length}/16 页 · 走过 ${farm.town.sketch.seen.length}/4 处风景`:'暂未添置';
  $('ledger-town-rain-gear').textContent=farm.town.inventory.rainGear?TOWN_RAIN_PALETTES[farm.town.rainGear.palette].name+' · 两把 / 已添置':'暂未添置';
  setLedgerNumbers('ledger-town-bath',[[farm.town.birdBath.visits,'次'],[observations.wagtail,'次']]);
  setLedgerNumbers('ledger-town-bird-meals',[[farm.town.birdMeals.taken],[farm.town.birdMeals.finished,'份']]);
  setLedgerNumbers('ledger-town-birds',[[observations.sparrow],[observations.kingfisher],[observations.robin,'次']]);
  setLedgerNumbers('ledger-east-pheasants',[[farm.eastWoods.observations,'次']]);
  setLedgerNumbers('ledger-east-canopy',[[farm.eastCanopy.chipmunks.filter(a=>a.noticed).length],[farm.eastCanopy.woodpecker.noticed?1:0,'次']]);
  setLedgerNumbers('ledger-east-shore',[[farm.eastShore.observations,'次'],[farm.eastShore.meals,'份']]);
  setLedgerNumbers('ledger-east-company',[[farm.eastShore.company.count,'回']]);
  setLedgerNumbers('ledger-east-keeper',[[farm.eastWoods.keeperVisits,'次']]);
  setLedgerNumbers('ledger-town-critters',[[observations.snail],[observations.hedgehog,'次']]);
  setLedgerNumber('ledger-town-fireflies',observations.firefly,'夜');
  $('ledger-mine-stock').textContent = mineOreText(farm.mine.stock);
  setLedgerNumbers('ledger-mine-totals', [[farm.mine.minedTotal], [farm.mine.deliveredTotal, '块']]);
  setLedgerNumber('ledger-mine-income', farm.mine.incomeTotal, '金');
  setLedgerNumber('ledger-festival-total', farm.celebration.spentTotal, '金');
  setLedgerNumber('ledger-festival-count', farm.celebration.count, '次');
  $('ledger-mine-next').textContent = `第 ${miner.nextDeliveryDay} 天起${isFestivalDay(miner.nextDeliveryDay)?'（欢庆日顺延）':''}`;
  setLedgerNumbers('ledger-nursery', [[farm.nursery.harvestTotal, '份'], [nurseryActiveBeds(), '畦']]);
  for (const id of DEPOT_IDS) setLedgerNumber(`ledger-depot-${id}`, depotCount(id), '件');
  const freightDetails = DEPOT_IDS.map(id => ({ id,
    goods: Object.entries(farm.depots[id]).filter(([, count]) => count > 0) }))
    .filter(entry => entry.goods.length);
  const freightList = $('ledger-goods-detail');
  if (!freightDetails.length) {
    freightList.replaceChildren();
    freightList.textContent = '目前没有待运货物';
  }
  else freightList.replaceChildren(...freightDetails.map(({ id, goods }) => {
    const row = document.createElement('div');
    row.className = 'ledger-goods-item';
    const name = document.createElement('span');
    name.textContent = `${DEPOT_SITES[id].name}：`;
    const contents = document.createElement('span');
    contents.textContent = goods.map(([good, count]) => `${GOOD_NAMES[good]} ${count}`).join('、');
    row.append(name, contents);
    return row;
  }));
}
