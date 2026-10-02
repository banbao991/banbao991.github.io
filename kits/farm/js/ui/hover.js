'use strict';
// Keep screen coordinates: the world can move or grow beneath a stationary pointer.
let mapHoverPointer = null;
let mapHoverElapsed = 0;
function clearMapHover(forgetPointer = false) {
  hover = null;
  tooltip.hidden = true;
  tooltip.textContent = '';
  if (forgetPointer) mapHoverPointer = null;
}
function rememberMapHover(event) {
  if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
  mapHoverPointer = { clientX: event.clientX, clientY: event.clientY };
  mapHoverElapsed = 0;
  refreshMapHover(true);
}
function refreshMapHover(selectAtPointer = false) {
  if (!mapHoverPointer || (!hover && !selectAtPointer)) return;
  if (drag || (typeof pureModeActive === 'function' && pureModeActive() && !farm.pureHints)) {
    clearMapHover(); return;
  }
  const bounds = canvas.getBoundingClientRect();
  const p = mousePosition(mapHoverPointer);
  if (p.localX < 0 || p.localY < 0 || p.localX >= bounds.width || p.localY >= bounds.height) {
    clearMapHover(true); return;
  }
  const current = describe(p.x, p.y);
  // Hide an object that left; don't silently switch to the grass or another passer-by.
  if (!current || (!selectAtPointer && current.target !== hover.target)) {
    clearMapHover(); return;
  }
  hover = current;
  if (tooltip.textContent !== current.text) tooltip.textContent = current.text;
  tooltip.hidden = false;
  tooltip.style.left = `${clamp(p.localX + 14, 5, wrap.clientWidth - tooltip.offsetWidth - 6)}px`;
  tooltip.style.top = `${clamp(p.localY - 25, 5, wrap.clientHeight - tooltip.offsetHeight - 6)}px`;
}
function updateMapHover(dt) {
  mapHoverElapsed += dt;
  if (mapHoverElapsed < .1) return;
  mapHoverElapsed = 0;
  refreshMapHover();
}
globalThis.addEventListener?.('blur', () => clearMapHover(true));
