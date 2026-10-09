'use strict';
// Sidebar portraits use their own canvas and display clock; they never move map actors.
function drawVillageResidentPortrait(canvas, name, clock = now) {
  const painter = canvas.getContext('2d');
  const actor = villageResidentActor(name);
  const colors = {
    '阿运': ['#8d9a72', '#b47850'], '阿葵': ['#c88762', '#87634b'],
    '阿蓼': ['#668e83', '#aa7754'], '阿芽': ['#9d8eab', '#d6b879'],
    '阿森': ['#8b9670', '#b4865d'], '阿矿': ['#7b9290', '#d7ae6e'],
    '阿棠': ['#78958b', '#dbba80']
  };
  const [shirt, hat] = colors[name] || [actor?.shirt || '#b08d64', actor?.hat || '#d9ba76'];
  const child = name === '阿宁';
  const offset = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) / 23;
  const breathe = Math.sin(clock * 1.8 + offset) > .35 ? 1 : 0;
  const blink = (clock + offset) % 4.8 < .15;
  const hand = Math.round(Math.sin(clock * 2 + offset));
  const x = 22, y = (child ? 36 : 32) + breathe;
  painter.setTransform(1, 0, 0, 1, 0, 0);
  painter.clearRect(0, 0, canvas.width, canvas.height);
  painter.setTransform(canvas.width / 44, 0, 0, canvas.height / 60, 0, 0);
  painter.imageSmoothingEnabled = false;
  const pixel = (px, py, w, h, color) => {
    painter.fillStyle = color; painter.fillRect(px, py, w, h);
  };
  pixel(x - 11, 55, 22, 3, '#75664920');
  pixel(x - 6, y + 10, 5, child ? 8 : 12, '#4c5c5c');
  pixel(x + 2, y + 10, 5, child ? 8 : 12, '#4c5c5c');
  pixel(x - 7, y + (child ? 17 : 21), 6, 3, '#645440');
  pixel(x + 2, y + (child ? 17 : 21), 6, 3, '#645440');
  pixel(x - (child ? 7 : 9), y - 2, child ? 14 : 18, 15, child ? '#7c946b' : shirt);
  pixel(x - (child ? 11 : 13), y + 1 + hand, 5, 10, '#dfb28b');
  pixel(x + (child ? 7 : 9), y + 1 - hand, 5, 10, '#dfb28b');
  pixel(x - 4, y + 8, 8, 3, '#6f604a');
  pixel(x - 7, y - 17, 14, 16, '#e8bc94');
  if (child) {
    pixel(x - 8, y - 20, 16, 6, '#9b7557');
    pixel(x - 7, y - 16, 3, 5, '#9b7557');
  } else {
    pixel(x - 10, y - 20, 20, 6, hat);
    pixel(x - 13, y - 16, 26, 4, '#b28d5f');
  }
  pixel(x - 4, y - 10, 2, blink ? 1 : 2, '#4a473c');
  pixel(x + 3, y - 10, 2, blink ? 1 : 2, '#4a473c');
  pixel(x - 1, y - 5, 3, 1, '#ba8467');
}
