let stars = [];
const STARS_NUM = 80;
let STAR_MAX_RADIUS, STAR_MIN_RADIUS;

/** 生成所有的星星 */
function gen_stars() {
  STAR_MAX_RADIUS = WINDOW_HEIGHT / 50;
  STAR_MIN_RADIUS = WINDOW_HEIGHT / 100;
  for (let i = 0; i < STARS_NUM; ++i) {
    let a_star = {
      x: Math.random() * WINDOW_WIDTH,
      y: -WINDOW_HEIGHT / 10 + (Math.random() * WINDOW_HEIGHT) / 20,
      dst_y: Math.random() * WINDOW_HEIGHT * 0.3,
      R: Math.random() * (STAR_MAX_RADIUS - STAR_MIN_RADIUS) + STAR_MIN_RADIUS,
      r_rate: Math.random() * 0.5 + 0.5,
      r_up: true,
      vy: Math.random() + 1,
      g: Math.random() * 2,
      max_bounces: Math.floor(Math.random() * 5) + 2,
      rotation: Math.random() * Math.PI,
      stop: false,
    };
    stars.push(a_star);
  }
}

/** 绘制一个星星 */
function draw_a_star(
  context,
  x,
  y,
  r,
  R,
  /* optional */ off_angle,
  /* optional */ fill_color
) {
  context.beginPath();
  let delta_angle = Math.PI / 5;
  let angle = delta_angle + (off_angle || 0);
  context.moveTo(r * Math.cos(angle) + x, r * Math.sin(angle) + y);
  for (let i = 1; i < 10; ++i) {
    angle += delta_angle;
    let r_tmp = (i & 1) === 0 ? r : R;
    context.lineTo(r_tmp * Math.cos(angle) + x, r_tmp * Math.sin(angle) + y);
  }
  context.closePath();
  context.shadowBlur = 10;
  context.shadowOffsetX = shadowOffsetY = 0;
  context.shadowColor = "#fffe33";

  context.lineJoin = "round";
  context.fillStyle = fill_color || "#fb3";
  context.fill();

  //   context.strokeStyle = "#fffe33";
  //   context.lineWidth = Math.max(2, R / 5);
  //   context.stroke();
}

/** 绘制所有的星星 */
function draw_stars(context) {
  // 生成所有的星星
  if (stars.length === 0) {
    gen_stars();
  }
  context.save();
  // 绘制动态的星星
  for (let i in stars) {
    let s = stars[i];
    draw_a_star(
      context,
      s.x,
      s.y,
      (s.R * s.r_rate) / 2,
      s.R * s.r_rate,
      s.rotation
    );
  }
  context.restore();
}

/** 更新星星位置 */
function update_stars() {
  for (let i in stars) {
    let s = stars[i];
    // 变化位置
    if (s.stop === false) {
      s.y += s.vy;
      s.vy += s.g;
      if (s.y >= s.dst_y) {
        s.vy = -s.vy * 0.5;
        if (s.max_bounces-- <= 0) {
          s.stop = true;
        }
      }
    }
    // 变化半径
    const R_CHANGE_RATE = 0.01;
    if (s.r_up) {
      s.r_rate += R_CHANGE_RATE;
      if (s.r_rate > 1.0) {
        s.r_up = false;
      }
    } else {
      s.r_rate -= R_CHANGE_RATE;
      if (s.r_rate < 0.5) {
        s.r_up = true;
      }
    }
  }
}