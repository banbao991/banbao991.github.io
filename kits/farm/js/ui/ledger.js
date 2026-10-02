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
  setLedgerNumber('ledger-eggs-total', farm.eggTotal, '枚');
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
  setLedgerNumber('ledger-fish-total', farm.fishTotal, '尾');
  setLedgerNumber('ledger-carp-total', farm.carpTotal, '尾');
  setLedgerNumber('ledger-gold-fish-total', farm.goldFishTotal, '尾');
  setLedgerNumber('ledger-fish-left', farm.fishSpots.length, '处');
  setLedgerNumber('ledger-shipped', farm.shippedTotal, '件');
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
