'use strict';
// Header, calendar controls and coordination of independent sidebar views.
const ui = {
  day: $('day-number'), daySummary: $('day-summary'), dayName: $('day-name'), season: $('season-label'), seasonIcon: $('season-icon'),
  weather: $('weather-label'), weatherIcon: $('weather-icon'), time: $('time-label'), progress: $('day-progress'),
  coins: $('coins'), harvest: $('harvest'), milk: $('milk'), fields: $('fields'), eggs: $('eggs'), honey: $('honey'),
  events: $('event-list'), unlock: $('next-unlock'), orderList: $('order-list'), orderSummary: $('order-summary'),
  ledgerToggle: $('ledger-toggle'), ledgerDetails: $('ledger-details')
};

function updateUI() {
  const season = seasons[seasonIndex()];
  const transition = seasonTransition();
  const changing = transition.from !== transition.to && transition.amount > .02 && transition.amount < .98;
  ui.day.textContent = String(Math.min(farm.day, 9999)).padStart(2, '0');
  ui.day.classList.toggle('is-compact', farm.day >= 1000);
  ui.daySummary.title = `苔谷第 ${farm.day} 天 · ${season.name} · 第 ${dayInSeason()} 天 · ${timeText()}`;
  ui.dayName.textContent = `${season.name.slice(0, 1)} · 第 ${dayInSeason()} 天${isFestivalDay() ? ' · 欢庆日' : ''}${farm.phase >= NIGHT_START ? ' · 夜' : ''}`;
  ui.season.textContent = changing ? `${seasons[transition.from].name[0]} → ${seasons[transition.to].name[0]}` : season.name;
  ui.seasonIcon.textContent = changing ? `${seasons[transition.from].icon}${seasons[transition.to].icon}` : season.icon;
  ui.seasonIcon.style.fontSize = changing ? '19px' : '';
  const weather = weatherVisual();
  const weatherIcons = { rain: '☂', snow: '❄', cloud: '☁', sunny: '☀' };
  const weatherNames = { rain: '细雨', snow: '飘雪', cloud: '多云', sunny: '晴朗' };
  const weatherChanging = weather.from !== weather.to && weather.amount < .98;
  ui.weather.textContent = weatherChanging
    ? `${weatherIcons[weather.from]} ${weatherNames[weather.from]}转${weatherNames[weather.to]}`
    : `${weatherIcons[weather.to]} ${weatherNames[weather.to]}`;
  ui.weatherIcon.textContent = weatherIcons[weatherChanging && weather.amount < .5 ? weather.from : weather.to];
  ui.time.textContent = timeText();
  ui.progress.style.width = `${(farm.phase * 100).toFixed(1)}%`;
  setOverviewNumber(ui.coins, farm.coins);
  setOverviewNumber(ui.harvest, farm.harvested);
  setOverviewNumber(ui.milk, farm.milkToday);
  setOverviewNumber(ui.fields, farm.plots.length);
  setOverviewNumber(ui.eggs, farm.eggsToday);
  setOverviewNumber(ui.honey, farm.honeyTotal);
  updateLedgerUI();
  updateWorldStatusUI();
  updateVillageDevelopmentUI();
  updateTownUI();
  updateTownLanternUI();
  updateOrdersUI();
  $('night-indicator').hidden = farm.phase < NIGHT_START;
  ui.unlock.textContent=villageNextDevelopmentText();
  updateJournalUI();
  $('play-button').textContent = farm.paused ? '▶' : 'Ⅱ';
  $('play-button').setAttribute('aria-label', farm.paused ? '继续演变' : '暂停演变');
  document.querySelectorAll('[data-speed]').forEach(b => { const active = +b.dataset.speed === farm.speed; b.classList.toggle('active', active); b.setAttribute('aria-pressed', active); });
  document.querySelector('.live-pill').innerHTML = `<span class="live-dot"></span>${farm.paused ? '暂时休息' : '正在生长'}`;
  updateViewUI(); drawMiniMap(); refreshMapHover();
}
