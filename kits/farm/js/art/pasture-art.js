'use strict';
// Sheep barn, pasture fences and sheep painting.
function drawSheepPen() {
  const pen = SHEEP_LAYOUT.pen, barn = SHEEP_LAYOUT.barn;
  for (let x = pen.left; x < pen.right - 5; x += 27) fencePost(x, pen.top);
  for (let y = pen.top + 20; y < pen.bottom - 34; y += 27) {
    if (y !== pen.top + 20 && y !== pen.top + 47) fencePost(pen.left, y);
    fencePost(pen.right - 8, y);
  }
  scenePart('sheep-barn', barn.bottom, () => {
    rect(barn.left + 4, barn.top + 33, 112, 39, '#8b6547');
    rect(barn.left, barn.top + 13, 120, 26, '#b07a58');
    rect(barn.left + 19, barn.top, 87, 22, '#bc8661');
    rect(barn.left + 22, barn.top + 47, 22, 22, windowColor('#d0a56d'));
    rect(barn.left + 56, barn.top + 35, 38, 36, '#634b39');
    rect(barn.left + 59, barn.top + 38, 32, 31, '#8e6a4b');
  });
  for (let i = 0; i < 5; i++) {
    scenePart(`sheep-hay:${i}`, pen.bottom - 65 + (i % 2) * 10, () => {
      rect(pen.left + 14 + i * 42, pen.bottom - 73 + (i % 2) * 10, 28, 8, '#cba65f');
      rect(pen.left + 18 + i * 42, pen.bottom - 78 + (i % 2) * 10, 21, 5, '#dfbe79');
    });
  }
}

function drawSheepFenceFront() {
  if (!villageSiteOpen('sheep')) return;
  for (let x = SHEEP_LAYOUT.pen.left; x < SHEEP_LAYOUT.pen.right - 5; x += 27) fencePost(x, SHEEP_LAYOUT.pen.bottom - 28);
}

function drawSheep(s) {
  rect(s.x - 18, s.y + 9, 38, 6, '#627a5b66');
  for (const [dx, dy] of [[-12, -4], [-5, -8], [3, -8], [10, -3], [-10, 3], [0, 4]]) circle(s.x + dx, s.y + dy, 10, '#f0e9d4');
  rect(s.x + 11, s.y - 6 + pausePulse(s.x,1.7)*2, 16, 15, '#76695e'); rect(s.x + 22, s.y - 3 + pausePulse(s.x,1.7)*2, 5, 4, '#4d453e');
  rect(s.x - 12, s.y + 9, 5, 9, '#887b6b'); rect(s.x + 6, s.y + 9, 5, 9, '#887b6b');
}
