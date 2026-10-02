'use strict';
// Shared world geometry keeps terrain, bridges, interaction and mini-map aligned.
const SOUTH_LAKE_SHIFT_Y = 64;
const FOREST_TREE_SITES = [[1000, 62], [1050, 86], [1214, 76], [1282, 108], [1455, 90],
  [1017, 390], [1127, 390], [1180, 421], [982, 508], [1115, 575], [1182, 568], [1030, 564]];
const RIVER_BRIDGES = [
  { y: 291, height: 33, west: 1247, east: 1363, westRoad: 930, eastRoad: 1950 },
  { y: 1005, height: 33, west: 1310, east: 1426, westRoad: 615, eastRoad: 1995 },
  { y: 1191, height: 31, west: 1253, east: 1365, westRoad: 620, eastRoad: 2004 },
  { y: 1683, height: 31, west: 1253, east: 1388, westRoad: 1109, eastRoad: 1566 }
];
const MARKET_LAYOUT = {
  district: { left: 1432, top: 730, right: 2016, bottom: 962 },
  homes: [
    { x: 1450, y: 670, roof: '#b97658' },
    { x: 1640, y: 670, roof: '#a96b52' },
    { x: 1830, y: 670, roof: '#ba8058' }
  ],
  fountain: { x: 1713, y: 886 },
  notice: { x: 1450, y: 843 },
  receiving: { x: 1850, y: 934 },
  lamps: [{ x: 1980, y: 777 }, { x: 2012, y: 932 }, { x: 1442, y: 932 }],
  stalls: [{ x: 1530, color: '#bc7659' }, { x: 1820, color: '#d29c65' }],
  garden: { left: 1480, top: 1070, right: 1900, bottom: 1153, rowSpacing: 58,
    access: { left: 1444, top: 1031, width: 32, bottom: 1128 },
    aisle: { left: 1476, top: 1100, width: 424, height: 28 }, entrance: { x: 1460, y: 1114 },
    basket: { x: 1925, y: 1114 } }
};
const COURIER_COTTAGE = { x: 222, y: 642 };
const COURIER_COTTAGE_DOOR = { x: COURIER_COTTAGE.x + 46, y: COURIER_COTTAGE.y + 18 };
const COURIER_VILLAGE_DOOR = { x: MARKET_LAYOUT.homes[0].x + 83, y: MARKET_LAYOUT.homes[0].y + 122 };
const NURSERY_LAYOUT = {
  area: { left: 52, top: 1332, right: 588, bottom: 1919 },
  home: { left: 445, top: 1368, right: 529, bottom: 1455, door: { x: 510, y: 1460 } },
  depot: { x: 579, y: 1460 },
  roadStop: { x: 620, y: 1460 },
  aisle: { x: 366, y: 1490 },
  rest: { x: 368, y: 1453 },
  bedWalkways: { columns: [207, 270, 335], rows: [1358, 1420, 1490, 1574, 1648] },
  paths: {
    entry: { x: 354, y: 1478, w: 284, h: 24 },
    home: { x: 498, y: 1453, w: 24, h: 49 },
    aisle: { x: 354, y: 1478, w: 24, h: 140 }
  },
  wetlandLobes: [
    { x: 170, y: 1753, rx: 150, ry: 105 },
    { x: 355, y: 1805, rx: 160, ry: 90 }
  ],
  wetlandPool: { x: 205, y: 1745, rx: 130, ry: 74 },
  wetlandPuddles: [
    { x: 405, y: 1812, rx: 41, ry: 21 },
    { x: 334, y: 1868, rx: 30, ry: 12 }
  ],
  creek: [
    { x: 160, y: 1287 }, { x: 151, y: 1344 }, { x: 132, y: 1416 },
    { x: 118, y: 1493 }, { x: 121, y: 1568 }, { x: 145, y: 1648 }
  ],
  creekLookout: { x: 65, y: 1445 },
  creekBridge: { x: 118, y: 1507 },
  beds: [
    { x: 302, y: 1532, kind: 'flowerBundle' }, { x: 240, y: 1550, kind: 'seedPacket' },
    { x: 302, y: 1598, kind: 'seedPacket' }, { x: 240, y: 1616, kind: 'flowerBundle' },
    { x: 176, y: 1534, kind: 'flowerBundle' }, { x: 176, y: 1600, kind: 'seedPacket' },
    { x: 301, y: 1450, kind: 'flowerBundle' }, { x: 239, y: 1454, kind: 'seedPacket' },
    { x: 176, y: 1458, kind: 'flowerBundle' }, { x: 299, y: 1386, kind: 'seedPacket' }
  ]
};
const NURSERY_BEDS_BY_LEVEL = [0, 4, 7, 10];
function wetlandCreekCenter(y) {
  const points = NURSERY_LAYOUT.creek;
  for (let i = 1; i < points.length; i++) {
    if (y <= points[i].y) {
      const a = points[i - 1], b = points[i];
      return a.x + (b.x - a.x) * (y - a.y) / (b.y - a.y);
    }
  }
  return points[points.length - 1].x;
}
function wetlandCreekAt(x, y, margin = 0) {
  return y >= NURSERY_LAYOUT.creek[0].y && y <= NURSERY_LAYOUT.creek.at(-1).y
    && Math.abs(x - wetlandCreekCenter(y)) <= 12 + margin;
}
const WETLAND_PLANTS = [
  { kind: 'cattail', x: 106, y: 1748 }, { kind: 'cattail', x: 476, y: 1775 },
  { kind: 'cattail', x: 485, y: 1858 }, { kind: 'cattail', x: 265, y: 1885 },
  { kind: 'iris', x: 174, y: 1660 }, { kind: 'iris', x: 428, y: 1735 },
  { kind: 'iris', x: 245, y: 1845 },
  { kind: 'lily', x: 155, y: 1723 }, { kind: 'lily', x: 232, y: 1708 },
  { kind: 'lily', x: 180, y: 1785 }, { kind: 'lily', x: 400, y: 1810 },
  { kind: 'sedge', x: 78, y: 1780 }, { kind: 'sedge', x: 495, y: 1800 },
  { kind: 'sedge', x: 306, y: 1898 }
];
function wetlandMarshSpread() { return .94 + farm.nursery.wetness * .06; }
function wetlandWaterSpread() { return .84 + farm.nursery.wetness * .24; }
function wetlandPuddleSpread() { return .65 + farm.nursery.wetness * .35; }
function wetlandMarshDepth(x, y) {
  const spread = wetlandMarshSpread();
  let depth = Infinity;
  for (const lobe of NURSERY_LAYOUT.wetlandLobes)
    depth = Math.min(depth, ((x - lobe.x) / (lobe.rx * spread)) ** 2
      + ((y - lobe.y) / (lobe.ry * spread)) ** 2);
  return depth;
}
const VILLAGE_WALKER_LAYOUT = {
  name: '阿宁', home: { x: MARKET_LAYOUT.homes[1].x + 83, y: MARKET_LAYOUT.homes[1].y + 122 },
  promenade: { left: COURIER_VILLAGE_DOOR.x, right: MARKET_LAYOUT.homes[1].x + 83, y: 812 }
};
// Shared road ribbons for the carrier, terrain, foraging clearance and mini-map.
const COURIER_TRAILS = [
  { x: 1444, y: 950, w: 32, h: 72 },   // Village frontage to the middle bridge.
  { x: 240, y: 592, w: 48, h: 76 },    // Small freight stall to the north-facing cottage door.
  { x: 476, y: 939 + SOUTH_LAKE_SHIFT_Y, w: 144, h: 32 },   // Lake fish box.
  { x: 1164, y: 1172, w: 32, h: 35 },  // Valley herb box.
  { x: 914, y: 1206, w: 32, h: 49 },   // Pasture box below the valley road.
  { x: 1220, y: 604, w: 76, h: 32 },   // Forest box.
  { x: 1444, y: 307, w: 32, h: 333 }, // West of the elm, away from the hare clearing.
  { x: 1444, y: 624, w: 357, h: 32 }, // Turn above the village homes.
  { x: 1769, y: 624, w: 32, h: 326 }, // Enter between the middle and eastern homes.
  { x: 1639, y: 950, w: 32, h: 71 }  // Market cart stop to the middle bridge.
];
function courierRoadAt(x, y, padding = 0) {
  const inside = (left, top, right, bottom) => inRect(x, y, left - padding, top - padding, right + padding, bottom + padding);
  if (inside(MARKET_LAYOUT.district.left, MARKET_LAYOUT.district.top, MARKET_LAYOUT.district.right, MARKET_LAYOUT.district.bottom)
    || inside(192, 576, 640, 608) || inside(604, 600, 638, SOUTH_VALLEY_ROAD_END)
    || inside(1220, 311, 1252, 1209)) return true;
  if (RIVER_BRIDGES.some(bridge => inside(bridge.westRoad, bridge.y, bridge.eastRoad, bridge.y + bridge.height))) return true;
  return COURIER_TRAILS.some(trail => inside(trail.x, trail.y, trail.x + trail.w, trail.y + trail.h));
}
function mineRoadAt(x, y, padding = 0) {
  return courierRoadAt(x, y, padding) || MINE_LAYOUT.paths.some(path =>
    inRect(x, y, path.x - padding, path.y - padding,
      path.x + path.w + padding, path.y + path.h + padding))
    || SCENIC_PATHS.some(path => inRect(x, y, path.x - padding, path.y - padding,
      path.x + path.w + padding, path.y + path.h + padding));
}
const FOREST_DEPOT_LAYOUT = { box: { x: 1288, y: 576 }, stop: { x: 1280, y: 620 } };
const HIVE_SITES = [{ x: 35, y: 470 }, { x: 35, y: 512 }];
const COW_BARN_BOUNDS = { left: 701, top: 74, right: 934, bottom: 272 };
const EAST_WINDMILL = { x: 976, y: 196, bounds: { left: 942, top: 140, right: 1010, bottom: 220 } };
const CENTRAL_PLAZA = { left: 668, top: 622, right: 1190, bottom: 974,
  stage: { x: 935, y: 728 }, well: { x: 1076, y: 688 },
  benches: [{ x: 788, y: 944 }, { x: 1100, y: 944 }],
  flowers: [[710, 687], [1150, 687], [700, 923], [1160, 923]],
  shrubs: [[700, 850], [1160, 850]],
  tables: [{ x: 724, y: 790 }, { x: 1140, y: 790 }],
  poles: [{ x: 704, y: 756 }, { x: 1168, y: 756 }] };
