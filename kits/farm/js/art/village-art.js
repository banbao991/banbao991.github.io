'use strict';
// Village houses, central square, market ground and 阿宁 painting.
function drawVillageGround() { drawCachedVillageGround(); }

function drawVillage() {
  // Homes, notice board, fountain and both stalls share the east-bank village street.
  for (const { x, y, roof } of MARKET_LAYOUT.homes) {
    scenePart(`village-home:${x}`, y + 116, () => {
      rect(x + 12, y + 44, 91, 72, '#dfc695'); rect(x, y + 30, 117, 27, roof);
      rect(x + 14, y + 13, 87, 25, '#c48760'); rect(x + 22, y + 70, 19, 18, windowColor('#789e9b'));
      rect(x + 71, y + 70, 26, 46, '#79583e'); rect(x + 75, y + 74, 18, 32, '#a27a55');
      rect(x + 9, y + 109, 110, 7, '#8d785b');
    });
  }
  const fountain = MARKET_LAYOUT.fountain, notice = MARKET_LAYOUT.notice;
  scenePart('village-fountain', fountain.y + 39, () => {
    drawVillageFountain();
  });
  scenePart('village-notice', notice.y + 72, () => {
    rect(notice.x + 15, notice.y + 11, 13, 61, '#8d694a'); rect(notice.x, notice.y, 45, 28, '#d7b476');
    rect(notice.x + 5, notice.y + 4, 35, 4, '#7a553c'); rect(notice.x + 7, notice.y + 13, 22, 3, '#b87955');
  });
  {
    for (const { x, color } of MARKET_LAYOUT.stalls.filter((_, index) => villageMarketStallOpen(index))) {
      scenePart(`village-stall:${x}`, 916, () => {
        rect(x + 7, 859, 103, 57, '#9d7352'); rect(x, 844, 118, 23, color);
        for (let i = 0; i < 5; i++) rect(x + 3 + i * 23, 846, 13, 16, i % 2 ? '#f0d4a0' : color);
        if (x === MARKET_LAYOUT.stalls[1].x) {
          rect(x + 49, 868, 21, 13, '#eee0b7');
          rect(x + 56, 870, 3, 10, '#766a59');
          rect(x + 51, 871, 13, 3, '#8d9184');
        } else for (let i = 0; i < 6; i++) circle(x + 19 + i * 15, 881, 5,
          i % 2 ? '#e9b965' : '#d68462');
      });
    }
  }
  for (const lamp of MARKET_LAYOUT.lamps) {
    scenePart(`village-lamp:${lamp.x}:${lamp.y}`, lamp.y + 29, () => {
      rect(lamp.x - 2, lamp.y, 4, 26, '#765743');
      rect(lamp.x - 6, lamp.y - 8, 12, 10, '#be9362');
      rect(lamp.x - 4, lamp.y - 6, 8, 7, '#edce91');
      rect(lamp.x - 8, lamp.y + 25, 16, 4, '#765743');
    });
  }
}

function drawVillageWalker() {
  if(townDonkeyVisitHome()||townBoatHome())return;
  if (festivalAtHome(villageWalker)) return;
  if (farm.phase >= NIGHT_START && villageWalkerAtHome()) return;
  const { step } = villageWalker;
  const x = Math.round(villageWalker.x), y = Math.round(villageWalker.y);
  const celebrating = isFestivalDay() && villageWalker.festival?.stage === 'gather';
  const gesture = celebrating ? festivalGesture(villageWalker) : null;
  const seated = !celebrating && farm.town.childVisit?.stage === 'tea';
  const watchingEaves=!celebrating&&plazaEavesChildWaiting();
  const standing=(['wait','feed'].includes(farm.town.donkeyVisit.stage)||watchingEaves||['fold','watch'].includes(farm.town.paperBoats.visit.stage)) && !celebrating;
  const walk = celebrating ? Math.round(gesture.leg * .65) : seated || standing ? 0 : Math.round(Math.sin(step) * 2);
  const cheer = gesture?.cheer || 0;
  const waving = celebrating && gesture.raise > 0 || now < villageWalker.waveUntil
    || watchingEaves&&Math.sin(now*1.4+x)>.3;
  const idleWave = farm.paused ? pausePulse(x, 2) * 2 : 0;
  const snackRaise=townChildSnackHandRaise();
  rect(x - 8, y + 18, 18, 4, '#536c4b66');
  rect(x - 5, y + 10, 4, 8 + walk, '#6d5c48');
  rect(x + 2, y + 10, 4, 8 - walk, '#6d5c48');
  rect(x - 6, y - 5, 14, 17, '#7c946b');
  rect(x - 10, y - 2 + walk, 4, 10, '#e2b990');
  rect(x + 8, y + (snackRaise!==null?2-snackRaise:waving ? -11 + cheer : -2 - walk + idleWave), 4, 10, '#e2b990');
  rect(x - 11, y + 7 + walk, 5, 3, '#f0cba7');
  rect(x + 8, y + (snackRaise!==null?7-snackRaise:waving ? -11 + cheer : 7 - walk + idleWave), 5, 3, '#f0cba7');
  const headY=y+(seated?townMusicHeadLift('child'):0);
  rect(x - 5, headY - 17, 12, 12, '#e2b990');
  rect(x - 7, headY - 20, 16, 5, '#9b7557');
  rect(x - 5, headY - 16, 3, 4, '#9b7557');
  const look=watchingEaves?3:0;
  rect(x - 3, headY - 11-look, 2, 2, '#4a443d');
  rect(x + 3, headY - 11-look, 2, 2, '#4a443d');
  rect(x, headY - 7-look, 2, 2, '#ca8d74');
  if (celebrating) drawFestivalProp(x, y,villageWalker);
  else drawTownDonkeyVisitProp(x,y);
  drawTownRainUmbrella('child');
  drawTownChildSnack();
  if(!celebrating)drawTownFoldingBoat(x,y);
}
