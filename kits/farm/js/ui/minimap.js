'use strict';
// Minimap painting and pointer-to-world coordinate conversion.
const miniCanvas = $('mini-map');
const mini = miniCanvas.getContext('2d', { alpha: false });
const MINI_W = miniCanvas.width, MINI_H = miniCanvas.height;

function miniToWorld(event) {
  const bounds = miniCanvas.getBoundingClientRect();
  return {
    x: clamp((event.clientX - bounds.left) / bounds.width * WORLD_W, 0, WORLD_W),
    y: clamp((event.clientY - bounds.top) / bounds.height * WORLD_H, 0, WORLD_H)
  };
}
function drawMiniMap() {
  const sx = MINI_W / WORLD_W, sy = MINI_H / WORLD_H;
  const area = (x, y, w, h, color) => { mini.fillStyle = color; mini.fillRect(x * sx, y * sy, w * sx, h * sy); };
  const lake = (cx, cy, rx, ry, color) => {
    for (let y = cy - ry; y < cy + ry; y += 8) {
      const distance = (y + 4 - cy) / ry;
      const reach = rx * Math.sqrt(Math.max(0, 1 - distance * distance));
      area(cx - reach, y, reach * 2, 8, color);
    }
  };
  const season = seasonTransition(), winter = season.winter;
  mini.fillStyle = season.palette.grass; mini.fillRect(0, 0, MINI_W, MINI_H);
  area(0, 0, 960, 640, season.palette.grass2);
  area(960, 0, WORLD_W - 960, 640, blendHex('#658d60', '#b7cbc1', winter));
  const meadowColor = blendHex('#a7bf83', '#c6d6cb', winter);
  const villageColor = blendHex('#bca878', '#bdc6aa', winter);
  const valleyColor = blendHex('#86a571', '#b8cbbf', winter);
  const villageEdgeColor = blendHex('#95a777', '#bcccb9', winter);
  area(0, 640, WORLD_W, WORLD_H - 640, meadowColor);
  area(0, 1040, WORLD_W, WORLD_H - 1040, valleyColor);
  for (let y = 640; y < WORLD_H; y += 8) {
    const bank = riverCenterAt(y) + 38;
    const from = y < 1040 ? meadowColor : valleyColor;
    const to = y < 1020 ? villageColor : villageEdgeColor;
    for (let offset = 0; offset < 96; offset += 16) area(bank + offset, y, 16, 8, blendHex(from, to, (offset + 8) / 96));
    area(bank + 96, y, WORLD_W - bank - 96, 8, to);
  }
  for (let i = 0; i < 36; i++) {
    const x = 988 + hash(i, 91) * (WORLD_W - 1005), y = 25 + hash(i, 92) * 580;
    area(x, y, 25, 25, '#456f54');
  }
  for (const perch of RIDGE_OWL_PERCHES.slice(1)) {
    area(perch.x - 16, perch.baseY - 35, 32, 38,
      perch.kind === 'maple' ? '#aa7755' : perch.kind === 'birch' ? '#9fb37c'
        : perch.kind === 'spruce' ? '#4f8195' : '#b4c27b');
  }
  lake(134, 190, 84, 80, '#78aaa4');
  lake(242, 865 + SOUTH_LAKE_SHIFT_Y, 146, 95, '#79aaa0');
  lake(195, 1220, 121, 70, '#79aaa0');
  for (let y = NURSERY_LAYOUT.creek[0].y; y < NURSERY_LAYOUT.creek.at(-1).y; y += 8)
    area(wetlandCreekCenter(y) - 9, y, 18, 8, '#85aaa0');
  const creekLookout = NURSERY_LAYOUT.creekLookout;
  area(creekLookout.x - 30, creekLookout.y - 10, 61, 18, '#ba9368');
  const creekBridge = NURSERY_LAYOUT.creekBridge;
  area(creekBridge.x - 35, creekBridge.y - 7, 72, 15, '#c29a6b');
  for (const lobe of NURSERY_LAYOUT.wetlandLobes)
    lake(lobe.x, lobe.y, lobe.rx * wetlandMarshSpread(),
      lobe.ry * wetlandMarshSpread(), '#679783');
  lake(NURSERY_LAYOUT.wetlandPool.x, NURSERY_LAYOUT.wetlandPool.y,
    NURSERY_LAYOUT.wetlandPool.rx * wetlandWaterSpread(),
    NURSERY_LAYOUT.wetlandPool.ry * wetlandWaterSpread(), '#80aaa1');
  for (const pool of NURSERY_LAYOUT.wetlandPuddles)
    lake(pool.x, pool.y, pool.rx * wetlandPuddleSpread(), pool.ry * wetlandPuddleSpread(), '#8db7aa');
  for (const plant of WETLAND_PLANTS)
    area(plant.x - 7, plant.y - 7, 14, 14,
      plant.kind === 'iris' ? '#b8a5cb' : plant.kind === 'lily' ? '#84ac79' : '#698c61');
  for (const plot of farm.plots) area(plot.x * T, plot.y * T, T, T, '#8b5e43');
  area(680, 286, 260, 280, '#c9b483');
  const catHouse = PLAZA_PET_LAYOUT.house;
  area(catHouse.left, catHouse.top, catHouse.right - catHouse.left, catHouse.bottom - catHouse.top, '#b98c62');
  const central = CENTRAL_PLAZA;
  for (let y = central.top; y < central.bottom; y += 8)
    area(central.left, y, plazaRightAt(y) - central.left, Math.min(8, central.bottom - y), '#d3b88a');
  area(central.stage.x - 65, central.stage.y - 58, 130, 76, '#af7959');
  area(central.well.x - 13, central.well.y - 14, 26, 27, '#80aba6');
  if (isFestivalDay()) {
    for (const table of central.tables) area(table.x - 20, table.y - 13, 40, 12, '#c9755a');
    area(central.stage.x - 70, central.stage.y - 74, 140, 8, '#e8c575');
  }
  const sheepPen = SHEEP_LAYOUT.pen, sheepBarn = SHEEP_LAYOUT.barn;
  if (farm.upgrades >= 4) {
    area(sheepPen.left, sheepPen.top, sheepPen.right - sheepPen.left, sheepPen.bottom - sheepPen.top, '#96b779');
    area(sheepBarn.left, sheepBarn.top, sheepBarn.right - sheepBarn.left, sheepBarn.bottom - sheepBarn.top, '#b87955');
  }
  const goatPen = GOAT_LAYOUT.pen, goatBarn = GOAT_LAYOUT.barn;
  if (farm.upgrades >= 4 || farm.goatBarnOpen) {
    area(goatPen.left, goatPen.top, goatPen.right - goatPen.left, goatPen.bottom - goatPen.top, farm.goatBarnOpen ? '#96b779' : '#a6bd85');
    area(goatBarn.left, goatBarn.top, goatBarn.right - goatBarn.left, goatBarn.bottom - goatBarn.top, farm.goatBarnOpen ? '#bd8760' : '#bca57b');
  }
  const valley = VALLEY_GARDEN_LAYOUT;
  area(valley.herbs.left, valley.herbs.top, valley.herbs.right - valley.herbs.left, valley.herbs.bottom - valley.herbs.top, '#ab9772');
  area(valley.teaHouse.left, valley.teaHouse.top, valley.teaHouse.right - valley.teaHouse.left, valley.teaHouse.bottom - valley.teaHouse.top, '#bb8158');
  area(valley.lookout.left, valley.lookout.top, valley.lookout.right - valley.lookout.left, valley.lookout.bottom - valley.lookout.top, '#a5835c');
  area(1700, 1440, WORLD_W - 1700, WORLD_H - 1440,
    blendHex('#938e78', '#b8c2bc', winter * .8));
  area(1760, 1510, WORLD_W - 1760, WORLD_H - 1510, '#878777');
  const district = MARKET_LAYOUT.district, garden = MARKET_LAYOUT.garden;
  area(district.left, 804, district.right - district.left, 28, '#c5b188');
  area(district.left, 938, district.right - district.left, 24, '#c5b188');
  for (const home of MARKET_LAYOUT.homes) area(home.x - 12, district.top, 142, 102, '#c5b188');
  for (const stall of MARKET_LAYOUT.stalls) area(stall.x - 16, 826, 150, 120, '#c5b188');
  area(MARKET_LAYOUT.fountain.x - 53, MARKET_LAYOUT.fountain.y - 53, 106, 106, '#c5b188');
  area(garden.left, garden.top, garden.right - garden.left, garden.bottom - garden.top, '#d4b783');
  area(garden.access.left, garden.access.top, garden.access.width,
    garden.access.bottom - garden.access.top, '#c5ad83');
  area(garden.aisle.left, garden.aisle.top, garden.aisle.width, garden.aisle.height, '#c5ad83');
  area(garden.basket.x - 9, garden.basket.y - 7, 18, 14,
    eastGardenBasketCount() ? '#dfaa65' : '#a88561');
  for (let y = 0; y < WORLD_H; y += 8) area(riverCenterAt(y) - 29, y, 58, 8, '#76aeb0');
  for (const bridge of RIVER_BRIDGES) {
    area(bridge.westRoad, bridge.y, bridge.west - bridge.westRoad + 3, bridge.height, '#d0b586');
    area(bridge.west, bridge.y, bridge.east - bridge.west, bridge.height, '#c49b68');
    area(bridge.east - 3, bridge.y, bridge.eastRoad - bridge.east + 3, bridge.height, '#d0b586');
  }
  area(192, 576, 448, 32, '#d0b586');
  area(604, 600, 34, SOUTH_VALLEY_ROAD_END - 600, '#d0b586');
  for (const path of Object.values(NURSERY_LAYOUT.paths))
    area(path.x, path.y, path.w, path.h, '#d0b586');
  area(NURSERY_LAYOUT.home.left, NURSERY_LAYOUT.home.top,
    NURSERY_LAYOUT.home.right - NURSERY_LAYOUT.home.left,
    NURSERY_LAYOUT.home.bottom - NURSERY_LAYOUT.home.top, '#ba8864');
  for (let index = 0; index < nurseryActiveBeds(); index++) {
    const bed = NURSERY_LAYOUT.beds[index];
    area(bed.x - 21, bed.y - 12, 42, 24, '#927351');
  }
  if (farm.nursery.level)
    area(NURSERY_LAYOUT.rest.x - 27, NURSERY_LAYOUT.rest.y - 5, 54, 8, '#af875f');
  area(1220, 311, 32, 898, '#d0b586');
  for (const trail of COURIER_TRAILS) area(trail.x, trail.y, trail.w, trail.h, '#d0b586');
  for (const path of MINE_LAYOUT.paths) area(path.x, path.y, path.w, path.h, '#d0b586');
  for (const path of SCENIC_PATHS) area(path.x, path.y, path.w, path.h, '#d0b586');
  if (farm.upgrades >= 4) area(638, 1378, 66, 32, '#d0b586');
  area(312, 126, 195, 130, '#c88b65');
  area(710, 105, 175, 150, '#ab654d');
  area(1020, 132, 157, 130, '#af7757');
  const valleyHome = VALLEY_WORKER_LAYOUT.home, valleyChair = VALLEY_WORKER_LAYOUT.chair;
  area(valleyHome.left, valleyHome.top, valleyHome.right - valleyHome.left,
    valleyHome.bottom - valleyHome.top, '#b98560');
  area(valleyChair.x - 18, valleyChair.y - 12, 37, 25, '#9c704f');
  area(COURIER_COTTAGE.x, COURIER_COTTAGE.y + 8, 91, 112, '#ae7152');
  for (const home of MARKET_LAYOUT.homes) area(home.x, home.y + 13, 117, 103, home.roof);
  area(MARKET_LAYOUT.fountain.x - 17, MARKET_LAYOUT.fountain.y - 17, 34, 34, '#80aba6');
  area(MARKET_LAYOUT.notice.x, MARKET_LAYOUT.notice.y, 45, 28, '#d7b476');
  if (farm.upgrades >= 5) for (const stall of MARKET_LAYOUT.stalls) area(stall.x, 844, 118, 72, stall.color);
  else area(MARKET_LAYOUT.stalls[1].x, 844, 118, 72, MARKET_LAYOUT.stalls[1].color);
  area(MINE_LAYOUT.home.left, MINE_LAYOUT.home.top,
    MINE_LAYOUT.home.right - MINE_LAYOUT.home.left,
    MINE_LAYOUT.home.bottom - MINE_LAYOUT.home.top, '#b9835f');
  area(MINE_LAYOUT.entrance.x - 35, MINE_LAYOUT.entrance.y - 52, 70, 58, '#525451');
  area(MINE_LAYOUT.rest.x - 24, MINE_LAYOUT.rest.y - 37, 48, 25, '#be9468');
  for (let index = 0; index < MINE_LAYOUT.nodes.length; index++) {
    const site = MINE_LAYOUT.nodes[index];
    area(site.x - 8, site.y - 7, 16, 14,
      mineNodeReady(index) ? MINE_ORES[site.kind].color : '#777b72');
  }
  for (const id of DEPOT_IDS) {
    if (id === 'nursery' && !farm.nursery.level) continue;
    const site = DEPOT_SITES[id];
    area(site.x - 10, site.y - 8, 20, 16, depotCount(id) ? '#e5b46c' : '#987957');
  }
  for (const cat of plazaCats) if (plazaCatVisible(cat)) area(cat.x - 4, cat.y - 4, 8, 8, cat.coat === 'ginger' ? '#e4ad6b' : '#eee7d6');
  for (const bird of plazaSparrows) if (plazaSparrowVisible(bird)) area(bird.x - 2, bird.y - bird.lift - 2, 4, 4, '#b38c61');
  mini.fillStyle = '#f8f2d2';
  for (const cow of cows) mini.fillRect(cow.x * sx, cow.y * sy, 3, 3);
  for (const worker of workers) if (!festivalAtHome(worker)) mini.fillRect(worker.x * sx, worker.y * sy, 2, 2);
  if (nurseryKeeperAt(nurseryKeeper.x, nurseryKeeper.y)) {
    mini.fillStyle = '#e4c0db'; mini.fillRect(nurseryKeeper.x * sx, nurseryKeeper.y * sy, 3, 3);
  }
  if (forestKeeperVisible()) {
    mini.fillStyle = '#d4b88a'; mini.fillRect(forestKeeper.x * sx, forestKeeper.y * sy, 3, 3);
  }
  const wetlandBird = wetlandWaterhenPosition();
  mini.fillStyle = '#454943'; mini.fillRect(wetlandBird.x * sx, wetlandBird.y * sy, 2, 2);
  if (!festivalAtHome(villageWalker) && (farm.phase < NIGHT_START || !villageWalkerAtHome())) {
    mini.fillStyle = '#a7c68d'; mini.fillRect(villageWalker.x * sx, villageWalker.y * sy, 2, 2);
  }
  if (!festivalAtHome(courier)) {
    mini.fillStyle = '#e7aa67'; mini.fillRect(courier.x * sx, courier.y * sy, 3, 3);
  }
  if (!festivalAtHome(miner) && miner.mode !== 'homeRest'
    && !(farm.phase >= NIGHT_START && miner.mode === 'home')) {
    mini.fillStyle = '#e1bd79'; mini.fillRect(miner.x * sx, miner.y * sy, 3, 3);
  }
  if (anglerAt(angler.x, angler.y)) {
    mini.fillStyle = '#bce1d2'; mini.fillRect(angler.x * sx, angler.y * sy, 3, 3);
  }
  if (isFestivalDay() || orderKeeper.festival?.stage === 'morning') {
    if (!festivalAtHome(orderKeeper)) {
      mini.fillStyle = '#eab590'; mini.fillRect(orderKeeper.x * sx, orderKeeper.y * sy, 3, 3);
    }
  }
  mini.fillStyle = '#f4e4cb';
  if (farm.goatBarnOpen) for (const goat of meadowGoats) mini.fillRect(goat.x * sx, goat.y * sy, 2, 2);
  for (const site of farm.forage) {
    mini.fillStyle = site.kind === 'berry' ? '#cc6d72' : site.kind === 'acorn' ? '#ead27e' : '#e7bf91';
    mini.fillRect(site.x * sx, site.y * sy, 2, 2);
  }
  mini.fillStyle = '#f7df9d';
  for (const site of farm.fishSpots) mini.fillRect(site.x * sx, site.y * sy, 2, 2);
  for (const herb of farm.valleyHerbs) {
    mini.fillStyle = valleyHerbProgress(herb) >= 1 ? '#b287a5' : '#76a278';
    mini.fillRect(herb.x * sx, herb.y * sy, 2, 2);
  }
  if (farm.upgrades >= 2) {
    mini.fillStyle = '#e4bd75';
    for (const hive of HIVE_SITES) mini.fillRect(hive.x * sx, (hive.y + 14) * sy, 2, 2);
  }
  mini.fillStyle = '#f9eacb';
  for (const duck of lakeDucks) mini.fillRect(duck.x * sx, duck.y * sy, 2, 2);
  for (const [creature, color] of [[valleyOtter, '#bf815e'], [valleyTurtle, '#90a96e'], [valleyHeron, '#f4ead7']]) {
    mini.fillStyle = color;
    mini.fillRect(creature.x * sx, creature.y * sy, 2, 2);
  }
  mini.fillStyle = '#c88750';mini.fillRect(squirrel.x * sx, squirrel.y * sy, 3, 3);
  for (const [animal, color] of [[ridgeDeer, '#e6ba88'], [ridgeHare, '#e9d7b7'], [ridgeOwl, '#e7d3a2']]) {
    mini.fillStyle = color;
    mini.fillRect(animal.x * sx, animal.y * sy, 2, 2);
  }
  mini.strokeStyle = '#fffbe7'; mini.lineWidth = 2;
  mini.strokeRect(farm.view.x * sx + 1, farm.view.y * sy + 1,
    Math.min(W / farm.view.zoom, WORLD_W) * sx - 2, Math.min(H / farm.view.zoom, WORLD_H) * sy - 2);
  mini.strokeStyle = '#3a5646'; mini.lineWidth = 1; mini.strokeRect(.5, .5, MINI_W - 1, MINI_H - 1);
}
clampCamera();
