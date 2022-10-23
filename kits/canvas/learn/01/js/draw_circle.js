// 放在 head 中的 JS 代码会在页面加载完成之前就读取
// 放在 body 中的 JS 代码会在整个页面加载完成之后读取
// 因此获取了 html 元素的代码需要放到 body 的最后
// 否则, 例如下面的变量 c 获取到的便是空值

let c = document.getElementById("myCanvas");
let ctx = c.getContext("2d");


// 计算出圆的坐标
let mW = (c.width = 300);
let mH = (c.height = 300);
let lineWidth = 5;
let r = mW / 2;
let cR = r - 4 * lineWidth;
let startAngle = -((1 / 2) * Math.PI);
let endAngle = startAngle + 2 * Math.PI;
let xAngle = 2 * (Math.PI / 180);
let cArr = []; // 圆坐标数组

for (let i = startAngle; i <= endAngle; i += xAngle) {
  let x = r + cR * Math.cos(i);
  let y = r + cR * Math.sin(i);
  cArr.push([x, y]);
}

// 移动到开始点
let startPoint = cArr.shift();
ctx.beginPath();
ctx.moveTo(startPoint[0], startPoint[1]);

// 渲染函数
let render_circle = function () {
  // 画圈
  if (cArr.length) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = "#1c86d1";

    let tmpPoint = cArr.shift();
    ctx.lineTo(tmpPoint[0], tmpPoint[1]);
    ctx.stroke();
  } else {
    cArr = null;
    return;
  }
  requestAnimationFrame(render_circle);
};