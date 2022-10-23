class Ball {
  constructor(x, y, r, vx, vy, g, color, /* optional */ wait) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.vx = vx;
    this.vy = vy;
    this.g = g;
    this.color = color;
    this.wait = wait || 0;
  }

  update_position(max_width, max_height) {
    if (this.wait >= 0) {
      this.wait--;
      return true;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.g;

    if (this.y + this.r >= max_height) {
      this.y = max_height - this.r;
      this.vy = -this.vy * 0.5; // 阻尼
    }

    if (this.x - this.r <= 0 || this.x + this.r >= max_width) {
      return false;
    }
    return true;
  }
}

class Frag {
  constructor(x1, y1, x2, y2, vx, vy, g, width, color) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.vx = vx;
    this.vy = vy;
    this.g = g;
    this.width = width;
    this.color = color;
  }

  update_position(max_width, max_height) {
    this.x1 += this.vx;
    this.x2 += this.vx;
    this.y1 += this.vy;
    this.y2 += this.vy;
    this.vy += this.g;

    if (
      this.x - this.r <= 0 ||
      this.x + this.r >= max_width ||
      this.y + this.r >= max_height
    ) {
      return false;
    }
    return true;
  }
}
