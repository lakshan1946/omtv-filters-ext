import { createPanelStyles, createPanelTemplate } from "./PanelTemplate.js";
import { UI_CONFIG, FILTER_TYPES } from "../utils/constants.js";
import { stateManager } from "../utils/state.js";

/**
 * Filter control panel UI
 */
export class FilterPanel {
  constructor() {
    this.panel = null;
    this.elements = {};
    this.isInitialized = false;
  }

  /**
   * Create and initialize the panel
   */
  create() {
    if (this.isInitialized) return;

    this.panel = this.createPanelElement();
    this.cacheElements();
    this.bindEvents();
    this.updateVisibility();

    document.documentElement.appendChild(this.panel);
    this.isInitialized = true;
  }

  /**
   * Create the panel DOM element
   */
  createPanelElement() {
    const panel = document.createElement("div");
    panel.id = UI_CONFIG.panel.id;

    const styles = createPanelStyles();
    Object.assign(panel.style, styles);

    panel.innerHTML = createPanelTemplate();

    return panel;
  }

  /**
   * Cache DOM elements for easier access
   */
  cacheElements() {
    this.elements = {
      enabled: this.panel.querySelector("#omtv-enabled"),
      mode: this.panel.querySelector("#omtv-mode"),
      blurRow: this.panel.querySelector("#omtv-blur-row"),
      pixelRow: this.panel.querySelector("#omtv-pixel-row"),
      blur: this.panel.querySelector("#omtv-blur"),
      blurVal: this.panel.querySelector("#omtv-blur-val"),
      pixel: this.panel.querySelector("#omtv-pixel"),
      pixelVal: this.panel.querySelector("#omtv-pixel-val"),
    };
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    const { enabled, mode, blur, pixel } = this.elements;

    enabled.addEventListener("change", () => {
      stateManager.set("enabled", enabled.checked);
    });

    mode.addEventListener("change", () => {
      stateManager.set("filter", mode.value);
      this.updateVisibility();
    });

    blur.addEventListener("input", () => {
      const value = parseInt(blur.value, 10);
      stateManager.set("blurPx", value);
      this.elements.blurVal.textContent = value;
    });

    pixel.addEventListener("input", () => {
      const value = parseInt(pixel.value, 10);
      stateManager.set("pixelSize", value);
      this.elements.pixelVal.textContent = value;
    });
  }

  /**
   * Update visibility of filter-specific controls
   */
  updateVisibility() {
    const currentFilter = stateManager.get("filter");

    this.elements.blurRow.style.display =
      currentFilter === FILTER_TYPES.BLUR ? "flex" : "none";

    this.elements.pixelRow.style.display =
      currentFilter === FILTER_TYPES.PIXELATE ? "flex" : "none";
  }

  /**
   * Update panel state from state manager
   */
  updateFromState() {
    if (!this.isInitialized) return;

    const state = stateManager.getState();

    this.elements.enabled.checked = state.enabled;
    this.elements.mode.value = state.filter;
    this.elements.blur.value = state.blurPx;
    this.elements.blurVal.textContent = state.blurPx;
    this.elements.pixel.value = state.pixelSize;
    this.elements.pixelVal.textContent = state.pixelSize;

    this.updateVisibility();
  }

  /**
   * Destroy the panel
   */
  destroy() {
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }
    this.panel = null;
    this.elements = {};
    this.isInitialized = false;
  }
}
