'use strict';
// Small upgrades add detail to existing quiet corners without paving over their grass.
function drawTownImprovements() {
  const improvements = farm.town.improvements;
  if (improvements.catComfort.level) {
    const level = improvements.catComfort.level, { x, y } = TOWN_LAYOUT.projects.catComfort;
    scenePart('town-cat-shade', y + 16, () => {
      rect(x - 17, y - 12, 4, 28, '#8b6a49'); rect(x + 14, y - 12, 4, 28, '#8b6a49');
      rect(x - 23, y - 22, 46, 9, '#94a48a'); rect(x - 17, y - 28, 34, 7, '#b3bda1');
      rect(x - 21, y - 15, 42, 4, '#d6bd8b');
    });
    const cushion = TOWN_LAYOUT.projects.catComfort.cushion;
    scenePart('town-cat-cushion', cushion.y + 8, () => {
      rect(cushion.x - 14, cushion.y - 4, 29, 12, '#b79877');
      rect(cushion.x - 12, cushion.y - 5, 25, 10, level > 1 ? '#d0a294' : '#dbbea0');
    },0,-1);
  }
  if (improvements.wetlandNest.level > 1) {
    const nest = TOWN_LAYOUT.birdhouse;
    scenePart('town-nest-care', nest.y + 9, () => {
      rect(nest.x - 21, nest.y - 53, 42, 3, '#a2b6a0');
      rect(nest.x - 5, nest.y + 4, 10, 5, '#c9b58b');
      if (improvements.wetlandNest.level > 2) {
        rect(nest.x + 27, nest.y - 12, 3, 12, '#719664'); circle(nest.x + 28, nest.y - 14, 4, '#dec89c');
      }
    });
  }
  if (improvements.teaChimes.level) {
    const level = improvements.teaChimes.level;
    scenePart('town-tea-chimes', VALLEY_GARDEN_LAYOUT.teaHouse.bottom + 1, () => {
      const sway = Math.round(Math.sin(now * 1.3) * 2);
      rect(907, 1793, 2, 12, '#8e7853'); rect(902 + sway, 1805, 12, 5, '#b6c0a5');
      for (let i = 0; i < level; i++) rect(904 + i * 4 + sway, 1810, 2, 10 + i % 2 * 4, '#d0bb8c');
      if (level > 1) drawTownFlowerPot(824, 1838, 0, townImprovementGrowth('teaChimes',1));
      if (level > 2) drawTownFlowerPot(900, 1838, 1, townImprovementGrowth('teaChimes',2));
    }, 20);
  }
  if (improvements.travellerGarden.level) {
    const { x, y } = TOWN_LAYOUT.garden, level = improvements.travellerGarden.level;
    for (let row = 0; row < level; row++) scenePart(`town-garden:${row}`, y + row * 23 + 4, () => {
      const growth = townImprovementGrowth('travellerGarden',row);
      for (let i = 0; i < 5; i++) {
        const xx = x - 38 + i * 18 + row % 2 * 5, yy = y + row * 23;
        rect(xx - 7, yy, 15, 4, '#aeab83'); rect(xx - 1, yy - 5 - growth * 13, 2, 8 + growth * 13, '#739761');
        rect(xx - 6, yy - 4, 5, 3, '#9caf7f'); rect(xx + 2, yy - 7, 5, 3, '#9caf7f');
        const bloom = clamp((growth - .5) / .4, 0, 1);
        if (bloom > .02) circle(xx, yy - 8 - growth * 10, 3 * bloom,
          blendHex('#9caf7f',blendHex(row % 2 ? '#ce9b94' : '#e2c18b', '#d7e1d3', sceneSeason.winter),bloom));
      }
    });
  }
  if(improvements.teaChimes.level || farm.town.pavilion.tea || farm.town.snacks.pantry.length){
    const {x,y}=TOWN_LAYOUT.pavilionTea;
    scenePart('town-pavilion-tea-box',y+6,()=>{
      rect(x-12,y-4,25,10,'#9a7855');rect(x-14,y-8,29,5,'#bb9569');
      rect(x-9,y-1,19,3,'#c8aa7b');rect(x-1,y,3,2,'#795e42');
      drawTownSnackBox();
      for(let i=0;i<farm.town.pavilion.tea;i++)rect(x-9+i*5,y-12,4,5,i%2?'#b0ba90':'#d6c397');
    });
  }
  drawTownCatWater();
  drawTownConstruction();
}
function drawTownConstruction() {
  const job = farm.town.construction;
  if (!job) return;
  const { x, y } = TOWN_LAYOUT.projects[job.id].materials;
  scenePart('town-construction-materials', y + 11, () => {
    if (job.kind === 'care') {
      rect(x-13,y+7,29,4,'#667a5150');
      rect(x-13,y-5,16,13,'#99aba1');rect(x-10,y-9,10,4,'#b4c1aa');
      rect(x+6,y-12,3,22,'#a08059');rect(x+3,y+4,9,5,'#bcaa7b');
      rect(x+16,y-1,7,9,'#b29067');rect(x+17,y-4,5,4,'#d4c39f');return;
    }
    rect(x - 20, y + 7, 40, 4, '#667a5150');
    for (let i = 0; i < 3; i++) {
      rect(x - 16 + i * 3, y - i * 4, 28, 4, '#b38b5c'); rect(x - 14 + i * 3, y - i * 4, 20, 2, '#dcc397');
    }
    rect(x - 22, y - 7, 8, 11, '#b1ad8f'); rect(x - 20, y - 10, 6, 5, '#cfccb0');
    if (job.progress > .3) {
      rect(x + 9, y - 30, 4, 35, '#8d6c49'); rect(x - 8, y - 30, 4, 35, '#8d6c49');
      rect(x - 10, y - 29, 25, 4, '#bc9a67');
    }
    if (job.progress > .68) { rect(x - 5, y - 21, 15, 13, '#afbd98'); rect(x - 3, y - 19, 11, 3, '#dbcc9c'); }
    rect(x + 18, y - 16, 3, 24, '#8b7150'); rect(x + 15, y - 12, 9, 4, '#d4bb87');
  });
}
