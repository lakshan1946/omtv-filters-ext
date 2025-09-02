/**
 * Video Filter State Management
 * Manages the current state of video filters
 */

const FilterState = (() => {
  const state = {
    filter: "none", // 'none' | 'grayscale' | 'blur' | 'pixelate'
    blurPx: 6, // for blur
    pixelSize: 8, // for pixelate
    enabled: true,
  };

  return {
    get: () => ({ ...state }),
    update: (updates) => {
      Object.assign(state, updates);
      console.log('[FilterState] Updated:', updates);
    },
    getFilter: () => state.filter,
    getBlurPx: () => state.blurPx,
    getPixelSize: () => state.pixelSize,
    isEnabled: () => state.enabled,
  };
})();
