import { BaseFilter } from "./BaseFilter.js";

/**
 * Vintage film effect filter
 */
export class VintageFilter extends BaseFilter {
  constructor() {
    super("vintage");
    this.noiseCanvas = null;
    this.noiseCtx = null;
    this.noisePattern = null;
    this.lastNoiseUpdate = 0;
  }

  apply(ctx, video, width, height, params) {
    const intensity = (params.vintageIntensity || 70) / 100;

    // Apply sepia tone
    ctx.filter = `sepia(${intensity * 100}%) contrast(${
      90 + intensity * 20
    }%) brightness(${90 + intensity * 10}%)`;
    ctx.drawImage(video, 0, 0, width, height);
    ctx.filter = "none";

    // Add film grain effect
    this.addFilmGrain(ctx, width, height, intensity);

    // Add vignette
    this.addVignette(ctx, width, height, intensity * 0.3);
  }

  addFilmGrain(ctx, width, height, intensity) {
    const currentTime = Date.now();

    // Update noise pattern every 100ms for animated grain
    if (currentTime - this.lastNoiseUpdate > 100) {
      this.generateNoise(width, height);
      this.lastNoiseUpdate = currentTime;
    }

    if (this.noisePattern) {
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = intensity * 0.15;
      ctx.drawImage(this.noisePattern, 0, 0, width, height);
      ctx.restore();
    }
  }

  generateNoise(width, height) {
    if (!this.noiseCanvas) {
      this.noiseCanvas = document.createElement("canvas");
      this.noiseCtx = this.noiseCanvas.getContext("2d");
    }

    this.noiseCanvas.width = width;
    this.noiseCanvas.height = height;

    const imageData = this.noiseCtx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise; // R
      data[i + 1] = noise; // G
      data[i + 2] = noise; // B
      data[i + 3] = 255; // A
    }

    this.noiseCtx.putImageData(imageData, 0, 0);
    this.noisePattern = this.noiseCanvas;
  }

  addVignette(ctx, width, height, intensity) {
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.7
    );

    gradient.addColorStop(0, `rgba(0,0,0,0)`);
    gradient.addColorStop(1, `rgba(0,0,0,${intensity})`);

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  cleanup() {
    this.noiseCanvas = null;
    this.noiseCtx = null;
    this.noisePattern = null;
  }
}
