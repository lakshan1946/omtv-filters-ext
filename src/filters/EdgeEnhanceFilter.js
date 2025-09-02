import { BaseFilter } from "./BaseFilter.js";

/**
 * Edge enhancement filter that highlights edges and contours
 */
export class EdgeEnhanceFilter extends BaseFilter {
  constructor() {
    super("edge_enhance");
    this.canvas = null;
    this.ctx = null;
  }

  apply(ctx, video, width, height, params) {
    const intensity = (params.edgeIntensity || 50) / 100;

    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");
    }

    // Resize working canvas if needed
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    // Draw original image
    ctx.drawImage(video, 0, 0, width, height);

    // Get image data for edge detection
    const imageData = ctx.getImageData(0, 0, width, height);
    const originalData = new Uint8ClampedArray(imageData.data);

    // Apply edge detection
    this.detectEdges(imageData, width, height);

    // Blend edge data with original
    this.blendWithOriginal(imageData, originalData, intensity);

    // Draw result
    ctx.putImageData(imageData, 0, 0);
  }

  detectEdges(imageData, width, height) {
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);

    // Sobel edge detection kernels
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sumX = 0,
          sumY = 0;

        // Apply Sobel operators
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            const kernelIdx = (ky + 1) * 3 + (kx + 1);

            sumX += gray * sobelX[kernelIdx];
            sumY += gray * sobelY[kernelIdx];
          }
        }

        // Calculate gradient magnitude
        const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
        const edge = Math.min(255, magnitude);

        const outputIdx = (y * width + x) * 4;
        output[outputIdx] = edge; // R
        output[outputIdx + 1] = edge; // G
        output[outputIdx + 2] = edge; // B
        output[outputIdx + 3] = 255; // A
      }
    }

    // Copy back to imageData
    for (let i = 0; i < data.length; i++) {
      data[i] = output[i];
    }
  }

  blendWithOriginal(imageData, originalData, intensity) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const edge = data[i];
      const edgeStrength = edge / 255;

      // Enhance edges while preserving original colors
      data[i] = originalData[i] + edgeStrength * intensity * 100; // R
      data[i + 1] = originalData[i + 1] + edgeStrength * intensity * 100; // G
      data[i + 2] = originalData[i + 2] + edgeStrength * intensity * 100; // B

      // Clamp values
      data[i] = Math.min(255, data[i]);
      data[i + 1] = Math.min(255, data[i + 1]);
      data[i + 2] = Math.min(255, data[i + 2]);
    }
  }

  cleanup() {
    this.canvas = null;
    this.ctx = null;
  }
}