// The northeastern corner leaves room for the existing forest cargo lane.
function plazaRightAt(y) { return Math.min(CENTRAL_PLAZA.right, 1136 + Math.max(0, y - CENTRAL_PLAZA.top) * .82); }
function centralPlazaAt(x, y) {
  return inRect(x, y, CENTRAL_PLAZA.left, CENTRAL_PLAZA.top, plazaRightAt(y), CENTRAL_PLAZA.bottom);
}
// The small house sits in the grass strip below the cow fence, above the northwest plaza.
const PLAZA_PET_LAYOUT = {
  house: { left: 728, top: 578, right: 800, bottom: 616,
    doors: [{ x: 750, y: 617 }, { x: 780, y: 617 }] },
  restSpots: [{ x: 752, y: 648 }, { x: 816, y: 648 }, { x: 1040, y: 648 },
    { x: 752, y: 872 }, { x: 816, y: 904 }, { x: 848, y: 808 },
    { x: 1040, y: 840 }, { x: 1088, y: 888 }, { x: 992, y: 936 }, { x: 1104, y: 744 }],
  birdSites: [{ kind: 'ground', x: 800, y: 800 }, { kind: 'ground', x: 848, y: 840 },
    { kind: 'ground', x: 1008, y: 808 }, { kind: 'ground', x: 960, y: 888 },
    { kind: 'ground', x: 1008, y: 936 }, { kind: 'ground', x: 752, y: 888 },
    { kind: 'ground', x: 816, y: 888 }, { kind: 'ground', x: 1088, y: 840 },
    { kind: 'roof', x: 750, y: 584, depth: 625 },
    { kind: 'stage', x: 873, y: 725, depth: 751 }, { kind: 'stage', x: 995, y: 725, depth: 751 },
    { kind: 'well', x: 1057, y: 671, depth: 714 }, { kind: 'well', x: 1096, y: 671, depth: 714 },
    { kind: 'bench', x: 772, y: 928, depth: 930 }, { kind: 'bench', x: 1118, y: 928, depth: 930 },
    { kind: 'pole', x: 704, y: 653, depth: 763 }, { kind: 'pole', x: 1168, y: 653, depth: 763 }]
};
const SOUTH_VALLEY_ROAD_END = 1699;
const SCENIC_PATHS = [
  { x: 1188, y: 856, w: 33, h: 28 }, // Plaza to the eastern village road.
  { x: 918, y: 972, w: 32, h: 35 },  // Plaza to the southern bridge road.
  { x: 850, y: 1698, w: 32, h: 56 }, // Tea-house approach from the valley road.
  { x: 866, y: 1726, w: 92, h: 28 },
  { x: 942, y: 1740, w: 32, h: 72 },
  { x: 604, y: 1683, w: 505, h: 31 } // Same width as the southern bridge road.
];
const SHEEP_LAYOUT = {
  barn: { left: 749, top: 1306, right: 869, bottom: 1379 },
  pen: { left: 704, top: 1360, right: 948, bottom: 1585 }
};
const GOAT_LAYOUT = {
  barn: { left: 1018, top: 1310, right: 1156, bottom: 1405 },
  pen: { left: 990, top: 1394, right: 1180, bottom: 1570 },
  homes: [{ x: 1061, y: 1417 }, { x: 1112, y: 1417 }]
};
const PASTURE_WORKER_LAYOUT = {
  rest: { x: 970, y: 1328 },
  goatApproach: { x: 970, y: 1381 },
  goatGate: { x: 1008, y: 1420 },
  home: { x: 816, y: 1383 }
};
const VALLEY_GARDEN_LAYOUT = {
  herbs: { left: 1000, top: 1074, right: 1180, bottom: 1152 },
  teaHouse: { left: 806, top: 1767, right: 922, bottom: 1839 },
  lookout: { left: 1100, top: 1767, right: 1228, bottom: 1828 },
  spots: [
    { x: 1033, y: 1097, kind: 'lavender' }, { x: 1087, y: 1097, kind: 'mint' }, { x: 1141, y: 1097, kind: 'thyme' },
    { x: 1033, y: 1131, kind: 'thyme' }, { x: 1087, y: 1131, kind: 'lavender' }, { x: 1141, y: 1131, kind: 'mint' }
  ]
};
const VALLEY_WORKER_LAYOUT = {
  home: { x: 715, y: 1209, left: 671, top: 1074, right: 758, bottom: 1183 },
  chair: { x: 963, y: 1122 },
  doorPath: { x: 715, y: 1218 },
  gardenPath: { x: 982, y: 1218 }
};
const MINE_LAYOUT = {
  area: { left: 1490, top: 1280, right: 2048, bottom: 1920 },
  home: { left: 1490, top: 1385, right: 1590, bottom: 1474, door: { x: 1602, y: 1432 } },
  gate: { x: 1828, y: 1206 },
  market: { x: 1900, y: 950 },
  entrance: { x: 1988, y: 1650 },
  entranceTurn: { x: 1988, y: 1705 },
  rest: { x: 1716, y: 1645 },
  stockpile: { x: 1755, y: 1383 },
  cartBay: { x: 1884, y: 1383 },
  paths: [
    { x: 1972, y: 938, w: 32, h: 284 }, // The cart clears the vegetable basket by a full road shift.
    { x: 1812, y: 1191, w: 32, h: 259 },
    { x: 1812, y: 1367, w: 92, h: 32 }, // Ore cart stands opposite the stockpile.
    { x: 1590, y: 1416, w: 254, h: 32 }, // Cottage door opens east; the southern road joins in a T.
    { x: 1550, y: 1495, w: 32, h: 219 }, // Southern bridge joins the cottage path.
    { x: 1566, y: 1495, w: 100, h: 31 },
    { x: 1650, y: 1432, w: 32, h: 94 }
  ],
  nodes: [
    { x: 1738, y: 1538, kind: 'stone' }, { x: 1902, y: 1490, kind: 'copper' },
    { x: 1767, y: 1758, kind: 'stone' }, { x: 1908, y: 1590, kind: 'quartz' },
    { x: 1980, y: 1833, kind: 'copper' }
  ]
};
function riverCenterAt(y) {
  return 1340 + Math.sin(y / 68) * 40 + Math.sin(y / 23) * 7;
}
function riverAt(x, y, padding = 0) {
  if (y < 0 || y >= WORLD_H) return false;
  const stripeY = Math.floor(y / 8) * 8;
  const center = Math.round(riverCenterAt(stripeY));
  return x >= center - 36 - padding && x < center + 38 + padding;
}
function bridgeAt(x, y) {
  return RIVER_BRIDGES.some(bridge => x >= bridge.west && x <= bridge.east && y >= bridge.y - 8 && y <= bridge.y + bridge.height + 8);
}
function inRect(x, y, left, top, right, bottom) {
  return x >= left && x < right && y >= top && y < bottom;
}
function inRasterLake(x, y, left, top, right, bottom, depth, limit) {
  if (!inRect(x, y, left, top, right, bottom)) return false;
  const cellX = left + Math.floor((x - left) / 8) * 8;
  const cellY = top + Math.floor((y - top) / 8) * 8;
  return depth(cellX, cellY) < limit;
}
function pondDepth(x, y) { return ((x - 134) / 84) ** 2 + ((y - 190) / 80) ** 2; }
function pondAt(x, y) { return inRasterLake(x, y, 44, 104, 252, 280, pondDepth, 1.09); }
const VALLEY_LAKE_CENTER = { x: 195, y: 1220 };
function valleyLakeDepth(x, y) {
  return ((x - VALLEY_LAKE_CENTER.x) / 121) ** 2 + ((y - VALLEY_LAKE_CENTER.y) / 70) ** 2;
}
function valleyLakeAt(x, y) { return inRasterLake(x, y, 70, 1152, 326, 1304, valleyLakeDepth, 1.07); }
function coopAt(x, y) { return inRect(x, y, 36, 6, 263, 112); }
function orchardAt(x, y) { return inRect(x, y, 55, 294, 190, 575); }
function hiveAt(x, y) {
  return farm.upgrades >= 2 && HIVE_SITES.some(site => inRect(x, y, site.x - 12, site.y, site.x + 12, site.y + 29));
}

