# Markdown 阅读器

静态网页入口为 [`index.html`](index.html)。直接访问 `/kits/markdown/` 时，默认展示 `kits/farm/doc/世界与玩法.md`；也可以通过站点根目录相对路径指定任意 Markdown 文件：

示例：[阅读分形原理](../fractal/README.md)。阅读器会让这个相对 Markdown 链接继续在阅读器中打开。

```text
/kits/markdown/?file=kits/fractal/README.md
```

文件路径可以直接输入页面顶部的框。支持 `.md`、`.markdown` 和 `.mdown`，开头可以有 `/`。路径必须属于当前站点；网页不能直接读取用户计算机上的任意绝对文件路径。部署在静态站点或本地 HTTP 服务后使用，例如从站点根目录运行：

```sh
python -m http.server 8000
```

然后访问 `http://localhost:8000/kits/markdown/?file=kits/fractal/README.md`。直接使用 `file://` 打开可能因浏览器的读取限制而无法加载目标 Markdown。

## 渲染方式

- 使用本地存放的 [Marked 18.0.14](https://marked.js.org/) 解析 Markdown，启用 GFM：标题、段落、链接、图片、列表、任务列表、表格、引用、行内代码和围栏代码块。
- 使用本地存放的 [DOMPurify 3.4.15](https://github.com/cure53/DOMPurify) 清理解析后的 HTML，然后再插入页面。脚本、事件处理属性和不安全链接不会作为可执行内容保留。
- 以目标 Markdown 文件为基准解析相对图片和链接；指向其他 Markdown 文件的站内链接仍在阅读器中打开。
- 自动生成可跳转的目录，代码块可以复制，宽表格可以横向滚动；提供浅色与深色模式。

库文件与许可证位于 [`../../libs/markdown/`](../../libs/markdown/)；页面无需连接 CDN。普通 Markdown 规范与常见 GFM 功能受支持。LaTeX 数学扩展及任意原始 HTML/CSS 页面不是此阅读器的目标；原始 HTML 会经过清理。
