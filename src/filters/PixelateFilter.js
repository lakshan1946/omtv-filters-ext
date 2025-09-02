import { BaseFilter } from "./BaseFilter.js";

/**
 * Pixelate filter
 */
export class PixelateFilter extends BaseFilter {
  constructor() {
    super("pixelate");
    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenCtx = this.offscreenCanvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });
  }

  apply(ctx, video, width, height, params) {
    const pixelSize = Math.max(1, Math.min(params.pixelSize || 8, 100));
    const scaledWidth = Math.max(1, Math.floor(width / pixelSize));
    const scaledHeight = Math.max(1, Math.floor(height / pixelSize));

    // Resize offscreen canvas if needed
    if (
      this.offscreenCanvas.width !== scaledWidth ||
      this.offscreenCanvas.height !== scaledHeight
    ) {
      this.offscreenCanvas.width = scaledWidth;
      this.offscreenCanvas.height = scaledHeight;
    }

    // Disable smoothing for pixelated effect
    this.offscreenCtx.imageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    // Downscale to offscreen canvas
    this.offscreenCtx.drawImage(video, 0, 0, scaledWidth, scaledHeight);

    // Upscale back to main canvas
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(
      this.offscreenCanvas,
      0,
      0,
      scaledWidth,
      scaledHeight,
      0,
      0,
      width,
      height
    );
  }

  cleanup() {
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
  }
}
