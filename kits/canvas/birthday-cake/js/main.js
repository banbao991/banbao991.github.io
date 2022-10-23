// 全局变量
let WINDOW_HEIGHT, WINDOW_WIDTH;
const WINDOW_RATE = 0.9;
const W2H = 16 / 9;
let render_bar;

// 用于存储所有的球属性
let balls = [];

/** 设置画布大小 */
function check_canvas_size() {
  WINDOW_HEIGHT = document.body.clientHeight * WINDOW_RATE;
  WINDOW_WIDTH = document.body.clientWidth * WINDOW_RATE;
  let tmp = WINDOW_HEIGHT * W2H;
  if (tmp < WINDOW_WIDTH) {
    WINDOW_WIDTH = tmp;
  } else {
    WINDOW_HEIGHT = WINDOW_WIDTH / W2H;
  }
  canvas.width = WINDOW_WIDTH;
  canvas.height = WINDOW_HEIGHT;
}

/** 绘制主逻辑 */
function render(context) {
  // 1. 绘制背景
  draw_bg(context);
  // 2(*1). 星星
  draw_stars(context);
  // 3(*2). 蛋糕
  draw_cake(context);
  //   for (let i in position_y) {
  //     position_y[i] = position_y_dst;
  //     position_idx = 7;
  //   }
  // 4. 小礼炮
  draw_boom(context);
  // 5.(*3) 小球
  draw_balls(context);
  // 6. 文字和图片
  draw_words_and_pics(context);
}

function update() {
  // *1. 星星
  update_stars();
  // *2. 蛋糕
  update_cake();
  // *3. 小球
  update_balls();
  // *4. 碎片
  update_boom_frag();
}

/** main */
function main(context) {
  check_canvas_size();

  //   let cnt = 0;
  render_bar = setInterval(() => {
    render(context);
    update();
    // if (cnt++ > 200) {
    //   clearInterval(render_bar);
    // }
  }, 50);
}

/** 更新小球位置 */
function update_balls() {
  let cnt = 0;
  for (let i in balls) {
    if (balls[i].update_position(WINDOW_WIDTH, WINDOW_HEIGHT)) {
      balls[cnt++] = balls[i];
    }
  }
  while (balls.length > cnt) {
    balls.pop();
  }
}

/** 绘制小球 */
function draw_balls(context) {
  for (let i in balls) {
    let a_ball = balls[i];
    context.beginPath();
    context.arc(a_ball.x, a_ball.y, a_ball.r, 0, 2 * Math.PI);
    context.fillStyle = a_ball.color;
    context.fill();
  }
}

/** 获取一个颜色 */
function get_a_color() {
  let r = Math.floor(Math.random() * 255),
    g = Math.floor(Math.random() * 255),
    b = Math.floor(Math.random() * 255);
  return "rgb(" + r + "," + g + "," + b + ")";
}
