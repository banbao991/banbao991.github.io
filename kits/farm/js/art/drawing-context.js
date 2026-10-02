'use strict';
// Canvas context, pixel primitives and ambient animation helpers, shared by all painters.
const canvas = document.getElementById('farm-map');
let ctx = canvas.getContext('2d', { alpha: false });

let W = 1152, H = 816;

const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const circle = (x, y, r, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2); ctx.fill(); };

let rain = Array.from({ length: 140 }, (_, i) => ({ x: hash(i, 1) * WORLD_W, y: hash(i, 2) * WORLD_H, speed: 170 + hash(i, 3) * 120 }));

let sceneSeason = seasonTransition();
function pausePulse(seed, speed = 2) { return farm.paused ? Math.sin(now * speed + seed) : 0; }
function nightStrength() {
  const p = farm.phase;
  return p < .52 ? 0 : p < .70 ? (p-.52)/.18 : p < .90 ? 1 : 1-(p-.90)/.10;
}
function windowColor(day) { return blendHex(day, '#ffe09b', nightStrength()); }
function drawLightGlow(x, y, radius, alpha) {
  const glow = ctx.createRadialGradient(x, y, 2, x, y, radius);
  glow.addColorStop(0, `rgba(255,207,121,${alpha})`);
  glow.addColorStop(1, 'rgba(255,207,121,0)');
  ctx.fillStyle = glow; ctx.fillRect(x-radius, y-radius, radius*2, radius*2);
}
