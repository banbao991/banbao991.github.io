'use strict';
// Main farm terrain, trees, buildings and shared pixel scenery primitives.
function grass() {
  const p = sceneSeason.palette;
  rect(0, 0, WORLD_W, WORLD_H, p.grass);
}

function terrainDetails() {
  const p = sceneSeason.palette;
  const grassHighlight = blendHex('#b5c584', '#dfe6d9', sceneSeason.winter);
  const left = Math.max(0, Math.floor(farm.view.x / T) - 1);
  const top = Math.max(0, Math.floor(farm.view.y / T) - 1);
  const right = Math.min(WORLD_W / T, Math.ceil((farm.view.x + W / farm.view.zoom) / T) + 1);
  const bottom = Math.min(WORLD_H / T, Math.ceil((farm.view.y + H / farm.view.zoom) / T) + 1);
  for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
    for (let i = 0; i < 4; i++) {
      const px = x*T + 3 + Math.floor(hash(x, y, i+9) * 26), py = y*T + 4 + Math.floor(hash(y, x, i+20) * 24);
      rect(px, py, 4, 2, i % 2 ? p.dark : grassHighlight);
    }
  }
  // A little crosshatched field of flowers and clover, positioned away from buildings and paths.
  for (let i = 0; i < 105; i++) {
    const x = Math.floor(hash(i, 4) * 920) + 20, y = Math.floor(hash(i, 5) * 588) + 28;
    if ((x > 240 && x < 635 && y > 284) || (x > 295 && x < 510 && y < 245) || (x > 668 && y > 250) || (x < 230 && y < 280) || (x > 700 && y < 250)) continue;
    const c = i % 5 === 0 ? blendHex('#e9d8ac', '#edf2e5', sceneSeason.winter) : i % 3 === 0 ? p.flower : blendHex('#e8f0c1', '#e5ece0', sceneSeason.winter);
    rect(x, y, 3, 3, c); rect(x + 4, y + 3, 2, 2, p.dark);
  }
}

function drawPond() {
  const water=groundTilePainter(),highlights=groundTilePainter();
  for (let y = 104; y < 276; y += 8) for (let x = 44; x < 247; x += 8) {
    const d = pondDepth(x, y);
    if (d < 1.09) water.add(x, y, 8, 8, d > .83 ? '#b6b888' : d > .66 ? '#6eafa9' : '#5f9fa9');
    if (d < .61 && hash(x, y, 4) > .86) highlights.add(x+2, y+2, 5, 2, '#91c4bb');
  }
  water.draw();highlights.draw();
  for (const [x, y] of [[72, 144],[217, 194],[92, 259],[222, 236]]) {
    rect(x, y, 3, 15, '#657e53'); rect(x+5, y-3, 3, 18, '#6e8551'); rect(x-4, y+4, 4, 2, '#d4af6c');
  }
  circle(114 + Math.sin(now*.7)*3, 213, 10, '#6aab78'); rect(109, 208, 7, 3, '#86bd80');
  rect(172 + Math.sin(now)*4, 178, 20, 2, '#b7d8c2'); rect(180 + Math.sin(now)*4, 182, 12, 2, '#b7d8c2');
}

function drawPondDuck() {
  if (sceneQueue) return scenePart('pond-duck', pondDuckPosition().y + 13, () => drawPondDuck());
  const { x: dx, y: dy } = pondDuckPosition();
  rect(dx-8,dy+5,20,8,'#e9e5c9');rect(dx-3,dy-2,11,11,'#f8f1d2');rect(dx+7,dy+1,7,3,'#d39253');rect(dx+2,dy+1,2,2,'#414c38');
  if (farm.paused) rect(dx-7,dy+1+pausePulse(3,2.7)*2,8,4,'#e2d8b8');
}

function pathTile(x, y) {
  const px=x*T, py=y*T;
  rect(px,py,T,T,'#d0b586');
  if(hash(x,y,30)>.4){rect(px+8,py+11,4,2,'#ebd6a7');rect(px+21,py+22,3,2,'#b69569');}
}

