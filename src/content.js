/**
 * Content script for OmeTV Custom Video Filters extension
 * Injects the main script into the page's JavaScript context
 */

(function () {
  // Prevent double injection
  if (window.__omtv_filters_injected) {
    console.log("[OmeTV Filters] Already injected, skipping");
    return;
  }
  window.__omtv_filters_injected = true;

  // Simple injection without ES6 modules
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("src/main.js");

  script.onload = function () {
    console.log("[OmeTV Filters] Main script loaded successfully");
    this.remove();
  };

  script.onerror = function () {
    console.error("[OmeTV Filters] Failed to load main script");
    this.remove();
  };

  (document.head || document.documentElement).appendChild(script);
  console.log("[OmeTV Filters] Script injection initiated");
})();
