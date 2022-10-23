let time_bar;
/** 渲染一个数字 */
function render_digit(x, y, num) {
  context.fillStyle = "#005588";
  let digit = DIGIT[num];
  let len1 = digit.length;
  let len2 = digit[0].length;
  for (let i = 0; i < len1; ++i) {
    for (let j = 0; j < len2; ++j) {
      if (digit[i][j] === 1) {
        context.beginPath();
        context.arc(
          x + (2 * j + 1) * RADIUS_PLUS_1,
          y + (2 * i + 1) * RADIUS_PLUS_1,
          RADIUS,
          0,
          2 * Math.PI
        );
        context.closePath();
        context.fill();
      }
    }
  }
}

/** 渲染主函数 */
function render() {
  // 清空 canvas
  context.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

  // 渲染数字
  let hour = 12,
    minute = 34,
    second = 56;

  hour = parseInt(current_time / 3600);
  minute = parseInt((current_time - hour * 3600) / 60);
  second = parseInt(current_time % 60);

  // hour:minute:second
  let show_num = [
    parseInt(hour / 10),
    parseInt(hour % 10),
    10,
    parseInt(minute / 10),
    parseInt(minute % 10),
    10,
    parseInt(second / 10),
    parseInt(second % 10),
  ];

  for (let i in show_num) {
    render_digit(MARGIN_LEFT + digit_margin_left[i], MARGIN_TOP, show_num[i]);
  }

  // 渲染小球
  for (let i = 0; i < balls.length; i++) {
    context.beginPath();
    context.arc(balls[i].x, balls[i].y, RADIUS, 0, 2 * Math.PI);
    context.closePath();

    context.fillStyle = COLORS[balls[i].color];
    context.fill();
  }
}

/** 获取距离截止时间的秒数 */
function get_time_to_end_in_second() {
  /*
  let cur = new Date();
  let ret = end_time.getTime() - cur.getTime();
  ret = Math.round(ret / 1000);
  return ret > 0 ? ret : 0;
  */

  // /*
  // 时钟效果
  let d = new Date();
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  //   */
}

/** 增加小球 */
function add_ball(x, y, num) {
  let digit = DIGIT[num];
  let len1 = digit.length;
  let len2 = digit[0].length;
  for (let i = 0; i < len1; ++i) {
    for (let j = 0; j < len2; ++j) {
      if (digit[i][j] === 1) {
        let a_ball = {
          x: x + (2 * j + 1) * RADIUS_PLUS_1,
          y: y + (2 * i + 1) * RADIUS_PLUS_1,
          g: 1.5 + Math.random(),
          vx: (-1 + (Math.random() > 0.5 ? 2 : 0)) * (2 + Math.random() * 4),
          vy: -5,
          color: Math.floor(Math.random() * COLORS.length), // [0, 1)
        };
        balls.push(a_ball);
      }
    }
  }
}

/** 更新小球位置 */
function update_ball() {
  // 小球数量, 简单的优化1
  if (balls.length > MAX_BALLS) {
    balls.splice(0, balls.length - MAX_BALLS);
  }
  for (let i = 0; i < balls.length; i++) {
    balls[i].x += balls[i].vx;
    balls[i].y += balls[i].vy;
    balls[i].vy += balls[i].g;

    if (balls[i].y >= WINDOW_HEIGHT - RADIUS) {
      balls[i].y = WINDOW_HEIGHT - RADIUS;
      balls[i].vy = -balls[i].vy * 0.75;
    }
  }
  // 小球数量, 简单的优化2
  let cnt = 0;
  for (let i = 0; i < balls.length; i++) {
    if (balls[i].x >= RADIUS && balls[i].x + RADIUS <= WINDOW_WIDTH) {
      balls[cnt++] = balls[i];
    }
  }
  while (balls.length > cnt) {
    balls.pop();
  }
}

function update() {
  // 更新时间内容
  next_time = get_time_to_end_in_second();
  if (next_time !== current_time) {
    // 生成小球
    // current
    let c_hour = parseInt(current_time / 3600),
      c_minute = parseInt((current_time - c_hour * 3600) / 60),
      c_second = parseInt(current_time % 60);
    let current_num = [
      parseInt(c_hour / 10),
      parseInt(c_hour % 10),
      10,
      parseInt(c_minute / 10),
      parseInt(c_minute % 10),
      10,
      parseInt(c_second / 10),
      parseInt(c_second % 10),
    ];
    // next
    let n_hour = parseInt(next_time / 3600),
      n_minute = parseInt((next_time - n_hour * 3600) / 60),
      n_second = parseInt(next_time % 60);
    let next_num = [
      parseInt(n_hour / 10),
      parseInt(n_hour % 10),
      10,
      parseInt(n_minute / 10),
      parseInt(n_minute % 10),
      10,
      parseInt(n_second / 10),
      parseInt(n_second % 10),
    ];
    for (let i = 0; i < current_num.length; ++i) {
      if (current_num[i] !== next_num[i]) {
        add_ball(
          MARGIN_LEFT + digit_margin_left[i],
          MARGIN_TOP,
          current_num[i]
        );
      }
    }
    current_time = next_time;
  }

  // 更新小球位置
  update_ball();
}

function time_main() {
  // 屏幕自适应
  normal_the_screen();

  clear_canvas();
  // 获取倒计时时间
  current_time = get_time_to_end_in_second();

  time_bar = setInterval(() => {
    render();
    update();
  }, 50);
}
