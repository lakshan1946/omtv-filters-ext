import { INJECTION_MARKER } from "./utils/constants.js";
import { streamManager } from "./core/StreamManager.js";
import { FilterPanel } from "./ui/FilterPanel.js";

/**
 * Main application class
 */
class OMeTVFilters {
  constructor() {
    this.panel = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize stream processing
      streamManager.initialize();

      // Create and initialize UI
      this.panel = new FilterPanel();
      this.initializeUI();

      this.isInitialized = true;
      console.log("[OmeTV Filters] Extension initialized successfully");
    } catch (error) {
      console.error("[OmeTV Filters] Failed to initialize:", error);
    }
  }

  /**
   * Initialize UI when DOM is ready
   */
  initializeUI() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.panel.create();
      });
    } else {
      this.panel.create();
    }
  }

  /**
   * Cleanup and restore original state
   */
  cleanup() {
    if (this.panel) {
      this.panel.destroy();
      this.panel = null;
    }

    streamManager.restore();
    this.isInitialized = false;
  }
}

// Initialize application if not already injected
(() => {
  // Prevent double injection
  if (window[INJECTION_MARKER]) {
    return;
  }
  window[INJECTION_MARKER] = true;

  // Create and initialize application
  const app = new OMeTVFilters();
  app.initialize();

  // Make cleanup available globally for debugging
  window.__omtv_filters_cleanup = () => app.cleanup();
})();
