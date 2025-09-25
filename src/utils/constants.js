/**
 * Application constants and configuration
 */

export const FILTER_TYPES = {
  NONE: "none",
  GRAYSCALE: "grayscale",
  BLUR: "blur",
  PIXELATE: "pixelate",
  BACKGROUND_BLUR: "background_blur",
  VINTAGE: "vintage",
  EDGE_ENHANCE: "edge_enhance",
  CAT_OVERLAY: "cat_overlay",
  MIRROR: "mirror",
};

export const DEFAULT_CONFIG = {
  filter: FILTER_TYPES.NONE,
  blurPx: 6,
  pixelSize: 8,
  backgroundBlurIntensity: 10,
  vintageIntensity: 70,
  edgeIntensity: 50,
  catSpeed: 50,
  catSize: 30,
  enabled: true,
};

export const UI_CONFIG = {
  panel: {
    id: "omtv-filter-panel",
    position: { right: "16px", bottom: "16px" },
    zIndex: 2147483647,
    minWidth: "240px",
  },
  blur: { min: 0, max: 20 },
  pixel: { min: 2, max: 40 },
  backgroundBlur: { min: 0, max: 30 },
  vintage: { min: 0, max: 100 },
  edge: { min: 0, max: 100 },
  catSpeed: { min: 10, max: 100 },
  catSize: { min: 10, max: 80 },
};

export const CANVAS_CONFIG = {
  alpha: false,
  desynchronized: true,
  defaultFps: 30,
  defaultDimensions: { width: 640, height: 480 },
};

export const INJECTION_MARKER = "__omtv_filter_patch_applied";
