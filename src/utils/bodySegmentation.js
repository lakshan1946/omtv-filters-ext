/**
 * Body segmentation utility using MediaPipe
 * Provides person detection and segmentation for background effects
 */

export class BodySegmentation {
  constructor() {
    this.isInitialized = false;
    this.isLoading = false;
    this.selfieSegmentation = null;
    this.canvas = null;
    this.ctx = null;
    this.maskCanvas = null;
    this.maskCtx = null;
  }

  /**
   * Initialize MediaPipe SelfieSegmentation
   */
  async initialize() {
    if (this.isInitialized || this.isLoading) {
      return this.isInitialized;
    }

    this.isLoading = true;

    try {
      // Check if MediaPipe is available
      if (typeof window.SelfieSegmentation === "undefined") {
        await this.loadMediaPipe();
      }

      // Initialize segmentation
      this.selfieSegmentation = new window.SelfieSegmentation({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        },
      });

      this.selfieSegmentation.setOptions({
        modelSelection: 1, // 0 for general, 1 for landscape
        selfieMode: true,
      });

      // Create canvas for processing
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");

      this.maskCanvas = document.createElement("canvas");
      this.maskCtx = this.maskCanvas.getContext("2d");

      this.isInitialized = true;
      console.log("[Background Blur] MediaPipe initialized successfully");
    } catch (error) {
      console.warn("[Background Blur] Failed to initialize MediaPipe:", error);
      this.isInitialized = false;
    }

    this.isLoading = false;
    return this.isInitialized;
  }

  /**
   * Load MediaPipe library dynamically
   */
  async loadMediaPipe() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Segment person from background
   * @param {HTMLVideoElement} video - Source video element
   * @param {Function} callback - Callback with segmentation results
   */
  async segment(video, callback) {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        // Fallback to simple blur if segmentation fails
        callback(null);
        return;
      }
    }

    try {
      this.selfieSegmentation.onResults((results) => {
        if (results.segmentationMask) {
          callback(results.segmentationMask);
        } else {
          callback(null);
        }
      });

      await this.selfieSegmentation.send({ image: video });
    } catch (error) {
      console.warn("[Background Blur] Segmentation failed:", error);
      callback(null);
    }
  }

  /**
   * Create blurred background with person cutout
   * @param {CanvasRenderingContext2D} ctx - Target canvas context
   * @param {HTMLVideoElement} video - Source video
   * @param {ImageData} mask - Segmentation mask
   * @param {number} blurAmount - Blur intensity
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  applyBackgroundBlur(ctx, video, mask, blurAmount, width, height) {
    if (!mask) {
      // Fallback to full blur
      ctx.filter = `blur(${blurAmount}px)`;
      ctx.drawImage(video, 0, 0, width, height);
      ctx.filter = "none";
      return;
    }

    // Resize canvases if needed
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.maskCanvas.width = width;
      this.maskCanvas.height = height;
    }

    // Draw blurred background
    this.ctx.filter = `blur(${blurAmount}px)`;
    this.ctx.drawImage(video, 0, 0, width, height);
    this.ctx.filter = "none";

    // Draw mask to mask canvas
    this.maskCtx.putImageData(mask, 0, 0);

    // Draw original video
    ctx.drawImage(video, 0, 0, width, height);

    // Use mask to composite blurred background
    ctx.globalCompositeOperation = "source-atop";
    ctx.drawImage(this.maskCanvas, 0, 0);

    ctx.globalCompositeOperation = "destination-over";
    ctx.drawImage(this.canvas, 0, 0);

    ctx.globalCompositeOperation = "source-over";
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.selfieSegmentation) {
      this.selfieSegmentation.close();
      this.selfieSegmentation = null;
    }

    this.canvas = null;
    this.ctx = null;
    this.maskCanvas = null;
    this.maskCtx = null;
    this.isInitialized = false;
  }
}

export const bodySegmentation = new BodySegmentation();
