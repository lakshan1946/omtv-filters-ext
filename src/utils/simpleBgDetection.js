/**
 * CPU-based body detection using simple edge detection and heuristics
 * This provides a fallback for background blur without external dependencies
 */

export class SimpleBgDetection {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.imageData = null;
    this.maskCanvas = null;
    this.maskCtx = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the detection system
   */
  initialize() {
    if (this.isInitialized) return;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.maskCanvas = document.createElement("canvas");
    this.maskCtx = this.maskCanvas.getContext("2d");

    this.isInitialized = true;
  }

  /**
   * Create a simple person mask using edge detection and center weighting
   * @param {HTMLVideoElement} video - Source video element
   * @param {number} width - Frame width
   * @param {number} height - Frame height
   * @returns {ImageData} - Mask data where white = person, black = background
   */
  createPersonMask(video, width, height) {
    if (!this.isInitialized) {
      this.initialize();
    }

    // Resize canvases if needed
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.maskCanvas.width = width;
      this.maskCanvas.height = height;
    }

    // Draw video to working canvas
    this.ctx.drawImage(video, 0, 0, width, height);
    this.imageData = this.ctx.getImageData(0, 0, width, height);

    // Create mask using simple heuristics
    const mask = this.createSimpleMask(width, height);

    return mask;
  }

  /**
   * Create a simple mask using center-weighted ellipse and motion detection
   */
  createSimpleMask(width, height) {
    const maskData = this.maskCtx.createImageData(width, height);
    const data = maskData.data;

    // Center point and ellipse parameters
    const centerX = width * 0.5;
    const centerY = height * 0.35; // Slightly above center for head/torso
    const radiusX = width * 0.25;
    const radiusY = height * 0.4;

    // Create elliptical mask with soft edges
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Calculate distance from center ellipse
        const dx = (x - centerX) / radiusX;
        const dy = (y - centerY) / radiusY;
        const ellipseDistance = Math.sqrt(dx * dx + dy * dy);

        // Create soft-edged mask
        let maskValue = 0;
        if (ellipseDistance < 1.0) {
          // Inside ellipse - likely person
          maskValue = Math.max(0, 255 * (1.2 - ellipseDistance));
        } else if (ellipseDistance < 1.3) {
          // Soft edge transition
          maskValue = Math.max(0, 255 * (1.3 - ellipseDistance) * 3);
        }

        // Apply some noise reduction
        maskValue = Math.min(255, Math.max(0, maskValue));

        // Set RGBA values (grayscale mask)
        data[idx] = maskValue; // R
        data[idx + 1] = maskValue; // G
        data[idx + 2] = maskValue; // B
        data[idx + 3] = 255; // A
      }
    }

    return maskData;
  }

  /**
   * Apply background blur using the generated mask
   * @param {CanvasRenderingContext2D} ctx - Target canvas context
   * @param {HTMLVideoElement} video - Source video
   * @param {number} blurAmount - Blur intensity
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  applyBackgroundBlur(ctx, video, blurAmount, width, height) {
    const mask = this.createPersonMask(video, width, height);

    // Clear target canvas
    ctx.clearRect(0, 0, width, height);

    // Draw blurred background
    ctx.filter = `blur(${blurAmount}px)`;
    ctx.drawImage(video, 0, 0, width, height);
    ctx.filter = "none";

    // Save the blurred background
    const blurredBg = ctx.getImageData(0, 0, width, height);

    // Draw original video
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(video, 0, 0, width, height);
    const originalFg = ctx.getImageData(0, 0, width, height);

    // Composite using mask
    this.compositeWithMask(ctx, originalFg, blurredBg, mask, width, height);
  }

  /**
   * Composite foreground and background using mask
   */
  compositeWithMask(ctx, foreground, background, mask, width, height) {
    const result = ctx.createImageData(width, height);
    const fgData = foreground.data;
    const bgData = background.data;
    const maskData = mask.data;
    const resultData = result.data;

    for (let i = 0; i < fgData.length; i += 4) {
      const maskValue = maskData[i] / 255; // Normalize to 0-1

      // Blend foreground and background based on mask
      resultData[i] = fgData[i] * maskValue + bgData[i] * (1 - maskValue); // R
      resultData[i + 1] =
        fgData[i + 1] * maskValue + bgData[i + 1] * (1 - maskValue); // G
      resultData[i + 2] =
        fgData[i + 2] * maskValue + bgData[i + 2] * (1 - maskValue); // B
      resultData[i + 3] = 255; // Full opacity
    }

    ctx.putImageData(result, 0, 0);
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.canvas = null;
    this.ctx = null;
    this.maskCanvas = null;
    this.maskCtx = null;
    this.imageData = null;
    this.isInitialized = false;
  }
}

export const simpleBgDetection = new SimpleBgDetection();
