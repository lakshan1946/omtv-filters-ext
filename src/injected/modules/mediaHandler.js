/**
 * getUserMedia Override Handler
 * Handles interception and processing of media streams
 */

const MediaHandler = (() => {
  let originalGetUserMedia = null;

  function initialize() {
    // Store original getUserMedia function
    originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

    // Override getUserMedia to intercept video streams
    navigator.mediaDevices.getUserMedia = async function interceptGetUserMedia(constraints = {}) {
      console.log('[MediaHandler] getUserMedia called with constraints:', constraints);
      
      try {
        const originalStream = await originalGetUserMedia(constraints);

        const requestsVideo = 
          (typeof constraints.video === "boolean" && constraints.video) ||
          (typeof constraints.video === "object" && constraints.video);

        if (!requestsVideo) {
          console.log('[MediaHandler] No video requested, returning original stream');
          return originalStream;
        }

        console.log('[MediaHandler] Processing video stream with filters...');
        const processedStream = await VideoProcessor.buildProcessedStream(originalStream, constraints);
        console.log('[MediaHandler] Successfully processed video stream');
        
        return processedStream || originalStream;
        
      } catch (error) {
        console.error('[MediaHandler] Error processing stream:', error);
        return originalGetUserMedia(constraints);
      }
    };

    console.log('[MediaHandler] getUserMedia override installed successfully');
  }

  return {
    initialize
  };
})();
