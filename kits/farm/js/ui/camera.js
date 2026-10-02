'use strict';
// Viewport mathematics, zoom, panning and region labels.
function minimumZoom() {
  return typeof pureModeActive === 'function' && pureModeActive()
    ? Math.min(W / WORLD_W, H / WORLD_H) : .7;
}
function worldPadding(zoom = farm.view.zoom) {
  return { x: Math.max(0, (W - WORLD_W * zoom) / 2), y: Math.max(0, (H - WORLD_H * zoom) / 2) };
}
function clampCamera() {
  const view = farm.view;
  view.zoom = clamp(Number(view.zoom) || 1, minimumZoom(), 1.6);
  view.x = clamp(Number(view.x) || 0, 0, Math.max(0, WORLD_W - W / view.zoom));
  view.y = clamp(Number(view.y) || 0, 0, Math.max(0, WORLD_H - H / view.zoom));
}
function screenToWorld(x, y) {
  clampCamera();
  const padding = worldPadding();
  return { x: farm.view.x + (x - padding.x) / farm.view.zoom,
    y: farm.view.y + (y - padding.y) / farm.view.zoom };
}
function setZoom(value, screenX = W / 2, screenY = H / 2) {
  const focus = screenToWorld(screenX, screenY);
  const minimum = minimumZoom(), requested = Number(value);
  farm.view.zoom = requested <= minimum ? minimum
    : clamp(Math.round(requested * 10) / 10, minimum, 1.6);
  const padding = worldPadding();
  farm.view.x = focus.x - (screenX - padding.x) / farm.view.zoom;
  farm.view.y = focus.y - (screenY - padding.y) / farm.view.zoom;
  clampCamera(); updateViewUI(); drawMiniMap();
  if (typeof refreshMapHover === 'function') refreshMapHover();
  save();
}
function panByScreen(dx, dy) {
  farm.view.x -= dx / farm.view.zoom;
  farm.view.y -= dy / farm.view.zoom;
  clampCamera(); updateViewUI(); drawMiniMap();
  if (typeof refreshMapHover === 'function') refreshMapHover();
}
function centerCamera(worldX, worldY) {
  const padding = worldPadding();
  farm.view.x = worldX - (W / 2 - padding.x) / farm.view.zoom;
  farm.view.y = worldY - (H / 2 - padding.y) / farm.view.zoom;
  clampCamera(); updateViewUI(); drawMiniMap();
  if (typeof refreshMapHover === 'function') refreshMapHover();
  save();
}
function updateViewUI() {
  const view = farm.view;
  $('zoom-range').min = String(minimumZoom());
  $('zoom-range').step = minimumZoom() === .7 ? '.1' : 'any';
  $('zoom-range').value = String(view.zoom);
  $('zoom-out').disabled = view.zoom <= minimumZoom() + 1e-9;
  $('zoom-in').disabled = view.zoom >= 1.6;
  $('zoom-label').textContent = `${Math.round(view.zoom * 100)}%`;
  const center = screenToWorld(W / 2, H / 2);
  if (inRect(center.x, center.y, NURSERY_LAYOUT.area.left, NURSERY_LAYOUT.area.top,
    NURSERY_LAYOUT.area.right, NURSERY_LAYOUT.area.bottom)) {
    $('region-label').textContent = farm.nursery.level ? '西南湿地苗圃' : '西南旧苗圃';
    return;
  }
  if (lakeAt(center.x, center.y)) {
    $('region-label').textContent = '西湖';
    return;
  }
  if (valleyLakeAt(center.x, center.y)) {
    $('region-label').textContent = '西南小湖';
    return;
  }
  if (inRect(center.x, center.y, MINE_LAYOUT.area.left, MINE_LAYOUT.area.top,
    MINE_LAYOUT.area.right, MINE_LAYOUT.area.bottom)) {
    $('region-label').textContent = '河东矿坡';
    return;
  }
  if (inRect(center.x, center.y, CENTRAL_PLAZA.left, CENTRAL_PLAZA.top,
    CENTRAL_PLAZA.right, CENTRAL_PLAZA.bottom)) {
    $('region-label').textContent = '苔谷广场';
    return;
  }
  $('region-label').textContent = center.x < 960
    ? center.y < 640 ? '苔谷主场' : center.y < 1040 ? '西部草甸'
      : center.x < 600 ? '西南草甸' : '南方山谷'
    : center.y < 640 ? '东部森林'
      : center.x <= riverCenterAt(center.y) + 38 ? center.y >= 1234 ? '南方山谷' : center.y < 1020 ? '溪西草甸' : '溪西南路'
        : center.y < 1020 ? (farm.upgrades >= 5 ? '村口集市' : '村口街区') : '村口南郊';
}
