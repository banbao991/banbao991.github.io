// 图形变换

/** 绘制一个五角星 */
function draw_star_with_style(x, y, w, h, rot) {
  draw_star(x, y, w, h, rot);
  context.strokeStyle = "#fb5";
  context.fillStyle = "#fb3";
  context.lineWidth = 3;
  context.lineJoin = "round";

  context.fill();
  context.stroke();
}

/** 绘制若干五角星 */
function t3_test1() {
  clear_canvas();
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  for (let i = 0; i < 200; ++i) {
    let r = Math.random() * 10 + 10;
    let x = Math.random() * canvas.clientWidth;
    let y = Math.random() * canvas.clientHeight;
    let a = Math.random() * 2 * Math.PI;
    draw_star_with_style(x, y, r, r / 2.0, a);
  }
}

/** 平移变换 */
function t3_test2() {
  clear_canvas();

  context.fillStyle = "red";
  context.translate(100, 100); // 需要在 fillRect 之前
  context.fillRect(0, 0, 200, 200);
  context.fill();
  //   context.translate(-100, -100); // 解除后效性

  // !!!! 图形变换函数是叠加的
  context.fillStyle = "green";
  context.translate(300, 300);
  context.fillRect(0, 0, 200, 200);
  context.fill();
}

/** 保存状态 */
function t3_test3() {
  clear_canvas();

  context.save(); // 保存所有状态
  context.fillStyle = "red";
  context.translate(100, 100);
  context.fillRect(0, 0, 200, 200);
  context.fill();
  //   context.translate(-100, -100); // 解除后效性

  context.restore(); // 恢复状态
  context.fillStyle = "green";
  context.translate(300, 300);
  context.fillRect(0, 0, 200, 200);
  context.fill();
}

/** translate / rotate / scale / 变换矩阵 */
function t3_test4() {
  clear_canvas();
  // scale 同时会修改其他属性
  // 齐次坐标, 变换矩阵
  // context.transform(a, b, c, d, e, f);
  ///////////
  // a c e //
  // b d f //
  // 0 0 1 //
  ///////////

  context.strokeStyle = "#058";
  context.fillStyle = "red";
  context.lineWidth = 10;

  context.save();

  //   context.transform(2, 0, 0, 1.5, 100, 0);
  // rotate 是相对于左上角, 画布旋转
  // 变换顺序: !!!先出现, **后**变换!!!
  context.transform(1, 0, 0, 2, 0, 0);
  context.transform(1, 0, 0, 1, 100, 0);
  context.fillRect(50, 50, 100, 100);
  context.strokeRect(50, 50, 100, 100);
  // transform 的下效果也是叠加
  // 但是可以通过 setTransform 进行设置(取消之前的叠加)
  context.restore();
}

function test3_main() {
  //   t3_test1();
  //   t3_test2();
  //   t3_test3();
}
