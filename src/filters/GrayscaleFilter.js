import { BaseFilter } from "./BaseFilter.js";

/**
 * Grayscale filter
 */
export class GrayscaleFilter extends BaseFilter {
  constructor() {
    super("grayscale");
  }

  apply(ctx, video, width, height) {
    ctx.filter = "grayscale(100%)";
    ctx.drawImage(video, 0, 0, width, height);
    ctx.filter = "none";
  }
}
