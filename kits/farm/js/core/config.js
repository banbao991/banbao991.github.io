'use strict';
// World dimensions, crop catalogs, seasons, depot types and development thresholds.
const T = 32, WORLD_W = 2560, WORLD_H = 1920, DAY_SECONDS = 72;

const NIGHT_START = 14 / 24;
const SAVE_KEY = 'moss-valley-farm-v1';
const FESTIVAL_RESERVE = 300, FESTIVAL_BUDGET_RATE = .01;
const FESTIVAL_LEVELS = [
  { name: '家常聚会', minimum: 0 }, { name: '丰盛餐桌', minimum: 50 },
  { name: '热闹庆典', minimum: 200 }, { name: '盛大庆典', minimum: 1000 }
];

const crops = {
  wheat: { name: '小麦', cost: 8, value: 24, days: 2, color: '#e5bb62' },
  carrot: { name: '胡萝卜', cost: 10, value: 32, days: 3, color: '#df8050' },
  pumpkin: { name: '南瓜', cost: 16, value: 56, days: 4, color: '#e59a43' },
  strawberry: { name: '草莓', cost: 12, value: 39, days: 3, color: '#d86d67' },
  corn: { name: '玉米', cost: 14, value: 45, days: 4, color: '#eac373' }
};
// Village vegetables stay in a separate pantry and never enter farm depots, money or orders.
const EAST_GARDEN_CROPS = {
  greens: { name: '青菜', days: 2.5, color: '#91b96b' },
  radish: { name: '小萝卜', days: 2.3, color: '#d9827d' },
  beans: { name: '豆荚', days: 3.1, color: '#8aab65' },
  tomato: { name: '番茄', days: 3.4, color: '#dc8066' },
  squash: { name: '小南瓜', days: 3.8, color: '#d7a45b' },
  cabbage: { name: '卷心菜', days: 3.2, color: '#a9c890' }
};
const EAST_GARDEN_ROTATION = [
  ['greens', 'radish', 'beans'], ['beans', 'tomato', 'greens'],
  ['squash', 'cabbage', 'radish'], ['cabbage', 'greens', 'radish']
];
const EAST_GARDEN_BED_COUNT = 28;

const DEPOT_IDS = ['farm', 'lake', 'nursery', 'pasture', 'valley', 'forest'];
const GOOD_IDS = [...Object.keys(crops), 'eggs', 'honey', 'fruit', 'milk', 'wool', 'goatMilk',
  'lavender', 'mint', 'thyme', 'carp', 'gold', 'mushroom', 'acorn', 'flowerBundle', 'seedPacket'];
const emptyDepots = () => Object.fromEntries(DEPOT_IDS.map(id => [id, {}]));
const NURSERY_THRESHOLDS = [100, 200, 300];
const MINE_ORES = {
  stone: { name: '青石', value: 13, color: '#929589' },
  copper: { name: '赤铜', value: 27, color: '#c8875d' },
  quartz: { name: '月白石英', value: 44, color: '#d8ded0' }
};

const FIELD_EXPANSIONS = {
  east: { left: 15, right: 17, top: 10, bottom: 15 },
  upperSouth: { left: 8, right: 17, top: 16, bottom: 16 },
  south: { left: 10, right: 17, top: 20, bottom: 23 }
};

const seasons = [
  { name: '春日', icon: '✿', grass: '#8cae69', grass2: '#94b574', dark: '#6e9954', flower: '#f2d6a0', tree: '#6e9e58', tree2: '#86b967' },
  { name: '夏日', icon: '☀', grass: '#87aa5d', grass2: '#93b565', dark: '#719747', flower: '#f0cc72', tree: '#57914c', tree2: '#78a956' },
  { name: '秋日', icon: '✦', grass: '#aaa76b', grass2: '#b7ad70', dark: '#8d905b', flower: '#dba366', tree: '#b47445', tree2: '#d49a51' },
  { name: '冬日', icon: '❄', grass: '#c9d6c6', grass2: '#d2ddcd', dark: '#afc2b7', flower: '#eff4e8', tree: '#aabbb0', tree2: '#bfcdc2' }
];
