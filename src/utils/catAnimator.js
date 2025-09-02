/**
 * Cat animation utility for creating and animating cats in the video
 */

export class CatAnimator {
  constructor() {
    this.cats = [];
    this.maxCats = 3;
    this.minCats = 2; // Always maintain at least 2 cats
    this.lastSpawn = 0;
    this.spawnInterval = 2000; // 2 seconds between spawns
    this.canvas = null;
    this.ctx = null;
    this.alwaysVisible = false;
  }

  /**
   * Initialize the cat animator
   */
  initialize() {
    if (this.canvas) return;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
  }

  /**
   * Create a new cat with random properties
   */
  createCat(width, height, speed, size) {
    const directions = ["left-to-right", "right-to-left", "top-to-bottom"];
    const direction = directions[Math.floor(Math.random() * directions.length)];

    let startX, startY, targetX, targetY;

    switch (direction) {
      case "left-to-right":
        startX = -size;
        startY = Math.random() * (height - size);
        targetX = width + size;
        targetY = startY + (Math.random() - 0.5) * 100;
        break;
      case "right-to-left":
        startX = width + size;
        startY = Math.random() * (height - size);
        targetX = -size;
        targetY = startY + (Math.random() - 0.5) * 100;
        break;
      case "top-to-bottom":
        startX = Math.random() * (width - size);
        startY = -size;
        targetX = startX + (Math.random() - 0.5) * 200;
        targetY = height + size;
        break;
    }

    const cat = {
      id: Date.now() + Math.random(),
      x: startX,
      y: startY,
      targetX,
      targetY,
      size,
      speed: speed / 100,
      direction,
      age: 0,
      maxAge: this.alwaysVisible ? Infinity : 8000, // Infinite lifetime when always visible
      opacity: 1,
      color: this.getRandomCatColor(),
      isJumping: false,
      jumpOffset: 0,
      tail: {
        angle: 0,
        swishSpeed: 0.1 + Math.random() * 0.05,
      },
      isPersistent: this.alwaysVisible,
    };

    return cat;
  }

