'use strict';
// Release saves use exactly the same validation and full-state restoration as player imports.
const defaultSaveButton = $('load-default-farm');
if (typeof DEFAULT_FARM_SAVE !== 'undefined') {
  defaultSaveButton.textContent = `✿ 加载 v${DEFAULT_FARM_SAVE.release} 默认农场`;
  $('default-save-note').textContent = `第 ${DEFAULT_FARM_SAVE.day} 天的完整农场 · 加载前可先导出自己的进度`;
}

async function readDefaultFarmArchive() {
  if (typeof DEFAULT_FARM_SAVE === 'undefined') throw new Error('默认存档未能加载，请刷新页面后重试。');
  let file;
  if (location.protocol === 'file:') {
    const bytes = Uint8Array.from(atob(DEFAULT_FARM_SAVE.base64), character => character.charCodeAt(0));
    file = new Blob([bytes], { type: 'application/zip' });
  } else {
    const response = await fetch(DEFAULT_FARM_SAVE.url);
    if (!response.ok) throw new Error('无法读取默认存档，请稍后重试。');
    file = await response.blob();
  }
  return importFarmText(await readFarmArchiveFile(file));
}

defaultSaveButton.addEventListener('click', async () => {
  if (defaultSaveButton.disabled) return;
  defaultSaveButton.disabled = true;
  setArchiveStatus('正在读取并检查默认农场…');
  try {
    const archive = await readDefaultFarmArchive();
    if (!confirm(`加载 v${DEFAULT_FARM_SAVE.release} 默认农场（第 ${archive.state.day} 天）将替换当前进度和浏览器自动存档。\n需要保留当前农场的话，请先取消并导出存档。\n确认加载？`)) {
      setArchiveStatus('已取消加载，当前农场继续保留。');
      return;
    }
    replaceFarmState(archive.state, archive.runtime);
    setArchiveStatus(`已加载 v${DEFAULT_FARM_SAVE.release} 默认农场，完整状态从第 ${farm.day} 天继续，已保存到浏览器。`);
  } catch (error) {
    setArchiveStatus(error instanceof Error ? error.message : '加载默认存档失败，请稍后重试。', true);
  } finally { defaultSaveButton.disabled = false; }
});
