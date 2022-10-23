// 其他内容

/** 使用内置的 html 组件 */
function t8_test1() {
  const gco_index = [0, 4, 5, 9];
  let idx = 3;

  clear_canvas();
  if (t8_control_borad === null) {
    t8_control_borad = d3
      .select("#canvas-wrapper")
      .append("div")
      .attr("id", "controller");
  }
  t8_control_borad.append("h1").text("Canvas");
  t8_control_borad.append("a").attr("id", "canvas-btn").text("change");
  t8_control_borad.append("h4").attr("id", "change_overlap").text(gco_type[gco_index[idx]]);

  t8_control_borad.select("#canvas-btn").on("click", () => {
    idx = (idx + 1) % gco_index.length;
    context.globalCompositeOperation = gco_type[gco_index[idx]];
    t8_control_borad.select("#change_overlap").text(gco_type[gco_index[idx]]);
  });

  // 添加小球
  balls = [];
  for (let i = 0; i < 50; ++i) {
    let r = Math.floor(Math.random() * 255),
      g = Math.floor(Math.random() * 255),
      b = Math.floor(Math.random() * 255),
      radius = Math.floor(Math.random() * 30 + 10);
    let a_ball = {
      color: "rgb(" + r + "," + g + "," + b + ")",
      radius: radius,
      x: Math.random() * (600 - 2 * radius) + radius,
      y: Math.random() * (600 - 2 * radius) + radius,
      vx: (Math.random() * 5 + 5) * (Math.random() > 0.5 ? -1 : 1),
      vy: (Math.random() * 5 + 5) * (Math.random() > 0.5 ? -1 : 1),
    };
    balls.push(a_ball);
  }

  context.globalCompositeOperation = gco_type[gco_index[idx]];
  t8_interval_1 = setInterval(() => {
    draw();
    update();
  }, 50);

  function draw() {
    context.clearRect(0, 0, 600, 600);
    for (let i in balls) {
      let a_ball = balls[i];
      context.fillStyle = a_ball.color;
      context.beginPath();
      context.arc(a_ball.x, a_ball.y, a_ball.radius, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
    }
  }

  function update() {
    for (let i in balls) {
      balls[i].x += balls[i].vx;
      balls[i].y += balls[i].vy;
      if (balls[i].x - balls[i].radius <= 0) {
        balls[i].vx = -balls[i].vx;
        balls[i].x = balls[i].radius;
      }
      if (balls[i].x + balls[i].radius >= 600) {
        balls[i].vx = -balls[i].vx;
        balls[i].x = 600 - balls[i].radius;
      }
      if (balls[i].y - balls[i].radius <= 0) {
        balls[i].vy = -balls[i].vy;
        balls[i].y = balls[i].radius;
      }
      if (balls[i].y + balls[i].radius >= 600) {
        balls[i].vy = -balls[i].vy;
        balls[i].y = 600 - balls[i].radius;
      }
    }
  }
}

/** 扩展 context */
function t8_test2() {
  clear_canvas();
  CanvasRenderingContext2D.prototype.fillStar = function (
    x,
    y,
    r1,
    r2,
    off_angle
  ) {
    this.beginPath();
    let delta_angle = Math.PI / 5;
    let angle = delta_angle + (off_angle || 0);
    this.moveTo(r1 * Math.cos(angle) + x, r1 * Math.sin(angle) + y);
    for (let i = 1; i < 10; ++i) {
      angle += delta_angle;
      let r = (i & 1) === 0 ? r1 : r2;
      this.lineTo(r * Math.cos(angle) + x, r * Math.sin(angle) + y);
    }
    this.closePath();
    this.fill();
  };

  context.fillStyle = "#058";
  context.fillStar(300, 300, 50, 100, 0);
  // 如果函数可能要用到其他函数的状态, 可以复写之前的函数
  // 例如 lineTo 需要用到 moveTo 的信息
  // 自己的函数如果需要用到 moveTo 的信息时, 可以复写 moveTo, 新添加一个变量用于记录位置
}

function test8_main() {
  //   t8_test1();
  t8_test2();
}
