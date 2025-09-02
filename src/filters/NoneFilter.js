import { BaseFilter } from "./BaseFilter.js";

/**
 * No filter - pass through original video
 */
export class NoneFilter extends BaseFilter {
  constructor() {
    super("none");
  }

  apply(ctx, video, width, height) {
    ctx.drawImage(video, 0, 0, width, height);
  }
}
