let position_y = [];
let position_idx = 0;
let position_y_dst = 0;

const PLATE_IDX = 0;
// 盘子
let plate = {
  cx: 0,
  cy: 0,
  rx: 0,
  ry: 0,
};
let p_outline = 1.1;

// 第 1 层蛋糕
let r1 = 0.7;
let h1 = 0;
let h1_outline_h = 0;
let h1_cy_off = 0;
let h1_inner_rate = 0.9;

// 第 2 层蛋糕
let h2 = 0;
let h2_inner_rate = 0.8;

// 蜡烛
let h3_candle_bottom = 0;

// 小新牌牌
let xiaoxin = new Image();
xiaoxin.src = "./img/xiaoxin_001.jpg";

// 碎花
const FRAGMENT_NUM = 100;
let frag1 = [],
  frag2 = [];
let frag_translation; // 判断是否在库路径内

/** 初始化蛋糕数据 */
function init_cake() {
  // plate
  plate = {
    cx: WINDOW_WIDTH / 2,
    cy: (WINDOW_HEIGHT * 4) / 5,
    rx: WINDOW_WIDTH / 7,
    ry: WINDOW_HEIGHT / 11,
  };

  // h1
  h1 = WINDOW_HEIGHT / 10;
  h1_outline_h = h1 / 5;
  h1_cy_off = -0.04 * plate.cy;

  // h2
  h2 = h1 * 0.8;

  // candle
  h3_candle_bottom = plate.cy - h1 + h1_cy_off - h2;

  // position_y
  for (let i = 0; i < 6; ++i) {
    position_y.push(-WINDOW_HEIGHT);
  }
  position_y_dst = WINDOW_HEIGHT / 20;
}

/** 绘制盘子 */
function draw_plate(context) {
  let cx = plate.cx,
    cy = plate.cy,
    rx = plate.rx,
    ry = plate.ry;
  // 1. 盘子
  context.beginPath();
  context.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
  context.fillStyle = "#fef5f7";
  context.fill();

  // 2. 描边
  context.beginPath();
  context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  context.ellipse(cx, cy, rx, ry * p_outline, 0, Math.PI, 0, true);
  context.fillStyle = "#f2d7dd";
  context.fill();
}

/** 绘制面包 */
// cx, cy, rx, ry 底面信息
function draw_bread(
  context,
  cx,
  cy,
  rx,
  ry,
  h,
  inner_rate,
  body_color,
  head_color,
  base_color,
  frag
) {
  // 1. 圆柱
  context.beginPath();
  context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  context.lineTo(cx - rx, cy - h);
  context.ellipse(cx, cy - h, rx, ry, 0, Math.PI, 0);
  context.closePath();
  context.fillStyle = body_color;
  context.fill();
  // 准备碎花
  let f_ll = cx - rx,
    f_dx = 2 * rx,
    f_tt = cy - ry - h,
    f_dy = 2 * ry + h;
  while (frag.length < FRAGMENT_NUM) {
    let x = Math.random() * f_dx + f_ll;
    let y = Math.random() * f_dy + f_tt;
    if (!context.isPointInPath(x, y + frag_translation)) {
      continue;
    }
    let l1 = Math.random() * 2,
      l2 = Math.random() * 2;
    let w = Math.random() * 3 + 1;
    let a_frag = {
      x1: x,
      y1: y,
      x2: x + l1,
      y2: y + l2,
      width: w,
      color: get_a_color(),
    };
    frag.push(a_frag);
  }

  // 2. 顶面内圆
  context.beginPath();
  context.ellipse(
    cx,
    cy - h,
    rx * inner_rate,
    ry * inner_rate,
    0,
    2 * Math.PI,
    0
  );
  context.closePath();

  context.fillStyle = head_color;
  context.fill();

  // 3. 奶油流下来的波浪线
  let ll = cx - rx;
  let delta_x = (2 * rx) / 5;
  // 中间点
  let stops_inter = [];
  for (let i = 0; i < 6; ++i) {
    let item = {
      x: ll + delta_x * i,
      y: cy - (i % 5 === 0 ? 0.1 : 0.2 + i * 0.005) * h,
    };
    stops_inter.push(item);
  }
  // 控制点
  let cps = [];
  let t_cx = ll + delta_x * 0.7,
    t_cy = cy + ry - h * 1.2;
  cps.push({ x: t_cx, y: t_cy });

  for (let i = 1; i <= 4; ++i) {
    t_cx = stops_inter[i].x + (stops_inter[i].x - t_cx);
    t_cy = stops_inter[i].y + (stops_inter[i].y - t_cy);
    cps.push({ x: t_cx, y: t_cy });
  }

  context.beginPath();
  context.moveTo(ll, cy);
  context.lineTo(stops_inter[0].x, stops_inter[0].y);
  for (let i = 0; i < 5; ++i) {
    context.quadraticCurveTo(
      cps[i].x,
      cps[i].y,
      stops_inter[i + 1].x,
      stops_inter[i + 1].y
    );
  }
  context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  context.closePath();

  context.fillStyle = base_color;
  context.fill();

  // 4. 碎花片片

  for (let i = 0; i < FRAGMENT_NUM; ++i) {
    let a_frag = frag[i];
    context.beginPath();
    context.moveTo(a_frag.x1, a_frag.y1);
    context.lineTo(a_frag.x2, a_frag.y2);
    context.strokeStyle = a_frag.color;
    context.lineWidth = a_frag.width;
    context.stroke();
  }
}

