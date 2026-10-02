'use strict';
// Render one complete world frame into a separate canvas without moving the live camera.
const mapExportButtons = [$('export-map-image'), $('pure-map-export')];

function renderCompleteFarmCanvas() {
  const image = document.createElement('canvas');
  image.width = WORLD_W;
  image.height = WORLD_H;
  const imageContext = image.getContext('2d', { alpha: false });
  if (!imageContext) throw new Error('无法创建农场画布。');

  const liveContext = ctx, liveView = farm.view, liveHover = hover;
  const liveWidth = W, liveHeight = H;
  try {
    ctx = imageContext;
    W = WORLD_W; H = WORLD_H;
    farm.view = { x: 0, y: 0, zoom: 1 };
    hover = null;
    render();
  } finally {
    ctx = liveContext;
    W = liveWidth; H = liveHeight;
    farm.view = liveView;
    hover = liveHover;
  }
  return image;
}

function farmImageBlob(image) {
  return new Promise((resolve, reject) => {
    try {
      image.toBlob(blob => blob ? resolve(blob) : reject(new Error('无法将农场画布转换为 PNG。')), 'image/png');
    } catch (error) { reject(error); }
  });
}

async function exportCompleteFarmImage() {
  const day = farm.day, time = shortTime().replace(':', '-');
  const labels = mapExportButtons.map(button => button.textContent);
  mapExportButtons.forEach(button => { button.disabled = true; button.textContent = '正在绘制…'; });
  setArchiveStatus('正在绘制完整农场图片…');
  try {
    const image = renderCompleteFarmCanvas();
    const blob = await farmImageBlob(image);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `苔谷农场-第${day}天-${time}-全图.png`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    setArchiveStatus(`已保存 ${WORLD_W} × ${WORLD_H} 的完整农场图片。`);
  } catch (_) {
    setArchiveStatus('生成图片失败，请检查浏览器是否允许下载。', true);
  } finally {
    mapExportButtons.forEach((button, index) => { button.disabled = false; button.textContent = labels[index]; });
  }
}

mapExportButtons.forEach(button => button.addEventListener('click', () => { void exportCompleteFarmImage(); }));