function paths() {
  // Development roads include the permanent farm yards. Keep the old tile painter
  // only for a world without development data; never draw both road systems.
  if(!farm.development){
    for(let x=9;x<=25;x++) pathTile(x,8);
    for(let y=5;y<=8;y++) for(let x=11;x<=14;x++) pathTile(x,y);
    for(let y=6;y<=8;y++) for(let x=23;x<=25;x++) pathTile(x,y);
    for(let y=8;y<=18;y++) pathTile(6,y);
    for(let x=6;x<=19;x++) pathTile(x,18);
    for(let y=8;y<=18;y++) pathTile(19,y);
    for(let x=6;x<=8;x++) pathTile(x,8);
    for(let x=19;x<=22;x++) pathTile(x,8);
    for(let y=2;y<=8;y++) pathTile(8,y);
    for(let x=6;x<=8;x++) pathTile(x,2);
  }
  // Stepping stones from the house to the orchard.
  for(let i=0;i<5;i++){rect(295-i*29,203+i*15,18,8,'#d9c69d');rect(298-i*29,203+i*15,12,4,'#e9d9af');}
}

function drawField() {
  const border = '#704b35', soil='#8c5b3c';
  for(const p of farm.plots){
    const x=p.x*T,y=p.y*T;
    rect(x,y,T,T,border);rect(x+2,y+2,28,28,soil);
    rect(x+5,y+7,23,3,'#a8754e');rect(x+4,y+18,24,3,'#765038');rect(x+7,y+27,18,2,'#a8754e');
    if(p.watered){rect(x+3,y+3,4,3,'#739c9b');rect(x+25,y+24,3,3,'#77a8a4');}
    if(p.crop) drawCropSprite(p,x+16,y+25);
  }
  if(hover?.plot){const x=hover.plot.x*T,y=hover.plot.y*T;ctx.strokeStyle='#fff9d4';ctx.lineWidth=3;ctx.strokeRect(x+2,y+2,28,28);}
}

function tree(x,y,seed=0){
  if (sceneQueue) return scenePart(`tree:${x}:${y}`, y + 25, () => tree(x,y,seed));
  const s=sceneSeason.palette, winter=sceneSeason.winter;
  const outline=blendHex(blendHex('#4d7a45','#865f40',sceneSeason.autumn),'#8caaa1',winter);
  rect(x-18,y+15,36,8,'#52674855');
  rect(x-5,y-8,11,33,'#71553c');rect(x+1,y-3,4,24,'#a67b50');
  rect(x-23,y-39,47,32,outline);rect(x-29,y-28,59,27,outline);rect(x-19,y-48,37,13,outline);
  rect(x-18,y-43,36,26,s.tree);rect(x-24,y-27,48,26,s.tree);rect(x-14,y-47,27,15,s.tree2);
  rect(x-15,y-36,15,9,s.tree2);rect(x+3,y-32,16,11,s.tree2);rect(x-19,y-16,17,9,s.tree2);
  if(farm.fruitReady && winter < 1){
    ctx.save();ctx.globalAlpha=1-winter;
    for(let i=0;i<5;i++){const fx=x-18+hash(seed,i)*36,fy=y-39+hash(i,seed)*28;rect(fx,fy,5,5,blendHex('#e8c274','#e6b26a',sceneSeason.autumn));}
    rect(x-23,y-26,6,3,'#b4d47a');rect(x+8,y-43,8,3,'#b5d47c');
    ctx.restore();
  }
  if(winter > 0){rect(x-14,y-47,27,4,`rgba(239,243,223,${(winter*.9).toFixed(3)})`);rect(x+12,y-28,14,3,`rgba(233,241,230,${(winter*.9).toFixed(3)})`);}
}

