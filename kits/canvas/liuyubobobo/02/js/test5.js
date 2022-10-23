// 曲线的绘制

// arc 函数
function t5_test1() {
  clear_canvas();
  context.lineWidth = 5;
  context.strokeStyle = "blue";

  context.beginPath();
  context.arc(300, 300, 200, 0, 1.5 * Math.PI, true);
  //   context.closePath();

  context.stroke();
}

/** 圆角矩形(左上角的内顶点在原点) */
function path_rounded_rectangle(cxt, w, h, r) {
  cxt.beginPath();
  cxt.arc(0, 0, r, 1.5 * Math.PI, Math.PI, true);
  cxt.lineTo(-r, h);
  cxt.arc(0, h, r, Math.PI, 0.5 * Math.PI, true);
  cxt.lineTo(0, r + h);
  cxt.arc(w, h, r, 0.5 * Math.PI, 0, true);
  cxt.lineTo(r + w, h);
  cxt.arc(w, 0, r, 0, 1.5 * Math.PI, true);
  cxt.closePath();
}

// x,y 矩形的中心
function draw_rounded_corner_rectangle(cxt, x, y, w, h, r) {
  cxt.save();
  cxt.translate(x - w / 2, y - h / 2);
  path_rounded_rectangle(cxt, w, h, r);
  cxt.strokeStyle = "black";
  cxt.lineWidth = 5;
  cxt.stroke();
  cxt.restore();
}

// 绘制圆角矩形
function t5_test2() {
  clear_canvas();
  draw_rounded_corner_rectangle(context, 300, 303, 400, 400, 20);
}

// arcTo
function t5_test3() {
  clear_canvas();
  // context.arcTo(x1, y1, x2, y2, radius);
  // (x0,y0)--(x1,y1), (x1,y1)--(x2,y2)
  // 弧线与上面两条直线相切, 半径为 radius
  // 起始点为 (x0,y0), 但是终止点不一定是 (x2,y2)
  // 前面不足的话用直线补全, 后面不足则直接省略

  // baseline
  context.strokeStyle = "#058";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(100, 100);
  context.lineTo(500, 100);
  context.lineTo(500, 500);
  //   context.closePath();
  context.stroke();

  context.strokeStyle = "red";
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(100, 100);
  context.arcTo(500, 100, 500, 500, 200); // 半径过大会先逆向画一条直线
  //   context.closePath();

  context.stroke();
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function path_moon(cxt, d) {
  cxt.beginPath();
  cxt.arc(0, 0, 1, 0.5 * Math.PI, 1.5 * Math.PI, true);
  cxt.moveTo(0, -1);
  // 1.
  cxt.arcTo(d, 0, 0, 1, distance(0, -1, d, 0) / Math.abs(d));
  // 2. 贝塞尔 2 次曲线
  //   cxt.quadraticCurveTo(d, 0, 0, 1);
  // 3. 贝塞尔 3 次曲线

  cxt.closePath();
}

function fill_moon(cxt, d, x, y, r, rot, fill_color) {
  cxt.save();
  cxt.translate(x, y);
  cxt.rotate(rot);
  cxt.scale(r, r);
  path_moon(cxt, d);
  cxt.fillStyle = fill_color || "#fb5";
  cxt.fill();
  cxt.restore();
}

/** 绘制弯月 */
function t5_test4() {
  clear_canvas();
  fill_moon(context, 1, 300, 300, 100, 0);
}

function test5_main() {
  //   t5_test1();
  //   t5_test2();
  //   t5_test3();
  //   t5_test4();
}
