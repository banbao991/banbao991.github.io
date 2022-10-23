/**
 * @description
 * 思路特别简单, 首先在 canvas 上面绘制出文字
 * 获取到 canvas 图片, 将文字的位置坐标设置为粒子的终点即可
 * 生成粒子的时候可以随机给定位置
 * (!!不是物理正确的!!)
 * @author banbao990
 */

// 画板
let canvas, context;

// 文字
const DEFAULT_TEXT = "banbao990";
// const DEFAULT_TEXT = "粒子";
const FONT_RATE = 0.8;

// 粒子系统
let particles = new Array();
const ALPHA_THRESHOLD = 200;
const PARTICLES_PER_LINE = 200; // 控制粒子个数
const OUT_X = -999;
const OUT_Y = -999;

/**
 * main() 函数
 */
function main() {
  // 初始化参数
  init_scene();
  // 生成粒子
  generate_particles();
  // 注册事件
  register_event();
  // 渲染主逻辑
  requestAnimationFrame(render);
}

/**
 * 渲染主逻辑
 */
function render() {
  requestAnimationFrame(render);
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i++) {
    particles[i].render(context);
  }
}

/**
 * 生成粒子
 */
function generate_particles() {
  particles.splice(0, particles.length);
  // 1. 获取文字
  let str = $("#set_text").val();
  if (str === "") {
    str = DEFAULT_TEXT;
  }
  // 2. 绘制文字
  let font_size = 100;
  clear_canvas();
  context.textAlign = "center";
  context.textBaseline = "middle";
  // 获取准确字体大小
  context.font = font_size + "px sans-serif";
  context.fillStyle = "rgba(0,0,0,1)";
  let w = context.measureText(str).width;
  font_size = Math.min(300, (font_size / w) * FONT_RATE * canvas.width);
  context.font = font_size + "px sans-serif";
  context.fillText(str, canvas.width / 2, canvas.height / 2);
  let img_data = context.getImageData(0, 0, canvas.width, canvas.height).data;
  // clear_canvas();
  // RGBA 格式, 我们取其的 A 通道不为 0
  let ww = canvas.width,
    hh = canvas.height;
  Particle.canvasWidth = ww;
  Particle.canvasHeight = hh;
  Particle.MAX_RADIUS = (ww / 1600) * 5;
  let delta = Math.floor(ww / PARTICLES_PER_LINE);
  for (let i = 0; i < hh; i += delta) {
    for (let j = 0; j < ww; j += delta) {
      if (img_data[(i * ww + j) * 4 + 3] > ALPHA_THRESHOLD) {
        particles.push(new Particle(j, i));
      }
    }
  }
}

/**
 * 初始化参数、界面
 */
function init_scene() {
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  // 设置分辨率和显示大小相同
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

/**
 * 清空 canvas
 */
function clear_canvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * 事件注册
 */
function register_event() {
  Particle.mouse = { x: OUT_X, y: OUT_Y };
  // 读取输入字符串
  document.getElementById("set_text").addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      generate_particles();
    }
  });
  // 屏幕大小改变
  window.addEventListener("resize", () => {
    init_scene();
    generate_particles();
  });
  // 鼠标
  window.addEventListener("mousemove", (e) => {
    Particle.mouse.x = e.clientX;
    Particle.mouse.y = e.clientY;
  });
  window.addEventListener("mouseout", (e) => {
    Particle.mouse.x = OUT_X;
    Particle.mouse.y = OUT_Y;
  });
  // 触摸屏
  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      Particle.mouse.x = e.touches[0].clientX;
      Particle.mouse.y = e.touches[0].clientY;
    }
  });
  window.addEventListener("touchend", (e) => {
    Particle.mouse.x = OUT_X;
    Particle.mouse.y = OUT_Y;
  });
}
