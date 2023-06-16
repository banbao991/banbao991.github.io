// 高级内容

/** 阴影 */
function t7_test1() {
  clear_canvas();
  context.fillStyle = "#058";
  context.shadowColor = "gray";
  context.shadowOffsetX = 10;
  context.shadowOffsetY = 30;
  context.shadowBlur = 5;
  context.fillRect(100, 100, 400, 150);
  context.fillRect(100, 400, 400, 150);
}

/** 全局透明度 globalAlpha=1 */
function t7_test2() {
  clear_canvas();

  context.globalAlpha = 0.7;
  for (let i = 0; i < 50; ++i) {
    let r = Math.floor(Math.random() * 255),
      g = Math.floor(Math.random() * 255),
      b = Math.floor(Math.random() * 255);
    context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    context.beginPath();
    context.arc(
      Math.random() * 600,
      Math.random() * 600,
      Math.random() * 50 + 1,
      0,
      2 * Math.PI
    );
    context.fill();
  }
}

/** 绘制图形重合情况下怎么处理 globalCompositeOperation */
function t7_test3() {
  function ff() {
    clear_canvas();
    if (t8_control_borad === null) {
      t8_control_borad = d3
        .select("#canvas-wrapper")
        .append("div")
        .attr("id", "controller");
    }
    t8_control_borad.append("h4").text("先红后蓝");
    t8_control_borad.append("h4").text("globalCompositeOperation");
    t8_control_borad.append("a").attr("id", "canvas-btn").text("change");
    t8_control_borad
      .append("h4")
      .attr("id", "change_overlap")
      .text(gco_type[gco_now_type]);

    t8_control_borad.select("#canvas-btn").on("click", () => {
      gco_now_type = (gco_now_type + 1) % gco_type.length;
      t8_control_borad.select("#change_overlap").text(gco_type[gco_now_type]);
      // context.clearRect(0, 0, 600, 600);
      draw();
    });
  }

  ff();
  draw();
  function draw() {
    ff();
    // draw
    context.fillStyle = "red";
    context.fillRect(100, 200, 200, 200);

    context.globalCompositeOperation = gco_type[gco_now_type];
    context.fillStyle = "blue";
    context.fillRect(200, 300, 200, 200);

    // 说明
    // context.globalCompositeOperation = gco_type[0];
    // context.fillStyle = "#058";
    // context.font = "bold 20px consolas";
    // context.textAlign = "center";
    // context.fillText("globalCompositeOperation = " + gco_type[gco_now_type], 300, 100);
  }
}

/** clip 和 剪辑区域 */
function t7_test4() {
  // 可以用于实现探照灯效果

  clear_canvas();
  context.fillStyle = "gray";
  context.fillRect(0, 0, 600, 600);

  context.beginPath();
  context.arc(300, 300, 100, 0, 2 * Math.PI);
  // clip 函数
  context.clip(); // 之后绘制的东西只保留在这块区域内的

  context.fillStyle = "blue";
  context.fillRect(0, 0, 600, 600);
}

/** 路径方向和剪纸效果 */
function t7_test5() {
  clear_canvas();
  // 内部还是外部, 使用非零环绕原则(射线法)
  // 圆环, 内外两个圆不同方向
  context.beginPath();
  context.arc(300, 300, 200, 0, 2 * Math.PI, true);
  context.arc(300, 300, 150, 0, 2 * Math.PI, false);
  context.closePath();

  context.fillStyle = "#058";
  context.shadowColor = "gray";
  context.shadowOffsetX = 10;
  context.shadowOffsetY = 10;
  context.shadowBlur = 10;
  context.fill();
}

/** clearRect() */
function t7_test6() {
  clear_canvas();
  t7_test5();
  // 清空操作
  context.clearRect(0, 280, 600, 40);
}

/** 交互 */

function draw_balls(x, y) {
  context.clearRect(0, 0, 600, 600);
  for (let i in balls) {
    let a_ball = balls[i];
    context.beginPath();
    context.arc(a_ball.x, a_ball.y, a_ball.r, 0, 2 * Math.PI);
    //   context.closePath();
    if (context.isPointInPath(x, y)) {
      context.fillStyle = "red";
    } else {
      context.fillStyle = "#058";
    }
    context.fill();
  }
}

function detect(event) {
  let x = event.clientX - canvas.getBoundingClientRect().left,
    y = event.clientY - canvas.getBoundingClientRect().top;
  draw_balls(x, y);
}

/** 交互 isPointInPath() */
function t7_test7() {
  clear_canvas();
  // 生成小球
  balls = [];
  while (balls.length < BALL_NUM) {
    let a_ball = {
      x: Math.random() * 600,
      y: Math.random() * 600,
      r: Math.random() * 20 + 50,
    };
    balls.push(a_ball);
  }

  // 绘制小球
  draw_balls(-100, -100);

  // 监听器
  canvas.addEventListener("mousemove", detect);
}

function test7_main() {
  //   t7_test1();
  //   t7_test2();
  //   t7_test3();
  //   t7_test4();
  //   t7_test5();
  //   t7_test6();
  //   t7_test7();
}
