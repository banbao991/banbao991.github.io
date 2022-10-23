// boom: 整体作用
let boom_cx = 0,
  boom_cy = 0;
let boom_rot = Math.PI * 0.25;
let cos_boom_rot = Math.cos(Math.PI / 2 - boom_rot),
  sin_boom_rot = Math.sin(Math.PI / 2 - boom_rot);

// 点击 scale
let click_transform = {
  stop: true,
  scale: 1.0,
  min_scale: 0.95,
  delta_scale: 0.01,
  w2h: 0.5,
  down: true,
  x: 0,
  y: 0,
};

// b1: 礼炮主体部分
let b1_rx = 0,
  b1_ry = 0;
let b1_body_h = 0;
let boom_body_frag = [];
const BOOM_BODY_FRAGMENT_NUM = 100;

// 小球和碎片
const BOOM_BALL_FRAG = {
  BALLS_NUM: 50,
  FRAGS_NUM: 100,
  MAX_RADIUS: 0,
  MIN_RADIUS: 0,
};
let boom_frags = [];

/** 初始化礼炮 */
function init_boom() {
  // b1: 礼炮主体部分
  boom_cx = WINDOW_WIDTH / 6;
  boom_cy = (WINDOW_HEIGHT * 3) / 4;
  b1_body_h = WINDOW_HEIGHT / 3;
  b1_rx = WINDOW_WIDTH / 30;
  b1_ry = b1_rx / 2;

  // 小球和碎片
  BOOM_BALL_FRAG.MAX_RADIUS = WINDOW_HEIGHT / 100;
  BOOM_BALL_FRAG.MIN_RADIUS = WINDOW_HEIGHT / 200;
}

/** 点击事件 */
function detect_boom_click(event) {
  click_transform.x = event.clientX - canvas.getBoundingClientRect().left;
  click_transform.y = event.clientY - canvas.getBoundingClientRect().top;
  //   console.log(click_transform.x, click_transform.y);
}

/** 绘制杯体 */
// 三角形中心
function draw_boom_body(context, /*optional*/ px, /*optional*/ py) {
  let cx = 0,
    cy = -b1_body_h / 2;
  let rx = b1_rx,
    ry = b1_ry;
  // 1. 绘制杯体
  context.beginPath();
  moveTo(cx + rx, cy);
  context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI, true);
  context.lineTo(cx, b1_body_h / 2);
  context.closePath();

  context.lineCap = "round";
  context.fillStyle = "#cbd9f9";
  context.fill();

  // 准备碎花
  let f_ll = cx - Math.max(rx, ry),
    f_tt = cy - Math.max(rx, ry);
  let f_dx = 2 * rx,
    f_dy = 2 * ry + b1_body_h;
  f_dx = f_dy = Math.max(f_dx, f_dy);

  while (boom_body_frag.length < BOOM_BODY_FRAGMENT_NUM) {
    let x = Math.random() * f_dx + f_ll;
    let y = Math.random() * f_dy + f_tt;
    // 注意这里
    let t_x = x * cos_boom_rot - y * sin_boom_rot + boom_cx,
      t_y = x * sin_boom_rot + y * cos_boom_rot + boom_cy;
    if (!context.isPointInPath(t_x, t_y)) {
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
    boom_body_frag.push(a_frag);
  }

  // 2. 点击事件
  if (context.isPointInPath(px, py)) {
    click_transform.stop = false;
    // 解除后效性
    click_transform.x = 0;
    click_transform.y = 0;
  }
  // scale
  canvas.addEventListener("click", detect_boom_click);

  // 3. 装饰
  // 爱心
  let pp = [
    { x: -rx / 2, y: -b1_body_h / 4 },
    { x: -rx / 3, y: -b1_body_h / 2 },
    { x: -rx / 4, y: +b1_body_h / 10 },
  ];
  for (let i in pp) {
    context.save();
    context.translate(pp[i].x, pp[i].y);
    context.scale(WINDOW_WIDTH / 1232, WINDOW_WIDTH / 1232);
    context.beginPath();
    context.moveTo(15, 10);
    context.bezierCurveTo(5, 5, 5, 15, 15, 20);
    context.moveTo(15, 10);
    context.bezierCurveTo(25, 5, 25, 15, 15, 20);
    context.fillStyle = "red";
    context.fill();
    context.restore();
  }

  // 4. 散落的碎花
  for (let i = 0; i < BOOM_BODY_FRAGMENT_NUM; ++i) {
    let a_frag = boom_body_frag[i];
    context.beginPath();
    context.moveTo(a_frag.x1, a_frag.y1);
    context.lineTo(a_frag.x2, a_frag.y2);
    context.strokeStyle = a_frag.color;
    context.lineWidth = a_frag.width;
    context.stroke();
  }
}