  /**
   * Get a random cat color
   */
  getRandomCatColor() {
    const colors = [
      { body: "#FF8C42", stripes: "#D4641C" }, // Orange tabby
      { body: "#8B4513", stripes: "#654321" }, // Brown tabby
      { body: "#2F2F2F", stripes: "#000000" }, // Black cat
      { body: "#D3D3D3", stripes: "#A9A9A9" }, // Gray cat
      { body: "#FFFFFF", stripes: "#E0E0E0" }, // White cat
      { body: "#FFE4B5", stripes: "#DEB887" }, // Cream cat
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Set whether cats should always be visible
   */
  setAlwaysVisible(alwaysVisible) {
    console.log('[Cat Animator] Setting always visible:', alwaysVisible);
    this.alwaysVisible = alwaysVisible;

    // Update existing cats
    this.cats.forEach((cat) => {
      if (alwaysVisible) {
        cat.maxAge = Infinity;
        cat.isPersistent = true;
      } else {
        // Give non-persistent cats a remaining lifetime
        cat.maxAge = cat.age + 8000;
        cat.isPersistent = false;
      }
    });

    // If enabling always visible and we don't have enough cats, spawn some immediately
    if (alwaysVisible && this.cats.length < this.minCats) {
      console.log('[Cat Animator] Spawning initial cats...');
      // Spawn initial cats immediately
      for (let i = this.cats.length; i < this.minCats; i++) {
        this.spawnRandomCat(640, 480); // Default size, will be updated with actual dimensions
      }
      console.log('[Cat Animator] Initial cats spawned, total:', this.cats.length);
    }
  }

  /**
   * Update cat positions and animations
   */
  updateCats(width, height, deltaTime) {
    // Remove old cats (but not persistent ones)
    const initialCount = this.cats.length;
    this.cats = this.cats.filter(
      (cat) => cat.isPersistent || cat.age < cat.maxAge
    );

    // For always visible mode, ensure we have minimum cats
    if (this.alwaysVisible && this.cats.length < this.minCats) {
      console.log(`[Cat Animator] Need more cats! Current: ${this.cats.length}, Min: ${this.minCats}`);
      this.spawnRandomCat(width, height);
    }

    // Spawn new cats based on timing
    const now = Date.now();
    if (
      now - this.lastSpawn > this.spawnInterval &&
      this.cats.length < this.maxCats
    ) {
      this.spawnRandomCat(width, height);
      this.lastSpawn = now;
    }

    // Update existing cats
    this.cats.forEach((cat) => {
      this.updateCat(cat, deltaTime, width, height);
    });
  }

  /**
   * Spawn a random cat
   */
  spawnRandomCat(width, height, speed = 50, size = 30) {
    console.log(`[Cat Animator] Spawning cat at ${width}x${height}, speed:${speed}, size:${size}`);
    const cat = this.createCat(width, height, speed, size);
    this.cats.push(cat);
    console.log(`[Cat Animator] Cat spawned! Total cats: ${this.cats.length}, Cat position: (${cat.x}, ${cat.y})`);
  }

  /**
   * Update individual cat
   */
  updateCat(cat, deltaTime, width, height) {
    cat.age += deltaTime;

    // Calculate movement
    const progress = cat.isPersistent ? 0 : Math.min(cat.age / cat.maxAge, 1);
    const dx = cat.targetX - cat.x;
    const dy = cat.targetY - cat.y;

    cat.x += dx * cat.speed * (deltaTime / 16);
    cat.y += dy * cat.speed * (deltaTime / 16);

    // Check if persistent cat has reached the edge and needs to respawn
    if (cat.isPersistent) {
      const isOffScreen =
        cat.x < -cat.size ||
        cat.x > width + cat.size ||
        cat.y < -cat.size ||
        cat.y > height + cat.size;

      if (isOffScreen) {
        // Respawn the cat from a new position
        this.respawnCat(cat, width, height);
      }
    }

    // Add jumping animation
    cat.jumpOffset = Math.sin(cat.age * 0.01) * 5;

    // Update tail swish
    cat.tail.angle += cat.tail.swishSpeed;

    // Fade out near end of life (only for non-persistent cats)
    if (!cat.isPersistent && progress > 0.8) {
      cat.opacity = 1 - (progress - 0.8) * 5;
    } else {
      cat.opacity = 1;
    }
  }

  /**
   * Respawn a persistent cat with new random position and direction
   */
  respawnCat(cat, width, height) {
    const directions = ["left-to-right", "right-to-left", "top-to-bottom"];
    const direction = directions[Math.floor(Math.random() * directions.length)];

    let startX, startY, targetX, targetY;
    const size = cat.size;

    switch (direction) {
      case "left-to-right":
        startX = -size;
        startY = Math.random() * (height - size);
        targetX = width + size;
        targetY = startY + (Math.random() - 0.5) * 100;
        break;
      case "right-to-left":
        startX = width + size;
        startY = Math.random() * (height - size);
        targetX = -size;
        targetY = startY + (Math.random() - 0.5) * 100;
        break;
      case "top-to-bottom":
        startX = Math.random() * (width - size);
        startY = -size;
        targetX = startX + (Math.random() - 0.5) * 200;
        targetY = height + size;
        break;
    }

    // Update cat properties for respawn
    cat.x = startX;
    cat.y = startY;
    cat.targetX = targetX;
    cat.targetY = targetY;
    cat.direction = direction;
    cat.age = 0;
    cat.opacity = 1;
    cat.color = this.getRandomCatColor(); // New random color
  }

  /**
   * Draw all cats
   */
  drawCats(ctx, width, height) {
    if (this.cats.length === 0) {
      console.log('[Cat Animator] No cats to draw!');
      return;
    }

    console.log(`[Cat Animator] Drawing ${this.cats.length} cats`);
    ctx.save();

    this.cats.forEach((cat, index) => {
      console.log(`[Cat Animator] Drawing cat ${index} at (${Math.round(cat.x)}, ${Math.round(cat.y)}), size: ${cat.size}, opacity: ${cat.opacity}`);
      this.drawCat(ctx, cat);
    });

    ctx.restore();
  }

  /**
   * Draw individual cat
   */
  drawCat(ctx, cat) {
    ctx.save();
    ctx.globalAlpha = cat.opacity;
    ctx.translate(cat.x, cat.y + cat.jumpOffset);

    const size = cat.size;
    const halfSize = size / 2;

    // Draw shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.ellipse(
      halfSize,
      size * 0.9,
      size * 0.6,
      size * 0.1,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw tail
    this.drawTail(ctx, cat, size);

    // Draw body (oval)
    ctx.fillStyle = cat.color.body;
    ctx.beginPath();
    ctx.ellipse(
      halfSize,
      halfSize,
      size * 0.35,
      size * 0.25,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw head (circle)
    ctx.beginPath();
    ctx.ellipse(
      halfSize,
      size * 0.3,
      size * 0.25,
      size * 0.25,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw ears
    ctx.beginPath();
    ctx.moveTo(halfSize - size * 0.15, size * 0.15);
    ctx.lineTo(halfSize - size * 0.05, size * 0.05);
    ctx.lineTo(halfSize - size * 0.25, size * 0.05);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(halfSize + size * 0.15, size * 0.15);
    ctx.lineTo(halfSize + size * 0.05, size * 0.05);
    ctx.lineTo(halfSize + size * 0.25, size * 0.05);
    ctx.closePath();
    ctx.fill();

    // Draw stripes on body
    ctx.fillStyle = cat.color.stripes;
    for (let i = 0; i < 3; i++) {
      const y = size * 0.4 + i * size * 0.08;
      ctx.fillRect(halfSize - size * 0.3, y, size * 0.6, size * 0.03);
    }

    // Draw eyes
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.ellipse(
      halfSize - size * 0.08,
      size * 0.25,
      size * 0.04,
      size * 0.06,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      halfSize + size * 0.08,
      size * 0.25,
      size * 0.04,
      size * 0.06,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw pupils
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(
      halfSize - size * 0.08,
      size * 0.25,
      size * 0.015,
      size * 0.03,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      halfSize + size * 0.08,
      size * 0.25,
      size * 0.015,
      size * 0.03,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw nose
    ctx.fillStyle = "#FFB6C1";
    ctx.beginPath();
    ctx.moveTo(halfSize, size * 0.32);
    ctx.lineTo(halfSize - size * 0.02, size * 0.28);
    ctx.lineTo(halfSize + size * 0.02, size * 0.28);
    ctx.closePath();
    ctx.fill();

    // Draw legs
    ctx.fillStyle = cat.color.body;
    const legPositions = [
      [halfSize - size * 0.2, size * 0.7],
      [halfSize - size * 0.05, size * 0.7],
      [halfSize + size * 0.05, size * 0.7],
      [halfSize + size * 0.2, size * 0.7],
    ];

    legPositions.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.04, size * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Draw animated tail
   */
  drawTail(ctx, cat, size) {
    ctx.save();

    const tailBase = {
      x: size * 0.15,
      y: size * 0.5,
    };

    ctx.strokeStyle = cat.color.body;
    ctx.lineWidth = size * 0.08;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(tailBase.x, tailBase.y);

    // Create curved tail with swishing motion
    const swish = Math.sin(cat.tail.angle) * size * 0.3;
    const cp1x = tailBase.x - size * 0.2 + swish;
    const cp1y = tailBase.y - size * 0.2;
    const cp2x = tailBase.x - size * 0.4 + swish * 0.5;
    const cp2y = tailBase.y - size * 0.4;
    const endx = tailBase.x - size * 0.3 + swish;
    const endy = tailBase.y - size * 0.6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endx, endy);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Clear all cats
   */
  clearCats() {
    this.cats = [];
  }

  /**
   * Get current cat count
   */
  getCatCount() {
    return this.cats.length;
  }
}

export const catAnimator = new CatAnimator();