function landmarkAt(x, y) {
  if (!inRect(x, y, 0, 0, WORLD_W, WORLD_H)) return null;
  // Specific objects take precedence over the ground and regional descriptions.
  if (inRect(x, y, PLAZA_PET_LAYOUT.house.left - 3, PLAZA_PET_LAYOUT.house.top,
    PLAZA_PET_LAYOUT.house.right + 3, PLAZA_PET_LAYOUT.house.bottom + 10)) return 'plaza-cat-house';
  if (inRect(x, y, MINE_LAYOUT.home.left, MINE_LAYOUT.home.top,
    MINE_LAYOUT.home.right + 16, MINE_LAYOUT.home.bottom)) return 'mine-home';
  if (inRect(x, y, MINE_LAYOUT.stockpile.x - 28, MINE_LAYOUT.stockpile.y - 22,
    MINE_LAYOUT.stockpile.x + 30, MINE_LAYOUT.stockpile.y + 18)) return 'mine-stockpile';
  if (inRect(x, y, MINE_LAYOUT.cartBay.x - 23, MINE_LAYOUT.cartBay.y - 18,
    MINE_LAYOUT.cartBay.x + 25, MINE_LAYOUT.cartBay.y + 23)) return 'mine-cart-bay';
  if (inRect(x, y, MINE_LAYOUT.rest.x - 27, MINE_LAYOUT.rest.y - 40,
    MINE_LAYOUT.rest.x + 29, MINE_LAYOUT.rest.y + 7)) return 'mine-rest';
  if (inRect(x, y, MINE_LAYOUT.entrance.x - 45, MINE_LAYOUT.entrance.y - 62,
    MINE_LAYOUT.entrance.x + 47, MINE_LAYOUT.entrance.y + 18)) return 'mine-entrance';
  if (inRect(x, y, 943, 1771, 1016, 1823)) return 'mine-tea-table';
  if (inRect(x, y, MARKET_LAYOUT.stalls[1].x, 844,
    MARKET_LAYOUT.stalls[1].x + 118, 917)) return 'mine-market-stall';
  if (inRect(x, y, MINE_LAYOUT.area.left, MINE_LAYOUT.area.top,
    MINE_LAYOUT.area.right, MINE_LAYOUT.area.bottom)) return 'mine-area';
  if (inRect(x, y, NURSERY_LAYOUT.home.left, NURSERY_LAYOUT.home.top,
    NURSERY_LAYOUT.home.right, NURSERY_LAYOUT.home.bottom)) return 'nursery-home';
  if (farm.nursery.level && inRect(x, y, NURSERY_LAYOUT.rest.x - 30, NURSERY_LAYOUT.rest.y - 15,
    NURSERY_LAYOUT.rest.x + 31, NURSERY_LAYOUT.rest.y + 16)) return 'nursery-bench';
  if (inRect(x, y, NURSERY_LAYOUT.creekLookout.x - 33, NURSERY_LAYOUT.creekLookout.y - 18,
    NURSERY_LAYOUT.creekLookout.x + 31, NURSERY_LAYOUT.creekLookout.y + 12)) return 'wetland-lookout';
  if (inRect(x, y, NURSERY_LAYOUT.creekBridge.x - 38, NURSERY_LAYOUT.creekBridge.y - 10,
    NURSERY_LAYOUT.creekBridge.x + 40, NURSERY_LAYOUT.creekBridge.y + 11)) return 'wetland-bridge';
  if (wetlandCreekAt(x, y, 11)) return 'wetland-creek';
  if (wetlandMarshDepth(x, y) <= 1.08) return 'nursery-wetland';
  if (inRect(x, y, NURSERY_LAYOUT.area.left, NURSERY_LAYOUT.area.top,
    NURSERY_LAYOUT.area.right, NURSERY_LAYOUT.area.bottom)) return 'nursery';
  if (valleyLakeAt(x, y)) return 'valley-lake';
  if (inRect(x, y, 455, 835 + SOUTH_LAKE_SHIFT_Y, 536, 925 + SOUTH_LAKE_SHIFT_Y)) return 'fishing-hut';
  if (inRect(x, y, 313, 893 + SOUTH_LAKE_SHIFT_Y, 376, 909 + SOUTH_LAKE_SHIFT_Y)) return 'rowboat';
  if (dockAt(x, y)) return 'lake-dock';
  if (lakeAt(x, y)) return 'south-lake';
  if (coopAt(x, y)) return 'coop';
  if (inRect(x, y, 313, 64, 503, 258)) return 'house';
  if (inRect(x, y, 701, 83, 934, 268)) return 'barn';
  if (farm.upgrades >= 3 && inRect(x, y, 525, 92, 674, 243)) return 'greenhouse';
  if (inRect(x, y, EAST_WINDMILL.bounds.left, EAST_WINDMILL.bounds.top,
    EAST_WINDMILL.bounds.right, EAST_WINDMILL.bounds.bottom)) return 'east-windmill';
  if (inRect(x, y, 1021, 109, 1188, 258)) return 'forest-cabin';
  if (farm.upgrades >= 4 && inRect(x, y, SHEEP_LAYOUT.barn.left, SHEEP_LAYOUT.barn.top, SHEEP_LAYOUT.barn.right, SHEEP_LAYOUT.barn.bottom)) return 'sheep-barn';
  if (farm.upgrades >= 4 && inRect(x, y, PASTURE_WORKER_LAYOUT.rest.x - 19,
    PASTURE_WORKER_LAYOUT.rest.y - 15, PASTURE_WORKER_LAYOUT.rest.x + 20,
    PASTURE_WORKER_LAYOUT.rest.y + 16)) return 'pasture-bench';
  if (farm.upgrades < 4 && inRect(x, y, 758, 1369, 918, 1413)) return 'future-pasture';
  if ((farm.upgrades >= 4 || farm.goatBarnOpen) && inRect(x, y, GOAT_LAYOUT.barn.left, GOAT_LAYOUT.barn.top, GOAT_LAYOUT.barn.right, GOAT_LAYOUT.barn.bottom)) return farm.goatBarnOpen ? 'goat-barn' : 'future-goat-barn';
  if (inRect(x, y, VALLEY_WORKER_LAYOUT.home.left, VALLEY_WORKER_LAYOUT.home.top,
    VALLEY_WORKER_LAYOUT.home.right, VALLEY_WORKER_LAYOUT.home.bottom)) return 'valley-worker-home';
  if (inRect(x, y, VALLEY_WORKER_LAYOUT.chair.x - 30, VALLEY_WORKER_LAYOUT.chair.y - 30,
    VALLEY_WORKER_LAYOUT.chair.x + 32, VALLEY_WORKER_LAYOUT.chair.y + 18)) return 'valley-chair';
  if (inRect(x, y, 774, 1029, 890, 1186)) return 'valley-windmill';
  if (inRect(x, y, VALLEY_GARDEN_LAYOUT.herbs.left, VALLEY_GARDEN_LAYOUT.herbs.top, VALLEY_GARDEN_LAYOUT.herbs.right, VALLEY_GARDEN_LAYOUT.herbs.bottom)) return 'valley-herbs';
  if (inRect(x, y, VALLEY_GARDEN_LAYOUT.teaHouse.left, VALLEY_GARDEN_LAYOUT.teaHouse.top, VALLEY_GARDEN_LAYOUT.teaHouse.right, VALLEY_GARDEN_LAYOUT.teaHouse.bottom)) return 'valley-tea-house';
  if (inRect(x, y, VALLEY_GARDEN_LAYOUT.lookout.left, VALLEY_GARDEN_LAYOUT.lookout.top, VALLEY_GARDEN_LAYOUT.lookout.right, VALLEY_GARDEN_LAYOUT.lookout.bottom)) return 'valley-lookout';
  if (inRect(x, y, 399, 1228, 524, 1293)) return 'valley-garden';
  if (inRect(x, y, CENTRAL_PLAZA.stage.x - 75, CENTRAL_PLAZA.stage.y - 68,
    CENTRAL_PLAZA.stage.x + 75, CENTRAL_PLAZA.stage.y + 24)) return 'central-stage';
  if (Math.hypot(x - CENTRAL_PLAZA.well.x, y - CENTRAL_PLAZA.well.y) < 34) return 'central-well';
  if (CENTRAL_PLAZA.benches.some(bench => inRect(x, y, bench.x - 22, bench.y - 24, bench.x + 23, bench.y + 7))) return 'central-bench';
  if ([...CENTRAL_PLAZA.flowers, ...CENTRAL_PLAZA.shrubs]
    .some(([flowerX, flowerY]) => Math.hypot(x - flowerX, y - flowerY) < 24)) return 'central-flowers';
  if (isFestivalDay()) {
    if (CENTRAL_PLAZA.tables.some(table => inRect(x, y, table.x - 28, table.y - 38, table.x + 28, table.y + 21))) return 'festival-table';
    if (CENTRAL_PLAZA.poles.some(pole => inRect(x, y, pole.x - 8, pole.y - 100, pole.x + 8, pole.y + 6))) return 'festival-pole';
  }
  if (centralPlazaAt(x, y)) return 'central-plaza';
  if (inRect(x, y, COURIER_COTTAGE.x - 8, COURIER_COTTAGE.y - 5,
    COURIER_COTTAGE.x + 91, COURIER_COTTAGE.y + 120)) return 'carrier-cottage';
  const market = MARKET_LAYOUT;
  if (inRect(x, y, market.garden.left, market.garden.top, market.garden.right, market.garden.bottom)) return 'east-garden';
  const courierHome = market.homes[0];
  if (inRect(x, y, courierHome.x, courierHome.y + 13, courierHome.x + 117,
    courierHome.y + 125)) return 'courier-village-home';
  const walkerHome = market.homes[1];
  if (inRect(x, y, walkerHome.x, walkerHome.y + 13, walkerHome.x + 117,
    walkerHome.y + 125)) return 'village-walker-home';
  const orderKeeperHome = market.homes[2];
  if (inRect(x, y, orderKeeperHome.x, orderKeeperHome.y + 13,
    orderKeeperHome.x + 117, orderKeeperHome.y + 116)) return 'order-keeper-home';
  if (Math.hypot(x - market.fountain.x, y - market.fountain.y) < 39) return 'fountain';
  if (farm.upgrades >= 5 && market.stalls.some(stall => inRect(x, y, stall.x, 844, stall.x + 118, 917))) return 'village-market';
  if (inRect(x, y, market.notice.x, market.notice.y, market.notice.x + 45, market.notice.y + 73)) return 'notice-board';
  if (market.lamps.some(lamp => Math.abs(x - lamp.x) <= 9 && y >= lamp.y - 8 && y <= lamp.y + 26)) return 'market-lamp';
  if (farm.upgrades < 5 && inRect(x, y, market.receiving.x - 10, market.receiving.y - 13,
    market.receiving.x + 63, market.receiving.y + 27)) return 'market-receiving';
  if (bridgeAt(x, y)) return 'bridge';
  if (riverAt(x, y)) return 'river';
  if (pondAt(x, y)) return 'pond';
  if (inRect(x, y, 31, 570, 186, 632)) return 'shipping-stall';
  if (hiveAt(x, y)) return 'beehive';
  if (orchardAt(x, y)) return 'orchard';
  if (inRect(x, y, 672, 256, 952, 572)) return 'cow-pasture';
  if (farm.upgrades >= 4 && inRect(x, y, SHEEP_LAYOUT.pen.left, SHEEP_LAYOUT.pen.top, SHEEP_LAYOUT.pen.right, SHEEP_LAYOUT.pen.bottom)) return 'sheep-pasture';
  if ((farm.upgrades >= 4 || farm.goatBarnOpen) && inRect(x, y, GOAT_LAYOUT.pen.left, GOAT_LAYOUT.pen.top, GOAT_LAYOUT.pen.right, GOAT_LAYOUT.pen.bottom)) return farm.goatBarnOpen ? 'goat-pen' : 'future-goat-pen';
  if (y >= 1040 && x < 600) return 'southwest-meadow';
  if (y >= 1234 && x < riverCenterAt(y) - 36) return 'valley';
  if (x >= 960 && y >= 1020) return x > riverCenterAt(y) + 38 ? 'village-south' : 'village-west-south';
  if (x >= 960 && y >= 640) return x > riverCenterAt(y) + 38 ? 'village' : 'village-west';
  if (x >= 960) return 'forest';
  if (y >= 1040) return 'valley';
  if (y >= 640) return 'meadow';
  return 'main-farm';
}

