/**
 * @author banbao990
 * @version 2.0
 * t_xx() 表示测试函数
 * 基于事件驱动太卡了，直接用 requestAnimationFrame
 * 将拼图分为前后景（动静分离），移动的时候只更新前景，提高效率
 * 另外还可以将肯定不会动的 ref、border 画到最底下的背景上（分为 3 层）
 */

// 移动
const TRANSLATE_KEYS = ['w', 'a', 's', 'd'];
const TRANSLATE_KEYS_DELTA = {
  w: {x: 0, y: -1},
  a: {x: -1, y: 0},
  s: {x: 0, y: 1},
  d: {x: 1, y: 0},
};
const ROTATE_KEYS = ['q', 'e'];
const ROTATE_KEYS_DELTA = {
  q: -1,
  e: 1,
};

let translate_sensitive = 1;
let rotate_sensitive = 1;

// set
const RESPONSE_KEYS = new Set((TRANSLATE_KEYS.concat(ROTATE_KEYS)));

// 常数
const SQRT2 = Math.sqrt(2);
const PI2 = Math.PI * 2;
const EPS_PI2 = PI2 / 720;

const FPS_COUNTER = new FPSCounter(20);

let keys = {};  // 记录按键状态

// 全局变量
let CANVAS = {
  width: 0,
  height: 0,
};

// 拼图框框
let PINTU = {
  // 位置是相对于 CANVAS 的相对位置
  size: 0,
  left: 0,
  top: 0,
  border_color: 'black',
  border_line_width: 0,
  ok_state: false,  // 完成拼图
};

// 拼图数据的生成
let PINTU_CELL = {
  mark_the_click_cell: -1,
  MAX_SIZE: 8,
  MIN_SIZE: 2,
  size: 2,
  data_origin: [],
  dst_translate: [],  // translate
  now_translate: [],  // translate
  now_rotate: [],     // rotate
  // 绘制 4 条边的顶点
  edge_delta: {
    dx: [0, 1, 1, 0, 0],
    dy: [0, 0, 1, 1, 0],
  },
  RATE: 2 / 5,  // 每一条边, 一条小直线所占的比例
  ONE_MINUS_RATE: 0,
  // 小气泡的方向
  bubble_delta: {
    dx: [0, 1, 0, -1],
    dy: [-1, 0, 1, 0],
  },
  edge_size_px: 0,       // 边长
  half_edge_size_px: 0,  // 边长的一半
};

// 所有 set_interval
let bar = {
  for_t_position: 0,
};

let t = {
  for_t_position: 0,
};

let IMAGE;

const ROTATE_RATE = 1.0 / 6;

let KEY = {
  draw_countdown: 0,
  MAX_WAIT_TIME: 1,  // 多少帧绘制一次
  // 键盘事件触发移动的距离
  translate_is_pressed: false,
  delta: 1,
  delta_change: 1,
  MAX_DELTA: 10,
  MIN_DELTA: 1,
  OK_DELTA: 3,
  // 键盘事件触发旋转的角度
  rotate_is_pressed: false,
  delta_angle: PI2 / 360 * ROTATE_RATE,
  delta_change_angle: PI2 / 360 * ROTATE_RATE,
  MAX_DELTA_ANGLE: PI2 / 36 * ROTATE_RATE,
  MIN_DELTA_ANGLE: PI2 / 360 * ROTATE_RATE,
  OK_DELTA_ANGLE: PI2 / 120 * ROTATE_RATE,
};

/**
 * 加载图片
 */

async function load_image(image_url) {
  const image_load_promise = new Promise((resolve) => {
    IMAGE = new Image();
    IMAGE.onload = resolve;
    IMAGE.src = image_url;
  });
  await image_load_promise;
}

/**
 * main 函数
 */