/** 第一层蛋糕 */
function draw_cake_1(context) {
  let cx = plate.cx,
    cy = plate.cy + h1_cy_off,
    rx = r1 * plate.rx,
    ry = r1 * plate.ry;

  // 1. 面包圆柱
  draw_bread(
    context,
    cx,
    cy,
    rx,
    ry,
    h1,
    h1_inner_rate,
    "#fff0f3",
    "#fff9fb",
    "#cbd9f9",
    frag1
  );

  // 2. 描边
  context.beginPath();
  context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  context.lineTo(cx - rx, cy + h1_outline_h);
  context.ellipse(cx, cy + h1_outline_h, rx, ry, 0, Math.PI, 0, true);
  context.closePath();
  context.fillStyle = "#ffa79d";
  context.fill();

  // 3. CKY
  context.font = "bold " + (50 / 1232) * WINDOW_WIDTH + "px consolas";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#6f3732";

  context.fillText("K", cx, cy - h1_cy_off / 2);

  let delta_x = (rx / 2) * 1.5,
    delta_y = (ry / 2) * 0.7;
  let rot = 0.07 * Math.PI;
  context.save();
  context.translate(cx - delta_x, cy - h1_cy_off / 2 - delta_y);
  context.rotate(rot);
  context.fillText("C", 0, 0);
  context.restore();

  context.save();
  context.translate(cx + delta_x, cy - h1_cy_off / 2 - delta_y);
  context.rotate(-rot);
  context.fillText("Y", 0, 0);
  context.restore();
}

/** 第 2 层蛋糕 */
function draw_cake_2(context) {
  let cx = plate.cx,
    cy = plate.cy - h1 + h1_cy_off,
    rx = r1 * r1 * plate.rx,
    ry = r1 * r1 * plate.ry;

  // 1. 面包圆柱
  draw_bread(
    context,
    cx,
    cy,
    rx,
    ry,
    h2,
    h2_inner_rate,
    "#ffaaa0",
    "#ffc3be",
    "#6f3732",
    frag2
  );
}

