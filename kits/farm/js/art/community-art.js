'use strict';
// Seasonal celebration decoration, gestures and hand-held festival props.
function festivalGesture(actor) {
  const beat = now * (festivalTheme().action === 'tea' ? 2 : 5) + actor.x * .03;
  const activity = actor.festival?.activity;
  if (activity?.route.length) return farm.paused
    ? { bounce: Math.sin(now * 2 + actor.x) * .45, leg: 0, cheer: Math.sin(now * 2) * 2, raise: 0 }
    : { bounce: 0, leg: Math.round(Math.sin(actor.walk || actor.step) * 3), cheer: 0, raise: 0 };
  if (activity?.kind === 'rest') return { bounce: Math.sin(now * 2 + actor.x) * .3, leg: 0, cheer: 0, raise: 0, seated: true };
  const calm = ['tea', 'harvest'].includes(festivalTheme().action)
    || activity && !['dance', 'perform'].includes(activity.kind);
  return { bounce: Math.sin(beat) * (calm ? .6 : 2), leg: calm ? 0 : Math.round(Math.sin(beat) * 3),
    cheer: calm ? Math.round(Math.sin(beat) * 2) : Math.round(Math.sin(beat) * 3),
    raise: activity?.kind === 'snack' ? (Math.sin(now * 4 + actor.x) + 1) * 4 - 2 : calm ? 0 : 8 };
}

function drawFestivalProp(x, y, actor = null) {
  const activity = actor?.festival?.activity;
  if (activity?.route.length) return;
  if (activity && ['chat', 'watch'].includes(activity.kind)) return;
  if (activity?.kind === 'snack') {
    const lift = (Math.sin(now * 4 + x) + 1) * 4;
    circle(x + 13, y + 3 - lift, 5, '#f0d299'); rect(x + 9, y + 1 - lift, 8, 3, '#c68d60'); return;
  }
  const action = activity?.kind === 'rest' ? 'tea' : activity?.kind === 'perform' ? 'music' : festivalTheme().action;
  if (action === 'flowers') {
    rect(x + 12, y - 26, 2, 15, '#70925b');
    circle(x + 13, y - 27, 5, '#e7adab'); circle(x + 13, y - 27, 2, '#f5df9e');
  } else if (action === 'music') {
    circle(x + 15, y - 13, 7, '#cf945c'); circle(x + 15, y - 13, 4, '#efd5a0');
    rect(x + 14, y - 22, 2, 3, '#faf0c7'); rect(x + 21, y - 14, 3, 2, '#faf0c7');
  } else if (action === 'harvest') {
    rect(x - 11, y + 7, 25, 11, '#9f784b'); rect(x - 9, y + 9, 21, 3, '#d0a16b');
    circle(x - 4, y + 4, 5, '#c77c43'); circle(x + 5, y + 4, 5, '#dfb65c');
  } else {
    rect(x + 7, y + 1, 9, 9, '#ead3a3'); rect(x + 16, y + 3, 3, 4, '#cfa773');
    const puff = (now * 5 + x) % 10;
    rect(x + 10, y - 3 - puff, 2, 4, '#efe5c49e');
  }
}

function drawFestivalTable(table) {
  const { x, y } = table, theme = festivalTheme(), level = currentFestivalLevel();
  rect(x - 25, y + 12, 50, 7, '#8b6547'); rect(x - 22, y - 12, 44, 24, '#d7af78');
  rect(x - 26, y - 22, 52, 7, theme.colors[0]);
  for (let i = 0; i < 3; i++) {
    const tx = x - 15 + i * 14;
    if (level === 0 || theme.action === 'tea') {
      rect(tx - 3, y - 22, 8, 7, '#e9d1a0');
      rect(tx, y - 28 - (now * 4 + i * 3) % 8, 2, 5, '#e8dfc195');
    } else if (theme.action === 'flowers' && i === 2) {
      rect(tx - 4, y - 17, 9, 7, '#aa7953'); rect(tx, y - 28, 2, 11, '#789764');
      circle(tx + 1, y - 30, 5, theme.colors[i]);
    } else {
      circle(tx, y - 23, theme.action === 'harvest' ? 7 : 5, theme.colors[i]);
      rect(tx, y - 30, 2, 5, '#779061');
    }
  }
  const dishes = Math.min(4, Math.ceil(farm.eastGarden.festivalServed / 3));
  for (let i = 0; i < dishes; i++) circle(x - 13 + i * 9, y - 2, 4, i % 2 ? '#e7ca78' : '#d27e65');
  if (level >= 1) { rect(x - 20, y - 11, 13, 7, '#f0d299'); rect(x - 18, y - 14, 9, 4, '#c68d60'); }
  if (level >= 3) { rect(x + 7, y - 13, 13, 9, '#ebd7b0'); rect(x + 8, y - 17, 11, 5, '#d99786'); }
}
function drawSeasonalFestival() {
  drawFestivalCanopy();
  for (const pole of CENTRAL_PLAZA.poles) drawFestivalPole(pole);
  for (const table of CENTRAL_PLAZA.tables) drawFestivalTable(table);
}
