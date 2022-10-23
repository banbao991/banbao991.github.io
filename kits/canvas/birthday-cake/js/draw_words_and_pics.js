let word_index = -1;
let word_start = false;
let word_interval = 0;
let word_end = false;
const INTERVAL_FOR_WORD = 20;
const INTERVAL_FOR_FIRST_STATIC_WORD = 30;
let word_ball = {
  seg: 0,
  r: 0,
};

// 图片
let pics = [];
const pic_src = ["doraemon_001.jpg", "xiaohuang_001.jpg", "xiaolan_001.jpg"];
let first_draw_static = true;

/** 初始化数据 */
function init_word_and_pic() {
  // pic
  if (pics.length === 0) {
    for (let i in pic_src) {
      let img = new Image();
      img.src = "./img/" + pic_src[i];
      pics.push(img);
    }
  }
}

/** 绘制一个字 */
function draw_a_word(idx) {
  // 初始化数据
  word_ball.seg = WINDOW_WIDTH / 200;
  word_ball.r = WINDOW_WIDTH / 500;
  // 绘制信息
  let cx = (WINDOW_WIDTH * 3) / 4,
    cy = (WINDOW_HEIGHT * 2) / 4;
  let word = cky[idx];
  for (let i = 0; i < cky_l2; ++i) {
    for (let j = 0; j < cky_l3; ++j) {
      if (word[i][j] === 0) {
        let a_ball = new Ball(
          cx + j * word_ball.seg,
          cy + i * word_ball.seg,
          word_ball.r,
          (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5 + 5),
          (Math.random() > 0.7 ? 1 : -1) * (Math.random() * 5 + 5),
          Math.random() * 2 + 1,
          //   "#058",
          get_a_color(),
          10
        );
        balls.push(a_ball);
      }
    }
  }
}

/** 绘制静态文字和图片 */
function draw_static(context) {
  let cx = (WINDOW_WIDTH * 23) / 28,
    cy = (WINDOW_HEIGHT * 2) / 4;
  context.textAlign = "center";
  context.textBaseline = "ideographic";
  context.font = (50 / 1232) * WINDOW_WIDTH + "px bold YaHei";
  context.fillStyle = "pink";
  context.fillText("白菜生日快乐!", cx, cy);

  draw_pics(context);
}

/** 绘制文字 */
function draw_words(context) {
  //   word_end = true;
  if (word_end === true) {
    if (first_draw_static && word_interval++ < INTERVAL_FOR_FIRST_STATIC_WORD) {
      return;
    }
    first_draw_static = false;
    draw_static(context);
    return;
  }

  // 6*20*21
  if (word_start === false || word_interval++ < INTERVAL_FOR_WORD) {
    return;
  }
  word_interval = 0;
  word_index++;
  draw_a_word(word_index);
  if (word_index === cky_l1 - 1) {
    word_end = true;
  }
}

function draw_pics(context) {
  if (word_end === false) {
    return;
  }
  let cx = WINDOW_WIDTH * 0.82,
    cy = (WINDOW_HEIGHT * 11) / 15;
  let dx = WINDOW_WIDTH * 0.12,
    dy = WINDOW_HEIGHT / 40;
  let rot = Math.PI / 10;
  let trans = [
    { tx: -dx, ty: -dy, rot: rot },
    { tx: 0, ty: 0, rot: 0 },
    { tx: dx, ty: -dy, rot: -rot },
  ];
  let pic_height = WINDOW_WIDTH / 10;
  let pic_width = (pic_height * 3) / 4;
  for (let i = 0; i < pics.length; ++i) {
    if (!pics[i].complete) {
      continue;
    }
    context.save();
    context.translate(trans[i].tx + cx, trans[i].ty + cy);
    context.rotate(trans[i].rot);
    context.drawImage(
      pics[i],
      -pic_width / 2,
      -pic_height / 2,
      pic_width,
      pic_height
    );
    context.restore();
  }
}

/** 绘制文字和图片 */
function draw_words_and_pics(context) {
  init_word_and_pic();
  draw_words(context);
  // 绘制图片和静态字一起了
}
