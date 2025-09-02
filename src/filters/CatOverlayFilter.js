import { BaseFilter } from "./BaseFilter.js";
import { catAnimator } from "../utils/catAnimator.js";

/**
 * Cat overlay filter that adds animated cats moving across the screen
 */
export class CatOverlayFilter extends BaseFilter {
  constructor() {
    super("cat_overlay");
    this.lastFrameTime = 0;
    this.isInitialized = false;
  }

  apply(ctx, video, width, height, params) {
    // Draw original video first
    ctx.drawImage(video, 0, 0, width, height);

    // Initialize cat animator if needed
    if (!this.isInitialized) {
      catAnimator.initialize();
      catAnimator.setAlwaysVisible(true); // Enable always visible mode
      this.isInitialized = true;
      this.lastFrameTime = Date.now();
    }

    // Calculate delta time for smooth animation
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Get parameters from UI controls
    const speed = params.catSpeed || 50;
    const size = params.catSize || 30; // Update cat animations with current parameters
    catAnimator.updateCats(width, height, deltaTime, speed, size);

    // Draw all cats on top of video
    catAnimator.drawCats(ctx, width, height);

    // Add cute paw prints occasionally
    if (Math.random() < 0.001) {
      this.drawPawPrint(ctx, width, height);
    }
  }

  /**
   * Draw a cute paw print that fades over time
   */
  drawPawPrint(ctx, width, height) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 8 + Math.random() * 12;

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#8B4513";

    // Main pad
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.4, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Toes
    const toePositions = [
      [-0.3, -0.4],
      [0, -0.5],
      [0.3, -0.4],
    ];

    toePositions.forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.ellipse(
        x + dx * size,
        y + dy * size,
        size * 0.15,
        size * 0.1,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    ctx.restore();

    // Schedule fade out (this is a simple approach, in a real app you'd manage these properly)
    setTimeout(() => {
      // Paw print fades naturally as the video refreshes
    }, 2000);
  }

  /**
   * Add instant cat spawn for testing
   */
  spawnCat(width, height, speed, size) {
    if (!this.isInitialized) {
      catAnimator.initialize();
      this.isInitialized = true;
    }
    catAnimator.spawnRandomCat(width, height, speed, size);
  }

  cleanup() {
    catAnimator.setAlwaysVisible(false); // Disable always visible mode
    catAnimator.clearCats();
    this.isInitialized = false;
  }
}
