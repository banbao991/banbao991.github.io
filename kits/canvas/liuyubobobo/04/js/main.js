/* 支持 undo 操作 */
// 现在的想法是点击 undo, 重新绘制之前的所有笔画
let UNDO = {
  // 之前的所有路径
  paths: [], // { color:red, points: [start, {x:0, y:0, w:1}, ... , end] }
  // 现在的路径
  now_path: [],
};

// 内容占屏幕比例
let CONTENT_WINDOW_RATE = 0.95;
// 最大宽度
const MAX_CANVAS_WIDTH = 600;
let CANVAS_WIDTH = MAX_CANVAS_WIDTH;
let CANVAS_HEIGHT = MAX_CANVAS_WIDTH;
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

// 当前使用的颜色
let now_stroke_color = "black";

// 线条宽度相关参数
const LINE_WIDTH = {
  max_line_width: 30,
  min_line_width: 5,
  max_v: 10,
  min_v: 0.1,
  last_rate: 0.6,
};

// 鼠标事件
let mouse_state = {
  is_mouse_down: false,
  last_loc: { x: 0, y: 0 },
  last_time: 0,
  last_line_width: -1,
};

/** main */
function main() {
  init_canvas();
  mi_add_listener();
  btn_add_listener();

  // 绘制米字格
  draw_mi();
}

/** 清空 undo 中的记录 */
function clear_undo() {
  UNDO.now_path = [];
  UNDO.paths = [];
}

/** 为按钮注册事件 */
function btn_add_listener() {
  // undo
  $("#undo_btn").on("click", function (e) {
    // 先清空
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    draw_mi();
    // 再绘制
    UNDO.paths.pop(); // 清除最后一笔
    for (let i in UNDO.paths) {
      let p = UNDO.paths[i].points;
      let p_len = p.length - 1;

      // draw
      context.strokeStyle = UNDO.paths[i].color;
      for (let j = 0; j < p_len; ++j) {
        context.beginPath();
        context.moveTo(p[j].x, p[j].y);
        context.lineTo(p[j + 1].x, p[j + 1].y);

        context.lineWidth = p[j + 1].w;
        context.stroke();
      }
    }
  });

  // 清除按钮
  $("#clear_btn").on("click", function (e) {
    // 清空 undo 操作的记录
    clear_undo();
    // 清空 canvas
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    draw_mi();
  });

  // 换颜色
  $(".color_btn").on("click", function (e) {
    $(".color_btn").removeClass("color_btn_selected");
    $(this).addClass("color_btn_selected");
    now_stroke_color = $(this).css("background-color");
  });
}

/* 绘制米字格 */
function draw_mi() {
  context.save();
  // 1. 外边框
  let line_width = 6;
  let t_half = line_width / 2;
  context.beginPath();
  context.moveTo(t_half, t_half);
  context.lineTo(CANVAS_WIDTH - t_half, t_half);
  context.lineTo(CANVAS_WIDTH - t_half, CANVAS_HEIGHT - t_half);
  context.lineTo(t_half, CANVAS_HEIGHT - t_half);
  context.closePath();

  context.lineWidth = line_width;
  context.strokeStyle = "rgb(230,11,9)";

  context.stroke();

  // 2. 米字
  let lines = [
    { x1: 0, y1: 0, x2: CANVAS_WIDTH, y2: CANVAS_HEIGHT }, // \
    { x1: CANVAS_WIDTH, y1: 0, x2: 0, y2: CANVAS_HEIGHT }, // /
    { x1: 0, y1: CANVAS_HEIGHT / 2, x2: CANVAS_WIDTH, y2: CANVAS_HEIGHT / 2 }, // -
    { x1: CANVAS_WIDTH / 2, y1: 0, x2: CANVAS_WIDTH / 2, y2: CANVAS_HEIGHT }, // |
  ];

  context.lineWidth = 1;
  context.setLineDash([5, 5]);

  for (let i in lines) {
    let l = lines[i];
    context.beginPath();
    context.moveTo(l.x1, l.y1);
    context.lineTo(l.x2, l.y2);
    context.stroke();
  }

  context.restore();
}

/** 屏幕坐标系到 canvas 坐标系的转换 */
function windows2canvas(x, y) {
  let bbox = canvas.getBoundingClientRect();
  return { x: Math.round(x - bbox.left), y: Math.round(y - bbox.top) };
}

