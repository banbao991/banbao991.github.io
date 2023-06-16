// 文字渲染基础

function t6_test1() {
  clear_canvas();
  context.font = "bold 50px sans-serif";
  context.strokeStyle = "#058";
  context.lineWidth = 1;
  context.fillStyle = "#058";

  context.fillText("Hello World!", 100, 100);
  context.strokeText("Hello World!", 100, 200);
  context.strokeText("Hello World!", 100, 300, 100); // maxlen
}

function t6_test2() {
  clear_canvas();
  context.fillStyle = "#058";
  // font
  // font-style: normal, italic(斜体字, 一种字体), oblique(倾斜字, 只是倾斜)
  context.font = "bold 40px sans-serif";
  context.fillText("Hello World!", 50, 100);
  context.font = "italic 40px sans-serif";
  context.fillText("Hello World!", 50, 150);
  context.font = "oblique 40px sans-serif";
  context.fillText("Hello World!", 50, 200);
  // font-variant: normal, small-caps(使用小型的大写字母显示小写字母)
  context.font = "bold 40px sans-serif";
  context.fillText("Hello World!", 50, 250);
  context.font = "small-caps bold 40px sans-serif";
  context.fillText("Hello World!", 50, 300);
  // font-weight: lighter, normal, bold, bolder
  // 100-400-700-900
  context.font = "lighter 40px sans-serif";
  context.fillText("Hello World!", 50, 350);
  context.font = "normal 40px sans-serif";
  context.fillText("Hello World!", 50, 400);
  context.font = "bold 40px sans-serif";
  context.fillText("Hello World!", 50, 450);
  context.font = "bolder 40px sans-serif";
  context.fillText("Hello World!", 50, 500);
  // font-size: 20px, 2em, 150%
  // xx-small, x-small, medium, large, x-large,xx-large

  // font-family: 字体, @font-face, web安全字体
}

/** 水平文本对齐 textAlign */
function t6_test3() {
  clear_canvas();
  // baseline
  context.strokeStyle = "red";
  context.lineWidth = 1;
  context.strokeRect(200, 0, 200, 600);

  // 水平对齐方式
  context.strokeStyle = "#058";
  context.font = "bold 20px consolas";

  context.textAlign = "left";
  context.fillText("Hello World!", 200, 100);
  context.textAlign = "center";
  context.fillText("Hello World!", 200, 200);
  context.textAlign = "right";
  context.fillText("Hello World!", 200, 300);
  context.textAlign = "start";
  context.fillText("Hello World!", 200, 400);
  context.textAlign = "end";
  context.fillText("Hello World!", 200, 500);
}

/** 竖直对齐方式 */
function t6_test4() {
  clear_canvas();
  canvas.height = 630;
  // baseline
  context.strokeStyle = "red";
  context.lineWidth = 1;
  context.strokeRect(0, 0, 600, 90);
  context.strokeRect(0, 180, 600, 90);
  context.strokeRect(0, 360, 600, 90);
  context.strokeRect(0, 450, 600, 90);

  // 竖直对齐方式
  context.strokeStyle = "#058";
  context.font = "bold 20px consolas";

  context.textBaseline = "top";
  context.fillText("Hello World!(top)", 100, 90);
  context.textBaseline = "bottom";
  context.fillText("Hello World!(bottom)", 100, 180);
  context.textBaseline = "middle";
  context.fillText("Hello World!(middle)", 100, 270);
  context.textBaseline = "alphabetic"; // 针对拉丁文字设计的
  context.fillText("Hello World!(alphabetic)印度文संस्कृतम्", 100, 360);
  context.textBaseline = "ideographic"; // 针对中文等方块字设计的
  context.fillText("Hello World!(ideographic)印度文संस्कृतम्", 100, 450);
  context.textBaseline = "hanging"; // 针对印度文设计的
  context.fillText("Hello World!(hanging)印度文संस्कृतम्", 100, 540);
}

/** 文本度量 */
function t6_test5() {
  clear_canvas();
  let str = "Hello World!";

  context.font = "bold 40px sans-serif";
  context.fillText(str, 50, 100);
  context.fillText(
    "width = " + parseInt(context.measureText(str).width),
    50,
    200
  );

  context.font = "bold 50px sans-serif";
  context.fillText(str, 50, 300);
  context.fillText(
    "width = " + parseInt(context.measureText(str).width),
    50,
    400
  );
}

function test6_main() {
  //   t6_test1();
  //   t6_test2();
  //   t6_test3();
  //   t6_test4();
  //   t6_test5();
}
