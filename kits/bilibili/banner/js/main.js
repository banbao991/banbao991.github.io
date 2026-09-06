const IMG_DIV_TXT = 'utils/img1/div-new.txt';
const HEADER_JSON = 'utils/img1/header.json';
const SMOOTHING = 0.14;
const SETTLED_DISTANCE = 0.0005;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const numberOr = (value, fallback) =>
    Number.isFinite(Number(value)) ? Number(value) : fallback;

function readPair(value, fallback = [0, 0]) {
  return Array.isArray(value) ?
      [numberOr(value[0], fallback[0]), numberOr(value[1], fallback[1])] :
      fallback;
}

/**
 * Return y for a CSS-style cubic-bezier curve at the supplied x position.
 * The saved Bilibili configuration uses curves whose y control points may
 * overshoot 0..1, which gives the two foreground characters their bounce.
 */
function cubicBezier(curve) {
  if (!Array.isArray(curve) || curve.length !== 4) {
    return value => value;
  }

  const [x1, y1, x2, y2] = curve.map(Number);
  if (![x1, y1, x2, y2].every(Number.isFinite)) {
    return value => value;
  }

  const sample = (t, a1, a2) => {
    const c = 3 * a1;
    const b = 3 * (a2 - a1) - c;
    const a = 1 - c - b;
    return ((a * t + b) * t + c) * t;
  };
  const slope = (t, a1, a2) => {
    const c = 3 * a1;
    const b = 3 * (a2 - a1) - c;
    const a = 1 - c - b;
    return 3 * a * t * t + 2 * b * t + c;
  };

  return value => {
    const x = clamp(value, 0, 1);
    let t = x;

    for (let i = 0; i < 8; i++) {
      const difference = sample(t, x1, x2) - x;
      const currentSlope = slope(t, x1, x2);
      if (Math.abs(difference) < 1e-6) break;
      if (Math.abs(currentSlope) < 1e-6) break;
      t -= difference / currentSlope;
    }

    if (t < 0 || t > 1) {
      let low = 0;
      let high = 1;
      t = x;
      for (let i = 0; i < 12; i++) {
        if (sample(t, x1, x2) < x) low = t;
        else high = t;
        t = (low + high) / 2;
      }
    }

    return sample(clamp(t, 0, 1), y1, y2);
  };
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  return response.json();
}

function createLayerState(layerElement, media, config) {
  const translate = config.translate || {};
  const rotate = config.rotate || {};
  const scale = config.scale || {};
  const blur = config.blur || {};
  const opacity = config.opacity || {};

  const state = {
    layerElement,
    media,
    name: config.name || '',
    dataWidth: numberOr(media.dataset.width, media.naturalWidth || 0),
    dataHeight: numberOr(media.dataset.height, media.naturalHeight || 0),
    initialScale: numberOr(scale.initial, 1),
    translateInitial: readPair(translate.initial),
    translateOffset: readPair(translate.offset),
    translateEase: cubicBezier(translate.offsetCurve),
    rotateInitial: numberOr(rotate.initial, 0),
    rotateOffset: numberOr(rotate.offset, 0),
    rotateEase: cubicBezier(rotate.offsetCurve),
    scaleOffset: numberOr(scale.offset, 0),
    scaleEase: cubicBezier(scale.offsetCurve),
    blurInitial: numberOr(blur.initial, 0),
    blurOffset: numberOr(blur.offset, 0),
    blurEase: cubicBezier(blur.offsetCurve),
    opacityInitial: numberOr(opacity.initial, 1),
    opacityOffset: numberOr(opacity.offset, 0),
    opacityEase: cubicBezier(opacity.offsetCurve),
    unitScale: 1,
  };

  layerElement.dataset.layerName = state.name;
  media.removeAttribute('width');
  media.removeAttribute('height');
  media.removeAttribute('style');
  media.setAttribute('aria-hidden', 'true');
  media.draggable = false;

  // The archived HTML contains one Windows path separator. Browsers usually
  // normalize it, but making the URL explicit keeps local servers consistent.
  const source = media.getAttribute('src');
  if (source) media.setAttribute('src', source.replace(/\\/g, '/'));

  if (media instanceof HTMLVideoElement) {
    media.muted = true;
    media.autoplay = true;
    media.loop = true;
    media.playsInline = true;
  }

  return state;
}

function waitForMedia(media) {
  if (media instanceof HTMLImageElement && media.complete) {
    return Promise.resolve();
  }
  if (media instanceof HTMLVideoElement && media.readyState >= 2) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    const done = () => resolve();
    media.addEventListener('load', done, {once: true});
    media.addEventListener('loadeddata', done, {once: true});
    media.addEventListener('error', done, {once: true});
  });
}