function orchard(){
  for(const [x,y,i] of orchardTrees)tree(x,y,i);
  if(farm.upgrades>=2){
    for(const {x,y} of HIVE_SITES){
      scenePart(`hive:${x}:${y}`, y + 29, () => {
        rect(x-16,y+29,32,3,'#70975c');
        rect(x-10,y+7,20,22,'#b8844b');rect(x-12,y,24,9,'#e0b463');
        rect(x-8,y+12,16,3,'#f3d389');rect(x-4,y+22,8,4,'#704d34');
      });
    }
    scenePart('bees', 0, () => {
      ctx.save();ctx.globalAlpha=beeHiveActivityAlpha();
      for(let i=1;i<6;i++){
        const hive=HIVE_SITES[i%HIVE_SITES.length];
        const bx=hive.x-15+i*7+Math.sin(motionNow*2+i)*7,by=hive.y-9+Math.sin(motionNow*2.5+i)*12;
        rect(bx,by,5,4,'#e8c35f');rect(bx+2,by+1,2,2,'#4b4934');
        if(farm.paused)rect(bx+1,by-2+pausePulse(i,5),3,2,'#f7e8b5');
      }
      ctx.restore();
    }, 0, 1);
  }
}

function marketStall(){
  if (sceneQueue) return scenePart('farm-stall', 639, () => marketStall());
  const x=31,y=570;
  rect(x+7,y+24,142,30,'#78553a');rect(x+12,y+28,132,28,'#ae7b51');
  rect(x+2,y+12,151,14,'#e7cf9d');
  for(let i=0;i<7;i++)rect(x+5+i*21,y+12,12,15,i%2?'#c87856':'#f4dfb2');
  rect(x+8,y+1,6,48,'#825a3c');rect(x+140,y+1,6,48,'#825a3c');
  rect(x+17,y+38,27,13,'#cb9a64');rect(x+53,y+38,27,13,'#cb9a64');rect(x+89,y+38,27,13,'#cb9a64');
  for(let i=0;i<7;i++)circle(x+21+i*14,y+37,5,i%2?'#d98655':'#e5bb6f');
  rect(x+121,y+30,18,19,'#6b4d38');rect(x+124,y+32,12,14,'#ebcd8e');
  rect(x+11,y+55,28,8,'#6d4a37');rect(x+120,y+55,28,8,'#6d4a37');
  circle(x+25,y+61,8,'#514c3b');circle(x+134,y+61,8,'#514c3b');
  if(farm.orders.length){rect(x+125,y+35,6,6,crops[farm.orders[0].crop].color);}
}

function house(){
  if (sceneQueue) return scenePart('farm-house', 258, () => house());
  const x=313,y=64;
  rect(x+22,y+77,156,115,'#5d6543');rect(x+15,y+74,162,105,'#e5bd8d');rect(x+23,y+82,145,96,'#f1ce9b');
  for(let i=0;i<10;i++){const inset=Math.abs(5-i)*9;rect(x+inset,y+23+i*7,190-inset*2,8,i%2?'#9f5c43':'#b36a49');}
  rect(x+14,y+91,164,5,'#e5a36a');rect(x+30,y+111,36,32,'#6e8b78');rect(x+34,y+115,28,24,windowColor('#b4d5b6'));rect(x+46,y+115,3,24,'#698774');rect(x+34,y+126,28,3,'#698774');
  rect(x+118,y+111,37,32,'#6e8b78');rect(x+122,y+115,29,24,windowColor('#a9d0b0'));rect(x+135,y+115,3,24,'#698774');rect(x+122,y+126,29,3,'#698774');
  rect(x+75,y+121,34,59,'#845c40');rect(x+79,y+125,26,55,'#a8794d');rect(x+99,y+153,4,4,'#f0d690');
  rect(x+4,y+176,179,10,'#c7a276');rect(x+65,y+186,54,8,'#b58d60');
  rect(x+37,y+18,17,29,'#8d5d46');rect(x+34,y+17,23,8,'#b06f50');
  const smoke=Math.sin(now*1.3)*3;for(let i=0;i<3;i++)circle(x+44+smoke+i*5,y+8-i*12,5+i*2,'#f7e8ce99');
  // Window boxes.
  for(const xx of [x+30,x+118]){rect(xx,y+143,39,6,'#905d42');for(let k=0;k<4;k++)circle(xx+6+k*9,y+142,3,'#e99275');}
}

