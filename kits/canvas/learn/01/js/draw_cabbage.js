let points = []; // 保存所有的绘制点
let points_now; // 当前绘制图元的信息

// canvas
let c = document.getElementById("myCanvas");
let ctx = c.getContext("2d");

/**
 * 初始化 canvas
 */
function init_canvas(width, height) {
  c.width = width;
  c.height = height;
}

/**
 * 螺旋线
 */
function add_helix(
  x,
  y,
  rx,
  ry,
  color,
  interval,
  reverse,
  start_angle,
  end_angle,
  x_off,
  y_off
) {
  let delta_angle = (end_angle - start_angle) / interval;
  let arr = [];
  for (let i = start_angle; i <= end_angle; i += delta_angle) {
    let _x = x + rx * Math.cos(i) + i * x_off;
    let _y = y + ry * Math.sin(i) * reverse + i * y_off;
    arr.push([_x, _y]);
  }
  points.push([arr, color]);
}

/**
 * 增加一条圆弧
 */
function add_arc(x, y, r, color, interval, reverse, start_angle, end_angle) {
  add_helix(x, y, r, r, color, interval, reverse, start_angle, end_angle, 0, 0);
}

/**
 * 增加一个圆
 * reverse: 1/-1, 顺时针/逆时针
 */
function add_circle(x, y, r, color, interval, reverse) {
  add_arc(x, y, r, color, interval, reverse, 0, 2 * Math.PI);
}

/**
 * 增加一条直线
 */
function add_line(x1, y1, x2, y2, interval) {
  let arr = [];
  let dx = (1.0 * (x2 - x1)) / interval;
  let dy = (1.0 * (y2 - y1)) / interval;
  for (let i = 0; i <= interval; ++i) {
    let _x = x1 + dx * i;
    let _y = y1 + dy * i;
    arr.push([_x, _y]);
  }
  points.push([arr]);
}

/**
 * 获取一个新的图元
 */
function ele_start() {
  if (points.length === 0) {
    return false;
  }
  points_now = points.shift();
  let startPoint = points_now[0].shift();
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#1c86d1";
  if (points_now.length >= 2) {
    ctx.strokeStyle = points_now[1];
  }
  if (points_now.length >= 3) {
    ctx.lineWidth = points_now[2];
  }
  ctx.moveTo(startPoint[0], startPoint[1]);
  return true;
}

/**
 * 绘制主函数
 */
let render_main = function () {
  if (points_now[0].length) {
    let t_point = points_now[0].shift();
    ctx.lineTo(t_point[0], t_point[1]);
    ctx.stroke();
  } else {
    ctx.closePath();
    if (!ele_start()) {
      return;
    }
  }
  requestAnimationFrame(render_main);
};

function render_cabbage() {
  // 0. 初始化 canvas
  init_canvas(300, 300);

  // 1. 准备好点
  add_circle(150, 150, 75, "#1c86d1", 100, 1);
  add_circle(150, 150, 50, "red", 100), 1;

  // 2. 绘制
  if (ele_start()) {
    render_main();
  }
}

/**
 * 绘制 cky
 */
function add_cky(xx_off, yy_off) {
  let interval = 50;
  let arr = [];

  // C
  let x = 150 + xx_off,
    y = 150 + yy_off,
    r = 50;
  let delta_angle = -Math.PI / interval;
  let start_angle = 1.7 * Math.PI;
  let end_angle = 0.3 * Math.PI;
  for (let i = start_angle; i >= end_angle; i += delta_angle) {
    let _x = x + r * Math.cos(i);
    let _y = y + r * Math.sin(i);
    arr.push([_x, _y]);
  }
  points.push([arr]);

  // K
  arr = [];
  x = 300 + xx_off;
  let l_off = -30,
    r_off = 40;
  add_line(x + l_off, y - r, x + l_off, y + r, interval);
  add_line(x + r_off, y - r, x + l_off, y, interval * 0.75);
  add_line(x + l_off, y, x + r_off, y + r, interval * 0.75);

  // Y
  x = 450 + xx_off;
  l_off = -40;
  r_off = 40;
  let y_off = -10;
  add_line(x + l_off, y - r, x, y + y_off, interval * 0.75);
  add_line(x + r_off, y - r, x, y + y_off, interval * 0.75);
  add_line(x, y + y_off, x, y + r, interval * 0.75);
}

