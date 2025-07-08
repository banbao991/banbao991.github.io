const _iterState = {
  isSmallKernel: true,

  // SmallKernel
  smallKernelLargeStepRatio: 0.5,

  // 一些通过迭代类型确定的参数
  isNormalStype: true,
  isVeachStyle: false,
  isKelemenStyle: false,
  isVeachOrKelemenStyle: false,
};

const ITER_TYPE = {
  LargeStep: 0,
  LargeStepVeachStyle: 1,
  SmallKernel: 2,
  SmallKernelVeachStyle: 3,
  SmallKernelKelemenStyle: 4,
};

const _config = {
  // mutate
  s2: 1.0 / 32,
  s1: 1.0 / 512,
  logRatio: null,
};

const _debug = {
  cnt: 0,
  maxCnt: 10,
};

setInterval(() => {
  _debug.cnt = 0;
}, 2000);

function debugLog(msg, ...args) {
  if (_debug.cnt++ < _debug.maxCnt) {
    console.log(msg, ...args);
  }
}

// 状态管理对象
const _state = {
  isPaused: false,
  currentIter: 0,
  reqId: null,
  iterPerFrame: 10000,
  maxIters: 10000000,
  warmupIters: 10000,
  histogram: null,
  fAvg: 0,
  width: 0,
  height: 0,
  // 迭代类型
  iterType: ITER_TYPE.SmallKernelKelemenStyle,
};

const _MCMCState = {
  x: [0, 0],
  Fx: 0,
  Cx: [0, 0, 0],
};

const _fpsState = {
  frameCount: 0,
  lastFpsUpdate: performance.now(),
  fps: 0,
};

function getTime() {
  // hh:mm:ss
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
}

let _targetF = null;

const _container = document.getElementById('container');
// 初始化控件
const _uploadBtn = document.getElementById('uploadBtn');
const _pauseBtn = document.getElementById('pauseBtn');
const _clearBtn = document.getElementById('clearBtn');
const _iterLabel = document.getElementById('iterLabel');
const _fpsLabel = document.getElementById('fpsLabel');
const _maxIterInput = document.getElementById('maxIter');
const _perFrameInput = document.getElementById('perFrame');
const _warmupInput = document.getElementById('warmup');
const _modeChangeSelect = document.getElementById('mode');
const _smallKernelLargeStepRatioRange =
    document.getElementById('largeStepRatio');
const _smallKernelLargeStepRatioLabel =
    document.getElementById('largeStepRatioValue');

initParamBindings();
// 初始化一张图片
(() => {
  let img = new Image();
  img.src = 'assets/8MW.jpg';
  img.onload = () => initProcessing(img);
})();

// 初始状态
_state.isPaused = true;
_config.logRatio = -Math.log(_config.s2 / _config.s1);
console.log('logRatio:', _config.logRatio);
updatePauseBtn();

function setMode(mode) {
  mode = parseInt(mode);
  // 设定参数
  _iterState.isNormalStype = false;
  _iterState.isVeachStyle = false;
  _iterState.isKelemenStyle = false;
  _iterState.isVeachOrKelemenStyle = false;
  // 累计类型
  if ([ITER_TYPE.LargeStepVeachStyle, ITER_TYPE.SmallKernelVeachStyle].indexOf(
          mode) !== -1) {
    _iterState.isVeachStyle = true;
  } else if ([ITER_TYPE.SmallKernelKelemenStyle].indexOf(mode) !== -1) {
    _iterState.isKelemenStyle = true;
  } else {
    _iterState.isNormalStype = true;
  }

  // 是否为 small kernel
  if ([
        ITER_TYPE.SmallKernel,
        ITER_TYPE.SmallKernelVeachStyle,
        ITER_TYPE.SmallKernelKelemenStyle,
      ].indexOf(mode) !== -1) {
    _iterState.isSmallKernel = true;
  } else {
    _iterState.isSmallKernel = false;
  }
  _smallKernelLargeStepRatioRange.disabled = !_iterState.isSmallKernel;

  _iterState.isVeachOrKelemenStyle =
      _iterState.isVeachStyle || _iterState.isKelemenStyle;
}

