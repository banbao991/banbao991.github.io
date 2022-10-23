// 基本图元绘制

/** 绘制直线 */
function t1_test1() {
  clear_canvas();
  context.beginPath();
  context.moveTo(100, 100);
  context.lineTo(500, 500);
  context.closePath();

  context.strokeStyle = "#005588";
  context.lineWidth = 5;
  context.stroke();
}

/** 绘制箭头 */
function t1_test2() {
  clear_canvas();
  context.beginPath();
  context.moveTo(50, 250);
  context.lineTo(350, 250);
  context.lineTo(350, 100);
  context.lineTo(550, 300);
  context.lineTo(350, 500);
  context.lineTo(350, 350);
  context.lineTo(50, 350);
  //   context.closePath();

  context.strokeStyle = "#005588";
  context.lineWidth = 5;
  context.stroke();
}

/** 绘制离散折线 */
function t1_test3() {
  clear_canvas();
  context.moveTo(50, 100);
  context.lineTo(150, 300);
  context.lineTo(50, 500);

  context.moveTo(250, 100);
  context.lineTo(350, 300);
  context.lineTo(250, 500);

  context.moveTo(450, 100);
  context.lineTo(550, 300);
  context.lineTo(450, 500);

  context.strokeStyle = "#005588";
  context.lineWidth = 5;
  context.stroke();
}

/** 绘制离散折线(不同) */
function t1_test4() {
  clear_canvas();
  // canvas 是状态机
  context.lineWidth = 5;

  context.beginPath(); // 第一个 beginPath 可以省略
  // beginPath 之后的 moveTo 可以使用 lineTo 代替
  // 相当于上一个点被 beginPath 清空
  context.moveTo(50, 100);
  context.lineTo(150, 300);
  context.lineTo(50, 500);
  //   context.closePath();
  context.strokeStyle = "red";
  context.stroke();

  context.beginPath();
  context.moveTo(250, 100);
  context.lineTo(350, 300);
  context.lineTo(250, 500);
  //   context.closePath();
  context.strokeStyle = "green";
  context.stroke();

  context.beginPath();
  context.moveTo(450, 100);
  context.lineTo(550, 300);
  context.lineTo(450, 500);
  //   context.closePath();
  context.strokeStyle = "blue";
  context.stroke();
}

/** 绘制箭头 */
function t1_test5() {
  clear_canvas();
  context.beginPath();
  context.moveTo(50, 250);
  context.lineTo(350, 250);
  context.lineTo(350, 100);
  context.lineTo(550, 300);
  context.lineTo(350, 500);
  context.lineTo(350, 350);
  context.lineTo(50, 350);
  //   context.lineTo(50, 250); // 最后相连的地方会缺角(线段有宽度)
  context.closePath(); // 会把缺角给补全

  // 注意描边和填充的顺序
  // 填充会将描边的内半部分给覆盖掉
  context.fillStyle = "yellow";
  context.fill();

  context.strokeStyle = "#005588";
  context.lineWidth = 5;
  context.stroke();
}

/** 绘制矩形函数 */
function draw_rect1(x, y, w, h, border_width, border_color, fill_color) {
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + w, y);
  context.lineTo(x + w, y + h);
  context.lineTo(x, y + h);
  context.closePath();

  context.strokeStyle = border_color;
  context.lineWidth = border_width;
  context.fillStyle = fill_color;

  context.fill();
  context.stroke();
}

function draw_rect2(x, y, w, h, border_width, border_color, fill_color) {
  context.beginPath();
  context.closePath();
  context.rect(x, y, w, h);
  context.strokeStyle = border_color;
  context.lineWidth = border_width;
  context.fillStyle = fill_color;

  context.fill();
  context.stroke();
}

function draw_rect3(x, y, w, h, border_width, border_color, fill_color) {
  context.strokeStyle = border_color;
  context.lineWidth = border_width;
  context.fillStyle = fill_color;

  context.fillRect(x, y, w, h);
  context.strokeRect(x, y, w, h);
}

/** 绘制矩形 */
function t1_test6() {
  clear_canvas();
  // 后绘制的图形会覆盖之前绘制的图形
  draw_rect1(100, 100, 200, 200, 5, "#058", "red");
  draw_rect2(200, 200, 200, 200, 5, "#058", "red");
  draw_rect3(300, 300, 200, 200, 5, "#058", "red");
}

function test1_main() {
  //   t1_test1();
  //   t1_test2();
  //   t1_test3();
  //   t1_test4();
  //   t1_test5();
  //   t1_test6();
}
