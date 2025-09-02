/**
 * Content script for OmeTV Custom Video Filters extension
 * Injects the main script into the page's JavaScript context
 */

(function injectScript() {
  try {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("src/main.js");
    script.type = "module";

    // Inject into document as early as possible
    const target = document.documentElement || document.head || document.body;
    target.appendChild(script);

    // Clean up script element after loading
    script.addEventListener("load", () => {
      script.remove();
    });

    script.addEventListener("error", (error) => {
      console.error("[OmeTV Filters] Failed to inject main script:", error);
      script.remove();
    });
  } catch (error) {
    console.error("[OmeTV Filters] Content script error:", error);
  }
})();