// Main farm orchard tree anchors.
const orchardTrees = [[92, 342, 1], [156, 351, 2], [92, 435, 3], [157, 450, 4], [112, 544, 5], [158, 547, 6]];

// North ridge activity sites and owl perches shared by life, art and inspection.
const RIDGE_SHIFT = 250;
const RIDGE_DEER_SPOTS = [[1441, 207], [1494, 192], [1538, 228], [1569, 198], [1468, 235]].map(([x, y]) => [x + RIDGE_SHIFT, y]);
const RIDGE_HARE_SPOTS = [[1439, 449], [1490, 483], [1530, 431], [1571, 493], [1460, 506]].map(([x, y]) => [x + RIDGE_SHIFT, y]);
const RIDGE_OWL_PERCHES = [
  { x: 1787, y: 104, baseY: 142, kind: 'pine', name: '老松' },
  { x: 1560, y: 215, baseY: 260, kind: 'birch', name: '白桦' },
  { x: 1970, y: 200, baseY: 245, kind: 'maple', name: '红枫' },
  { x: 1990, y: 555, baseY: 635, kind: 'spruce', name: '蓝杉' },
  { x: 1575, y: 480, baseY: 570, kind: 'elm', name: '青榆' }
];
const RIDGE_OWL_HOME = RIDGE_OWL_PERCHES[0];

// Regional tree anchors shared by scenery and occlusion.
const valleyTrees = [[363, 1124, 81], [431, 1187, 82], [330, 1313, 83],
  [711, 1775, 84], [1030, 1875, 85], [1549, 1290, 86],
  [420, 1609, 88], [559, 1761, 89], [1472, 1623, 90], [1570, 1845, 91]];
const regionTrees = [...FOREST_TREE_SITES,
  [RIDGE_OWL_PERCHES[0].x + 19, RIDGE_OWL_PERCHES[0].y - 27],
  [570, 823], [58, 724], [72, 960 + SOUTH_LAKE_SHIFT_Y], [550, 1115], [912, 1125]];
