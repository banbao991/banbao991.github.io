'use strict';
// Surface ripples drift downstream while the riverbanks and bridge geometry stay fixed.
function riverCurrentMarks(time = motionNow) {
  const marks = [];
  for (let i = 0; i < 58; i++) {
    const broad = i < 38;
    const index = broad ? i : i - 38;
    const spacing = broad ? 36 : 69;
    const speed = (broad ? 24 : 17) + hash(i, 101) * (broad ? 13 : 9);
    const start = index * spacing + hash(i, 102) * 23;
    const y = (start + time * speed) % (WORLD_H + 30) - 15;
    const offset = (hash(i, 103) - .5) * (broad ? 37 : 43);
    const x = riverCenterAt(clamp(y, 0, WORLD_H - 1)) + offset
      + Math.sin(y / 72 + i * 1.7) * 2;
    marks.push({ x: Math.round(x), y: Math.round(y), speed, broad });
  }
  return marks;
}
function drawRiverCurrent() {
  const visibleTop = farm.view.y - 24;
  const visibleBottom = farm.view.y + H / farm.view.zoom + 24;
  for (const mark of riverCurrentMarks()) {
    const { x, y } = mark;
    if (y < visibleTop || y > visibleBottom || y < 0 || y >= WORLD_H - 12) continue;
    if (mark.broad) {
      rect(x + 3, y - 4, 2, 13, 'rgba(49,124,148,0.23)');
      rect(x - 5, y, 4, 2, 'rgba(200,233,215,0.30)');
      rect(x - 2, y + 3, 7, 2, 'rgba(203,235,219,0.42)');
      rect(x - 1, y + 7, 5, 2, 'rgba(223,243,225,0.57)');
      rect(x, y + 10, 2, 2, 'rgba(223,243,225,0.33)');
    } else {
      rect(x, y, 2, 10, 'rgba(53,133,153,0.24)');
      rect(x - 2, y + 5, 5, 2, 'rgba(178,222,213,0.34)');
    }
  }
}
