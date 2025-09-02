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
      console.log('[Cat Filter] Initializing cat animator...');
      catAnimator.initialize();
      catAnimator.setAlwaysVisible(true); // Enable always visible mode
      this.isInitialized = true;
      this.lastFrameTime = Date.now();
      console.log('[Cat Filter] Cat animator initialized, cats count:', catAnimator.getCatCount());
    }

    // Calculate delta time for smooth animation
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Get parameters
    const speed = params.catSpeed || 50;
    const size = params.catSize || 30;

    // Update cat animations
    catAnimator.updateCats(width, height, deltaTime);

    // Draw all cats on top of video
    catAnimator.drawCats(ctx, width, height);

    // Add a simple test rectangle to verify drawing is working
    ctx.save();
    ctx.fillStyle = 'rgba(255, 0, 255, 0.7)';
    ctx.fillRect(50, 50, 100, 50);
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText('Cat Filter Active!', 55, 75);
    ctx.restore();

    // Add a visual indicator that the cat filter is active
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px system-ui';
    ctx.fillText(`🐱 Cats: ${catAnimator.getCatCount()}`, 10, height - 10);
    ctx.restore();

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