function main() {
  // 1. 设置各种属性
  init_the_window();

  // 2. 生成数据
  gen_cell();

  // 2.1 测试生成数据是否正确
  //   t.for_t_position = 0;
  //   bar.for_t_position = setInterval(() => {
  //     t_position(7, canvas, context);
  //   }, 400);

  // 2.2 加载图片
  load_image('/resources/img/kits/qilabi_01.jpg').then(() => {
    // 3. 绘制拼图
    draw_ref();
    draw_pintu_border();
    change_pintu_size(PINTU_CELL.size);

    // 测试绘制拼图的底
    // t_draw_pic(context);

    gameLoop();
  });
}

function calculateFPS() {
  let fps = FPS_COUNTER.calculateFPS();
  document.getElementById('fps').textContent = `FPS: ${fps}`;
}

// 游戏循环
function gameLoop() {
  calculateFPS();  // 计算 FPS
  update();        // 更新
  requestAnimationFrame(gameLoop);
}

/**
 * 测试绘制拼图的底
 **/
function t_draw_pic(context) {
  context.drawImage(
      IMAGE,
      PINTU.left,  // - IMAGE.width,
      PINTU.top,   // - IMAGE.height,
      PINTU.size, PINTU.size);
  draw_pintu_border();
}

/**
 * 绘制整个拼图
 */
function draw_pintu(context) {
  let s = PINTU_CELL.size * PINTU_CELL.size;
  PINTU_CELL.mark_the_click_cell = -1;
  for (let i = 0; i < s; ++i) {
    draw_a_cell(context, i);
  }
  check_ok();
}

/**
 * 绘制一个小块
 * @param {point} point 如果为 undefined, mark_the_top 失效, 表示由点击事件触发
 * @param {boolean} mark_the_top 是否只标记而不绘制
 */