// 参数绑定初始化
function initParamBindings() {
  // 初始化控件值
  _maxIterInput.value = _state.maxIters;
  _perFrameInput.value = _state.iterPerFrame;
  _warmupInput.value = _state.warmupIters;
  _modeChangeSelect.value = _state.iterType;
  _smallKernelLargeStepRatioRange.value = _iterState.smallKernelLargeStepRatio;
  _smallKernelLargeStepRatioLabel.textContent =
      _iterState.smallKernelLargeStepRatio.toFixed(2);

  setMode(_state.iterType);

  _smallKernelLargeStepRatioRange.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    _iterState.smallKernelLargeStepRatio = value;
    _smallKernelLargeStepRatioLabel.textContent = value.toFixed(2);
  });

  _maxIterInput.addEventListener('input', () => {
    _state.maxIters = Math.max(1, parseInt(_maxIterInput.value) || 100000);
    _maxIterInput.value = _state.maxIters;
    updateIterLabelTxt();
  });

  _perFrameInput.addEventListener('input', () => {
    _state.iterPerFrame = Math.max(1, parseInt(_perFrameInput.value) || 1000);
    _perFrameInput.value = _state.iterPerFrame;
  });

  _warmupInput.addEventListener('input', () => {
    _state.warmupIters = Math.max(1, parseInt(_warmupInput.value) || 1000);
    _warmupInput.value = _state.warmupIters;
  });

  _modeChangeSelect.addEventListener('change', (e) => {
    const mode = e.target.value;
    _state.iterType = parseInt(mode);
    setMode(_state.iterType);
    // 重新模拟
    _clearBtn.click();
  });
}

function updateIterLabelTxt() {
  let ratio = (_state.currentIter / _state.maxIters) * 100;
  ratio = ratio.toFixed(1);
  _iterLabel.textContent = `${_state.currentIter}/${_state.maxIters},${ratio}%`;
}

function updatePauseBtn() {
  _pauseBtn.textContent = _state.isPaused ? '继续模拟' : '暂停模拟';
  _pauseBtn.setAttribute('data-state', _state.isPaused ? 'paused' : 'running');
}

// 暂停/继续控制
_pauseBtn.addEventListener('click', () => {
  _state.isPaused = !_state.isPaused;
  updatePauseBtn();
  if (!_state.isPaused) iterate();
});

// 清空画布
_clearBtn.addEventListener('click', () => {
  if (_state.reqId) {
    cancelAnimationFrame(_state.reqId);
    _state.reqId = null;
  }

  _state.isPaused = true;
  updatePauseBtn();
  _state.currentIter = 0;
  updateIterLabelTxt();
  const ctx = document.getElementById('resultCanvas').getContext('2d');
  ctx.clearRect(0, 0, _state.width, _state.height);
  _state.histogram = new Float32Array(_targetF.length);
});

