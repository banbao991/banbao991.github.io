const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let N = 50;
const CELL_SIZE = 10;
let currentGrid;
let nextGrid;
let distributions;
let currentSeed = 12345;
let simulationStep = 0;
let maxSimulationSteps = 1000;
let isPaused = false;

// FPS 计算相关变量
let frameCount = 0;
let lastFpsUpdate = Date.now();
let currentFps = 0;
let animationId;

// 伪随机数生成器 (使用种子)
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateDistributions() {
  return Array.from({length: N}, (_, i) => Array.from({length: N}, (_, j) => {
    const dirs = [];
    dirs.push({di: 0, dj: 0});
    if (i > 0) dirs.push({di: -1, dj: 0});
    if (i < N - 1) dirs.push({di: 1, dj: 0});
    if (j > 0) dirs.push({di: 0, dj: -1});
    if (j < N - 1) dirs.push({di: 0, dj: 1});

    const weights = dirs.map((_, idx) => {
      const seed = currentSeed + i * N + j + idx * 1000;
      return seededRandom(seed);
    });
    const total = weights.reduce((sum, w) => sum + w, 0);
    return weights.map(w => w / total);
  }));
}

function initialize(resetType = 'soft') {
  simulationStep = 0;
  document.getElementById('currentStep').textContent = '0000';

  // 同步输入框种子值
  const seedInput = parseInt(document.getElementById('seedInput').value);
  if (!isNaN(seedInput)) {
    currentSeed = seedInput;
  }

  // 更新网格尺寸
  const newN = parseInt(document.getElementById('gridSize').value);
  if (newN >= 3 && newN <= 100) {
    N = newN;
  }

  canvas.width = N * CELL_SIZE;
  canvas.height = N * CELL_SIZE;

  currentGrid = Array.from({length: N}, () => new Array(N).fill(128));
  nextGrid = Array.from({length: N}, () => new Array(N).fill(0));

  // 仅在硬重置或尺寸变化时重新生成分布
  if (resetType === 'hard' || !distributions || distributions.length !== N) {
    const newSeed = Math.floor(Math.random() * 1000000);
    document.getElementById('seedInput').value = newSeed;
    currentSeed = newSeed;
    distributions = generateDistributions();
  }
}

function updateGrid() {
  nextGrid.forEach(row => row.fill(0));

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const water = currentGrid[i][j];
      if (water === 0) continue;

      const dirs = [];
      dirs.push({di: 0, dj: 0});
      if (i > 0) dirs.push({di: -1, dj: 0});
      if (i < N - 1) dirs.push({di: 1, dj: 0});
      if (j > 0) dirs.push({di: 0, dj: -1});
      if (j < N - 1) dirs.push({di: 0, dj: 1});

      const probabilities = distributions[i][j];

      dirs.forEach(({di, dj}, idx) => {
        const ni = i + di;
        const nj = j + dj;
        nextGrid[ni][nj] += water * probabilities[idx];
      });
    }
  }
  [currentGrid, nextGrid] = [nextGrid, currentGrid];
  simulationStep++;
  document.getElementById('currentStep').textContent =
      ('0000' + simulationStep).slice(-4);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const gray = Math.min(Math.max(currentGrid[i][j], 0), 255) | 0;
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

function updateFps() {
  frameCount++;
  const now = Date.now();
  const delta = now - lastFpsUpdate;

  if (delta >= 1000) {
    currentFps = Math.round((frameCount * 1000) / delta);
    document.getElementById('fpsLabel').textContent = currentFps;
    frameCount = 0;
    lastFpsUpdate = now;
  }
}

function animate() {
  updateFps();

  if (isPaused) {
    // 绘制初始化状态
    if (simulationStep == 0) {
      draw();
    }
    return;
  }

  updateGrid();
  draw();

  // 检查是否达到最大轮次
  if (simulationStep >= maxSimulationSteps) {
    stopAnimation();
  } else {
    animationId = requestAnimationFrame(animate);
  }
}

function stopAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function startSimulation() {
  stopAnimation();
  // isPaused = false;
  // document.getElementById('pauseButton').textContent = '暂停模拟';
  animate();
}

function randomReset(grid) {
  // 配置参数
  const totalShuffles = grid.length * grid.length * 10;  // 每个格子平均交换10次
  const maxAttempts = totalShuffles * 2;                 // 最大尝试次数

  let attempts = 0;
  let successfulSwaps = 0;

  while (successfulSwaps < totalShuffles && attempts < maxAttempts) {
    attempts++;

    // 随机选择两个不同位置
    const [x1, y1] = [
      Math.floor(Math.random() * grid.length),
      Math.floor(Math.random() * grid.length)
    ];
    const [x2, y2] = [
      Math.floor(Math.random() * grid.length),
      Math.floor(Math.random() * grid.length)
    ];

    // 如果是同一个格子则跳过
    if (x1 === x2 && y1 === y2) continue;

    // 计算可转移量
    const currentA = grid[x1][y1];
    const currentB = grid[x2][y2];
    const maxTransfer = Math.min(
        currentA,                       // 源不能为负
        255 - currentB,                 // 目标不能溢出
        Math.floor(currentA * 0.1) + 1  // 每次最多转移10%
    );

    if (maxTransfer <= 0) continue;

    // 执行随机转移
    const transfer = Math.floor(Math.random() * maxTransfer);
    grid[x1][y1] -= transfer;
    grid[x2][y2] += transfer;
    successfulSwaps++;
  }

  simulationStep = 0;
  document.getElementById('currentStep').textContent = '0000';
  startSimulation();
}

// 事件监听
document.getElementById('resetButton').addEventListener('click', () => {
  initialize('soft');
  startSimulation();
});

document.getElementById('pauseButton').addEventListener('click', () => {
  isPaused = !isPaused;
  document.getElementById('pauseButton').textContent =
      isPaused ? '继续模拟' : '暂停模拟';
  if (!isPaused) animate();
});

document.getElementById('stepButton').addEventListener('click', () => {
  if (isPaused) {
    updateGrid();
    draw();
    updateFps();
  }
});

document.getElementById('fullResetBtn').addEventListener('click', () => {
  // 使用当前输入框的种子重新生成分布
  initialize('hard');
  startSimulation();
});

document.getElementById('newSeedBtn').addEventListener('click', () => {
  // 生成新种子并更新输入框
  const newSeed = Math.floor(Math.random() * 1000000);
  document.getElementById('seedInput').value = newSeed;
  currentSeed = newSeed;
  distributions = generateDistributions();

  simulationStep = 0;
  document.getElementById('currentStep').textContent = '0000';
  startSimulation();
});

document.getElementById('seedInput').addEventListener('change', (e) => {
  const newSeed = parseInt(e.target.value);
  if (!isNaN(newSeed) && newSeed !== currentSeed) {
    currentSeed = newSeed;
    initialize('hard');
    startSimulation();
  }
});

document.getElementById('gridSize').addEventListener('change', () => {
  initialize('hard');
  startSimulation();
});

document.getElementById('maxSteps').addEventListener('change', (e) => {
  maxSimulationSteps = parseInt(e.target.value) || 1000;
  // 如果当前已超过新设置的最大值则停止
  if (simulationStep >= maxSimulationSteps) {
    stopAnimation();
  }
});

document.getElementById('randomResetBtn').addEventListener('click', () => {
  randomReset(currentGrid);
});

// 初始启动
initialize('hard');
startSimulation();