function draw_a_cell(context, pos, point, mark_the_top) {
  context.save();
  // 大小
  let size = PINTU_CELL.size;
  let edges = PINTU_CELL.data_origin[size - PINTU_CELL.MIN_SIZE][pos];
  let delta = PINTU.size / size;
  let j = pos % size;
  let i = (pos - j) / size;
  context.strokeStyle = PINTU.border_color;
  context.lineWidth = PINTU.border_line_width;
  // 小气泡位置, 上右下左(+1)
  //   PINTU_CELL.bubble_delta
  // 小气泡角度(都是朝外的气泡)
  let bubble_angle = {
    s: [
      (Math.PI * 3) / 4,
      (Math.PI * 5) / 4,
      (Math.PI * 7) / 4,
      (Math.PI * 1) / 4,
    ],
    t: [
      (Math.PI * 1) / 4,
      (Math.PI * 3) / 4,
      (Math.PI * 5) / 4,
      (Math.PI * 7) / 4,
    ],
  };
  let bubble_angle_neg = {
    s: [
      (Math.PI * 5) / 4,
      (Math.PI * 7) / 4,
      (Math.PI * 1) / 4,
      (Math.PI * 3) / 4,
    ],
    t: [
      (Math.PI * 7) / 4,
      (Math.PI * 1) / 4,
      (Math.PI * 3) / 4,
      (Math.PI * 5) / 4,
    ],
  };
  // 绘制 4 条边的顶点
  // PINTU_CELL.edge_delta;

  // transform
  context.translate(
      PINTU_CELL.now_translate[pos].x, PINTU_CELL.now_translate[pos].y);
  //   context.translate(
  //     PINTU_CELL.dst_translate[pos].x,
  //     PINTU_CELL.dst_translate[pos].y
  //   );
  context.rotate(PINTU_CELL.now_rotate[pos]);
  // 绘制顺序: 上右下左(刚好位于原点)
  let half_delta = delta / 2;
  context.beginPath();
  context.moveTo(-half_delta, -half_delta);
  const RADIUS =
      (delta * (PINTU_CELL.ONE_MINUS_RATE - PINTU_CELL.RATE)) / SQRT2;
  for (let k = 0; k < 4; ++k) {
    let p = [
      {
        x: -half_delta + PINTU_CELL.edge_delta.dx[k] * delta,
        y: -half_delta + PINTU_CELL.edge_delta.dy[k] * delta,
      },
      {
        x: -half_delta + PINTU_CELL.edge_delta.dx[k + 1] * delta,
        y: -half_delta + PINTU_CELL.edge_delta.dy[k + 1] * delta,
      },
    ];
    // 第一条小边
    context.lineTo(
        PINTU_CELL.ONE_MINUS_RATE * p[0].x + PINTU_CELL.RATE * p[1].x,
        PINTU_CELL.ONE_MINUS_RATE * p[0].y + PINTU_CELL.RATE * p[1].y);
    // 小半球
    if (edges[k] !== 0) {
      let s = bubble_angle.s[k], t = bubble_angle.t[k];
      let dire = false;
      if (!judge_bubble_direction(k, edges[k])) {
        s = bubble_angle_neg.s[k];
        t = bubble_angle_neg.t[k];
        dire = true;
      }
      context.arc(
          half_delta * PINTU_CELL.bubble_delta.dx[k] +
              ((k & 1) === 1 ? 1 : 0) * ((edges[k] * RADIUS) / SQRT2),
          half_delta * PINTU_CELL.bubble_delta.dy[k] +
              ((k & 1) === 1 ? 0 : 1) * ((edges[k] * RADIUS) / SQRT2),
          RADIUS, s, t, dire);
      //   console.log("DEBUG");
    } else {
      context.lineTo(
          PINTU_CELL.RATE * p[0].x + PINTU_CELL.ONE_MINUS_RATE * p[1].x,
          PINTU_CELL.RATE * p[0].y + PINTU_CELL.ONE_MINUS_RATE * p[1].y);
    }
    // 第二条小边
    context.lineTo(p[1].x, p[1].y);
  }
  context.closePath();
  if (point !== undefined) {
    if (mark_the_top) {
      // 不会进行绘制
      if (context.isPointInPath(point.x, point.y)) {
        // console.log("YES: " + pos);
        PINTU_CELL.mark_the_click_cell = pos;
      }
      context.restore();  // !!!!! 必须要 restore
      return;
    }
  }

  //   context.fillStyle = "red";
  //   context.fill();

  // 阴影边界
  if (point !== undefined && PINTU_CELL.mark_the_click_cell === pos) {
    context.shadowColor = PINTU.border_color;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 10;
  }
  // 正常绘制
  // (1) 这个解决方式有 BUG: 会覆盖之前绘制的图像
  // context.save();
  // context.globalCompositeOperation = "source-atop";
  // context.drawImage(
  //   IMAGE,
  //   PINTU_CELL.edge_size_px * (-j - 1 / 2),
  //   PINTU_CELL.edge_size_px * (-i - 1 / 2),
  //   PINTU.size,
  //   PINTU.size
  // );
  // context.restore();

  // (2) OK
  // 注意 pattern 的 transform 也是基于 canvas 原点的
  // context.save();
  const pattern = context.createPattern(IMAGE, 'repeat');
  let m = new DOMMatrix([1, 0, 0, 1, 0, 0]);
  m = m.translate(
      -PINTU_CELL.half_edge_size_px - j * PINTU_CELL.edge_size_px,
      -PINTU_CELL.half_edge_size_px - i * PINTU_CELL.edge_size_px);
  let s = Math.max(PINTU.size / IMAGE.width, PINTU.size / IMAGE.height);
  m = m.scale(s, s);
  pattern.setTransform(m);
  context.fillStyle = pattern;
  context.fill();
  // context.restore();

  context.stroke();
  context.restore();

  /**
   * 判断是否需要将小气泡翻转
   * @returns false(需要翻转)
   */
  function judge_bubble_direction(a, b) {
    // 0,-1
    // 1,+1
    // 2,+1
    // 3,-1
    return (
        (b === -1 && (a === 0 || a === 3)) ||
        (b === 1 && (a === 1 || a === 2)));
  }
}

/**
 * 判断拼图大小是否合法
 */
