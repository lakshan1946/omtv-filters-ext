/**
 * OmeTV Custom Video Filters - Main Script
 * Simplified version without ES6 module imports for Manifest V3 compatibility
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

  // Basic constants
  const FILTER_TYPES = {
    NONE: "none",
    GRAYSCALE: "grayscale",
    BLUR: "blur",
    PIXELATE: "pixelate",
    MIRROR: "mirror",
  };

  /**
   * Simple Filter Panel for basic functionality
   */
  class SimpleFilterPanel {
    constructor() {
      this.panel = null;
      this.isVisible = false;
    }

    create() {
      if (this.panel) return;

      // Create panel container
      this.panel = document.createElement("div");
      this.panel.id = "omtv-filter-panel";
      this.panel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 200px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 2147483647;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;

      // Add title
      const title = document.createElement("div");
      title.textContent = "OmeTV Filters";
      title.style.cssText =
        "font-weight: bold; margin-bottom: 10px; text-align: center;";
      this.panel.appendChild(title);

      // Add filter buttons
      Object.entries(FILTER_TYPES).forEach(([key, value]) => {
        const button = document.createElement("button");
        button.textContent = key.charAt(0) + key.slice(1).toLowerCase();
        button.style.cssText = `
          display: block;
          width: 100%;
          margin: 5px 0;
          padding: 8px;
          background: #333;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        `;

        button.addEventListener("click", () => {
          this.applyFilter(value);
          // Update active button styling
          this.panel
            .querySelectorAll("button")
            .forEach((b) => (b.style.background = "#333"));
          button.style.background = "#007acc";
        });

        this.panel.appendChild(button);
      });

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
      console.log(`[OmeTV Filters] Applying filter: ${filterType}`);

      // Find video elements
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        // Reset filters
        video.style.filter = "";

        // Apply new filter
        switch (filterType) {
          case FILTER_TYPES.GRAYSCALE:
            video.style.filter = "grayscale(100%)";
            break;
          case FILTER_TYPES.BLUR:
            video.style.filter = "blur(5px)";
            break;
          case FILTER_TYPES.PIXELATE:
            video.style.filter = "contrast(150%) blur(1px)";
            video.style.imageRendering = "pixelated";
            break;
          case FILTER_TYPES.MIRROR:
            video.style.transform = "scaleX(-1)";
            break;
          case FILTER_TYPES.NONE:
          default:
            video.style.filter = "";
            video.style.transform = "";
            video.style.imageRendering = "";
            break;
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
      this.isInitialized = false;
    }

    initialize() {
      if (this.isInitialized) return;

      try {
        console.log("[OmeTV Filters] Initializing extension...");

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
        this.panel = new SimpleFilterPanel();
        this.panel.create();
      }, 2000);
    }

    cleanup() {
      if (this.panel) {
        this.panel.destroy();
        this.panel = null;
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
