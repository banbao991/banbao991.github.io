/** 测试 1: 绘制线条 */
function test1() {
  clear_canvas();
  // 设置状态
  context.moveTo(100, 100);
  context.lineTo(700, 700);
  context.lineTo(100, 700);
  context.lineTo(100, 100);

  context.lineWidth = 5;
  context.strokeStyle = "#005588";

  // 绘制
  context.stroke();
}

/** 测试 2: 绘制填充物体 */
function test2() {
  clear_canvas();
  // 设置状态
  context.moveTo(100, 100);
  context.lineTo(700, 700);
  context.lineTo(100, 700);
  context.lineTo(100, 100);

  context.fillStyle = "#005588";

  // 绘制
  context.fill();

  // 对边也加条件
  context.lineWidth = 5;
  context.strokeStyle = "red";
  context.stroke();
}

/** 测试 3: 基于状态绘制 */
function test3() {
  clear_canvas();
  // 设置状态
  context.moveTo(100, 100);
  context.lineTo(700, 700);
  context.lineTo(100, 700);
  context.lineTo(100, 100);
  context.lineWidth = 10;
  context.strokeStyle = "red";
  context.stroke();

  // 第二次绘制的时候上面的 moveTo/lineTo 也还在起作用
  // 因此下面调用的 stroke 又重新执行了上面的绘制代码
  context.moveTo(200, 100);
  context.lineTo(500, 400);
  context.lineWidth = 5;
  context.strokeStyle = "black";
  context.stroke();
}

/** 测试 3: 基于状态绘制(beginPath) */
function test4() {
  clear_canvas();
  // 设置状态
  context.beginPath();
  context.moveTo(100, 100);
  context.lineTo(700, 700);
  context.lineTo(100, 700);
  context.lineTo(100, 100);
  context.closePath();

  context.lineWidth = 10;
  context.strokeStyle = "red";
  context.stroke();

  context.beginPath();
  context.moveTo(200, 100);
  context.lineTo(500, 400);
  context.closePath();
  context.lineWidth = 5;
  context.strokeStyle = "black";
  context.stroke();
}

/** 绘制七巧板的一个单元 */
function draw(piece) {
  context.beginPath();
  context.moveTo(piece.p[0].x, piece.p[0].y);
  for (let i = 1; i < piece.p.length; ++i) {
    context.lineTo(piece.p[i].x, piece.p[i].y);
  }
  context.closePath();
  context.fillStyle = piece.color;
  context.fill();
}

/** 绘制七巧板 */
function draw_qiqiaoban() {
  clear_canvas();
  canvas.width = 800;
  canvas.height = 800;
  let tangram = [
    {
      p: [
        { x: 0, y: 0 },
        { x: 800, y: 0 },
        { x: 400, y: 400 },
      ],
      color: "green",
    },
    {
      p: [
        { x: 0, y: 0 },
        { x: 400, y: 400 },
        { x: 0, y: 800 },
      ],
      color: "red",
    },
    {
      p: [
        { x: 800, y: 0 },
        { x: 800, y: 400 },
        { x: 600, y: 600 },
        { x: 600, y: 200 },
      ],
      color: "yellow",
    },
    {
      p: [
        { x: 600, y: 200 },
        { x: 600, y: 600 },
        { x: 400, y: 400 },
      ],
      color: "blue",
    },
    {
      p: [
        { x: 400, y: 400 },
        { x: 600, y: 600 },
        { x: 400, y: 800 },
        { x: 200, y: 600 },
      ],
      color: "pink",
    },
    {
      p: [
        { x: 200, y: 600 },
        { x: 400, y: 800 },
        { x: 0, y: 800 },
      ],
      color: "black",
    },
    {
      p: [
        { x: 800, y: 400 },
        { x: 800, y: 800 },
        { x: 400, y: 800 },
      ],
      color: "gray",
    },
  ];
  for (let i in tangram) {
    draw(tangram[i]);
  }
}

/** 测试 5: 绘制弧线 */
function test5() {
  clear_canvas();
  // 6个参数
  // 圆心坐标 x, y, 半径, 起始弧度, 终止弧度, 是否逆时针
  context.lineWidth = 5;
  context.strokeStyle = "blue";
  context.arc(300, 300, 200, 0, 1.5 * Math.PI, true);
  context.stroke();
}

/** 测试 6: 绘制弧线测试 */
function test6() {
  clear_canvas();
  canvas.height = 800;
  // 1. 正常绘制
  context.lineWidth = 5;
  context.strokeStyle = "#005588";
  for (let i = 0; i < 10; ++i) {
    context.beginPath();
    context.arc(50 + i * 100, 120, 40, 0, (2 * Math.PI * (i + 1)) / 10);
    // 如果路径未封闭, 则 closePath 会见其首尾相连(只对 stroke 有效)
    context.closePath();
    context.stroke();
  }

  // 2. 没有 closePath
  for (let i = 0; i < 10; ++i) {
    context.beginPath();
    // beginPath 和 closePath 可以不成对出现, beginPath 认为接下来绘制的就是新路径
    context.arc(50 + i * 100, 240, 40, 0, (2 * Math.PI * (i + 1)) / 10);
    context.stroke();
  }

  // 3. 逆时针, 正常绘制
  context.lineWidth = 5;
  context.strokeStyle = "#005588";
  for (let i = 0; i < 10; ++i) {
    context.beginPath();
    context.arc(50 + i * 100, 360, 40, 0, (2 * Math.PI * (i + 1)) / 10, true);
    context.closePath();
    context.stroke();
  }

  // 4. 逆时针, 没有 closePath
  for (let i = 0; i < 10; ++i) {
    context.beginPath();
    context.arc(50 + i * 100, 480, 40, 0, (2 * Math.PI * (i + 1)) / 10, true);
    context.stroke();
  }

  // 5. 填充
  context.fillStyle = "#005588";
  for (let i = 0; i < 10; ++i) {
    context.beginPath();
    context.arc(50 + i * 100, 600, 40, 0, (2 * Math.PI * (i + 1)) / 10, true);
    // 这个语句无效
    context.closePath();
    context.fill();
  }

  // 6. 无 closePath
  context.fillStyle = "#005588";
  for (let i = 0; i < 10; ++i) {
    context.beginPath();
    context.arc(50 + i * 100, 720, 40, 0, (2 * Math.PI * (i + 1)) / 10, true);
    // 这个语句无效
    context.closePath();
    context.fill();
  }
}

function test_main() {
  //   test1();
  //   test2();
  //   test3();
  //   test4();
  //   draw_qiqiaoban();

  //   test5();
  //   test6();
}