/** 绘制礼炮 */
function draw_boom(context) {
  context.save();

  // 0. 初始化
  init_boom();
  context.translate(boom_cx, boom_cy);
  context.rotate(boom_rot);
  if (click_transform.stop === false) {
    let sy = click_transform.scale;
    let sx = (1.0 - sy) * click_transform.w2h + 1.0;
    context.translate(0, b1_body_h / 2);
    context.scale(sx, sy);
    context.translate(0, -b1_body_h / 2);
    if (click_transform.down) {
      sy -= click_transform.delta_scale;
      if (sy <= click_transform.min_scale) {
        click_transform.down = false;
        gen_boom_balls_frags();
      }
    } else {
      sy += click_transform.delta_scale;
      if (sy >= 1.0) {
        click_transform.stop = true;
        click_transform.down = true;
      }
    }
    click_transform.scale = sy;
  }

  // 1. 绘制杯体
  draw_boom_body(context, click_transform.x, click_transform.y);

  context.restore();

  // 2. 绘制球体
  draw_boom_balls_frags(context);
}

/** 绘制小球和小碎片 */
function draw_boom_balls_frags(context) {
  // 小球全局 main 绘制了, 因为还有其他地方有
  // 碎片
  for (let i in boom_frags) {
    let a_frag = boom_frags[i];
    context.beginPath();
    context.moveTo(a_frag.x1, a_frag.y1);
    context.lineTo(a_frag.x2, a_frag.y2);
    context.strokeStyle = a_frag.color;
    context.lineWidth = a_frag.width;
    context.stroke();
  }
}

/** 更新碎片位置 */
function update_boom_frag() {
  let cnt = 0;
  for (let i in boom_frags) {
    if (boom_frags[i].update_position(WINDOW_WIDTH, WINDOW_HEIGHT)) {
      boom_frags[cnt++] = boom_frags[i];
    }
  }
  while (boom_frags.length > cnt) {
    boom_frags.pop();
  }
}

/** 生成小球和小碎片 */
function gen_boom_balls_frags() {
  let cx = 0,
    cy = -b1_body_h / 2;
  let sx = cx - b1_rx,
    sy = cy - b1_ry;
  let dx = b1_rx * 2,
    dy = b1_ry * 2;
  let sr = BOOM_BALL_FRAG.MIN_RADIUS,
    dr = BOOM_BALL_FRAG.MAX_RADIUS - BOOM_BALL_FRAG.MIN_RADIUS;
  // 注意这里的小球绘制不在这个 transform 中, 因此需要去除 transform 的影响
  for (let i = 0; i < BOOM_BALL_FRAG.BALLS_NUM; ++i) {
    let a_ball = new Ball(
      Math.random() * dx + sx,
      Math.random() * dy + sy,
      Math.random() * dr + sr,
      Math.random() * 40 + 10,
      -(Math.random() * 20 + 10),
      Math.random() * 2 + 1,
      get_a_color()
    );
    // 修正旋转与平移
    let x = a_ball.x,
      y = a_ball.y;

    a_ball.x = x * cos_boom_rot - y * sin_boom_rot + boom_cx;
    a_ball.y = x * sin_boom_rot + y * cos_boom_rot + boom_cy;
    balls.push(a_ball);
  }

  // 碎片
  for (let i = 0; i < BOOM_BALL_FRAG.FRAGS_NUM; ++i) {
    let x1 = Math.random() * dx + sx,
      y1 = Math.random() * dy + sy;
    let l1 = Math.random() * 2,
      l2 = Math.random() * 2;
    let w = Math.random() * 3 + 1;
    let a_frag = new Frag(
      x1,
      y1,
      x1 + l1,
      y1 + l2,
      Math.random() * 10 + 5,
      -(Math.random() * 20 + 10),
      Math.random() * 2 + 1,
      w,
      get_a_color()
    );
    // 修正旋转与平移
    let x = a_frag.x1,
      y = a_frag.y1;
    a_frag.x1 = x * cos_boom_rot - y * sin_boom_rot + boom_cx;
    a_frag.y1 = x * sin_boom_rot + y * cos_boom_rot + boom_cy;
    // 2
    x = a_frag.x2;
    y = a_frag.y2;
    a_frag.x2 = x * cos_boom_rot - y * sin_boom_rot + boom_cx;
    a_frag.y2 = x * sin_boom_rot + y * cos_boom_rot + boom_cy;
    boom_frags.push(a_frag);
  }
}
