'use strict';
// Deterministic random values, geometry and color utilities; no world initialization.
const hash = (x, y, k = 0) => {
  let n = Math.imul(x + 47, 374761393) + Math.imul(y + 13, 668265263) + Math.imul(k + 1, 2246822519);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function blendHex(a, b, amount) {
  const left = Number.parseInt(a.slice(1), 16), right = Number.parseInt(b.slice(1), 16);
  const channel = shift => Math.round(((left >> shift) & 255) * (1 - amount) + ((right >> shift) & 255) * amount);
  return `#${[16, 8, 0].map(shift => channel(shift).toString(16).padStart(2, '0')).join('')}`;
}
