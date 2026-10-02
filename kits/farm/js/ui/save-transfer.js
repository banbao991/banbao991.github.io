'use strict';
// Portable JSON/ZIP farm archives, separate from the browser's automatic local save.
const archiveStatus = $('archive-status');
const archiveInput = $('import-farm-file');
function setArchiveStatus(message, error = false) {
  archiveStatus.textContent = message;
  archiveStatus.classList.toggle('error', error);
}
if (cacheLoadError) setArchiveStatus('浏览器存档暂时无法读取，原数据已保留；可以导入完整存档或重新开始。', true);
function farmExportText(minify = true) {
  return JSON.stringify({ format: 'moss-valley-farm', version: 1, archiveVersion: 2,
    exportedAt: new Date().toISOString(), state: farm, runtime: captureRuntimeState() }, null, minify ? 0 : 2);
}
function importFarmText(text) {
  let parsed;
  try { parsed = JSON.parse(text); }
  catch (_) { throw new Error('无法读取 JSON，请选择苔谷农场导出的存档。'); }
  if (parsed?.format !== 'moss-valley-farm' || parsed.archiveVersion !== 2 || !parsed.runtime) {
    throw new Error('请选择新版苔谷农场完整状态存档。');
  }
  const state = parseFarmSave(parsed);
  validateRuntimeSnapshot(parsed.runtime);
  return { state, runtime: parsed.runtime };
}
$('export-farm').addEventListener('click', () => {
  try {
    const minify = $('export-minify').checked;
    const zip = $('export-zip').checked;
    const { blob, name } = createFarmArchiveDownload(farmExportText(minify), `苔谷农场-第${farm.day}天.json`, zip);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    const format = minify ? '精简 JSON' : '带缩进 JSON';
    setArchiveStatus(`当前农场完整状态已导出（${zip ? `ZIP · ${format}` : format}）。`);
  } catch (error) {
    setArchiveStatus(error instanceof Error ? error.message : '导出失败，请检查浏览器是否允许下载文件。', true);
  }
});
$('import-farm').addEventListener('click', () => archiveInput.click());
archiveInput.addEventListener('change', async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const archive = importFarmText(await readFarmArchiveFile(file));
    replaceFarmState(archive.state, archive.runtime);
    setArchiveStatus('完整农场状态已导入，演变从保存的位置继续。');
  } catch (error) {
    setArchiveStatus(error instanceof Error ? error.message : '导入失败，请检查存档文件。', true);
  } finally { archiveInput.value = ''; }
});
