/**
 * Base filter class
 */
export class BaseFilter {
  constructor(name) {
    this.name = name;
  }

  /**
   * Apply filter to canvas context
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {HTMLVideoElement} video - Source video element
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @param {Object} params - Filter parameters
   */
  apply(ctx, video, width, height, params = {}) {
    throw new Error("Filter must implement apply method");
  }

  /**
   * Cleanup filter resources
   */
  cleanup() {
    // Override if needed
  }
}
