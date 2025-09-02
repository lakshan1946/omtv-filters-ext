/**
 * Application constants and configuration
 */

export const FILTER_TYPES = {
  NONE: "none",
  GRAYSCALE: "grayscale",
  BLUR: "blur",
  PIXELATE: "pixelate",
};

export const DEFAULT_CONFIG = {
  filter: FILTER_TYPES.NONE,
  blurPx: 6,
  pixelSize: 8,
  enabled: true,
};

export const UI_CONFIG = {
  panel: {
    id: "omtv-filter-panel",
    position: { right: "16px", bottom: "16px" },
    zIndex: 2147483647,
    minWidth: "220px",
  },
  blur: { min: 0, max: 20 },
  pixel: { min: 2, max: 40 },
};

export const CANVAS_CONFIG = {
  alpha: false,
  desynchronized: true,
  defaultFps: 30,
  defaultDimensions: { width: 640, height: 480 },
};

export const INJECTION_MARKER = "__omtv_filter_patch_applied";
