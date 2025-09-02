import { BaseFilter } from "./BaseFilter.js";

/**
 * Blur filter
 */
export class BlurFilter extends BaseFilter {
  constructor() {
    super("blur");
  }

  apply(ctx, video, width, height, params) {
    const blurAmount = params.blurPx || 6;
    ctx.filter = `blur(${blurAmount}px)`;
    ctx.drawImage(video, 0, 0, width, height);
    ctx.filter = "none";
  }
}
