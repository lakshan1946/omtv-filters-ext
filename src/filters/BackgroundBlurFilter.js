import { BaseFilter } from "./BaseFilter.js";
import { simpleBgDetection } from "../utils/simpleBgDetection.js";

/**
 * Background blur filter that blurs only the background while keeping the person sharp
 * Uses CPU-based detection to avoid external dependencies and CORS issues
 */
export class BackgroundBlurFilter extends BaseFilter {
  constructor() {
    super("background_blur");
    this.isInitialized = false;
  }

  apply(ctx, video, width, height, params) {
    const blurAmount = Math.max(1, params.backgroundBlurIntensity || 10);

    if (!this.isInitialized) {
      simpleBgDetection.initialize();
      this.isInitialized = true;
    }

    try {
      // Apply CPU-based background blur
      simpleBgDetection.applyBackgroundBlur(
        ctx,
        video,
        blurAmount,
        width,
        height
      );

      // Draw subtle indicator that background blur is active
      this.drawStatusIndicator(ctx, width, height, "BG Blur Active");
    } catch (error) {
      console.warn(
        "[Background Blur] Processing failed, using fallback:",
        error
      );

      // Simple fallback - reduced blur on entire frame
      ctx.filter = `blur(${Math.min(blurAmount * 0.3, 5)}px)`;
      ctx.drawImage(video, 0, 0, width, height);
      ctx.filter = "none";

      this.drawStatusIndicator(ctx, width, height, "Simple Mode");
    }
  }

  /**
   * Draw status indicator
   */
  drawStatusIndicator(ctx, width, height, status) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(width - 100, 10, 90, 20);

    ctx.fillStyle = "#4CAF50";
    ctx.font = "11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(status, width - 55, 24);
    ctx.restore();
  }

  cleanup() {
    simpleBgDetection.cleanup();
    this.isInitialized = false;
  }
}
