function test_ball_main() {
  let ball = { x: 512, y: 100, r: 20, g: 2, vx: -4, vy: 0, color: "#005588" };
  function render() {
    clear_canvas();
    context.beginPath();
    context.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    context.closePath();
    context.fillStyle = ball.color;
    context.fill();
  }

  function update() {
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vy += ball.g;
    // 边缘检测(左右上弹性, 下非弹性)
    // 下
    if (ball.y + ball.r >= WINDOW_HEIGHT) {
      ball.y = WINDOW_HEIGHT - ball.r;
      ball.vy = -ball.vy * 0.5; // 阻尼
    }
    // 上
    if (ball.y <= ball.r) {
      ball.y = ball.r;
      ball.vy = -ball.vy;
    }
    // 右
    if (ball.x + ball.r >= WINDOW_WIDTH) {
      ball.x = WINDOW_WIDTH - ball.r;
      ball.vx = -ball.vx;
    }
    // 左
    if (ball.x <= ball.r) {
      ball.x = ball.r;
      ball.vx = -ball.vx;
    }
    // TODO 遗留问题, 小球上下停不下来
  }

  setInterval(() => {
    render();
    update();
  }, 20);
}
