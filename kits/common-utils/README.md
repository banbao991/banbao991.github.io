# Kits 公共主题

`theme.css` 提供时间类小工具共用的视觉基础，当前由以下页面使用：

- `countdown`
- `break-reminder`
- `elapsed-time`

## 使用方式

在工具自己的样式之前加载公共主题：

```html
<link rel="stylesheet" href="../common-utils/theme.css">
<link rel="stylesheet" href="main.css">
```

公共层包含颜色变量、页面背景、装饰光斑、外层容器、标题区、卡片、按钮、开关、焦点态、响应式基础和无障碍辅助类。工具自己的 CSS 只保留业务组件及必要的布局差异。

新增同类工具时，优先复用 `.app-shell`、`.app-header`、`.app-footer`、`.app-footer-content`、`.back-link`、`.eyebrow`、`.intro`、`.panel`、`.button`、`.switch` 和 `.sr-only`。