/** 计算两点之间的距离 */
function calc_distance(loc1, loc2) {
  let dx = loc1.x - loc2.x,
    dy = loc1.y - loc2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// 事件
/** 开始绘制事件 */
function begin_stroke(point) {
  mouse_state.is_mouse_down = true;
  // console.log("down");
  mouse_state.last_loc = windows2canvas(point.x, point.y);
  mouse_state.last_time = new Date().getTime();
  // undo
  UNDO.now_path = [];
  UNDO.now_path.push({
    x: mouse_state.last_loc.x,
    y: mouse_state.last_loc.y,
    w: 0, // 没有用
  });
}

/** 绘制的过程事件 */
function move_stroke(point) {
  let cur_loc = windows2canvas(point.x, point.y);
  let cur_time = new Date().getTime();
  // 绘制事件
  context.beginPath();
  context.moveTo(mouse_state.last_loc.x, mouse_state.last_loc.y);
  context.lineTo(cur_loc.x, cur_loc.y);

  // 粗线条断断续续问题解决
  context.lineCap = "round";
  context.lineJoin = "round";

  // 根据笔画的速度来决定线条粗细
  let d = calc_distance(cur_loc, mouse_state.last_loc); // 距离
  let t = cur_time - mouse_state.last_time; // 时间
  let line_width = calc_line_width(d, t); // 计算出来的线条宽度
  context.lineWidth = line_width;
  context.strokeStyle = now_stroke_color;
  context.stroke();
  mouse_state.last_loc = cur_loc;
  mouse_state.last_time = cur_time;

  // undo
  UNDO.now_path.push({ x: cur_loc.x, y: cur_loc.y, w: line_width });
}

/** 结束绘制事件 */
function end_stroke() {
  // undo
  if (mouse_state.is_mouse_down) {
    UNDO.paths.push({ color: now_stroke_color, points: UNDO.now_path });
    UNDO.now_path = [];
  }

  mouse_state.is_mouse_down = false;
}

/** 事件注册 */
function mi_add_listener() {
  // 1. 添加鼠标事件
  canvas.onmousedown = function (e) {
    // 阻止默认响应函数(例如浏览器中上下移动页面)
    e.preventDefault();
    begin_stroke({ x: e.clientX, y: e.clientY });
  };

  canvas.onmouseup = function (e) {
    e.preventDefault();
    end_stroke();
    // console.log("up");
  };

  canvas.onmouseout = function (e) {
    e.preventDefault();
    end_stroke();
    // console.log("out");
  };

  canvas.onmousemove = function (e) {
    e.preventDefault();
    // console.log("move");
    if (mouse_state.is_mouse_down) {
      move_stroke({ x: e.clientX, y: e.clientY });
    }
  };

  // 2. 添加触控事件
  canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
    // 可能有多点触控
    let touch = e.touches[0];
    begin_stroke({ x: touch.pageX, y: touch.pageY });
  });

  canvas.addEventListener("touchmove", function (e) {
    e.preventDefault();
    if (mouse_state.is_mouse_down) {
      let touch = e.touches[0];
      move_stroke({ x: touch.pageX, y: touch.pageY });
    }
  });

  canvas.addEventListener("touchend", function (e) {
    e.preventDefault();
    end_stroke();
  });
}

/** 计算线条宽度 */
function calc_line_width(d, t) {
  let v = d / t;
  let ret = 0;
  if (v <= LINE_WIDTH.min_v) {
    ret = LINE_WIDTH.max_line_width;
  } else if (v >= LINE_WIDTH.max_v) {
    ret = LINE_WIDTH.min_line_width;
  } else {
    ret =
      LINE_WIDTH.max_line_width -
      ((v - LINE_WIDTH.min_v) / (LINE_WIDTH.max_v - LINE_WIDTH.min_v)) *
        (LINE_WIDTH.max_line_width - LINE_WIDTH.min_line_width);
  }

  // 为了保证线条平滑, 我们使用上一次计算出来的信息
  if (mouse_state.last_line_width != -1) {
    ret =
      mouse_state.last_line_width * LINE_WIDTH.last_rate +
      ret * (1 - LINE_WIDTH.last_rate);
  }
  mouse_state.last_line_width = ret;
  return ret;
}

/** 初始化 canvas */
function init_canvas() {
  // 屏幕自适应
  let w = $(window).width();
  let h = $(window).height();
  w = Math.min(w, h) * CONTENT_WINDOW_RATE;
  w = Math.min(MAX_CANVAS_WIDTH, w); // 最大设置为 MAX_CANVAS_WIDTH

  // 设置分辨率 canvas
  CANVAS_HEIGHT = CANVAS_WIDTH = w;
  canvas.height = w;
  canvas.width = w;

  let t = LINE_WIDTH.max_line_width;
  LINE_WIDTH.max_line_width = (w / MAX_CANVAS_WIDTH) * t;
  // controller
  $("#controller").width(w + "px");
}
