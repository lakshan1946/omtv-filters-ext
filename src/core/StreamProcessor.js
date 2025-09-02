import { CANVAS_CONFIG } from "../utils/constants.js";

/**
 * Canvas-based video stream processor
 */
export class StreamProcessor {
  constructor() {
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    this.animationId = null;
  }

  /**
   * Initialize processor with video element
   */
  initialize(videoElement) {
    this.video = videoElement;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", {
      alpha: CANVAS_CONFIG.alpha,
      desynchronized: CANVAS_CONFIG.desynchronized,
    });
  }

  /**
   * Start processing stream
   */
  start(onFrame) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.processFrame(onFrame);
  }

  /**
   * Stop processing stream
   */
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Process a single frame
   */
  processFrame(onFrame) {
    if (!this.isRunning) return;

    this.updateCanvasSize();

    if (onFrame) {
      onFrame(this.ctx, this.video, this.canvas.width, this.canvas.height);
    }

    this.animationId = requestAnimationFrame(() => this.processFrame(onFrame));
  }

  /**
   * Update canvas size to match video dimensions
   */
  updateCanvasSize() {
    const width =
      this.video?.videoWidth || CANVAS_CONFIG.defaultDimensions.width;
    const height =
      this.video?.videoHeight || CANVAS_CONFIG.defaultDimensions.height;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  /**
   * Get processed stream
   */
  getStream(fps = CANVAS_CONFIG.defaultFps) {
    return this.canvas.captureStream(fps);
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stop();
    this.video = null;
    this.canvas = null;
    this.ctx = null;
  }
}
