# fflate 0.8.3

用于浏览器 ZIP 压缩和解压的纯 JavaScript 库，采用 MIT 许可证。

- 项目：https://github.com/101arrowz/fflate
- 固定版本：0.8.3
- 下载来源：https://registry.npmjs.org/fflate/-/fflate-0.8.3.tgz
- 提取文件：npm 包内 `umd/index.js`，本地命名为 `fflate.min.js`
- 许可证：见 [LICENSE](LICENSE)
- npm 包的 SHA-512 完整性已核对。
- `fflate.min.js` SHA-256：`462ef8041fc970e3615a20a9dd2b2e3047a073b2da729ef4f02b634bba8b7b83`

## 浏览器加载

```html
<script src="../../libs/fflate@0.8.3/fflate.min.js" defer></script>
```

普通脚本加载后通过全局 `fflate` 调用。与农场的有序 `defer` 脚本配合时，应放在存档功能脚本之前；本地加载不需要联网。

```js
const zipped = fflate.zipSync({'farm.json': fflate.strToU8(jsonText)});
const files = fflate.unzipSync(zipped);
const restoredText = fflate.strFromU8(files['farm.json']);
```

农场页面已通过本地普通脚本接入此库；默认导出 ZIP，上传时自动识别并解压，JSON 数据仍由原有完整状态校验处理。
