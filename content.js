// Inject our real override into the page's JS context (not the isolated world)
(function inject() {
  const s = document.createElement("script");
  s.src = chrome.runtime.getURL("injected.js");
  s.type = "text/javascript";
  // Make sure it runs as early as possible
  (document.documentElement || document.head || document.body).appendChild(s);
  s.onload = () => s.remove();
})();
