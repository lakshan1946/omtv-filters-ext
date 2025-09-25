/**
 * OmeTV Custom Video Filters - Main Script
 * Full implementation with stream interception for Manifest V3 compatibility
 */

(function () {
  "use strict";

  // Prevent double injection
  const INJECTION_MARKER = "__omtv_filter_patch_applied";
  if (window[INJECTION_MARKER]) {
    console.log("[OmeTV Filters] Already injected, skipping");
    return;
  }
  window[INJECTION_MARKER] = true;

  // Filter types
  const FILTER_TYPES = {
    NONE: "none",
    GRAYSCALE: "grayscale",
    BLUR: "blur",
    PIXELATE: "pixelate",
    MIRROR: "mirror",
    BACKGROUND_BLUR: "background_blur",
    VINTAGE: "vintage",
    EDGE_ENHANCE: "edge_enhance",
  };

  // Canvas configuration
  const CANVAS_CONFIG = {
    alpha: false,
    desynchronized: true,
    defaultFps: 30,
    defaultDimensions: { width: 640, height: 480 },
  };

  // State management
  let currentFilter = FILTER_TYPES.NONE;
  let isEnabled = true;

  /**
   * Stream Processor - processes video frames through canvas
   */
  class StreamProcessor {
    constructor() {
      this.video = null;
      this.canvas = null;
      this.ctx = null;
      this.isRunning = false;
      this.animationId = null;
    }

    initialize(videoElement) {
      this.video = videoElement;
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d", {
        alpha: CANVAS_CONFIG.alpha,
        desynchronized: CANVAS_CONFIG.desynchronized,
      });
    }

    start(onFrame) {
      if (this.isRunning) return;
      this.isRunning = true;
      this.processFrame(onFrame);
    }

    stop() {
      this.isRunning = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    processFrame(onFrame) {
      if (!this.isRunning) return;

      this.updateCanvasSize();

      if (onFrame) {
        onFrame(this.ctx, this.video, this.canvas.width, this.canvas.height);
      }

      this.animationId = requestAnimationFrame(() =>
        this.processFrame(onFrame)
      );
    }

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

    getStream(fps = CANVAS_CONFIG.defaultFps) {
      return this.canvas.captureStream(fps);
    }

    cleanup() {
      this.stop();
      this.video = null;
      this.canvas = null;
      this.ctx = null;
    }
  }

  /**
   * Stream Manager - intercepts getUserMedia and processes streams
   */
  class StreamManager {
    constructor() {
      this.originalGetUserMedia = null;
      this.isPatched = false;
    }

    initialize() {
      if (this.isPatched) return;

      this.originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(
        navigator.mediaDevices
      );

      navigator.mediaDevices.getUserMedia = this.patchedGetUserMedia.bind(this);
      this.isPatched = true;
      console.log("[OmeTV Filters] getUserMedia patched successfully");
    }

    async patchedGetUserMedia(constraints = {}) {
      console.log("[OmeTV Filters] getUserMedia intercepted", constraints);

      const rawStream = await this.originalGetUserMedia(constraints);

      const wantsVideo = this.isVideoRequested(constraints);
      if (!wantsVideo) {
        return rawStream;
      }

      try {
        const processedStream = await this.buildProcessedStream(
          rawStream,
          constraints
        );
        return processedStream || rawStream;
      } catch (error) {
        console.warn("[OmeTV Filters] Failed to process stream:", error);
        return rawStream;
      }
    }

    isVideoRequested(constraints) {
      return (
        (typeof constraints.video === "boolean" && constraints.video) ||
        typeof constraints.video === "object"
      );
    }

    async buildProcessedStream(rawStream, constraints) {
      const videoTrack = rawStream.getVideoTracks()[0];
      if (!videoTrack) {
        return rawStream;
      }

      const video = this.createVideoElement(rawStream);
      await this.waitForVideoReady(video);

      const fps = this.extractFrameRate(videoTrack, constraints);
      const processor = new StreamProcessor();
      processor.initialize(video);

      processor.start((ctx, videoEl, width, height) => {
        this.applyCurrentFilter(ctx, videoEl, width, height);
      });

      const processedStream = processor.getStream(fps);
      this.forwardAudioTracks(rawStream, processedStream);
      this.setupStreamCleanup(processedStream, rawStream, processor);

      console.log("[OmeTV Filters] Stream processed successfully");
      return processedStream;
    }

    createVideoElement(stream) {
      const video = document.createElement("video");
      video.style.position = "fixed";
      video.style.opacity = "0";
      video.style.pointerEvents = "none";
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      return video;
    }

    async waitForVideoReady(video) {
      try {
        await video.play();
      } catch (error) {
        console.debug("Video autoplay blocked:", error);
      }
    }

    extractFrameRate(videoTrack, constraints) {
      const settings = videoTrack.getSettings ? videoTrack.getSettings() : {};
      return (
        settings.frameRate ||
        constraints?.video?.frameRate ||
        CANVAS_CONFIG.defaultFps
      );
    }

    applyCurrentFilter(ctx, video, width, height) {
      if (!isEnabled || currentFilter === FILTER_TYPES.NONE) {
        ctx.drawImage(video, 0, 0, width, height);
        return;
      }

      // Apply the selected filter
      switch (currentFilter) {
        case FILTER_TYPES.GRAYSCALE:
          ctx.drawImage(video, 0, 0, width, height);
          ctx.filter = "grayscale(100%)";
          ctx.globalCompositeOperation = "source-over";
          break;

        case FILTER_TYPES.BLUR:
          ctx.filter = "blur(5px)";
          ctx.drawImage(video, 0, 0, width, height);
          break;

        case FILTER_TYPES.PIXELATE:
          // Pixelate by drawing small then scaling up
          const pixelSize = 8;
          const smallWidth = width / pixelSize;
          const smallHeight = height / pixelSize;

          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(video, 0, 0, smallWidth, smallHeight);
          ctx.drawImage(
            ctx.canvas,
            0,
            0,
            smallWidth,
            smallHeight,
            0,
            0,
            width,
            height
          );
          break;

        case FILTER_TYPES.MIRROR:
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(video, -width, 0, width, height);
          ctx.restore();
          break;

        case FILTER_TYPES.VINTAGE:
          ctx.drawImage(video, 0, 0, width, height);
          ctx.filter = "sepia(70%) contrast(130%) brightness(90%)";
          break;

        case FILTER_TYPES.EDGE_ENHANCE:
          ctx.drawImage(video, 0, 0, width, height);
          ctx.filter = "contrast(200%) brightness(120%)";
          break;

        default:
          ctx.drawImage(video, 0, 0, width, height);
      }

      // Reset filter for next frame
      ctx.filter = "none";
    }

    forwardAudioTracks(rawStream, processedStream) {
      rawStream.getAudioTracks().forEach((track) => {
        processedStream.addTrack(track);
      });
    }

    setupStreamCleanup(processedStream, rawStream, processor) {
      const videoTrack = processedStream.getVideoTracks()[0];
      if (!videoTrack) return;

      const cleanup = () => {
        processor.cleanup();
        rawStream.getTracks().forEach((track) => track.stop());
      };

      videoTrack.addEventListener("ended", cleanup);
    }

    restore() {
      if (this.isPatched && this.originalGetUserMedia) {
        navigator.mediaDevices.getUserMedia = this.originalGetUserMedia;
        this.isPatched = false;
      }
    }
  }

  /**
   * Filter Panel for UI
   */
  class FilterPanel {
    constructor() {
      this.panel = null;
      this.isVisible = false;
    }

    create() {
      if (this.panel) return;

      this.panel = document.createElement("div");
      this.panel.id = "omtv-filter-panel";
      this.panel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 200px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 2147483647;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
      `;

      const title = document.createElement("div");
      title.textContent = "OmeTV Filters";
      title.style.cssText =
        "font-weight: bold; margin-bottom: 10px; text-align: center; color: #00ff88;";
      this.panel.appendChild(title);

      // Create filter buttons
      Object.entries(FILTER_TYPES).forEach(([key, value]) => {
        const button = document.createElement("button");
        button.textContent =
          key.charAt(0) + key.slice(1).toLowerCase().replace("_", " ");
        button.style.cssText = `
          display: block;
          width: 100%;
          margin: 5px 0;
          padding: 8px;
          background: ${currentFilter === value ? "#007acc" : "#333"};
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        `;

        button.addEventListener("click", () => {
          this.applyFilter(value);
          this.updateButtonStates();
        });

        this.panel.appendChild(button);
      });

      // Add toggle button
      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = isEnabled ? "Disable Filters" : "Enable Filters";
      toggleBtn.style.cssText = `
        display: block;
        width: 100%;
        margin: 10px 0 5px 0;
        padding: 8px;
        background: ${isEnabled ? "#ff6b6b" : "#51cf66"};
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      `;

      toggleBtn.addEventListener("click", () => {
        isEnabled = !isEnabled;
        toggleBtn.textContent = isEnabled
          ? "Disable Filters"
          : "Enable Filters";
        toggleBtn.style.background = isEnabled ? "#ff6b6b" : "#51cf66";
        console.log(
          `[OmeTV Filters] Filters ${isEnabled ? "enabled" : "disabled"}`
        );
      });

      this.panel.appendChild(toggleBtn);

      // Add close button
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "×";
      closeBtn.style.cssText = `
        position: absolute;
        top: 5px;
        right: 10px;
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
      `;
      closeBtn.addEventListener("click", () => this.toggle());
      this.panel.appendChild(closeBtn);

      document.body.appendChild(this.panel);
      this.isVisible = true;

      console.log("[OmeTV Filters] Panel created successfully");
    }

    applyFilter(filterType) {
      console.log(`[OmeTV Filters] Setting filter to: ${filterType}`);
      currentFilter = filterType;
    }

    updateButtonStates() {
      const buttons = this.panel.querySelectorAll("button");
      buttons.forEach((button, index) => {
        if (index < Object.keys(FILTER_TYPES).length) {
          const filterValue = Object.values(FILTER_TYPES)[index];
          button.style.background =
            currentFilter === filterValue ? "#007acc" : "#333";
        }
      });
    }

    toggle() {
      if (this.panel) {
        this.panel.style.display = this.isVisible ? "none" : "block";
        this.isVisible = !this.isVisible;
      }
    }

    destroy() {
      if (this.panel) {
        this.panel.remove();
        this.panel = null;
        this.isVisible = false;
      }
    }
  }

  /**
   * Main Application
   */
  class OMeTVFilters {
    constructor() {
      this.panel = null;
      this.streamManager = null;
      this.isInitialized = false;
    }

    initialize() {
      if (this.isInitialized) return;

      try {
        console.log("[OmeTV Filters] Initializing extension...");

        // Initialize stream manager immediately
        this.streamManager = new StreamManager();
        this.streamManager.initialize();

        // Create UI when DOM is ready
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => {
            this.setupUI();
          });
        } else {
          this.setupUI();
        }

        this.isInitialized = true;
        console.log("[OmeTV Filters] Extension initialized successfully");
      } catch (error) {
        console.error("[OmeTV Filters] Failed to initialize:", error);
      }
    }

    setupUI() {
      // Wait a bit for the page to fully load
      setTimeout(() => {
        this.panel = new FilterPanel();
        this.panel.create();
      }, 2000);
    }

    cleanup() {
      if (this.panel) {
        this.panel.destroy();
        this.panel = null;
      }

      if (this.streamManager) {
        this.streamManager.restore();
        this.streamManager = null;
      }

      this.isInitialized = false;
    }
  }

  // Initialize the application
  const app = new OMeTVFilters();
  app.initialize();

  // Make cleanup available globally for debugging
  window.__omtv_filters_cleanup = () => app.cleanup();

  console.log("[OmeTV Filters] Main script executed successfully");
})();