function check_pintu_size(size) {
  if (isNaN(size) || size > PINTU_CELL.MAX_SIZE || size < PINTU_CELL.MIN_SIZE) {
    let str = 'your size: ' + size + '\nsize must in [' + PINTU_CELL.MIN_SIZE +
        ',' + PINTU_CELL.MAX_SIZE + ']';
    // console.log(str);
    $('#choose_pintu_size').val('');
    return false;
  }
  return true;
}

/**
 * 测试生成的数据是否正确
 */
function t_position(size, canvas, context) {
  if (!check_pintu_size(size)) {
    return;
  }

  //   canvas.height = canvas.height;
  //   canvas.width = canvas.width;

  let a = PINTU_CELL.data_origin[size - PINTU_CELL.MIN_SIZE][t.for_t_position];
  let delta = PINTU.size / size;
  let j = t.for_t_position % size;
  let i = (t.for_t_position - j) / size;

  context.strokeStyle = PINTU.border_color;
  context.lineWidth = PINTU.border_line_width;
  context.strokeRect(
      PINTU.left + j * delta, PINTU.top + i * delta, delta, delta);
  let cx = PINTU.left + j * delta + delta / 2;
  let cy = PINTU.top + i * delta + delta / 2;
  let dx = [0, 1, 0, -1];
  let dy = [-1, 0, 1, 0];
  for (let k = 0; k < 4; ++k) {
    if (a[k] != 0) {
      context.beginPath();
      context.arc(
          cx + (dx[k] * delta) / 2 +
              (((k & 1) === 1 ? 1 : 0) * (a[k] * delta)) / 8,
          cy + (dy[k] * delta) / 2 +
              (((k & 1) === 1 ? 0 : 1) * (a[k] * delta)) / 8,
          delta / 8, 0, Math.PI * 2);
      context.stroke();
    }
  }

  t.for_t_position++;
  if (t.for_t_position >= size * size) {
    t.for_t_position = 0;
  }
}

/**
 * 生成所有 size 的拼图小格子数据
 */
function gen_cell() {
  PINTU_CELL.data_origin;
  for (let size = PINTU_CELL.MIN_SIZE; size <= PINTU_CELL.MAX_SIZE; ++size) {
    let size_minus_1 = size - 1;
    let aa = [];
    for (let i = 0; i < size; ++i) {
      for (let j = 0; j < size; ++j) {
        let a = [0, 0, 0, 0];  // 0123 -> 上右下左
        // 0,1,-1 -> 无,半圆朝右/下(+),半圆朝左/上(-)
        // a[0]
        if (i !== 0) {
          a[0] = 1 - ((j & 1) === 1 ? 0 : 2);
        }
        // a[1]
        if (j !== size_minus_1) {
          a[1] = 1 - ((i & 1) === 1 ? 2 : 0);
        }
        // a[2]
        if (i !== size_minus_1) {
          a[2] = 1 - ((j & 1) === 1 ? 0 : 2);
        }
        // a[3]
        if (j !== 0) {
          a[3] = 1 - ((i & 1) === 1 ? 2 : 0);
        }
        aa.push(a);
      }
    }
    PINTU_CELL.data_origin.push(aa);
  }
}

function detect_keyup(event) {
  if (!RESPONSE_KEYS.has(event.key)) {
    return;
  }

  keys[event.key] = false;

  //   console.log(event);
  let k = event.key;
  if (k === 'w' || k === 'a' || k === 's' || k === 'd') {
    KEY.translate_is_pressed = false;
  } else if (k === 'q' || k === 'e') {
    KEY.rotate_is_pressed = false;
  }
  draw_foreground();
}


/**
 * 背景绘制
 */
function draw_background() {
  let canvas = document.getElementById('canvas');
  let context = canvas.getContext('2d');

  clear_canvas(canvas);

  // 拼图小格
  let s = PINTU_CELL.size * PINTU_CELL.size;
  for (let i = 0; i < s; ++i) {
    if (i === PINTU_CELL.mark_the_click_cell) {
      continue;
    }
    draw_a_cell(context, i, null, false);
  }
}

