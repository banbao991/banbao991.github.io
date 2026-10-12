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

// Exact input values, bounded across continuous seasons/growth/night lighting.
// This derived cache is independent of the farm and never enters a save.
const hexBlendCache = new Map();
const HEX_BLEND_CACHE_LIMIT = 2048;
let hexBlendCacheSize = 0;
function blendHex(a, b, amount) {
  // Preserve the original coercion behavior for nonprimitive callers.
  if (typeof a !== 'string' || typeof b !== 'string' || typeof amount !== 'number') return blendHexDirect(a, b, amount);
  const cached = hexBlendCache.get(a)?.get(b)?.get(amount);
  if (cached !== undefined) return cached;
  const color = blendHexDirect(a, b, amount);
  if (hexBlendCacheSize >= HEX_BLEND_CACHE_LIMIT) { hexBlendCache.clear(); hexBlendCacheSize = 0; }
  let targets = hexBlendCache.get(a);
  if (!targets) hexBlendCache.set(a, targets = new Map());
  let amounts = targets.get(b);
  if (!amounts) targets.set(b, amounts = new Map());
  amounts.set(amount, color); hexBlendCacheSize++;
  return color;
}
function blendHexDirect(a, b, amount) {
  const left = Number.parseInt(a.slice(1), 16), right = Number.parseInt(b.slice(1), 16);
  const channel = shift => Math.round(((left >> shift) & 255) * (1 - amount) + ((right >> shift) & 255) * amount);
  return `#${[16, 8, 0].map(shift => channel(shift).toString(16).padStart(2, '0')).join('')}`;
}
