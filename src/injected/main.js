/**
 * Main Injected Script
 * Coordinates video filtering functionality on OmeTV
 */

import { createFilterPanel } from '../utils/filterPanel.js';
import { buildProcessedStream } from '../utils/videoProcessor.js';

(() => {
  // Prevent double injection
  if (window.__omtv_filter_patch_applied) {
    console.log('[OmeTV Filters] Already injected, skipping...');
    return;
  }
  window.__omtv_filter_patch_applied = true;

  console.log('[OmeTV Filters] Initializing video filter extension...');

  // Store original getUserMedia function
  const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(
    navigator.mediaDevices
  );

  // Override getUserMedia to intercept video streams
  navigator.mediaDevices.getUserMedia = async function interceptGetUserMedia(constraints = {}) {
    console.log('[OmeTV Filters] getUserMedia called with constraints:', constraints);
    
    try {
      // Get the original stream
      const originalStream = await originalGetUserMedia(constraints);

      // Check if video is requested
      const requestsVideo = 
        (typeof constraints.video === "boolean" && constraints.video) ||
        (typeof constraints.video === "object" && constraints.video);

      if (!requestsVideo) {
        console.log('[OmeTV Filters] No video requested, returning original stream');
        return originalStream;
      }

      console.log('[OmeTV Filters] Processing video stream with filters...');
      
      // Process the stream with filters
      const processedStream = await buildProcessedStream(originalStream, constraints);
      
      console.log('[OmeTV Filters] Successfully processed video stream');
      return processedStream || originalStream;
      
    } catch (error) {
      console.error('[OmeTV Filters] Error processing stream:', error);
      console.log('[OmeTV Filters] Falling back to original getUserMedia');
      
      // Fallback to original function on error
      return originalGetUserMedia(constraints);
    }
  };

  // Initialize the control panel
  function initializeControlPanel() {
    try {
      createFilterPanel();
      console.log('[OmeTV Filters] Control panel initialized successfully');
    } catch (error) {
      console.error('[OmeTV Filters] Failed to create control panel:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeControlPanel);
  } else {
    // DOM is already ready
    initializeControlPanel();
  }

  console.log('[OmeTV Filters] Extension initialization complete');
})();