/**
 * 键盘事件触发之后的前景绘制
 */
function draw_foreground() {
  let canvas_upper = document.getElementById('canvas_upper');
  let context_upper = canvas_upper.getContext('2d');

  clear_canvas(canvas_upper);
  // 将选中的区域画到最上层
  if (PINTU_CELL.mark_the_click_cell !== -1) {
    draw_a_cell(context_upper, PINTU_CELL.mark_the_click_cell, null, false);
  }
  check_ok();
}

/**
 * 按键事件
 */
function detect_keydown(event) {
  //   console.log(event);
  if (!RESPONSE_KEYS.has(event.key)) {
    return;
  }

  keys[event.key] = true;
}

/**
 * 每一帧处理按键事件
 */
function update() {
  // 未选中任何拼图小块, 则直接返回
  let pos = PINTU_CELL.mark_the_click_cell;
  if (pos === -1) {
    return;
  }

  // 未按键, 则直接返回
  let no_keys = true;
  for (let k in keys) {
    if (keys[k]) {
      no_keys = false;
      break;
    }
  }
  if (no_keys) {
    return;
  }

  // translate
  let delta_trans = translate_sensitive * KEY.delta;
  for (let k of TRANSLATE_KEYS) {
    if (keys[k]) {
      PINTU_CELL.now_translate[pos].x +=
          TRANSLATE_KEYS_DELTA[k].x * delta_trans;
      PINTU_CELL.now_translate[pos].y +=
          TRANSLATE_KEYS_DELTA[k].y * delta_trans;
    }
  }
  // rotate
  const delta_rot = rotate_sensitive * KEY.delta_angle;
  for (let k of ROTATE_KEYS) {
    if (keys[k]) {
      PINTU_CELL.now_rotate[pos] += ROTATE_KEYS_DELTA[k] * delta_rot;
    }
  }

  // console.log(keys);

  // (1) translate
  if (KEY.translate_is_pressed === false) {
    KEY.translate_is_pressed = true;
    KEY.draw_countdown = 0;
    KEY.delta = KEY.MIN_DELTA - KEY.delta_change;
  }
  KEY.delta = KEY.delta + KEY.delta_change;
  if (KEY.delta > KEY.MAX_DELTA) {
    KEY.delta = KEY.MAX_DELTA;
  }
  // (2) rotate
  if (KEY.rotate_is_pressed === false) {
    KEY.rotate_is_pressed = true;
    KEY.draw_countdown = 0;
    KEY.delta_angle = KEY.MIN_DELTA_ANGLE - KEY.delta_change_angle;
  }
  KEY.delta_angle = KEY.delta_angle + KEY.delta_change_angle;
  if (KEY.delta_angle > KEY.MAX_DELTA_ANGLE) {
    KEY.delta_angle = KEY.MAX_DELTA_ANGLE;
  }
  // 几次绘制一次
  if (KEY.draw_countdown-- > 0) {
    return;
  } else {
    KEY.draw_countdown = KEY.MAX_WAIT_TIME;
  }
  // console.log('DRAW!');
  // 绘制
  draw_foreground();
}

/**
 * 点击事件
 */
function detect_click(event) {
  let canvas = document.getElementById('canvas');
  let context = canvas.getContext('2d');
  let canvas_upper = document.getElementById('canvas_upper');
  let context_upper = canvas_upper.getContext('2d');

  let x = event.clientX - canvas.getBoundingClientRect().left;
  let y = event.clientY - canvas.getBoundingClientRect().top;
  let p = {x: x, y: y};

  //   console.log(x, y);
  // 初始化工作
  clear_canvas(canvas);
  clear_canvas(canvas_upper);

  PINTU_CELL.mark_the_click_cell = -1;
  // 不绘制
  let s = PINTU_CELL.size * PINTU_CELL.size;
  for (let i = 0; i < s; ++i) {
    draw_a_cell(context, i, p, true);
  }
  // 绘制
  for (let i = 0; i < s; ++i) {
    if (i === PINTU_CELL.mark_the_click_cell) {
      continue;
    }
    draw_a_cell(context, i, p, false);
  }
  // 将选中的区域画到最上层
  if (PINTU_CELL.mark_the_click_cell !== -1) {
    draw_a_cell(context_upper, PINTU_CELL.mark_the_click_cell, p, false);
  }
  check_ok();
}

