// 常量定义
const CELL_SIZE = 30;
let MAZE_WIDTH = 21;   // 必须是奇数
let MAZE_HEIGHT = 21;  // 必须是奇数

// 获取 Canvas 和上下文
const backgroundCanvas = document.getElementById('backgroundCanvas');
const foregroundCanvas = document.getElementById('foregroundCanvas');
const bgCtx = backgroundCanvas.getContext('2d');
const fgCtx = foregroundCanvas.getContext('2d');

// 设置 Canvas 尺寸
backgroundCanvas.width = foregroundCanvas.width = MAZE_WIDTH * CELL_SIZE;
backgroundCanvas.height = foregroundCanvas.height = MAZE_HEIGHT * CELL_SIZE;

// 初始化变量
let maze = [];
let player = {x: 1, y: 1};
let end = {x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 2};
let keys = {};  // 记录按键状态

// 生成迷宫的递归回溯算法
function generateMaze() {
  // 初始化全为墙
  maze = Array(MAZE_HEIGHT).fill().map(() => Array(MAZE_WIDTH).fill(1));

  function carve1(x, y) {
    maze[y][x] = 0;
    const directions = shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]);

    for (let [dx, dy] of directions) {
      const nx = x + dx * 2;
      const ny = y + dy * 2;
      if (nx >= 0 && nx < MAZE_WIDTH && ny >= 0 && ny < MAZE_HEIGHT &&
          maze[ny][nx] === 1) {
        maze[y + dy][x + dx] = 0;
        carve1(nx, ny);
      }
    }
  }

  function carve2(x, y) {
    maze[y][x] = 0;  // 将当前单元格设为路径
    const directions =
        shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]);  // 随机打乱方向

    for (let [dx, dy] of directions) {
      const nx = x + dx * 2;  // 计算下一个单元格的位置
      const ny = y + dy * 2;

      // 检查下一个单元格是否在迷宫范围内且是墙
      if (nx >= 0 && nx < MAZE_WIDTH && ny >= 0 && ny < MAZE_HEIGHT &&
          maze[ny][nx] === 1) {
        maze[y + dy][x + dx] = 0;  // 打通当前单元格和下一个单元格之间的墙
        carve2(nx, ny);  // 递归处理下一个单元格

        // 增加额外的分支路径
        if (Math.random() < 0.3) {  // 30% 的概率生成额外分支
          const extraDirections = shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]);
          for (let [ex, ey] of extraDirections) {
            const exX = nx + ex * 2;
            const exY = ny + ey * 2;
            if (exX >= 0 && exX < MAZE_WIDTH && exY >= 0 && exY < MAZE_HEIGHT &&
                maze[exY][exX] === 1) {
              maze[ny + ey][nx + ex] = 0;
              carve2(exX, exY);
            }
          }
        }
      }
    }
  }

  // 从(1,1)开始生成
  // carve1(1, 1);
  carve2(1, 1);
}

// 绘制背景迷宫
function drawBackground() {
  // 清空背景
  bgCtx.fillStyle = '#444';
  bgCtx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

  // 绘制迷宫墙壁
  for (let y = 0; y < MAZE_HEIGHT; y++) {
    for (let x = 0; x < MAZE_WIDTH; x++) {
      if (maze[y][x] === 1) {
        bgCtx.fillStyle = '#ddd';
        bgCtx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  // 绘制终点
  bgCtx.fillStyle = 'green';
  bgCtx.fillRect(end.x * CELL_SIZE, end.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

// 绘制前景玩家
function drawForeground() {
  // 清空前景
  fgCtx.clearRect(0, 0, foregroundCanvas.width, foregroundCanvas.height);

  // 绘制玩家
  fgCtx.fillStyle = 'red';
  fgCtx.beginPath();
  fgCtx.arc(
      (player.x + 0.5) * CELL_SIZE, (player.y + 0.5) * CELL_SIZE, CELL_SIZE / 3,
      0, Math.PI * 2);
  fgCtx.fill();
}

// 移动检测
function canMove(x, y) {
  return maze[y][x] === 0;
}

// 更新玩家位置
// 在 requestAnimationFrame 的游戏循环中持续更新玩家位置，确保移动流畅
function updatePlayerPosition() {
  const moves = {
    ArrowUp: {x: 0, y: -1},
    ArrowDown: {x: 0, y: 1},
    ArrowLeft: {x: -1, y: 0},
    ArrowRight: {x: 1, y: 0}
  };

  for (const key in moves) {
    if (keys[key]) {
      const newX = player.x + moves[key].x;
      const newY = player.y + moves[key].y;

      if (newX >= 0 && newX < MAZE_WIDTH && newY >= 0 && newY < MAZE_HEIGHT &&
          canMove(newX, newY)) {
        player.x = newX;
        player.y = newY;
      }
    }
  }
}

// 游戏逻辑更新
function update() {
  updatePlayerPosition();

  // 胜利检测
  if (player.x === end.x && player.y === end.y) {
    // 弹出提示框，获取用户输入的迷宫大小
    let newSize = prompt(
        '恭喜你逃出迷宫！请输入新的迷宫大小（必须是奇数，最小为 5）：',
        MAZE_WIDTH);

    // 验证用户输入
    newSize = parseInt(newSize, 10);
    if (isNaN(newSize)) {
      alert('输入无效，请输入一个数字！');
      resetGame();
      return;
    }
    if (newSize < 5 || newSize % 2 === 0) {
      alert('迷宫大小必须是大于等于 5 的奇数！');
      resetGame();
      return;
    }

    // 更新迷宫大小并重置游戏
    MAZE_WIDTH = newSize;
    MAZE_HEIGHT = newSize;
    resetGame();
  }
}

// 重置游戏
function resetGame() {
  // 设置 Canvas 尺寸
  backgroundCanvas.width = foregroundCanvas.width = MAZE_WIDTH * CELL_SIZE;
  backgroundCanvas.height = foregroundCanvas.height = MAZE_HEIGHT * CELL_SIZE;

  // 调整 .canvas-container 的尺寸
  const container = document.querySelector('.canvas-container');
  container.style.width = `${MAZE_WIDTH * CELL_SIZE}px`;
  container.style.height = `${MAZE_HEIGHT * CELL_SIZE}px`;

  // 重置玩家位置和按键状态
  player = {x: 1, y: 1};
  keys = {};

  // 设置终点位置
  end = {x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 2};

  // 生成迷宫
  generateMaze();
  drawBackground();  // 重新绘制背景
}

// 工具函数：随机打乱数组
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// 键盘事件监听
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;  // 记录按键按下
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;  // 记录按键释放
});

// 游戏循环
function gameLoop() {
  update();
  drawForeground();
  requestAnimationFrame(gameLoop);
}

// 初始化游戏
function initGame() {
  resetGame();  // 重置游戏状态
  gameLoop();   // 启动游戏循环
}

// 启动游戏
initGame();