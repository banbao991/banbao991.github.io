# 无极分形 · Fractal Atlas

一个静态、离线可运行的复平面分形探索网页。入口为 [`index.html`](index.html)。界面提供 13 种景观、拖动平移、滚轮及按钮缩放、迭代次数与画质设置、调色板、PNG 保存和可复制的视图链接。

## 运行

从站点根目录使用任意静态 HTTP 服务，例如：

```sh
python -m http.server 8000
```

然后访问 `http://localhost:8000/kits/fractal/`。使用 HTTP 服务是因为浏览器通常禁止 `file://` 页面启动同目录的 Web Worker。所有计算在本地浏览器完成，不依赖在线 API，也不需要构建步骤。

## 交互

- 在左侧选择公式。Julia 的四张卡片分别固定了不同的复参数。
- 拖动画布平移；滚轮、双击、`+`/`−` 以指针或视图中心为轴缩放；`⌖` 回到当前公式的起点。
- 调整迭代次数时，提高数值通常能显示更深边界，但计算时间随之增加。流畅、高清、超清控制画布像素数；高清是默认设置。
- “分享视图”把精确的定点坐标和缩放尺度写入 URL；“保存图片”导出当前画布 PNG。

## 分形的基本原理

把一个复数写作 `z = x + yi`，其中 `i² = −1`。屏幕上的每个像素对应复平面中的一个点。对这个点反复执行某个公式，观察轨道是否越过逃逸半径。如果在指定迭代次数内逃逸，就依据逃逸速度上色；未逃逸则画成深色。有限迭代的深色只是“尚未观察到逃逸”，并不是数学上的成员资格证明。