/**
 * 设置画布属性、input 属性等
 */
function init_the_window() {
  let canvas = document.getElementById('canvas');

  let init_h = $(window).height(), init_w = $(window).width();
  let h = init_h * 0.9, w = init_w * 0.9;
  if (2 * h < w) {
    w = 2 * h;
  } else {
    h = w / 2;
  }
  canvas.height = h;
  canvas.width = w;
  canvas.style.marginTop = (init_h - h) / 2 + 'px';
  canvas.style.marginLeft = (init_w - w) / 2 + 'px';

  let canvas_upper = document.getElementById('canvas_upper');
  canvas_upper.height = h;
  canvas_upper.width = w;
  canvas_upper.style.marginTop = (init_h - h) / 2 + 'px';
  canvas_upper.style.marginLeft = (init_w - w) / 2 + 'px';

  let canvas_inner = document.getElementById('canvas_inner');
  canvas_inner.height = h;
  canvas_inner.width = w;
  canvas_inner.style.marginTop = (init_h - h) / 2 + 'px';
  canvas_inner.style.marginLeft = (init_w - w) / 2 + 'px';

  // 设置全局属性 CANVAS, PINTU
  CANVAS.width = w;
  CANVAS.height = h;
  // 注册事件
  canvas_upper.addEventListener('click', detect_click);
  document.addEventListener('keypress', detect_keydown);
  document.addEventListener('keyup', detect_keyup);

  PINTU.top = h * 0.1;
  PINTU.size = h * 0.8;
  PINTU.left = (w - PINTU.size) / 2;
  PINTU.border_line_width = Math.max(1, PINTU.size / 200);

  // PINTU_CELL
  PINTU_CELL.ONE_MINUS_RATE = 1 - PINTU_CELL.RATE;

  // 设置 input 属性
  let bb = canvas.getBoundingClientRect();
  let tip_warrper = $('#tip_warpper');
  tip_warrper.css('margin-left', bb.left + 'px');
  tip_warrper.css('margin-top', bb.top + 'px');
  tip_warrper.css('font-size', Math.max(5, CANVAS.width / 90) + 'px');
  tip_warrper.css('max-width', PINTU.left + 'px');

  let cps = $('#choose_pintu_size');
  cps.css('max-width', PINTU.left * 0.6 + 'px');
  cps.attr(
      'placeholder',
      '拼图大小 [' + PINTU_CELL.MIN_SIZE + ',' + PINTU_CELL.MAX_SIZE + ']');
  //   cps.attr("onkeydown", "change_pintu_size(this)");
  cps.on('keydown', function(e) {
    if (e.key === 'Enter') {
      let v = parseInt(cps.val());
      let size = 2;
      if (v == undefined || v == null || isNaN(v)) {
        size = 2;
      } else {
        size = Math.min(Math.max(v, PINTU_CELL.MIN_SIZE), PINTU_CELL.MAX_SIZE);
      }
      cps.val(size);
      change_pintu_size(size);
    }
  });
  // 取消旋转的按钮
  let cr = $('#cancel_rotate');
  cr.on('click', function(e) {
    let s = PINTU_CELL.now_rotate.length;
    PINTU_CELL.now_rotate = [];
    for (let i = 0; i < s; ++i) {
      PINTU_CELL.now_rotate.push(0);
    }
    draw_background();
    draw_foreground();
  });
  // 调节卡顿的按钮
  let kd = $('#kadun');
  let kd_num = $('#kadun_num').text('几帧绘制一次(' + KEY.MAX_WAIT_TIME + ')');
  kd.on('change', function(e) {
    // console.log(e);
    // console.log(this.value);
    KEY.MAX_WAIT_TIME = parseInt(this.value);
    kd_num.text('卡顿调节(' + KEY.MAX_WAIT_TIME + ')');
  });
  // 平移敏感度
  let td = $('#translate_delta');
  let td_num =
      $('#translate_delta_num').text('平移敏感度(' + translate_sensitive + ')');
  td.on('change', function(e) {
    translate_sensitive = parseFloat(this.value);
    td_num.text('平移敏感度(' + translate_sensitive + ')');
  });
  // 旋转敏感度
  let rd = $('#rotate_delta');
  let rd_num =
      $('#rotate_delta_num').text('旋转敏感度(' + rotate_sensitive + ')');
  rd.on('change', function(e) {
    rotate_sensitive = parseFloat(this.value);
    rd_num.text('旋转敏感度(' + rotate_sensitive + ')');
  });


  // 上传图片的按钮
  let uimg = document.getElementById('upload_img');
  let uimg_help = document.getElementById('upload_img_help');
  // 20 = 2*10 暂时写死,
  // 因为是通过 #tip_warpper > div { margin-top: 10px;} 设置的
  // 不知道怎么获取
  uimg_help.style.marginTop = 20 + uimg.offsetTop - uimg_help.offsetTop + 'px';
  upload_your_bgimg(uimg);
}