function coop(){
  if(chickenMealVisible())scenePart('coop-grain-tray',TOWN_LAYOUT.henMeal.tray.y+3,()=>{
    const {x,y}=TOWN_LAYOUT.henMeal.tray;
    rect(x-9,y-3,18,6,'#936f50');rect(x-7,y-3,14,3,'#c7a36b');
    if(farm.town.inventory.henGrain || farm.town.henMeal.stage==='eat') {
      rect(x-5,y-2,3,2,'#edd28d');rect(x+1,y-2,3,2,'#dec076');
    }
  });
  scenePart('coop-building', 110, () => {
    const x=36,y=6;
    rect(x+19,y+47,118,53,'#9f6b49');rect(x+24,y+50,108,49,'#e4b77f');
    for(let i=0;i<6;i++){const inset=Math.abs(3-i)*12;rect(x+inset,y+15+i*7,154-inset*2,8,i%2?'#a76445':'#bd7951');}
    rect(x+54,y+55,36,44,'#82533d');rect(x+58,y+59,28,40,'#aa724d');
    rect(x+62,y+72,20,18,'#4f4b38');rect(x+63,y+88,18,4,'#d5a46d');
    rect(x+105,y+59,17,17,'#6d7457');rect(x+108,y+62,11,11,'#b7d2ae');rect(x+115,y+62,2,11,'#66856e');
    rect(x+16,y+97,125,7,'#c79a6e');
  });
  // The small paddock and nest box.
  for(const px of [171,198,226,253]){fencePost(px,20);fencePost(px,94);}
  scenePart('coop-fence-back', 48, () => {
    rect(172,28,83,3,'#d3b282');rect(172,38,83,3,'#b98d61');
  });
  scenePart('coop-fence-front', 122, () => {
    rect(172,96,83,3,'#d3b282');rect(172,106,83,3,'#b98d61');
  });
  scenePart('coop-fence-side', 97, () => {
    rect(245,31,4,66,'#d3b282');rect(253,31,4,66,'#b98d61');
  });
  scenePart('coop-nest', 95, () => {
    rect(246,73,15,22,'#c18b57');rect(244,70,19,6,'#e7bd78');
    if(farm.eggsReady){for(const ex of [249,256]){circle(ex,76,4,'#f8e4b8');}}
  });
}

function barn(){
  if (sceneQueue) return scenePart('cow-barn', COW_BARN_BOUNDS.bottom, () => barn());
  const {left:x,top:y}=COW_BARN_BOUNDS;
  rect(x+14,y+64,163,134,'#7a4835');rect(x+20,y+68,151,116,'#b55f43');
  for(let i=0;i<9;i++){const inset=Math.abs(4-i)*15;rect(x+inset,y+10+i*8,191-inset*2,9,i%2?'#8c4e3b':'#a9533d');}
  rect(x+18,y+70,155,8,'#e1ad70');rect(x+77,y+111,46,74,'#6d4839');rect(x+81,y+114,38,69,'#764e3b');
  rect(x+97,y+114,4,69,'#d49b60');rect(x+83,y+145,36,4,'#d49b60');rect(x+87,y+121,28,3,'#d49b60');rect(x+85,y+168,32,3,'#d49b60');
  rect(x+35,y+104,24,24,'#664839');rect(x+39,y+108,16,16,windowColor('#d8bf87'));rect(x+157,y+83,11,100,'#d7a365');
  // Silo with a tiled copper roof.
  const sx=876;rect(sx,y+78,56,119,'#bb9870');rect(sx+5,y+81,46,115,'#cfac80');
  for(let i=0;i<5;i++){const inset=Math.abs(2-i)*6;rect(sx+inset,y+41+i*8,56-inset*2,9,i%2?'#a75f44':'#ba704d');}
  rect(sx+22,y+121,12,20,'#758c7a');rect(sx+20,y+140,16,4,'#e6cd9d');
}

function greenhouse(){
  if (sceneQueue) return scenePart('greenhouse', 242, () => greenhouse());
  if(!villageSiteOpen('greenhouse'))return;
  const x=525,y=84;
  rect(x+8,y+57,132,101,'#719279');rect(x+15,y+62,118,88,'#a4c9a7');
  for(let i=0;i<7;i++){const inset=Math.abs(3-i)*12;rect(x+inset,y+8+i*8,149-inset*2,8,i%2?'#d7bd8a':'#ece1b8');}
  for(let i=0;i<4;i++)rect(x+22+i*28,y+66,4,83,'#e7dcad');
  rect(x+58,y+108,36,42,'#5c805e');rect(x+62,y+112,28,38,'#91bb93');
  for(const xx of [x+33,x+111])circle(xx,y+126,8,'#5d955b');
}

