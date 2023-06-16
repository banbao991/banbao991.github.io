let DATA;
const MAX_CANVAS_WIDTH = 600;
let CONTENT_WINDOW_RATE = 0.95; // 内容占屏幕比例
let CANVAS_HEIGHT, CANVAS_WIDTH;
let DATE_DST = new Date(2021, 11, 25, 8, 30, 0); // 2021.12.25.08:30:00
const SECONDS = [86400, 3600, 60];
let JSON_INDEX = [11, 0, 1, 2, 3, 5, 7, 8, 9, 10];
let JSON_NUM = [1, 1, 1, 1, 2, 2, 1, 1, 1, 1];
let word_start_height = 0;
let c_time = [];

let RENDER_MAIN = {
  // 处理了一个数字多笔画的问题
  now_num: -1, // 现在是第几个数字(4->1)
  total_num: 0, // 一共有多少个数字(4->1)
  start_base_point: { x: 0, y: 0, w: 0, h: 0 },
  first_point: false,
  now_path: [],
  points: [],
  use_last_base: [],
  in_process: false,
  render_first_flag: true,
};

function main(canvas) {
  // 读取数据
  d3.json("assets/num.json").then(function (data) {
    DATA = data;
    deal(canvas);
  });
}

/* 初始化 canvas */
function init_canvas() {
  // 屏幕自适应
  let w = $(window).width();
  let h = $(window).height();
  w = Math.min(MAX_CANVAS_WIDTH, w); // 最大设置为 MAX_CANVAS_WIDTH
  CANVAS_HEIGHT = CANVAS_WIDTH = w;
  canvas.height = w;
  canvas.width = w;
  word_start_height = CANVAS_HEIGHT / 5;
  RENDER_MAIN.start_base_point.y = (CANVAS_HEIGHT * 3) / 10;
  RENDER_MAIN.start_base_point.h = (CANVAS_WIDTH * 2) / 5;
}

/* 绘制文字 */
function draw_words(context, str, x, y) {
  context.fillStyle = "black";
  context.font = "bold 50px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "ideographic";
  context.fillText(str, x, y);
}

/* 主要处理函数 */
function deal(canvas) {
  let context = canvas.getContext("2d");
  init_canvas(canvas);
  //   draw_main(context);
  setInterval(() => {
    draw_main(context);
  }, 50);
}

// 计算时间
function calc_time() {
  let now_time = new Date();
  let dis = (DATE_DST.getTime() - now_time.getTime()) / 1000;
  if (dis < 0) {
    dis = 0;
  }
  // day, hour, minute, second
  c_time = [0, 0, 0, 0];
  for (let i = 0; i < SECONDS.length; ++i) {
    let t = parseInt(dis / SECONDS[i]);
    c_time[i] = t;
    dis -= t * SECONDS[i];
  }
  c_time[c_time.length - 1] = parseInt(Math.round(dis));
}

function draw_main(context) {
  function PrefixZero(num, n) {
    return (Array(n).join(0) + num).slice(-n);
  }
  // 计算时间
  calc_time();
  // 写文字
  // 只绘制一次
  if (RENDER_MAIN.render_first_flag) {
    // draw_words(context, "离考研还有", CANVAS_WIDTH / 2, word_start_height);
  }
  // 逐帧绘制数字
  draw_num(context);
  if (RENDER_MAIN.in_process === false) {
    draw_words(
      context,
      PrefixZero(c_time[1], 2) +
        " 时 " +
        PrefixZero(c_time[2], 2) +
        " 分 " +
        PrefixZero(c_time[3], 2) +
        " 秒 ",
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - word_start_height / 2
    );
  }
}

function draw_num(context) {
  if (RENDER_MAIN.in_process) {
    return;
  }
  // 首次绘制
  if (RENDER_MAIN.render_first_flag) {
    RENDER_MAIN.render_first_flag = false;
    let nums = [];
    let t1 = c_time[0];
    let t_first = true;
    while (t_first || t1 > 0) {
      t_first = false;
      let tt1 = t1 % 10;
      nums.push(tt1);
      t1 = (t1 - tt1) / 10;
    }
    RENDER_MAIN.total_num = nums.length;
    RENDER_MAIN.start_base_point.w = RENDER_MAIN.start_base_point.h / 2;

    // 深拷贝路径
    RENDER_MAIN.points = [];
    while (nums.length > 0) {
      let t2 = nums.pop();
      RENDER_MAIN.use_last_base.push(false);
      for (let i = 0; i < JSON_NUM[t2]; ++i) {
        if (i !== 0) {
          RENDER_MAIN.use_last_base.push(true);
        }
        RENDER_MAIN.points.push(DATA.paths[JSON_INDEX[t2] + i].points.concat());
      }
    }
    render_per_frame(context);
  } else {
    let h = RENDER_MAIN.start_base_point.y + RENDER_MAIN.start_base_point.h;
    context.clearRect(0, h, CANVAS_WIDTH, CANVAS_HEIGHT - h);
  }
}

function get_x_y(t_point) {
  let x =
      (t_point.x / DATA.width) * RENDER_MAIN.start_base_point.w +
      RENDER_MAIN.start_base_point.x,
    y =
      (t_point.y / DATA.height) * RENDER_MAIN.start_base_point.h +
      RENDER_MAIN.start_base_point.y;
  return { x: x, y: y };
}

/* 逐帧绘制 */
function render_per_frame(context) {
  RENDER_MAIN.in_process = true;
  let render_main = function () {
    if (RENDER_MAIN.first_point) {
      RENDER_MAIN.first_point = false;
      let t_point = RENDER_MAIN.now_path[0];
      t_point = get_x_y(t_point);
      context.moveTo(t_point.x, t_point.y);
    } else if (RENDER_MAIN.now_path.length) {
      let t_point = RENDER_MAIN.now_path.shift();
      context.lineWidth =
        (t_point.w / DATA.width) * RENDER_MAIN.start_base_point.w;
      context.lineCap = "round";
      context.lineJoin = "round";

      t_point = get_x_y(t_point);
      context.lineTo(t_point.x, t_point.y);
      context.stroke();
    } else {
      RENDER_MAIN.first_point = true;
      if (RENDER_MAIN.points.length) {
        RENDER_MAIN.now_path = RENDER_MAIN.points.shift();
        if (RENDER_MAIN.use_last_base.shift() === false) {
          ++RENDER_MAIN.now_num;
          RENDER_MAIN.start_base_point.x =
            CANVAS_WIDTH / 2 -
            (RENDER_MAIN.start_base_point.w * RENDER_MAIN.total_num) / 2 +
            (RENDER_MAIN.now_num * RENDER_MAIN.start_base_point.h) / 2;
        }
      } else {
        RENDER_MAIN.in_process = false;
        return;
      }
    }
    requestAnimationFrame(render_main);
  };
  render_main();
}
