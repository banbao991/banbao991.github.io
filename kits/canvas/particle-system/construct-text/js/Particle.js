/**
 * 获取一个随机颜色
 */
function get_color() {
  let r = Math.floor(Math.random() * 255),
    g = Math.floor(Math.random() * 255),
    b = Math.floor(Math.random() * 255);
  let a = Math.random() * 0.5 + 0.5;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * 粒子类
 */
class Particle {
  constructor(x, y) {
    // 属性: 半径, 颜色
    this.r = Math.random() * (Particle.MAX_RADIUS - 1) + 1;
    this.color = get_color();
    // 目标位置
    this.dst = { x: x, y: y };
    // 当前位置
    this.now = {
      x: Math.random() * Particle.canvasWidth,
      y: Math.random() * Particle.canvasHeight,
    };
    // 速度
    this.vx = (Math.random() - 0.5) * 25;
    this.vy = (Math.random() - 0.5) * 25;
    // 加速度
    this.accX = 0;
    this.accY = 0;
    // 阻尼
    this.friction = Math.random() * 0.05 + 0.9;
  }

  // 渲染
  render(cxt) {
    // 加速度简单设置为距离的一个线性函数
    this.accX = (this.dst.x - this.now.x) / 1000;
    this.accY = (this.dst.y - this.now.y) / 1000;
    this.vx += this.accX;
    this.vy += this.accY;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.now.x += this.vx;
    this.now.y += this.vy;

    cxt.fillStyle = this.color;
    cxt.beginPath();
    cxt.arc(this.now.x, this.now.y, this.r, Math.PI * 2, false);
    cxt.fill();

    // 鼠标(触摸)互动, 让小球无法靠近鼠标
    let dx = this.now.x - Particle.mouse.x;
    let dy = this.now.y - Particle.mouse.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < this.r * 10 + 20) {
      this.accX = dx / 50;
      this.accY = dy / 50;
      this.vx += this.accX;
      this.vy += this.accY;
    }
  }
}