/**
 * 上传你的图片
 */
function upload_your_bgimg(uimg) {
  uimg.onchange = function() {
    // 获取到一个FileList对象中的第一个文件 (File 对象), 是我们上传的文件
    let fileData = this.files[0];
    let pattern = /^image/;

    console.log(fileData.type);

    if (!pattern.test(fileData.type)) {
      alert('图片格式不正确');
      return;
    }
    let reader = new FileReader();
    reader.readAsDataURL(
        fileData);  // 异步读取文件内容，结果用data:url的字符串形式表示
    // 当读取操作成功完成时调用
    reader.onload = function(e) {
      // 查看对象
      // console.log(e);
      // console.log(this.result);
      // 要的数据, 这里的 this 指向FileReader() 对象的实例 reader
      load_image(this.result).then(() => {
        draw_ref();
        draw_pintu_border();
        change_pintu_size(PINTU_CELL.size);
      });
    };
  };
}

/**
 * 修改拼图大小
 */
function change_pintu_size(size) {
  let canvas = document.getElementById('canvas');
  let context = canvas.getContext('2d');
  let canvas_upper = document.getElementById('canvas_upper');
  clear_canvas(canvas);
  clear_canvas(canvas_upper);

  //   console.log(size);
  if (!check_pintu_size(size)) {
    return;
  }
  // console.log("TODO: 改变拼图大小");
  // 1. 设置属性
  PINTU.ok_state = false;
  PINTU_CELL.size = size;
  PINTU_CELL.edge_size_px = PINTU.size / PINTU_CELL.size;
  PINTU_CELL.half_edge_size_px = PINTU_CELL.edge_size_px / 2;
  // 2. 生成新的数据结构
  // (1) PINTU_CELL
  // 清空
  PINTU_CELL.dst_translate = [];
  PINTU_CELL.now_translate = [];
  PINTU_CELL.now_rotate = [];
  // 生成数据
  let delta = PINTU_CELL.edge_size_px;
  const R = 1.5;  // 因为外面有小圈圈 bubble
  let r_delta = delta * R;
  let r_half_delta = PINTU_CELL.half_edge_size_px * R;
  for (let i = 0; i < size; ++i) {
    for (let j = 0; j < size; ++j) {
      // dst_translate
      PINTU_CELL.dst_translate.push({
        x: PINTU.left + (j + 1 / 2) * delta,
        y: PINTU.top + (i + 1 / 2) * delta,
      });
      // now_translate, 随机生成
      PINTU_CELL.now_translate.push({
        x: Math.random() * (CANVAS.width - r_delta) + r_half_delta,
        y: Math.random() * (CANVAS.height - r_delta) + r_half_delta,
        // x: PINTU_CELL.dst_translate[i * size + j].x,
        // y: PINTU_CELL.dst_translate[i * size + j].y,
      });
      // now_rotate
      PINTU_CELL.now_rotate.push(
          (Math.floor(Math.random() * 360) / 360) * PI2  // 保证最小变化为 1
                                                         // 度 PI2 / 8
      );
    }
  }
  // 3. 绘制
  draw_pintu(context);
}

