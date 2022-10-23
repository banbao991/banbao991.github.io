// 渐变

/** 线性渐变色 */
function t4_test1() {
  clear_canvas();

  // 线性渐变
  let grd = context.createLinearGradient(100, 100, 500, 500);
  // 超出部分显示边界的颜色
  grd.addColorStop(0.0, "#fff");
  grd.addColorStop(1.0, "#000");

  context.lineWidth = 20;
  context.fillStyle = grd;

  context.fillRect(0, 0, 600, 600);
}

/** 径向渐变 */
function t4_test2() {
  clear_canvas();
  // 定义在两个同心圆的基础
  let grd = context.createRadialGradient(300, 300, 0, 300, 300, 200);
  // 超出部分显示边界的颜色
  grd.addColorStop(0.0, "#fff");
  grd.addColorStop(1.0, "#000");

  context.lineWidth = 20;
  context.fillStyle = grd;

  context.fillRect(0, 0, 600, 600);
}

// 使用图片 pattern
function t4_test3() {
  clear_canvas();

  let img = new Image();
  img.src = "/resources/img/kits/xiaoxin-001.jpg";
  img.onload = () => {
    let pattern;
    // pattern = context.createPattern(img, "no-repeat");
    // pattern = context.createPattern(img, "repeat-x");
    // pattern = context.createPattern(img, "repeat-y");
    pattern = context.createPattern(img, "repeat");
    context.fillStyle = pattern;
    context.fillRect(0, 0, 600, 600);
  };
}

function create_bg_canvas() {
  let c = document.createElement("canvas");
  c.width = 100;
  c.height = 100;
  let cc = c.getContext("2d");
  draw_star(50, 50, 50, 25, 0, cc);
  cc.strokeStyle = "#fb5";
  cc.fillStyle = "#fb3";
  cc.lineWidth = 3;
  cc.lineJoin = "round";

  cc.fill();
  cc.stroke();
  return c;
}

// pattern 可以使用另外的 canvas 画布
// 还可以使用 video
function t4_test4() {
  clear_canvas();
  let bg_canvas = create_bg_canvas();
  let pattern = context.createPattern(bg_canvas, "repeat");
  context.fillStyle = pattern;
  context.fillRect(0, 0, 600, 600);
}

function test4_main() {
  //   t4_test1();
  //   t4_test2();
  //   t4_test3();
  //   t4_test4();
}