function fences(){
  for(let x=21;x<=29;x++){
    if(x<29 && x*T+8 < COW_BARN_BOUNDS.left) scenePart(`cow-rail:${x}:back`, 8*T+28, () => {
      const width = Math.min(32, COW_BARN_BOUNDS.left-x*T-8);
      rect(x*T+8,8*T+7,width,4,'#d0ad7c');rect(x*T+8,8*T+19,width,4,'#b7875d');
    });
    if(x*T+4 < COW_BARN_BOUNDS.left || x*T+4 > COW_BARN_BOUNDS.right) fencePost(x*T+4,8*T);
  }
  for(let y=9;y<17;y++){
    scenePart(`cow-fence-side:${y}`, y*T+28, () => {
      if(y!==11){rect(21*T+4,y*T+5,4,32,'#cfab79');rect(21*T+16,y*T+5,4,32,'#b7865b');}
      rect(29*T+4,y*T+4,4,32,'#cfab79');rect(29*T+16,y*T+4,4,32,'#b7865b');
    });
    fencePost(21*T+3,y*T);fencePost(29*T+3,y*T);
  }
  scenePart('cow-gate', 366, () => {
    rect(670,362,25,4,'#be966b');
  });
}

function fencePost(x,y){
  if (sceneQueue) return scenePart(`fence-post:${x}:${y}`, y + 28, () => fencePost(x,y));
  rect(x,y,8,28,'#946b4a');rect(x-1,y-4,10,9,'#dfbd8b');rect(x+2,y,3,17,'#e9ca9a');}

function extras(){
  for (const [x, y] of [[272, 278], [657, 287]]) scenePart(`farm-lamp:${x}`, y + 4, () => {
    rect(x-2,y-24,4,28,'#735a47'); rect(x-6,y-28,12,9,'#c49a66');
    rect(x-4,y-26,8,6,windowColor('#e9cb8e'));
  });
  // Windmill, logs, scarecrow, birds and little moving lights.
  scenePart('east-windmill', EAST_WINDMILL.bounds.bottom, () => {
    const {x,y}=EAST_WINDMILL;rect(x-8,y-21,16,44,'#a97951');rect(x-15,y+19,30,5,'#806044');circle(x,y-22,7,'#e7d8a5');
    ctx.save();ctx.translate(x,y-22);ctx.rotate(now*.5);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);rect(1,-4,31,8,'#ead4a0');rect(25,-2,8,4,'#caa66e');}ctx.restore();circle(x,y-22,4,'#8d694d');
  });
  scenePart('farm-logs', 318, () => {
    rect(562,309,25,9,'#96683e');rect(566,300,25,9,'#bd8952');rect(568,294,3,4,'#e3bd7a');
  });
  scenePart('scarecrow', 384, () => {
    const sx=653,sy=371;rect(sx,sy-23,3,36,'#845c41');rect(sx-11,sy-19,26,4,'#845c41');rect(sx-8,sy-33,17,14,'#ead3a0');rect(sx-13,sy-34,27,5,'#ad7b4a');rect(sx-4,sy-25,2,2,'#66573d');rect(sx+4,sy-25,2,2,'#66573d');rect(sx-7,sy-8,16,15,'#a95f48');
  });
  scenePart('farm-air', 0, () => {
    for(let i=0;i<3;i++){const bx=95+i*240+Math.sin(motionNow*.5+i)*19,by=91+Math.sin(motionNow*.9+i)*8;rect(bx,by,8,2,'#e9dfbd');rect(bx+3,by+2+pausePulse(i,4)*2,2,2,'#e9dfbd');}
    for(let i=0;i<4;i++){const bx=70+i*180+Math.sin(motionNow*1.3+i*2)*27,by=320+i*44+Math.sin(motionNow*2+i)*12;if(bx>260&&bx<640&&by>320)continue;rect(bx,by,4,3,i%2?'#f1d17f':'#f7e2b0');rect(bx+3,by-2+pausePulse(i,4)*2,3,2,'#fbf2ce');}
  }, 0, 1);
}
