import { NoneFilter } from "./NoneFilter.js";
import { GrayscaleFilter } from "./GrayscaleFilter.js";
import { BlurFilter } from "./BlurFilter.js";
import { PixelateFilter } from "./PixelateFilter.js";
import { FILTER_TYPES } from "../utils/constants.js";

/**
 * Filter factory and registry
 */
class FilterRegistry {
  constructor() {
    this.filters = new Map();
    this.registerDefaultFilters();
  }

  /**
   * Register default filters
   */
  registerDefaultFilters() {
    this.register(FILTER_TYPES.NONE, new NoneFilter());
    this.register(FILTER_TYPES.GRAYSCALE, new GrayscaleFilter());
    this.register(FILTER_TYPES.BLUR, new BlurFilter());
    this.register(FILTER_TYPES.PIXELATE, new PixelateFilter());
  }

  /**
   * Register a filter
   */
  register(type, filter) {
    this.filters.set(type, filter);
  }

  /**
   * Get filter by type
   */
  getFilter(type) {
    return this.filters.get(type) || this.filters.get(FILTER_TYPES.NONE);
  }

  /**
   * Get all registered filter types
   */
  getFilterTypes() {
    return Array.from(this.filters.keys());
  }

  /**
   * Cleanup all filters
   */
  cleanup() {
    this.filters.forEach((filter) => {
      if (filter.cleanup) {
        filter.cleanup();
      }
    });
    this.filters.clear();
  }
}

export const filterRegistry = new FilterRegistry();
