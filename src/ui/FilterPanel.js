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
      bgBlurRow: this.panel.querySelector("#omtv-bg-blur-row"),
      vintageRow: this.panel.querySelector("#omtv-vintage-row"),
      edgeRow: this.panel.querySelector("#omtv-edge-row"),
      catRow: this.panel.querySelector("#omtv-cat-row"),
      blur: this.panel.querySelector("#omtv-blur"),
      blurVal: this.panel.querySelector("#omtv-blur-val"),
      pixel: this.panel.querySelector("#omtv-pixel"),
      pixelVal: this.panel.querySelector("#omtv-pixel-val"),
      bgBlur: this.panel.querySelector("#omtv-bg-blur"),
      bgBlurVal: this.panel.querySelector("#omtv-bg-blur-val"),
      vintage: this.panel.querySelector("#omtv-vintage"),
      vintageVal: this.panel.querySelector("#omtv-vintage-val"),
      edge: this.panel.querySelector("#omtv-edge"),
      edgeVal: this.panel.querySelector("#omtv-edge-val"),
      catSpeed: this.panel.querySelector("#omtv-cat-speed"),
      catSpeedVal: this.panel.querySelector("#omtv-cat-speed-val"),
      catSize: this.panel.querySelector("#omtv-cat-size"),
      catSizeVal: this.panel.querySelector("#omtv-cat-size-val"),
    };
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    const {
      enabled,
      mode,
      blur,
      pixel,
      bgBlur,
      vintage,
      edge,
      catSpeed,
      catSize,
    } = this.elements;

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

    bgBlur.addEventListener("input", () => {
      const value = parseInt(bgBlur.value, 10);
      stateManager.set("backgroundBlurIntensity", value);
      this.elements.bgBlurVal.textContent = value;
    });

    vintage.addEventListener("input", () => {
      const value = parseInt(vintage.value, 10);
      stateManager.set("vintageIntensity", value);
      this.elements.vintageVal.textContent = value;
    });

    edge.addEventListener("input", () => {
      const value = parseInt(edge.value, 10);
      stateManager.set("edgeIntensity", value);
      this.elements.edgeVal.textContent = value;
    });

    catSpeed.addEventListener("input", () => {
      const value = parseInt(catSpeed.value, 10);
      stateManager.set("catSpeed", value);
      this.elements.catSpeedVal.textContent = value;
    });

    catSize.addEventListener("input", () => {
      const value = parseInt(catSize.value, 10);
      stateManager.set("catSize", value);
      this.elements.catSizeVal.textContent = value;
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

    this.elements.bgBlurRow.style.display =
      currentFilter === FILTER_TYPES.BACKGROUND_BLUR ? "flex" : "none";

    this.elements.vintageRow.style.display =
      currentFilter === FILTER_TYPES.VINTAGE ? "flex" : "none";

    this.elements.edgeRow.style.display =
      currentFilter === FILTER_TYPES.EDGE_ENHANCE ? "flex" : "none";

    this.elements.catRow.style.display =
      currentFilter === FILTER_TYPES.CAT_OVERLAY ? "flex" : "none";
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
    this.elements.bgBlur.value = state.backgroundBlurIntensity;
    this.elements.bgBlurVal.textContent = state.backgroundBlurIntensity;
    this.elements.vintage.value = state.vintageIntensity;
    this.elements.vintageVal.textContent = state.vintageIntensity;
    this.elements.edge.value = state.edgeIntensity;
    this.elements.edgeVal.textContent = state.edgeIntensity;
    this.elements.catSpeed.value = state.catSpeed;
    this.elements.catSpeedVal.textContent = state.catSpeed;
    this.elements.catSize.value = state.catSize;
    this.elements.catSizeVal.textContent = state.catSize;

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
