'use strict';
// Cargo depots, courier, carrier cottage and market goods painting.
function goodsPalette(good) {
  if (crops[good]) return crops[good].color;
  return { eggs: '#f2e2b9', honey: '#e7b858', fruit: '#d78362', milk: '#e9e3d0',
    wool: '#ede6d2', goatMilk: '#e9d6bf', lavender: '#b093b5', mint: '#7aa787',
    thyme: '#dfbd9d', carp: '#8db7aa', gold: '#ebc06a', mushroom: '#d69a75', acorn: '#b48d5f',
    flowerBundle: '#e5b3a3', seedPacket: '#e4cb85' }[good] || '#d7ad76';
}

function drawDepots() {
  for (const id of DEPOT_IDS) {
    if (id === 'nursery' && !farm.nursery.level) continue;
    const site = DEPOT_SITES[id], x = site.x, y = site.y;
    const goods = Object.entries(farm.depots[id]).filter(([, count]) => count > 0);
    scenePart(`depot:${id}`, y + 16, () => {
      rect(x - 23, y + 11, 49, 5, '#55744d55');
      rect(x - 23, y + 3, 47, 8, '#8e6748');
      for (let i = 0; i < 3; i++) rect(x - 21 + i * 16, y + 5, 13, 4, '#bc9260');
      rect(x - 21, y - 13, 20, 17, '#a7754f'); rect(x - 18, y - 10, 14, 11, '#c7945b');
      rect(x - 13, y - 13, 4, 17, '#80583d'); rect(x - 21, y - 5, 20, 3, '#80583d');
      if (goods.length) {
        rect(x + 2, y - 10, 21, 13, '#916343'); rect(x + 4, y - 8, 17, 9, '#c09661');
        for (let i = 0; i < Math.min(3, goods.length); i++) {
          rect(x + 4 + i * 6, y - 14 - i % 2 * 3, 6, 7, goodsPalette(goods[i][0]));
        }
      }
    });
  }
}

function drawCourier() {
  if (courier.night?.sleeping && !courier.night.waking) return;
  if (festivalAtHome(courier)) return;
  if (isFestivalDay() && farm.phase >= NIGHT_START && distance(courier, COURIER_HOME) < 20) return;
  if (courier.festival?.attending
    && (courier.festival.day === farm.day || courier.festival.stage === 'morning')) {
    worker({ ...courier, walk: courier.step, shirt: '#8d9a72', hat: '#b47850' });
    return;
  }
  const x = courier.x, y = courier.y;
  const moving = ['outbound', 'return'].includes(courier.leg) || (courier.night && (!courier.night.sleeping || courier.night.waking));
  const walking = moving ? Math.round(Math.sin(courier.step) * 2) : 0;
  rect(x - 28, y + 18, 57, 4, '#47664d66');
  rect(x + 3, y - 1, 27, 19, '#8e6544'); rect(x + 6, y + 1, 22, 12, '#c19562');
  rect(x + 4, y + 15, 27, 4, '#614a3b');
  circle(x + 8, y + 19, 5, '#594c40'); circle(x + 26, y + 19, 5, '#594c40');
  for (const [i, good] of Object.keys(courier.cargo).slice(0, 3).entries()) {
    rect(x + 7 + i * 7, y - 5 - i % 2 * 3, 7, 7, goodsPalette(good));
  }
  rect(x - 19, y + 6, 5, 13 + walking, '#5a6257'); rect(x - 10, y + 6, 5, 13 - walking, '#5a6257');
  rect(x - 21, y - 10, 17, 19, '#8d9a72');
  rect(x - 19, y - 25, 14, 15, '#e5b990');
  rect(x - 22, y - 27, 20, 5, '#b47850'); rect(x - 17, y - 30, 11, 5, '#d6a36c');
  rect(x - 5, y - 6, 8, 5, '#e5b990');
  if (farm.paused) rect(x - 8, y - 19 + pausePulse(x, 2), 3, 2, '#9a715a');
}

function drawCarrierCottage() {
  if (sceneQueue) return scenePart('courier-cottage', COURIER_COTTAGE.y + 108, () => drawCarrierCottage());
  const { x, y } = COURIER_COTTAGE;
  rect(x + 4, y + 36, 80, 72, '#b7865f');
  rect(x + 7, y + 43, 74, 61, '#d7ab76');
  rect(x, y + 31, 91, 14, '#875b49');
  rect(x + 7, y + 17, 78, 19, '#ae7152');
  rect(x + 17, y + 8, 59, 13, '#c18a63');
  rect(x + 12, y + 46, 19, 23, '#715f50');
  rect(x + 15, y + 49, 13, 17, farm.phase >= NIGHT_START ? '#f5cd80' : '#8ab3a7');
  rect(x + 62, y + 46, 19, 23, '#715f50');
  rect(x + 65, y + 49, 13, 17, farm.phase >= NIGHT_START ? '#f5cd80' : '#8ab3a7');
  // Door and three shallow steps meet the northern path; the south wall stays closed.
  rect(x + 32, y + 29, 33, 26, '#684b3a');
  rect(x + 36, y + 31, 25, 21, '#a37850');
  rect(x + 40, y + 32, 17, 17, farm.phase >= NIGHT_START ? '#b78c5b' : '#946e4b');
  circle(x + 54, y + 42, 2, '#f0d9a5');
  rect(x + 32, y + 24, 33, 5, '#815b48');
  rect(x + 35, y + 17, 27, 5, '#b88958');
  rect(x + 38, y + 11, 21, 5, '#d4ad78');
  rect(x + 3, y + 103, 86, 5, '#795d48');
}

function drawMarketGoods() {
  if (sceneQueue) return scenePart('market-goods', farm.upgrades >= 5 ? 916 : MARKET_LAYOUT.receiving.y + 22, () => drawMarketGoods());
  const goods = Object.entries(farm.marketGoods).filter(([, count]) => count > 0).slice(0, 5);
  const x = farm.upgrades >= 5 ? MARKET_LAYOUT.stalls[0].x + 23 : MARKET_LAYOUT.receiving.x;
  const y = farm.upgrades >= 5 ? 895 : MARKET_LAYOUT.receiving.y;
  if (farm.upgrades < 5) {
    rect(x - 9, y, 70, 12, '#855e43'); rect(x - 5, y - 5, 62, 7, '#bd9566');
    rect(x - 4, y + 12, 6, 10, '#765741'); rect(x + 49, y + 12, 6, 10, '#765741');
  }
  goods.forEach(([good], i) => {
    rect(x + i * 11, y - 13 - i % 2 * 3, 9, 10, goodsPalette(good));
    rect(x + i * 11, y - 3, 9, 2, '#70563f');
  });
}
