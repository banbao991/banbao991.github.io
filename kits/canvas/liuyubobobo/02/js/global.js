let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

let WINDOW_WIDTH = 600;
let WINDOW_HEIGHT = 600;

// test8.js
let t8_interval_1 = null;
let t8_control_borad = d3.select("#controller");

function clear_canvas() {
  canvas.height = WINDOW_HEIGHT;
  canvas.width = WINDOW_WIDTH;
  clearInterval(t8_interval_1);
  canvas.removeEventListener("mousemove", detect);

  if (t8_control_borad !== null) {
    // t8_control_borad.selectAll("*").remove();
    t8_control_borad.remove();
    t8_control_borad = null;
  }
}

/** 绘制五角星 */
function draw_star(x, y, r1, r2, off_angle, cxt) {
  if (cxt === undefined) {
    cxt = context;
  }
  cxt.beginPath();
  let delta_angle = Math.PI / 5;
  let angle = delta_angle + off_angle;
  cxt.moveTo(r1 * Math.cos(angle) + x, r1 * Math.sin(angle) + y);
  for (let i = 1; i < 10; ++i) {
    angle += delta_angle;
    let r = (i & 1) === 0 ? r1 : r2;
    cxt.lineTo(r * Math.cos(angle) + x, r * Math.sin(angle) + y);
  }
  cxt.closePath();
}

/** 小球 */
let balls = [];
const BALL_NUM = 10;

const gco_type = [
  "source-over",
  "copy",
  "destination-in",
  "destination-out",
  "destination-over",
  "lighter",
  "source-atop",
  "source-in",
  "source-out",
  "xor",
];
let gco_now_type = gco_type.length - 1;
