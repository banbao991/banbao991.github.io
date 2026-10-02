'use strict';
// A celebration purchases its supplies once; UI and painters only read the settled budget.
function makeFestivalState() { return { day: 0, openingCoins: 0, budget: 0, level: 0, spentTotal: 0, count: 0 }; }
function festivalBudgetFor(coins) {
  return Math.max(0, Math.floor(Math.min(coins * FESTIVAL_BUDGET_RATE, coins - FESTIVAL_RESERVE)));
}
function festivalLevelFor(budget) { return FESTIVAL_LEVELS.filter(level => budget >= level.minimum).length - 1; }
function prepareFestival() {
  if (!isFestivalDay() || farm.celebration.day === farm.day) return false;
  const openingCoins = farm.coins, budget = festivalBudgetFor(openingCoins);
  Object.assign(farm.celebration, { day: farm.day, openingCoins, budget, level: festivalLevelFor(budget),
    spentTotal: farm.celebration.spentTotal + budget, count: farm.celebration.count + 1 });
  farm.coins -= budget;
  record(`欢庆筹备：${FESTIVAL_LEVELS[farm.celebration.level].name}，支出 ${budget} 金；按清晨金币的 1% 筹备，经营储备不足时不支出。`);
  return true;
}
function currentFestivalLevel() { return farm.celebration.day === farm.day ? farm.celebration.level : 0; }
function festivalProgramme() {
  if (farm.phase >= .44) return '欢庆散场 · 各自返家';
  if (farm.phase < .12) return '陆续到场 · 茶点迎客';
  if (farm.phase >= .22 && farm.phase < .32 && currentFestivalLevel() >= 2) return '木台演奏 · 中央舞会';
  return farm.phase >= .32 ? '茶点闲聊 · 歇脚小聚' : '取餐、聊天与四季小舞';
}