/** 绘制蜡烛 */
function draw_candles(context) {
  let pos = [
    { x: WINDOW_WIDTH / 2 - 0.2 * plate.rx, y: h3_candle_bottom },
    { x: WINDOW_WIDTH / 2 + 0.2 * plate.rx, y: h3_candle_bottom },
  ];

  // 蜡烛属性
  let h_candle = WINDOW_HEIGHT / 12,
    w_candle = WINDOW_WIDTH / 100;
  // 以底边中心为标准
  for (let i = 0; i < pos.length; ++i) {
    context.save();
    context.translate(0, position_y[3 + i]);

    let x = pos[i].x,
      y = pos[i].y;

    // 1. 蜡烛
    context.fillStyle = "#b1c9e9";
    context.fillRect(x - w_candle / 2, y - h_candle, w_candle, h_candle);

    // 2. 线条
    context.strokeStyle = "white";
    context.lineWidth = w_candle / 5;
    let start_x = x - w_candle / 2,
      start_y = y;
    let end_x = x + w_candle / 2,
      end_y = 0;
    const DELTA_Y_FOR_CANDLE = 0.7 * w_candle;
    let should_stop_y = y - h_candle + DELTA_Y_FOR_CANDLE;
    while (start_y > should_stop_y) {
      // 三角函数
      end_y = start_y - DELTA_Y_FOR_CANDLE;
      context.beginPath();
      context.moveTo(start_x, start_y);
      context.lineTo(end_x, end_y);
      context.stroke();
      start_y = end_y;
    }

    // 3. 火焰
    // 外焰
    let h_fire = h_candle / 2.5,
      w_fire = w_candle;
    context.beginPath();
    let pos_bottom_fire = y - h_candle;
    let pos_top_fire = pos_bottom_fire - h_fire;
    // 控制点位置
    let x_fire_delta = w_fire;
    context.beginPath();
    context.moveTo(x, pos_bottom_fire);
    context.quadraticCurveTo(
      x - x_fire_delta,
      pos_top_fire + h_fire / 2,
      x,
      pos_top_fire
    );
    context.quadraticCurveTo(
      x + x_fire_delta,
      pos_top_fire + h_fire / 2,
      x,
      pos_bottom_fire
    );
    context.fillStyle = "#ff0f00";
    context.fill();
    // 内焰
    h_fire *= 0.7;
    w_fire *= 0.8;
    pos_top_fire = pos_bottom_fire - h_fire;
    x_fire_delta = w_fire;
    context.beginPath();
    context.moveTo(x, pos_bottom_fire);
    context.quadraticCurveTo(
      x - x_fire_delta,
      pos_top_fire + h_fire / 2,
      x,
      pos_top_fire
    );
    context.quadraticCurveTo(
      x + x_fire_delta,
      pos_top_fire + h_fire / 2,
      x,
      pos_bottom_fire
    );
    context.fillStyle = "#ffff00";
    context.fill();

    context.restore();
  }
}

/** 小新牌牌 */
function draw_xiaoxin(context) {
  let cx = WINDOW_WIDTH / 2,
    cy = h3_candle_bottom;
  let pai_bottom = cy - (WINDOW_HEIGHT / 10) * 1.3;

  // 线
  context.beginPath();
  context.moveTo(cx, cy);
  context.lineTo(cx, pai_bottom);
  context.lineWidth = Math.max(2, WINDOW_WIDTH / 100 / 5);
  context.strokeStyle = "white";
  context.lineCap = "round";
  context.stroke();

  // 牌
  let xiaoxin_width = WINDOW_WIDTH / 20;
  while (!xiaoxin.complete) {}
  xiaoxin.width = xiaoxin_width;
  xiaoxin.height = (xiaoxin_width / 3) * 4;
  //   let pattern = context.createPattern(xiaoxin, "repeat");
  //   context.fillStyle = pattern;
  //   context.fillRect(
  //     cx - xiaoxin_width / 2,
  //     pai_top - xiaoxin.height,
  //     xiaoxin_width,
  //     xiaoxin.height
  //   );
  context.drawImage(
    xiaoxin,
    cx - xiaoxin_width / 2,
    pai_bottom - xiaoxin.height,
    xiaoxin_width,
    xiaoxin.height
  );
}

/** 绘制整个蛋糕 */
function draw_cake(context) {
  // 0. 初始化
  init_cake();

  // 1. 绘制盘子
  context.save();
  context.translate(0, position_y[0]);
  draw_plate(context);
  context.restore();

  // 2. 第 1 层蛋糕
  context.save();
  context.translate(0, position_y[1]);
  frag_translation = position_y[1];
  draw_cake_1(context);
  context.restore();

  // 3. 第 2 层蛋糕
  context.save();
  context.translate(0, position_y[2]);
  frag_translation = position_y[2];
  draw_cake_2(context);
  context.restore();

  // 4. 蜡烛(每根蜡烛都有 save/restore)
  draw_candles(context);

  // 5. 小新牌牌
  context.save();
  context.translate(0, position_y[5]);
  draw_xiaoxin(context);
  context.restore();

  // 6. 碎花片片(绘制蛋糕的时候就已经绘制了)
  //   draw_fragment(context);
}

function update_cake() {
  if (position_idx >= 6) {
    word_start = true;
    return;
  }

  while (position_idx < 6) {
    position_y[position_idx] += WINDOW_HEIGHT / 20;
    if (position_y[position_idx] < position_y_dst - 0.1) {
      return;
    } else {
      position_y[position_idx] = 0;
      position_idx++;
    }
  }
}
