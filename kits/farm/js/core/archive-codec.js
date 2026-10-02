'use strict';
// ZIP is only a container: JSON validation and world restoration stay in their existing modules.
const FARM_ARCHIVE_MAX_BYTES = 2_000_000;

function farmZipLibrary() {
  if (typeof fflate === 'undefined') throw new Error('ZIP 工具未能加载，请刷新页面或改用 JSON 存档。');
  return fflate;
}

function createFarmArchiveDownload(text, jsonName, zip = false) {
  if (!zip) return { name: jsonName, blob: new Blob([text], { type: 'application/json;charset=utf-8' }) };
  const codec = farmZipLibrary();
  const bytes = codec.zipSync({ [jsonName]: codec.strToU8(text) }, { level: 6 });
  return { name: jsonName.replace(/\.json$/i, '.zip'), blob: new Blob([bytes], { type: 'application/zip' }) };
}

function farmZipArchiveText(bytes) {
  const codec = farmZipLibrary();
  let jsonEntries = 0;
  let entryError = null;
  let files;
  try {
    files = codec.unzipSync(bytes, { filter(entry) {
      if (!/\.json$/i.test(entry.name)) return false;
      jsonEntries++;
      if (jsonEntries > 1) entryError = 'ZIP 中有多个 JSON 文件，请选择只包含一个农场存档的压缩包。';
      else if (entry.originalSize > FARM_ARCHIVE_MAX_BYTES)
        entryError = 'ZIP 内的存档超过 2 MB，请选择苔谷农场存档。';
      // Reject oversized members before the library allocates their decompressed buffers.
      if (entryError) throw new Error(entryError);
      return true;
    } });
  } catch (_) {
    throw new Error(entryError || '无法解压 ZIP，压缩包可能已损坏或使用了不支持的格式。');
  }
  if (jsonEntries !== 1) throw new Error('ZIP 中没有 JSON 存档，请选择苔谷农场导出的压缩包。');
  const content = Object.values(files)[0];
  if (!content || content.length > FARM_ARCHIVE_MAX_BYTES) throw new Error('ZIP 内的存档超过 2 MB。');
  return codec.strFromU8(content);
}

async function readFarmArchiveFile(file) {
  if (file.size > FARM_ARCHIVE_MAX_BYTES) throw new Error('文件超过 2 MB，请选择苔谷农场存档。');
  const signature = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  const zipHeader = signature[0] === 0x50 && signature[1] === 0x4b
    && ((signature[2] === 3 && signature[3] === 4) || (signature[2] === 5 && signature[3] === 6));
  if (zipHeader || /\.zip$/i.test(file.name || ''))
    return farmZipArchiveText(new Uint8Array(await file.arrayBuffer()));
  return file.text();
}