/** 增加一个爱心 */
function add_love(x, y, r, color, interval) {
  // x = 16*sin(t)^3
  // y = 13*cos(t)-5*cos(2*t)-2cos(3*t)-cos(4*t)
  let delta_angle = (2 * Math.PI) / interval;
  let start_angle = 0.0;
  let end_angle = Math.PI;
  let arr = [];
  for (let k = 0; k < 2; ++k) {
    let inverse = 1 - 2 * k;
    for (let i = start_angle; i <= end_angle; i += delta_angle) {
      let t = Math.sin(i);
      let _x = x - inverse * r * (t * t * t);
      let _y =
        y -
        (r *
          (13 * Math.cos(i) -
            5 * Math.cos(2 * i) -
            2 * Math.cos(3 * i) -
            Math.cos(4 * i))) /
          17.0;
      arr.push([_x, _y]);
    }
    points.push([arr, color]);
    arr = [];
  }
}

/** 画小人 */
function add_face() {
  let color = "#1c86d1";
  // 外圈
  add_arc(150, 450, 60, color, 100, 1, 0.7 * Math.PI, 2.3 * Math.PI);
  // 左眼
  let x1 = -30;
  let y1 = -30;
  let x2 = -10;
  let y2 = y1 / 2;
  add_line(150 + x1, 450 + y1, 150 + x2, 450 + y2, 20);
  add_line(150 + x2, 450 + y2, 150 + x1, 450, 20);
  // 右眼
  // (1) 和左眼一样
  // add_line(150 - x1, 450 + y1, 150 - x2, 450 + y2, 20);
  // add_line(150 - x2, 450 + y2, 150 - x1, 450, 20);
  // (2) 螺旋线
  add_helix(
    150 - x1 - 20,
    450 + y2,
    9,
    14,
    color,
    50,
    1,
    0.6 * Math.PI,
    3.2 * Math.PI,
    3.0,
    0
  );
  // 嘴巴
  let s = 1.2 * Math.PI;
  let t = 1.8 * Math.PI;
  let r1 = 40;
  add_arc(150, 450, r1, color, 30, -1, s, t);
  let r2 = 5;
  add_circle(
    150 + (r1 - r2) * Math.cos(t),
    450 - (r1 - r2) * Math.sin(t),
    r2,
    color,
    10,
    -1
  );
  // 手指
  let r3 = 10;
  let x3 = 150 - r1 - 60;
  let y3 = 450 + 50;
  add_circle(x3, y3, r3, color, 40, -1);
  add_helix(
    x3 + 7 + r3,
    y3 - 10,
    8,
    20,
    color,
    40,
    1,
    1.0 * Math.PI,
    2.8 * Math.PI,
    0,
    0
  );
  // 符号
  add_line(x3, y3 - 100, x3 - 10, y3 - 100 - 10, 10);
  add_line(x3 - 5, y3 - 95, x3 - 15, y3 - 95, 10);
  add_line(x3, y3 - 90, x3 - 15, y3 - 90 + 10, 10);
}

/** 画波浪线 */
function add_wave(x, y, start_angle, end_angle, A, omega, interval, color) {
  let arr = [];
  let delta_angle = (end_angle - start_angle) / interval;
  let sy = y - A * Math.sin(start_angle);
  let cnt = 0;
  for (let i = start_angle; i <= end_angle; i += delta_angle) {
    let _y = sy + A * Math.sin(omega * i);
    arr.push([cnt * 10 * delta_angle + x, _y]);
    ++cnt;
  }
  points.push([arr, color]);
}

/** 画白菜 */
function add_cabbage() {
  let color = "#1c86d1";
  let rx = 8;
  let ry = 40;
  add_helix(400, 450, rx, ry, color, 40, 1, 0, 2 * Math.PI, 0, 0);
  add_wave(450 + rx, 450 - 80, -6 * Math.PI, 1 * Math.PI, 10, 0.3, 50, color);
  add_wave(420 + rx, 450 - 40, -Math.PI, 9 * Math.PI, 10, 0.5, 50, color);
  add_wave(400 + rx, 450, 0, 10 * Math.PI, 10, 0.7, 50, color);
  add_wave(410 + rx, 480, -Math.PI, 8 * Math.PI, 10, 0.4, 50, color);
  add_wave(450 + rx, 510, -8 * Math.PI, -0.5 * Math.PI, 10, 0.25, 50, color);
  add_wave(580 + rx, 520, 0.5 * Math.PI, 3 * Math.PI, 10, 0.3, 50, color);
}

function render_cky() {
  init_canvas(900, 700);
  // 900 * 300
  add_love(150, 150, 60, "red", 100);
  // add_cky(300, 0);
  // 900 * 400
  add_face();
  add_cabbage();

  if (ele_start()) {
    render_main();
  }
}

function render_cabbage_main() {
  render_cky();
}
