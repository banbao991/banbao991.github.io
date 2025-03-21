class FPSCounter {
  constructor(sampleSize = 10) {
    this.fpsSamples = [];
    this.sampleSize = sampleSize;
    this.fps = 0;
  }

  calculateFPS() {
    const now = performance.now();
    this.fpsSamples.push(now);

    if (this.fpsSamples.length > this.sampleSize) {
      this.fpsSamples.shift();
    }

    if (this.fpsSamples.length >= 2) {
      const delta =
          this.fpsSamples[this.fpsSamples.length - 1] - this.fpsSamples[0];
      const averageDelta = delta / (this.fpsSamples.length - 1);
      this.fps = Math.round(1000 / averageDelta);
    }
    return this.fps;
  }
}