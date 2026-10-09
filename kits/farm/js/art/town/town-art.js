'use strict';
// Small timber inn and a wheeled shop, composed through the world's contact-depth queue.
function drawTownScenery() {
  if(!villageSiteOpen('traveller'))return;
  const home = TOWN_LAYOUT.home, x = home.left, y = home.top;
  scenePart('traveller-home', home.bottom, () => {
    drawTownHearthChimney();
    rect(x - 3, home.bottom, 128, 7, '#59704955');
    rect(x + 10, y + 40, 101, 64, '#ddc493');
    rect(x + 14, y + 44, 93, 54, '#e8d2a7');
    rect(x - 3, y + 28, 126, 24, '#946342'); rect(x + 10, y + 10, 100, 22, '#b47a52');
    rect(x + 25, y, 71, 15, '#c28b5c');
    for (let i = 0; i < 5; i++) rect(x + 18 + i * 18, y + 19, 12, 3, '#cf9b69');
    rect(x + 23, y + 63, 25, 24, '#886d4f'); rect(x + 26, y + 66, 19, 18, windowColor('#88aaa2'));
    drawTownHearthWindow();
    rect(x + 34, y + 65, 3, 20, '#c8ad7b');
    rect(x + 68, y + 58, 30, 46, '#79583f'); rect(x + 72, y + 62, 22, 38, '#a87e54');
    rect(x + 89, y + 84, 3, 3, '#e7c37e'); rect(x + 65, y + 101, 36, 4, '#d5b37a');
    rect(x + 53, y + 51, 8, 8, '#ebd7a7'); rect(x + 55, y + 53, 4, 4, '#9a6f49');
    drawTownChime(0);
    drawTownPorchLight(0);
    drawTownPostcardWall();
  });
  for (let i=0;i<farm.town.inventory.flowerPot;i++) {
    const pot=TOWN_LAYOUT.flowerPots[i];
    scenePart(`traveller-flower-pot:${i}`,pot.y+1,()=>{drawTownFlowerPot(pot.x,pot.y,i,townPlantGrowth('flowerPot',i));drawTownFlowerSoil(i);});
  }
  const actor = farm.town.traveller;
  if (actor.mode !== 'away') {
    const cart = townCartPosition();
    scenePart('traveller-cart', cart.y + 42, () => drawTownCart(cart.x, cart.y), 5);
  }
  scenePart('traveller-tea-table', TOWN_LAYOUT.tea.y+16, drawTownTeaTable);
  const seat=TOWN_LAYOUT.merchantSeat;
  scenePart('traveller-merchant-seat-back',seat.y+7,()=>{
    rect(seat.x+8,seat.y-5,4,17,'#94724f');
  });
  scenePart('traveller-merchant-seat',seat.y+23,()=>{
    rect(seat.x-10,seat.y+8,20,5,'#aa8259');rect(seat.x-8,seat.y+13,3,10,'#7b6146');
    rect(seat.x+6,seat.y+13,3,10,'#7b6146');
  });
  const childSeat=TOWN_LAYOUT.childSeat;
  scenePart('traveller-child-seat-back',childSeat.y+7,()=>{
    rect(childSeat.x-12,childSeat.y-5,4,17,'#94724f');
  });
  scenePart('traveller-child-seat', childSeat.y + 23, () => {
    rect(childSeat.x-10,childSeat.y+8,22,5,'#a07c54');
    rect(childSeat.x-8,childSeat.y+13,4,10,'#775b40');rect(childSeat.x+6,childSeat.y+13,4,10,'#775b40');
  }, 0);
  const tray = TOWN_LAYOUT.feeding;
  scenePart('traveller-bird-tray', tray.y + 5, () => {
    rect(tray.x - 14, tray.y - 3, 28, 7, '#8f775a'); rect(tray.x - 11, tray.y - 5, 22, 6, '#a6c0b1');
    drawTownBirdGrain();
  });
}
function drawTownFlowerPot(x, y, seed, growth = 1) {
  rect(x - 7, y - 9, 14, 10, '#ad7853'); rect(x - 9, y - 11, 18, 4, '#c79467');
  const colors = ['#db9c9b', '#e6bc78', '#c78767', '#b5c7b5'];
  for (let i = 0; i < 3; i++) {
    const height = Math.round(3 + growth * (12 + i % 2 * 4));
    rect(x - 5 + i * 4, y - 10 - height, 2, height, '#6f955e');
    rect(x - 8 + i * 4, y - 12 - growth * 7, 3 + growth * 3, 3, '#91ae72');
    const bloom = clamp((growth - .5) / .4, 0, 1);
    if (bloom > .02) circle(x - 4 + i * 4, y - 11 - height, 3 * bloom,
      blendHex('#91ae72',blendHex(colors[(sceneSeason.from + seed % 2) % 4], colors[(sceneSeason.to + seed % 2) % 4], sceneSeason.amount),bloom));
  }
}
function drawTownCart(x, y) {
  const actor = farm.town.traveller;
  rect(x - 59, y + 34, 122, 9, '#526a4955');
  for (const dx of [-37, 37]) {
    circle(x + dx, y + 32, 12, '#6c513b'); circle(x + dx, y + 32, 7, '#aa885b');
    rect(x + dx - 1, y + 24, 3, 16, '#d4b582'); rect(x + dx - 8, y + 31, 16, 3, '#d4b582');
  }
  rect(x - 56, y - 13, 112, 41, '#a17650'); rect(x - 51, y - 7, 102, 32, '#c49a68');
  rect(x - 56, y - 47, 5, 35, '#76553b'); rect(x + 51, y - 47, 5, 35, '#76553b');
  rect(x - 61, y - 47, 122, 15, '#759389');
  for (let i = 0; i < 6; i++) rect(x - 59 + i * 20, y - 45, 11, 12, '#e4c995');
  rect(x - 53, y - 55, 106, 9, '#8ba398'); rect(x - 41, y - 60, 82, 6, '#a1b4a0');
  rect(x - 23, y - 31, 46, 13, '#f0dbae');
  rect(x - 12, y - 28, 4, 7, '#93714d'); rect(x - 4, y - 28, 4, 7, '#93714d'); rect(x + 4, y - 28, 9, 3, '#93714d');
  for (const [i, offer] of actor.offers.entries()) {
    if (offer.sold) continue;
    const bx = x - 43 + i * 21;
    rect(bx - 6, y - 7, 15, 13, i % 2 ? '#cdaa6f' : '#a4b798');
    rect(bx - 3, y - 10, 9, 5, ['#dcab83', '#e0cd9b', '#8eac98', '#a48aa2', '#d5b86f'][i]);
    rect(bx - 2, y + 9, 8, 3, '#e9d9b6');
    if (offer.regularPrice) {
      // The price tag is attached to its stock on the original cart depth item.
      rect(bx + 5, y - 10, 2, 12, '#795b40');
      rect(bx + 2, y - 9, 10, 9, '#d6936c');
      rect(bx + 4, y - 7, 6, 2, '#f5dfae');
      rect(bx + 4, y - 3, 4, 1, '#f5dfae');
    }
  }
  rect(x - 47, y + 23, 94, 5, '#876242');
  drawTownFoldedRainGear(x,y);
  drawTownCartSketch();
}
function drawTownTeaTable() {
  const { x, y } = TOWN_LAYOUT.tea;
  rect(x - 19, y + 1, 38, 7, '#9a7550'); rect(x - 15, y + 8, 4, 8, '#77573d'); rect(x + 11, y + 8, 4, 8, '#77573d');
  rect(x - 6, y - 7, 12, 9, '#b78861'); rect(x - 4, y - 11, 8, 4, '#dbc393');
  rect(x + 7, y - 2, 7, 4, '#eee0b8');
  if (farm.town.inventory.musicBox) {
    rect(x - 18, y - 11, 10, 12, '#8a6b50'); rect(x - 17, y - 13, 8, 3, '#c7a479');
    rect(x - 14, y - 8, 3, 3, '#d9c090');
    drawTownMusic();
  }
  if (farm.town.childVisit?.stage === 'tea')
    circle(x + 2 + Math.sin(now) * 2, y - 17 - now * 2 % 6, 3, '#f6ecd7aa');
  drawTownTeaPartySnacks(x,y);
  drawTownChildSnackPlate();
}
function drawTownSeatedAdult(actor,shirt,hat,drinking,listener='merchant') {
  const x=Math.round(actor.x),y=Math.round(actor.y),dir=actor.dir<0?-1:1;
  rect(x-8,y-2,17,14,shirt);rect(x-7,y+10,14,5,'#536464');
  rect(x-9,y+14,6,4,'#536464');rect(x+3,y+14,6,4,'#536464');
  const headY=y+townMusicHeadLift(listener);
  rect(x-7,headY-17,14,16,'#e8bc94');rect(x-10,headY-20,20,6,hat);rect(x-13,headY-16,26,4,'#b28d5f');
  rect(x+dir*4-1,headY-10,2,2,'#4a473c');rect(x-13,y+2,6,9,'#dfb28b');rect(x+8,y+2,5,8,'#dfb28b');
  if(drinking){
    rect(x+dir*8-4,y+3,8,6,'#ecddbb');rect(x+dir*8-2,y+2,5,2,'#9d8060');
    circle(x+dir*8+Math.sin(now)*2,y-2-now%4,2,'#eee0bd88');
  }
}
function drawTownTraveller() {
  const actor = farm.town.traveller;
  if(actor.mode==='rest' && !isFestivalDay()){
    drawTownSeatedAdult(actor,'#78958b','#dbba80',actor.drinking&&!townSketchDrawing());
    drawTownSketching(actor);
    return;
  }
  worker({ ...actor, walk: !actor.festival && ['shop', 'home', 'rest', 'work','flowers'].includes(actor.mode) ? 0 : actor.walk,
    shirt: '#78958b', hat: '#dbba80',facing:actor.mode==='flowers'?'up':undefined });
  drawTownRainUmbrella('merchant');
  if(actor.mode==='flowers' && !isFestivalDay()){drawTownFlowerWatering(actor);return;}
  if (!isFestivalDay()) {
    rect(actor.x - 13, actor.y + 5, 10, 12, '#9b7452'); rect(actor.x - 12, actor.y + 5, 8, 3, '#d2ae7e');
    drawTownSnackParcel(actor);
    for(let i=0;i<actor.carriedTea;i++)rect(actor.x-11+i*4,actor.y+10,3,4,'#b6c396');
    if (actor.mode === 'work') {
      const lift = Math.round(Math.sin(farm.paused ? now * 2 : motionNow * 9) * 4);
      if (farm.town.construction?.kind === 'care'
        && ['travellerGarden','meadowFlowers','teaChimes'].includes(farm.town.construction.id)) {
        rect(actor.x+12,actor.y+1-lift,12,9,'#8fa9a2');
        rect(actor.x+15,actor.y-3-lift,6,4,'#b7c8b6');
        rect(actor.x+24,actor.y+3-lift,7,3,'#9daf9f');
        if (!farm.paused)
          rect(actor.x+31,actor.y+9-lift,2,3,'#a9c8b7');
      } else {
        rect(actor.x + 13, actor.y - 8 - lift, 3, 19, '#aa885a');
        rect(actor.x + 9, actor.y - 11 - lift, 11, 5,
          farm.town.construction?.kind === 'care' ? '#c2b185' : '#a5ada4');
      }
    }
  }
}
function drawTownNight(night) {
  if(!villageSiteOpen('traveller'))return;
  drawTownHearthGlow(night);
  if (!farm.town.merchantUnlocked) return;
  drawLightGlow(TOWN_LAYOUT.home.left + 35, TOWN_LAYOUT.home.top + 74, 28, night * .38);
  drawTownPorchLightGlow(night);
}
