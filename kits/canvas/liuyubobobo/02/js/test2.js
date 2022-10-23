// 线条属性

/** lineCap */
function t2_test1() {
  clear_canvas();
  // baseline
  context.lineWidth = 1;
  context.strokeStyle = "blue";

  context.beginPath();
  context.moveTo(100, 50);
  context.lineTo(100, 550);
  context.stroke();

  context.beginPath();
  context.moveTo(500, 50);
  context.lineTo(500, 550);
  context.stroke();

  // 3 种属性
  context.lineWidth = 50;
  context.strokeStyle = "red";

  context.beginPath();
  context.moveTo(100, 100);
  context.lineTo(300, 50);
  context.lineTo(500, 100);
  context.lineCap = "butt";
  context.stroke();

  context.beginPath();
  context.moveTo(100, 300);
  context.lineTo(300, 200);
  context.lineTo(500, 300);
  context.lineCap = "square"; // 同时可以实现 closePath 接合相连点的功能 t1_test5()
  context.stroke();

  context.beginPath();
  context.moveTo(100, 500);
  context.lineTo(300, 400);
  context.lineTo(500, 500);
  context.lineCap = "round"; // 线段与线段的衔接还是尖角, 只对端点有效
  context.stroke();
}

/** 画一个五角星 */
function t2_test2() {
  clear_canvas();
  draw_star(300, 300, 50, 100, Math.PI / 5);
  context.strokeStyle = "red";
  context.lineWidth = 10;
  context.stroke();
}

/** lineJoin */
function t2_test3() {
  clear_canvas();
  // 3 种属性
  context.lineWidth = 20;

  draw_star(200, 200, 50, 100, 0);
  context.lineJoin = "miter";
  context.strokeStyle = "red";
  context.stroke();

  draw_star(350, 450, 50, 100, 0);
  context.lineJoin = "bevel";
  context.strokeStyle = "green";

  context.stroke();

  draw_star(450, 150, 50, 100, 0);
  context.lineJoin = "round";
  context.strokeStyle = "blue";

  context.stroke();
}

/** miterLimit */
function t2_test4() {
  clear_canvas();
  // 3 种属性
  context.lineWidth = 20;
  context.lineJoin = "miter";

  draw_star(200, 200, 50, 100, 0);
  context.strokeStyle = "red";
  context.stroke();

  draw_star(350, 450, 20, 100, 0);
  context.strokeStyle = "green";

  context.stroke();

  // 当连接处的内外距离超过 miterLimit 时, 连接方式会从 miter 变为 bevel
  // miterLimit 指的距离是线条外边缘到(虚拟延长)相交出来的角的距离
  draw_star(450, 150, 10, 100, 0);
  context.strokeStyle = "blue";

  context.stroke();
}

function test2_main() {
  //   t2_test1();
  //   t2_test2();
  //   t2_test3();
  //   t2_test4();
}
