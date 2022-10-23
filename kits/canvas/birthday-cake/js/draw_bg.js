/** 绘制背景 */
function draw_bg(context) {
  let sky_style = context.createRadialGradient(
    WINDOW_WIDTH / 2,
    WINDOW_HEIGHT,
    0,
    WINDOW_WIDTH / 2,
    WINDOW_HEIGHT,
    WINDOW_HEIGHT
  );
  sky_style.addColorStop(0.0, "#035");
  sky_style.addColorStop(1.0, "black");
  context.fillStyle = sky_style;
  context.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
}
