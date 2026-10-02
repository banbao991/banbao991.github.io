'use strict';
// Native fullscreen when available, with a page-sized fallback for restricted browsers.
const purePanel = $('map-panel');
const pureToggle = $('pure-mode-toggle');
const pureHintsToggle = $('pure-hints-toggle');
function pureModeActive() {
  return document.fullscreenElement === purePanel || purePanel.classList.contains('is-pure-mode');
}
function resizeFarmViewport() {
  const previousView = { ...farm.view };
  // Capture the old view before the changed mode applies its new zoom limit.
  const oldPadding = worldPadding();
  const focus = { x: farm.view.x + (W / 2 - oldPadding.x) / farm.view.zoom,
    y: farm.view.y + (H / 2 - oldPadding.y) / farm.view.zoom };
  let width = 1152, height = 816;
  if (pureModeActive()) {
    const bounds = purePanel.getBoundingClientRect();
    const scale = Math.min(816 / Math.max(1, bounds.height), WORLD_W / Math.max(1, bounds.width));
    width = Math.max(1, Math.round(bounds.width * scale));
    height = Math.max(1, Math.round(bounds.height * scale));
  }
  const resized = width !== W || height !== H;
  if (resized) {
    W = width; H = height;
    canvas.width = W; canvas.height = H;
  }
  farm.view.zoom = clamp(farm.view.zoom, minimumZoom(), 1.6);
  const padding = worldPadding();
  farm.view.x = focus.x - (W / 2 - padding.x) / farm.view.zoom;
  farm.view.y = focus.y - (H / 2 - padding.y) / farm.view.zoom;
  clampCamera(); updateViewUI();
  if (resized || Math.abs(farm.view.zoom - previousView.zoom) > 1e-9
    || Math.abs(farm.view.x - previousView.x) > 1e-9
    || Math.abs(farm.view.y - previousView.y) > 1e-9) save();
}
function syncPureMode() {
  const active = pureModeActive();
  resizeFarmViewport();
  pureToggle.textContent = active ? '✕ 退出纯享' : '⛶ 点击进入全屏纯享';
  pureToggle.title = active ? '退出全屏纯享模式，也可按 P 或 Esc' : '点击进入全屏纯享模式，或按 P';
  pureToggle.setAttribute('aria-pressed', String(active));
  pureHintsToggle.textContent = farm.pureHints ? '提示：开' : '提示：关';
  pureHintsToggle.title = farm.pureHints ? '点击隐藏全屏鼠标提示' : '点击显示全屏鼠标提示';
  pureHintsToggle.setAttribute('aria-pressed', String(farm.pureHints));
}
async function togglePureMode() {
  if (pureModeActive()) {
    if (document.fullscreenElement === purePanel && document.exitFullscreen) {
      try { await document.exitFullscreen(); }
      catch (_) { purePanel.classList.remove('is-pure-mode'); }
    } else purePanel.classList.remove('is-pure-mode');
  } else if (purePanel.requestFullscreen) {
    try { await purePanel.requestFullscreen(); }
    catch (_) { purePanel.classList.add('is-pure-mode'); }
  } else purePanel.classList.add('is-pure-mode');
  syncPureMode();
}
pureToggle.addEventListener('click', () => { void togglePureMode(); });
pureHintsToggle.addEventListener('click', () => {
  farm.pureHints = !farm.pureHints;
  if (!farm.pureHints) clearMapHover(true);
  syncPureMode(); save();
});
document.addEventListener('fullscreenchange', syncPureMode);
globalThis.addEventListener?.('resize', () => { if (pureModeActive()) resizeFarmViewport(); });
document.addEventListener('keydown', event => {
  if ((event.code === 'KeyP' || event.key?.toLowerCase() === 'p') && !event.repeat
    && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
    event.preventDefault(); void togglePureMode(); return;
  }
  if (event.key === 'Escape' && purePanel.classList.contains('is-pure-mode')) {
    purePanel.classList.remove('is-pure-mode');
    syncPureMode();
  }
});