/**
 * 清空 canvas
 * 必须在设置完 canvas 大小之后调用
 */
function clear_canvas(canvas) {
  canvas.width = canvas.width;
  canvas.height = canvas.height;
}

/** 绘制拼图的边框 */
function draw_pintu_border() {
  let canvas = document.getElementById('canvas_inner');
  let context = canvas.getContext('2d');

  context.strokeStyle = PINTU.border_color;
  context.lineWidth = PINTU.border_line_width;
  context.strokeRect(PINTU.left, PINTU.top, PINTU.size, PINTU.size);

  return;
  // 注意 pattern 的 transform 也是基于 canvas 原点的
  const pattern = context.createPattern(IMAGE, 'repeat');
  let m = new DOMMatrix([1, 0, 0, 1, 0, 0]);
  m = m.translate(PINTU.left, PINTU.top);
  let s = Math.max(PINTU.size / IMAGE.width, PINTU.size / IMAGE.height);
  m = m.scale(s, s);
  pattern.setTransform(m);
  context.fillStyle = pattern;
  // context.fillRect(0, 0, CANVAS.width, CANVAS.height);
  context.fillRect(PINTU.left, PINTU.top, PINTU.size, PINTU.size);
}

/**
 * 绘制参考图
 */
function draw_ref() {
  let canvas_inner = document.getElementById('canvas_inner');
  let context = canvas_inner.getContext('2d');

  let size = PINTU.left * 0.6;
  let x = (PINTU.left - size) / 2;
  let y = (CANVAS.height - size) / 2;

  context.save();
  context.shadowColor = 'yellow';
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 20;

  context.strokeStyle = 'black';
  context.lineWidth = PINTU.border_line_width;

  const pattern = context.createPattern(IMAGE, 'repeat');
  let m = new DOMMatrix([1, 0, 0, 1, 0, 0]);
  m = m.translate(x, y);
  let s = Math.max(size / IMAGE.width, size / IMAGE.height);
  m = m.scale(s, s);
  pattern.setTransform(m);
  context.fillStyle = pattern;

  context.fillRect(x, y, size, size);
  context.strokeRect(x, y, size, size);

  context.restore();
}

/**
 * 检查是否完成拼图
 */
function check_ok() {
  let s = PINTU_CELL.dst_translate.length;
  for (let i = 0; i < s; ++i) {
    // translate
    if (Math.abs(
            PINTU_CELL.dst_translate[i].x - PINTU_CELL.now_translate[i].x) <=
            KEY.OK_DELTA &&
        Math.abs(
            PINTU_CELL.dst_translate[i].y - PINTU_CELL.now_translate[i].y) <=
            KEY.OK_DELTA) {
      // rotate
      let rot = PINTU_CELL.now_rotate[i];
      while (rot < -EPS_PI2) {
        rot += PI2;
      }
      while (rot > EPS_PI2 + PI2) {
        rot -= PI2;
      }
      PINTU_CELL.now_rotate[i] = rot;
      if (Math.abs(rot) < KEY.OK_DELTA_ANGLE ||
          Math.abs(PI2 - rot) < KEY.OK_DELTA_ANGLE) {
        continue;
      }
    }
    PINTU.ok_state = false;  // 处理这样的情况: 拼好后又打乱了
    return false;
  }

  if (PINTU.ok_state === false) {
    PINTU.ok_state = true;
    alert('OK');
  }

  // 取消所有按键
  keys = {};
  return true;
}