**参数平面**的像素代表 `c`，通常从 `z₀ = 0` 开始；**Julia 平面**固定 `c`，而像素代表初始点 `z₀`。二者使用同一种迭代，却展示不同的问题。[Mandelbrot 集](https://mathworld.wolfram.com/MandelbrotSet.html)与 [Julia 集](https://mathworld.wolfram.com/JuliaSet.html)的资料可进一步阅读。

| 景观 | 逐步迭代公式 | 特点 |
| --- | --- | --- |
| Mandelbrot 集 | `z' = z² + c` | 经典二次参数集合，像素为 `c` |
| Julia · 兔子 | `z' = z² + c`, `c = −0.123 + 0.746i` | 近似 Douady 兔子参数 |
| Julia · 闪电 | 同上，`c = i` | 树枝状 dendrite |
| Julia · 漩涡 | 同上，`c = −0.74543 + 0.11301i` | 精细旋臂 |
| Julia · 星尘 | 同上，`c = 0.285 + 0.01i` | 离散岛屿 |
| 三次 Multibrot | `z' = z³ + c` | 三次幂参数集合 |
| 四次 Multibrot | `z' = z⁴ + c` | 四次幂参数集合 |
| 燃烧之船 | `z' = (\|Re z\| + i\|Im z\|)² + c` | 平方前折叠两个坐标，产生火焰尖塔 |
| 三角帽 / Mandelbar | `z' = (conj z)² + c` | 共轭使三个主要分枝出现 |
| 凯尔特结 | `z' = \|Re(z²)\| + i Im(z²) + c` | 平方后折叠实部 |
| 水牛分形 | `z' = \|Re(z²)\| + i\|Im(z²)\| + c` | 平方后折叠两个坐标；Buffalo 的一种常见变体 |
| 垂直之船 | `z' = (\|Re z\| + i Im z)² + c` | 平方前只折叠实部 |
| 凤凰分形 | `z' = z² + c − 0.5 zₙ₋₁` | 增加上一步轨道的“记忆” |

表中未特别说明的参数图均从 `z₀ = 0` 开始。Julia 图的 `c` 固定，像素作为 `z₀`。燃烧之船的绝对值形式参见 [Wolfram MathWorld](https://mathworld.wolfram.com/BurningShipFractal.html)。不同资料对船形变体的命名与朝向可能不同，此处以公式为准。

## 实现与精度

### 1. 坐标不会停在 JavaScript `Number` 的 53 位有效整数处

视图中心与水平跨度以 `BigInt / 2^bits` 的二进制定点数保存。初始为 128 位小数；放大后，当每个像素可用的低位接近阈值，就把分子左移 64 位并增加 64 位精度。平移、缩放和分享链接都在此表示上进行，因此深度放大时不会因为普通双精度坐标的舍入而冻结在同一点。所需位数随缩放深度增长；浏览器内存与时间依然有限，所以这里的“无限”是用户体验上的、可按需扩展的精度，并非真的无限资源。

### 2. 分层计算

普通缩放深度下，`live-preview.js` 用原生 WebGL 片元着色器即时预览，最多迭代 112 次；`gpu-float.wgsl` 再用 WebGPU 为全部 13 种公式计算目标分辨率、用户指定迭代次数的完整图。`gpu-display.wgsl` 直接读取 GPU 上的逃逸数据，完成连续着色并显示到 WebGPU 画布；普通视图不把整张图读回 JavaScript。首次打开时需要编译着色器，之后复用管线和 GPU 缓冲区。仅更改调色板时也复用普通视图的逃逸结果。

拖动与缩放的视觉更新合并到每个屏幕刷新帧。上一张完整分辨率图保持在 GPU 上，随指针平移和缩放；WebGL 通过裁剪只计算移开后露出的区域。放大时旧图完全覆盖视口，就跳过临时预览。Mandelbrot 和 Julia 进入更深区域后，Worker 计算一条高精度参考轨道；WebGL 与 WebGPU 着色器用扰动递推计算周围像素与该轨道的差值。参考点会在视野中心及附近挑选，以减少轨道提前逃逸的问题。

拖动与连续滚轮期间，后台目标的更新间隔根据最近的计算耗时调整，普通 GPU 视图最低约 48 毫秒，深度视图最低约 96 毫秒；停下后追到最终视图。过期结果在显示前丢弃，图像与它的复平面坐标同时更新，避免旧任务造成画面跳动。深度二次分形会先让 Worker 准备参考轨道，GPU 生成完整图并通过高精度抽样核对；等待核对时 Worker 暂停逐像素 CPU 渲染。GPU 失败、超时或核对发现差异时，Worker 再逐块计算。其他不适用 GPU 的视图也由 Worker 先生成低成本预览，再补齐目标分辨率。

WebGL 扰动预览需要浏览器支持浮点纹理、当前视野存在足够长的参考轨道，而且跨度不小于约 `1e-30`。更深的 Mandelbrot / Julia 视图优先尝试 WebGPU 高分辨率扰动；没有足够长的参考轨道时尝试 WebGPU 多段整数预览。不支持 WebGPU 或超出这两条路径的精度范围时，Worker 继续生成图像。其他公式暂不使用 GPU 深度预览，因为它们的递推关系各不相同。新视图会使旧任务停在下一个图块边界。双指触摸也可平移和缩放。

画质档按设备像素密度设置目标画布，并分别限制在约 110 万、320 万、620 万像素以内。两条 WebGPU 完整图路径都支持这个 620 万像素上限。平移时沿用完整分辨率旧图；放大旧图仍会暂时变软，直到当前尺度的图像完成。直接浮点路径限于像素间距足以被 `f32` 区分的视图；不适用扰动的极深视图可能回退，速度取决于设备、尺度和迭代次数。

### 2.1 WebGPU 多段定点数试验

`gpu-precision.wgsl` 将一个有符号数拆为 **10 个 16 位段**，使用 `u32` 存储，按二进制补码表示为 `Q16.144` 定点数。加减法逐段传递进位；乘法用学校式逐段乘积生成 320 位中间值，再取对应小数位的 160 位结果。JavaScript 只负责用 `BigInt` 把当前中心、像素步长和 Julia 常量准确打包；WebGPU 计算着色器并行迭代各个像素，显示着色器直接读取逃逸结果并上色。这是在 GPU 上运行的多精度迭代。

这条路径在视野跨度小于约 `1e-29`、但无法使用完整 GPU 扰动时作为预览启用，最多计算约 36 万预览像素和 160 次迭代。`Q16.144` 的最小单位约为 `4.5e-44`；当像素步长不足 8 个单位时停止使用，避免相邻像素落到相同坐标。预览可能缺少高迭代次数才出现的细枝；Worker 仍按用户设置的迭代次数和画质完成最终图。这个固定宽度试验并没有把任意精度变成 GPU 原生能力，也不能保证每台 GPU 上都比扰动算法快。

### 2.2 WebGPU 高分辨率扰动

对于拥有完整参考轨道的 Mandelbrot / Julia 视图，Worker 先计算一条 `BigInt` 轨道。`gpu-perturb.wgsl` 用“高位 + 低位”两个 `f32` 表示每个参考值和差量，并把像素差量按视野跨度缩放，避免极小差量直接相加时被舍入掉。GPU 按用户设置的迭代次数、最多约 620 万像素计算完整图。页面只读回 169 个分布在画面各处的逃逸次数，共 **676 字节**，用 Worker 的逐点 `BigInt` 计算核对；全部一致且 GPU 分辨率达到目标时，直接采用 GPU 图。否则保留 GPU 图供观看，由 Worker 继续完成最终画面。

抽样核对能发现常见的数值偏差，**不能证明每个像素都完全一致**。特别深、没有足够长参考轨道或设备精度不足的视图仍会回退。测试中的 `−2 + 0i`、约 `1e-32` 跨度、1600 次迭代视图，GPU 图通过了 169 点核对；GPU 绘图约 70 毫秒，包含参考轨道和核对的总耗时约 0.2 秒。

### 2.3 各尺度的计算方法

| 视图尺度 | 方法 |
| --- | --- |
| 普通尺度 | WebGPU `f32` 对全部公式并行计算完整图；WebGL 即时预览 |
| 深度 Mandelbrot / Julia | `BigInt` 计算参考轨道；WebGPU 双浮点扰动生成高分辨率图，经 169 点高精度核对后可直接完成 |
| 无法使用完整 GPU 扰动的深度预览 | WebGPU 中的 160 位多段定点逐像素迭代，随后由 Worker 精修 |
| 极深视图及其余公式 | 每个像素使用 `BigInt` 定点迭代 |

二次映射的差量递推为：设参考轨道 `Z' = Z² + C`，相邻像素轨道 `z = Z + δz`、参数差 `δc`，则 `δz' = 2Zδz + (δz)² + δc`。Julia 集中 `δc = 0`，差量放在初始 `δz₀`。当差量相对参考轨道过大，或参考轨道提前结束，像素回退到直接 `BigInt` 计算。这种 [perturbation（扰动）方法](https://www.mathr.co.uk/web/m-perturbation.html)用于加速深度缩放。有限浮点差量仍有误差，极深时改用逐像素高精度路径。

### 3. 着色与可见性

逃逸点通过连续逃逸值平滑颜色，再映射到选定调色板；未逃逸点为深色。逃逸阈值使用 `|z| > 4`。实际画面受当前迭代上限、像素分辨率、计算速度与数值误差约束。特别深的画面或高迭代次数可能等待较久，这是逐像素任意精度计算的成本。

### 性能验证

2026-10-02 在同一浏览器、1397 × 615 像素、320 次迭代下，对比了旧的整图读回及 JavaScript 着色与 GPU 直接显示。着色器已编译后，燃烧之船、Julia 漩涡、三次 Multibrot 和 Mandelbrot 的单次渲染从约 61～82 毫秒降到约 8～10 毫秒；主线程着色与提交从约 46～67 毫秒降到约 0.2～0.3 毫秒。这个对比衡量单次图像更新，并不是对所有视图帧率的保证。1600 次迭代的深倍率边界仍有明显 GPU 计算成本。

打开 [`tests/gpu-smoke.html`](tests/gpu-smoke.html) 可运行实际浏览器 GPU 集成检查：PNG 导出、与独立 CPU 参考值比较的颜色、调色板切换及缓冲区复用、Julia / Multibrot / 船形显示、620 万像素完整图，以及 `1e-32` 跨度、1600 次迭代的 169 点 BigInt 核对。

### 4. 第三方库

本实现**没有外部运行时依赖**：`BigInt`、Canvas、WebGL、WebGPU、Web Worker 均为浏览器原生 API。因此无需向 `libs/` 下载库，页面离线可用。若 WebGL / WebGPU 不可用，页面仍由 Canvas 和 Worker 渲染。下面列出的 GPU 大整数项目作为参考资料，并未复制进运行代码。

## 文件

- `index.html`：页面语义结构与控件。
- `style.css`：响应式界面。
- `main.js`：视图状态、精确坐标、交互、导出与分享。
- `live-preview.js`：WebGL 实时预览与 Mandelbrot / Julia 的深度扰动着色器。
- `gpu-precision.js`、`gpu-float.wgsl`：WebGPU 管线、普通尺度完整图的计算与着色。
- `gpu-display.wgsl`：直接在 GPU 上着色与显示，不读回整张图。
- `gpu-precision.wgsl`：多段定点预览着色器。
- `gpu-perturb.wgsl`：缩放差量、双浮点复数运算及高分辨率扰动着色器。
- `render-worker.js`：公式、图块渲染、扰动与高精度计算。
- `tests/gpu-smoke.html`：真实 GPU、PNG 导出、像素颜色和高精度核对的集成检查。

## 参考资料

- [Wolfram MathWorld — Mandelbrot Set](https://mathworld.wolfram.com/MandelbrotSet.html)
- [Wolfram MathWorld — Julia Set](https://mathworld.wolfram.com/JuliaSet.html)
- [Wolfram MathWorld — Burning Ship Fractal](https://mathworld.wolfram.com/BurningShipFractal.html)
- [Claude Heiland-Allen — Perturbation](https://www.mathr.co.uk/web/m-perturbation.html)
- [c52e — Mandelbrot Set / Julia 实时联动示例](https://c52e.github.io/Mandelbrot_set.html)：参考其片元着色器即时重绘的交互方式；本页还使用 WebGPU 和 Worker 完成深度计算。
- [NVIDIA CGBN](https://github.com/NVlabs/CGBN)：CUDA 上的多精度整数库，用协作线程处理一个大整数；不能直接用于浏览器 WGSL。
- [NVIDIA cuPQC-BigInt](https://docs.nvidia.com/cuda/cupqc/libraries/cupqc_bigint/cupqc_bigint_feature.html)：CUDA 内核中的固定宽度多精度整数运算。
- [WebGPU-WGSL-64bit-BigInt](https://github.com/Gold18K/WebGPU-WGSL-64bit-BigInt)：WGSL 中以多个机器字表示大整数的社区实现；本页的定点运算为独立实现。
- [mandelbrot-webgpu](https://github.com/Desarso/mandelbrot-webgpu)：浏览器 WebGPU 深度 Mandelbrot 开源项目，在 GPU 上计算参考轨道并结合扰动；进一步优化本页时值得参考。