async function main() {
  const banner = document.querySelector('#outter');
  const status = banner.querySelector('.banner-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  try {
    const [markup, headerResponse] = await Promise.all([
      fetchText(IMG_DIV_TXT),
      fetchJson(HEADER_JSON),
    ]);
    const splitLayer = JSON.parse(headerResponse.data.split_layer);

    const template = document.createElement('template');
    template.innerHTML = markup.trim();
    const animatedBanner = template.content.querySelector('.animated-banner');
    const layerElements = [...animatedBanner.querySelectorAll(':scope > .layer')];

    if (layerElements.length !== splitLayer.layers.length) {
      throw new Error(
          `Layer count mismatch: ${layerElements.length} assets, ` +
          `${splitLayer.layers.length} configurations`);
    }

    const layers = layerElements.map((layerElement, index) => {
      const media = layerElement.querySelector('img, video');
      if (!media) throw new Error(`Layer ${index} has no media element`);
      return createLayerState(layerElement, media, splitLayer.layers[index]);
    });

    const sceneWidth = Math.max(...layers.map(layer => layer.dataWidth));
    const sceneHeight = Math.max(...layers.map(layer => layer.dataHeight));
    const baseScale = numberOr(splitLayer.layers[0]?.scale?.initial, 1);
    let layoutScale = 1;
    let currentProgress = 0;
    let targetProgress = 0;
    let animationFrame = 0;

    function layout() {
      const rect = banner.getBoundingClientRect();
      layoutScale = Math.max(rect.width / sceneWidth, rect.height / sceneHeight);

      for (const layer of layers) {
        const layerScale = layoutScale * layer.initialScale / baseScale;
        layer.unitScale = layerScale;
        layer.media.style.width = `${layer.dataWidth * layerScale}px`;
        layer.media.style.height = `${layer.dataHeight * layerScale}px`;
      }
      render(currentProgress);
    }

    function render(progress) {
      for (const layer of layers) {
        const translateProgress = layer.translateEase(progress);
        const x = (layer.translateInitial[0] +
            layer.translateOffset[0] * translateProgress) * layer.unitScale;
        const y = (layer.translateInitial[1] +
            layer.translateOffset[1] * translateProgress) * layer.unitScale;
        const rotation = layer.rotateInitial +
            layer.rotateOffset * layer.rotateEase(progress);
        const motionScale = Math.max(0.001,
            1 + layer.scaleOffset * layer.scaleEase(progress));
        const blur = Math.max(0, layer.blurInitial +
            layer.blurOffset * layer.blurEase(progress));
        const opacity = clamp(layer.opacityInitial +
            layer.opacityOffset * layer.opacityEase(progress), 0, 1);

        layer.media.style.transform =
            `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${motionScale})`;
        layer.media.style.filter = blur ? `blur(${blur * layer.unitScale}px)` : '';
        layer.media.style.opacity = opacity;
      }
    }

    function animate() {
      animationFrame = 0;
      if (reducedMotion.matches) {
        currentProgress = 0;
      } else {
        currentProgress += (targetProgress - currentProgress) * SMOOTHING;
      }
      render(currentProgress);

      if (Math.abs(targetProgress - currentProgress) > SETTLED_DISTANCE) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        currentProgress = targetProgress;
        render(currentProgress);
      }
    }

    function scheduleAnimation() {
      if (!animationFrame) animationFrame = requestAnimationFrame(animate);
    }

    banner.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || reducedMotion.matches) return;
      const rect = banner.getBoundingClientRect();
      targetProgress = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      scheduleAnimation();
    });

    banner.addEventListener('pointerleave', () => {
      targetProgress = 0;
      scheduleAnimation();
    });

    reducedMotion.addEventListener('change', () => {
      targetProgress = 0;
      scheduleAnimation();
    });

    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(banner);
    banner.appendChild(animatedBanner);
    layout();

    await Promise.all(layers.map(layer => waitForMedia(layer.media)));
    for (const layer of layers) {
      if (layer.media instanceof HTMLVideoElement) {
        layer.media.play().catch(() => {});
      }
    }

    status.hidden = true;
    animatedBanner.classList.add('is-ready');
  } catch (error) {
    console.error('Failed to initialize the Bilibili banner.', error);
    status.textContent = 'Banner 加载失败，请通过本地服务器打开此页面。';
  }
}

main();
