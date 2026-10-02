'use strict';
// Warm stone terraces, a lived-in miner's cottage and the village's ore stall.
function mineVisible() {
  return farm.view.x < MINE_LAYOUT.area.right + 80
    && farm.view.x + W / farm.view.zoom > MINE_LAYOUT.area.left - 80
    && farm.view.y < MINE_LAYOUT.area.bottom + 80
    && farm.view.y + H / farm.view.zoom > MINE_LAYOUT.area.top - 80;
}
function drawMineGround() {
  if (!mineVisible()) return;
  const winter = sceneSeason.winter, rain = weatherVisual().rain;
  const dirt = blendHex('#a69370', '#b7b9ad', winter * .7);
  const rock = blendHex('#8e8b78', '#b8c2bc', winter * .8);
  for (let y = 1424; y < WORLD_H; y += 16) {
    const edge = 1680 + Math.round(Math.sin(y / 57) * 27 + (hash(y, 1, 841) - .5) * 25);
    const fade = y < 1460 ? (y - 1424) / 36 : 1;
    if (fade > 0) rect(edge, y, WORLD_W - edge, 16,
      `rgba(157,142,112,${(.38 * fade).toFixed(2)})`);
    const ridge = edge + 44 + Math.round(Math.sin(y / 44) * 20);
    rect(ridge, y + 2, WORLD_W - ridge, 9,
      `rgba(91,91,78,${(.14 + rain * .1).toFixed(2)})`);
    if (hash(y, 2, 842) > .42) rect(ridge + 22, y + 11, 90 + hash(y, 3, 843) * 120, 3, dirt);
  }
  for (let i = 0; i < 130; i++) {
    const x = 1690 + hash(i, 4, 844) * 346, y = 1450 + hash(i, 5, 845) * 455;
    if (x > 1803 && x < 1852 && y < 1608) continue;
    rect(x, y, 6 + hash(i, 6, 846) * 14, 3 + hash(i, 7, 847) * 5,
      i % 3 ? rock : dirt);
  }
  for (let i = 0; i < 22; i++) {
    const x = 1600 + hash(i, 8, 848) * 430, y = 1365 + hash(i, 9, 849) * 500;
    if (x < 1705 && y < 1495 || x > 1790 && x < 1850 && y < 1610) continue;
    rect(x, y, 8, 4, '#72865f'); rect(x + 3, y - 6, 4, 7, '#81996b');
  }
  if (rain > .2) for (const [x, y, width] of [[1725, 1606, 24], [1885, 1780, 35], [1990, 1565, 17]])
    rect(x, y, width, 4, `rgba(112,158,161,${(rain * .45).toFixed(2)})`);
}
function drawMineRail() {
  const rail = (x1, y1, x2, y2) => {
    if (y1 === y2) {
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x += 15) rect(x, y1 - 9, 5, 18, '#785b46');
      rect(Math.min(x1, x2), y1 - 6, Math.abs(x2 - x1) + 5, 3, '#b99a67');
      rect(Math.min(x1, x2), y1 + 4, Math.abs(x2 - x1) + 5, 3, '#b99a67');
    } else {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y += 15) rect(x1 - 9, y, 18, 5, '#785b46');
      rect(x1 - 6, Math.min(y1, y2), 3, Math.abs(y2 - y1) + 5, '#b99a67');
      rect(x1 + 4, Math.min(y1, y2), 3, Math.abs(y2 - y1) + 5, '#b99a67');
    }
  };
  rail(1828, 1448, 1828, 1840);
  for (const node of MINE_LAYOUT.nodes) rail(1828, node.y, node.x, node.y);
  const turn = MINE_LAYOUT.entranceTurn, cave = MINE_LAYOUT.entrance;
  rail(1828, turn.y, turn.x - 9, turn.y);
  rail(turn.x, cave.y, turn.x, turn.y - 9);
  // Two stepped rails turn north without crossing each other at the elbow.
  rect(turn.x - 13, turn.y - 13, 21, 21, '#785b46');
  for (const offset of [-5, 5]) {
    const cornerX = turn.x + offset, cornerY = turn.y + offset;
    rect(turn.x - 13, cornerY - 1, 13 + offset, 3, '#b99a67');
    rect(cornerX - 1, turn.y - 13, 3, 13 + offset, '#b99a67');
  }
  rail(1828, MINE_REST.y, MINE_REST.x, MINE_REST.y);
  const switchAt = (y, side) => {
    rect(1812, y - 10, 32, 20, '#84674c');
    for (const dy of [-8, 2]) rect(1814, y + dy, 29, 5, '#a47b55');
    rect(1821, y - 13, 3, 26, '#d4b17b');
    rect(1832, y - 13, 3, 26, '#d4b17b');
    const edge = side === 'left' ? 1812 : 1835;
    rect(edge, y - 6, 12, 3, '#d4b17b');
    rect(edge, y + 4, 12, 3, '#d4b17b');
    rect(side === 'left' ? 1815 : 1839, y - 12, 3, 6, '#e7c48b');
    rect(side === 'left' ? 1815 : 1839, y - 17, 4, 5, '#c6815b');
  };
  for (const node of MINE_LAYOUT.nodes) switchAt(node.y, node.x < 1828 ? 'left' : 'right');
  switchAt(MINE_LAYOUT.entranceTurn.y, 'right');
  switchAt(MINE_REST.y, 'left');
}
function drawMineNode(index) {
  if (sceneQueue) return scenePart(`mine-node:${index}`, MINE_LAYOUT.nodes[index].y + 16, () => drawMineNode(index));
  const site = MINE_LAYOUT.nodes[index], state = farm.mine.nodes[index];
  const wait = { stone: 1.12, copper: 1.65, quartz: 2.15 }[site.kind];
  const progress = clamp(1 - (state.readyAt - mineClock()) / wait, 0, 1);
  const size = 7 + progress * 15;
  const base = sceneSeason.winter > .5 ? '#a9b5ad' : '#787d74';
  rect(site.x - 23, site.y + 11, 47, 5, '#514f4866');
  rect(site.x - size, site.y - size * .35, size * 1.6, size * .85, base);
  rect(site.x - size + 4, site.y - size * .65, size * 1.3, size * .55, '#a7a99b');
  rect(site.x + 6, site.y - size * .45, size * .7, size * .62, '#6e746e');
  if (progress > .33) {
    const color = MINE_ORES[site.kind].color;
    rect(site.x - 6, site.y - size * .55, 5 + progress * 4, 3 + progress * 3, color);
    rect(site.x + 7, site.y - 2, 4 + progress * 3, 3, color);
  }
  if (progress >= 1) rect(site.x - 2, site.y - size * .7 - 4, 3, 3, '#f1e6c3');
}
function drawMineScenery() {
  if (!mineVisible()) return;
  // The cliff face forms a backdrop, with a modest timber-framed opening.
  for (let i = 0; i < 7; i++) {
    const x = 1723 + i * 46, y = 1519 + (i % 3) * 12;
    rect(x - 13, y - 30, 58, 41, '#77796c');
    rect(x - 8, y - 34, 47, 7, '#a7a493');
    rect(x + 7, y + 11, 28, 6, '#646b61');
  }
  drawMineRail();
  const cave = MINE_LAYOUT.entrance;
  scenePart('mine-cave', cave.y + 12, () => {
    rect(cave.x - 43, cave.y - 59, 86, 70, '#8e8975');
    rect(cave.x - 35, cave.y - 54, 70, 66, '#665d52');
    rect(cave.x - 27, cave.y - 42, 54, 54, '#343c3c');
    rect(cave.x - 37, cave.y - 57, 9, 68, '#a9815d');
    rect(cave.x + 28, cave.y - 57, 9, 68, '#a9815d');
    rect(cave.x - 39, cave.y - 62, 78, 9, '#c39869');
    rect(cave.x - 22, cave.y + 4, 44, 5, '#856d53');
  });
  // A side spur ends at the cart bay and a small place to rest between shifts.
  scenePart('mine-rest-shelter', MINE_REST.y + 1, () => {
    rect(MINE_REST.x - 25, MINE_REST.y - 39, 51, 8, '#b58b62');
    rect(MINE_REST.x - 21, MINE_REST.y - 30, 5, 30, '#765a43');
    rect(MINE_REST.x + 17, MINE_REST.y - 30, 5, 30, '#765a43');
    rect(MINE_REST.x - 17, MINE_REST.y - 27, 36, 9, '#d2ae79');
    rect(MINE_REST.x - 18, MINE_REST.y - 12, 37, 6, '#a87d55');
    rect(MINE_REST.x + 27, MINE_REST.y - 13, 8, 14, '#836246');
    rect(MINE_REST.x + 29, MINE_REST.y - 17, 4, 5, '#ebd6a7');
  });
  // Ore crates show stock; the delivery cart has its own bay across the road.
  const stock = MINE_LAYOUT.stockpile;
  scenePart('mine-stock', stock.y + 17, () => {
    rect(stock.x - 31, stock.y + 7, 65, 5, '#6f604b');
    rect(stock.x - 26, stock.y - 8, 52, 19, '#946d4d');
    rect(stock.x - 22, stock.y - 5, 44, 9, '#6b5b4e');
    const count = mineStockCount();
    for (let i = 0; i < Math.min(7, count); i++) {
      rect(stock.x - 20 + i * 6, stock.y - 11 - i % 2 * 4, 8, 6,
        MINE_ORES[['stone', 'copper', 'quartz'][i % 3]].color);
    }
    rect(stock.x - 20, stock.y + 11, 5, 6, '#73533d');
    rect(stock.x + 15, stock.y + 11, 5, 6, '#73533d');
  });
  const bay = MINE_LAYOUT.cartBay;
  if (!['toMarket', 'returnCart'].includes(miner.mode)) {
    scenePart('mine-parked-cart', bay.y + 22, () => {
      rect(bay.x - 17, bay.y + 1, 34, 15, '#986d4a');
      rect(bay.x - 13, bay.y + 14, 6, 8, '#4c5147');
      rect(bay.x + 8, bay.y + 14, 6, 8, '#4c5147');
      rect(bay.x - 12, bay.y - 3, 25, 5, '#bd9565');
    });
  }
  for (let i = 0; i < MINE_LAYOUT.nodes.length; i++) drawMineNode(i);
  const home = MINE_LAYOUT.home;
  scenePart('mine-home', home.bottom + 1, () => {
    rect(home.left + 5, home.top + 23, 90, 64, '#d4ba91');
    rect(home.left - 7, home.top + 10, 114, 23, '#a86f53');
    rect(home.left + 5, home.top - 11, 90, 23, '#bd845b');
    rect(home.left + 18, home.top + 47, 17, 17, windowColor('#70999b'));
    rect(home.right - 12, home.top + 28, 13, 39, '#715440');
    rect(home.right - 9, home.top + 31, 9, 31, '#a47b54');
    rect(home.right - 14, home.top + 22, 17, 6, '#e3bd7e');
    rect(home.right + 1, home.top + 59, 14, 6, '#b49668');
    rect(home.left + 1, home.bottom - 6, 98, 7, '#8d7459');
    rect(home.left + 66, home.top + 27, 11, 8, '#6c5842');
    rect(home.left + 69, home.top + 29, 5, 4, '#e5c881');
  });
  scenePart('mine-lamp', 1446, () => {
    rect(1879, 1415, 5, 31, '#765a45');
    rect(1873, 1409, 17, 9, '#e1bd7b');
    rect(1876, 1410, 11, 6, '#f2daa1');
  });
}
function drawMiner() {
  if (festivalAtHome(miner) || miner.mode === 'homeRest' || farm.phase >= NIGHT_START
    && miner.mode === 'home' && distance(miner, MINE_HOME) < 14) return;
  const x = miner.x, y = miner.y;
  if (miner.mode === 'toMarket' || miner.mode === 'returnCart') {
    const cartX = x + (miner.dir < 0 ? 15 : -44);
    rect(cartX, y + 2, 28, 13, '#986d4a');
    rect(cartX + 3, y + 13, 5, 8, '#4c5147');
    rect(cartX + 21, y + 13, 5, 8, '#4c5147');
    rect(cartX + (miner.dir < 0 ? 27 : -9), y + 5, 11, 3, '#c29a68');
    for (let i = 0; i < Math.min(3, mineCargoCount()); i++)
      rect(cartX + 2 + i * 8, y - 4 - i % 2 * 3, 8, 8,
        MINE_ORES[['stone', 'copper', 'quartz'][i % 3]].color);
  } else if (mineCargoCount()) {
    rect(x - 15, y + 2, 29, 17, '#8e6748');
  }
  worker({ ...miner, walk: miner.mode === 'teaRest' ? 0 : miner.walk,
    shirt: '#7b9290', hat: '#d7ae6e' });
  if (miner.mode === 'teaRest') {
    rect(x - 9, y + 11, 19, 6, '#9c7651');
    rect(x + 10, y + 2 + pausePulse(x, 3) * 2, 5, 8, '#e5bf93');
  }
  if (miner.mode === 'rest' && !isFestivalDay()) {
    rect(x + 12, y - 10 + pausePulse(x, 2) * 2, 4, 8, '#e5bf93');
  }
  if (miner.mode === 'mining' && !farm.paused) {
    const swing = Math.round(Math.sin(motionNow * 10) * 7);
    rect(x + 11, y - 11 + swing, 3, 24, '#8a6447');
    rect(x + 5, y - 14 + swing, 17, 4, '#b8bbb0');
  }
}
function drawMineMarketDisplay() {
  if (sceneQueue) return scenePart('mine-market-goods', 916, () => drawMineMarketDisplay());
  const stall = MARKET_LAYOUT.stalls[1], goods = farm.mine.marketGoods;
  const piles = Object.entries(goods).filter(([, count]) => count > 0);
  rect(stall.x + 8, 899, 102, 9, '#76563e');
  rect(stall.x + 13, 884, 92, 18, '#b18a63');
  if (!piles.length) {
    for (let i = 0; i < 3; i++) rect(stall.x + 20 + i * 27, 875, 15, 9, '#936f4e');
    return;
  }
  piles.forEach(([kind, count], i) => {
    const x = stall.x + 19 + i * 29, height = 9 + Math.min(count, 5) * 2;
    rect(x - 3, 884 - height, 26, height, '#776c5e');
    rect(x, 881 - height, 20, 9, MINE_ORES[kind].color);
    rect(x + 6, 878 - height, 7, 4, '#e6dac0');
  });
}
function drawMineNight(night) {
  const home = MINE_LAYOUT.home;
  drawLightGlow(home.left + 27, home.top + 55, 27, night * 0.45);
  for (const [x, y] of [[1880, 1411], [MINE_LAYOUT.entrance.x - 38, MINE_LAYOUT.entrance.y - 42]]) {
    drawLightGlow(x, y, 24, night * 0.48);
  }
}
