import BaseFilter from "./BaseFilter";

/**
 * MirrorFilter horizontally flips the video stream.
 */
class MirrorFilter extends BaseFilter {
  constructor() {
    super("Mirror");
  }

  /**
   * Applies the mirror effect to the video frame.
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   * @param {HTMLVideoElement} video - The video element.
   * @param {number} width - The width of the canvas.
   * @param {number} height - The height of the canvas.
   * @param {Object} params - Filter parameters (unused)
   */
  apply(ctx, video, width, height, params = {}) {
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();
  }
}

export default MirrorFilter;
