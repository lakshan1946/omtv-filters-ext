/**
 * Content Script for OmeTV Video Filters Extension
 * Injects the main functionality into the page context
 */

(function injectFilterScript() {
  // Create script element
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("src/injected/injected.js");
  script.type = "text/javascript";
  
  // Inject as early as possible in the page
  const targetElement = document.documentElement || document.head || document.body;
  if (targetElement) {
    targetElement.appendChild(script);
    
    // Clean up script element after injection
    script.onload = () => {
      script.remove();
      console.log('[OmeTV Filters] Content script injection completed');
    };
    
    script.onerror = () => {
      console.error('[OmeTV Filters] Failed to inject script');
      script.remove();
    };
  } else {
    console.error('[OmeTV Filters] No suitable element found for script injection');
  }
})();