// 文件上传处理
_uploadBtn.addEventListener('change', function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const img = new Image();
    img.onload = () => initProcessing(img);
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

function resizeImage(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  // 调整图片大小到合适尺寸大概像素在 512x512 左右
  // 小的也要放大
  const maxDim = 512;
  let width = img.width;
  let height = img.height;
  if (width > height) {
    height *= maxDim / width;
    width = maxDim;
  } else {
    width *= maxDim / height;
    height = maxDim;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

function initProcessing(img) {
  const canvas = document.getElementById('sourceCanvas');
  const ctx = canvas.getContext('2d');

  console.log('Original image size: ', img.width, img.height);
  img = resizeImage(img);
  console.log('Resized image size: ', img.width, img.height);

  // 重置状态
  // state.isPaused = false;
  _state.currentIter = 0;
  _fpsState.fps = 0;
  canvas.width = img.width;
  canvas.height = img.height;
  document.getElementById('resultCanvas').width = img.width;
  document.getElementById('resultCanvas').height = img.height;

  // 绘制源图像
  ctx.drawImage(img, 0, 0);
  const srcData = ctx.getImageData(0, 0, img.width, img.height).data;
  // set container visible
  _container.style.visibility = 'visible';

  // 预处理图像数据
  _targetF = new Float32Array(srcData.length);
  for (let i = 0; i < srcData.length; i += 4) {
    _targetF[i] = srcData[i] / 255;
    _targetF[i + 1] = srcData[i + 1] / 255;
    _targetF[i + 2] = srcData[i + 2] / 255;
    _targetF[i + 3] = 1;
  }

  // 计算平均亮度
  _state.fAvg = computeAverageLuminance(_targetF, img.width, img.height);
  console.log('Average luminance (by random sample 10spp):', _state.fAvg);
  _state.histogram = new Float32Array(_targetF.length);
  _state.width = img.width;
  _state.height = img.height;

  // 启动处理
  startMCMCProcess();
}

function computeAverageLuminance(targetF, width, height) {
  let sum = 0;
  const N = width * height * 10;
  for (let i = 0; i < N; i++) {
    const idx = Math.floor(Math.random() * (width * height)) * 4;
    sum += 0.299 * targetF[idx] + 0.587 * targetF[idx + 1] +
        0.114 * targetF[idx + 2];
  }
  return sum / N;
}

function startMCMCProcess() {
  _fpsState.frameCount = 0;
  _fpsState.lastFpsUpdate = performance.now();

  // 初始化样本
  initMCMCState();

  // 迭代处理
  iterate();
}

function initMCMCState() {
  let attempts = 0;
  while (true) {
    attempts += 1;

    _MCMCState.x = [
      Math.floor(Math.random() * _state.width),
      Math.floor(Math.random() * _state.height),
    ];
    const idx = (_MCMCState.x[1] * _state.width + _MCMCState.x[0]) * 4;
    _MCMCState.Cx = [_targetF[idx], _targetF[idx + 1], _targetF[idx + 2]];
    _MCMCState.Fx = 0.299 * _MCMCState.Cx[0] + 0.587 * _MCMCState.Cx[1] +
        0.114 * _MCMCState.Cx[2];

    if (_MCMCState.Fx <= 0) {
      continue;
    }

    _MCMCState.Cx = _MCMCState.Cx.map((v) => v / _MCMCState.Fx);
    break;
  }
  console.log('Get Non-zero Fx after', attempts, 'attempts');
}

function mutate(x) {
  let y = [0, 0];
  let wh = [_state.width, _state.height];
  for (let i = 0; i < 2; i++) {
    let length = wh[i];
    let sample = Math.random();
    let add = false;

    if (sample < 0.5) {
      add = true;
      sample *= 2.0;
    } else {
      add = false;
      sample = 2.0 * (sample - 0.5);
    }

    let dv = _config.s2 * Math.exp(sample * _config.logRatio);
    dv *= length;
    if (add) {
      y[i] = Math.round(x[i] + dv);
      if (y[i] >= length) {
        y[i] -= length;
      }
    } else {
      y[i] = Math.round(x[i] - dv);
      if (y[i] < 0) {
        y[i] += length;
      }
    }
  }
  return y;
}

function iterate() {
  if (_state.isPaused) return;

  // 计算帧率
  const now = performance.now();
  _fpsState.frameCount++;
  if (now - _fpsState.lastFpsUpdate > 1000) {
    _fpsState.fps =
        _fpsState.frameCount / ((now - _fpsState.lastFpsUpdate) / 1000);
    _fpsLabel.textContent = `${_fpsState.fps.toFixed(1)} fps`;
    _fpsState.frameCount = 0;
    _fpsState.lastFpsUpdate = now;
  }

  // debugLog(_iterState);

  // 主处理循环
  for (let i = 0; i < _state.iterPerFrame; i++) {
    // if not small kernel, then large step
    // if small kernel, then large step with probability
    const largeStep = _iterState.isSmallKernel ?
        Math.random() < _iterState.smallKernelLargeStepRatio :
        true;

    // 生成候选样本
    let y = null;
    if (largeStep) {
      y = [
        Math.floor(Math.random() * _state.width),
        Math.floor(Math.random() * _state.height),
      ];
    } else {
      y = mutate(_MCMCState.x);
    }

    const yIdx = (y[1] * _state.width + y[0]) * 4;
    const Cy = [_targetF[yIdx], _targetF[yIdx + 1], _targetF[yIdx + 2]];
    const Fy = 0.299 * Cy[0] + 0.587 * Cy[1] + 0.114 * Cy[2];
    const CyNorm = Cy.map((v) => (Fy !== 0 ? v / Fy : 0));

    // 计算接受概率
    const Axy = Math.min(1, Fy / _MCMCState.Fx);

    // [IterType]
    if (_iterState.isVeachOrKelemenStyle) {
      if (_state.currentIter > _state.warmupIters) {
        let oldRate = 1 - Axy;
        let newRate = Axy;

        if (_iterState.isKelemenStyle) {
          oldRate = ((1 - Axy) * _MCMCState.Fx) /
              (_MCMCState.Fx / _state.fAvg +
               _iterState.smallKernelLargeStepRatio);
          newRate = ((Axy + (largeStep ? 1 : 0)) * Fy) /
              (Fy / _state.fAvg + _iterState.smallKernelLargeStepRatio);
        }

        // old idx
        const histIdxOld =
            (_MCMCState.x[1] * _state.width + _MCMCState.x[0]) * 4;
        _state.histogram[histIdxOld] += _MCMCState.Cx[0] * oldRate;
        _state.histogram[histIdxOld + 1] += _MCMCState.Cx[1] * oldRate;
        _state.histogram[histIdxOld + 2] += _MCMCState.Cx[2] * oldRate;
        // new idx
        const histIdxNew = (y[1] * _state.width + y[0]) * 4;
        _state.histogram[histIdxNew] += CyNorm[0] * newRate;
        _state.histogram[histIdxNew + 1] += CyNorm[1] * newRate;
        _state.histogram[histIdxNew + 2] += CyNorm[2] * newRate;
      }
    }

    if (Math.random() < Axy) {
      _MCMCState.x = y;
      _MCMCState.Fx = Fy;
      _MCMCState.Cx = CyNorm;
    }

    // [IterType]
    if (_iterState.isNormalStype) {
      if (_state.currentIter > _state.warmupIters) {
        const histIdx = (_MCMCState.x[1] * _state.width + _MCMCState.x[0]) * 4;
        _state.histogram[histIdx] += _MCMCState.Cx[0];
        _state.histogram[histIdx + 1] += _MCMCState.Cx[1];
        _state.histogram[histIdx + 2] += _MCMCState.Cx[2];
      }
    }

    // 更新迭代计数
    if (++_state.currentIter >= _state.maxIters) {
      _state.isPaused = true;
      _state.reqId = null;
      updatePauseBtn();
      updateDisplay();
      return;
    }
  }

  updateDisplay();
  _state.reqId = requestAnimationFrame(iterate);
}

function updateDisplay() {
  // 更新迭代标签
  updateIterLabelTxt();

  // 更新结果图像
  const ctx = document.getElementById('resultCanvas').getContext('2d');
  const output = new ImageData(_state.width, _state.height);

  // 计算缩放因子
  let hSum = 0;
  for (let i = 0; i < _state.histogram.length; i += 4) {
    hSum += 0.299 * _state.histogram[i] + 0.587 * _state.histogram[i + 1] +
        0.114 * _state.histogram[i + 2];
  }
  const scale = _state.fAvg / (hSum / (_state.width * _state.height));

  // 转换数据
  for (let i = 0; i < _state.histogram.length; i += 4) {
    output.data[i] = Math.min(255, _state.histogram[i] * scale * 255);
    output.data[i + 1] = Math.min(255, _state.histogram[i + 1] * scale * 255);
    output.data[i + 2] = Math.min(255, _state.histogram[i + 2] * scale * 255);
    output.data[i + 3] = 255;
  }

  ctx.putImageData(output, 0, 0);
}
