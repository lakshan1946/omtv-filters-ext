/**
 * OmeTV Video Filters Extension - Bundled Version
 * Auto-generated from modular source files
 * 
 * @version 1.0.0
 * @description Applies custom video filters to OmeTV video streams
 */

(() => {
  // Prevent double injection
  if (window.__omtv_filter_patch_applied) {
    console.log('[OmeTV Filters] Already injected, skipping...');
    return;
  }
  window.__omtv_filter_patch_applied = true;
  console.log('[OmeTV Filters] Initializing video filter extension...');

  // =============================================================================
  // FILTER STATE MODULE
  // =============================================================================

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

  // =============================================================================
  // VIDEO PROCESSOR MODULE
  // =============================================================================

  const VideoProcessor = (() => {
    
    async function buildProcessedStream(rawStream, constraints) {
      const videoTrack = rawStream.getVideoTracks()[0];
      if (!videoTrack) return rawStream;

      const settings = videoTrack.getSettings ? videoTrack.getSettings() : {};
      const fps = settings.frameRate || (constraints?.video && constraints.video.frameRate) || 30;

      const video = document.createElement("video");
      video.style.position = "fixed";
      video.style.opacity = "0";
      video.style.pointerEvents = "none";
      video.muted = true;
      video.playsInline = true;
      video.srcObject = rawStream;

      await video.play().catch(() => {
        console.warn('[VideoProcessor] Video autoplay blocked, will work after user interaction');
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });

      const offscreenCanvas = document.createElement("canvas");
      const offscreenCtx = offscreenCanvas.getContext("2d", { alpha: false, desynchronized: true });

      function resizeCanvas() {
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      }

      let isRunning = true;
      
      function renderFrame() {
        if (!isRunning) return;
        resizeCanvas();

        const state = FilterState.get();
        if (!state.enabled || state.filter === "none") {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } else {
          applyVideoFilter(ctx, video, canvas, offscreenCanvas, offscreenCtx, state);
        }

        requestAnimationFrame(renderFrame);
      }
      
      requestAnimationFrame(renderFrame);

      const processedStream = canvas.captureStream(fps);
      rawStream.getAudioTracks().forEach((track) => processedStream.addTrack(track));

      const outputVideoTrack = processedStream.getVideoTracks()[0];
      if (outputVideoTrack) {
        const cleanup = () => {
          isRunning = false;
          rawStream.getTracks().forEach((track) => track.stop());
          video.remove();
        };
        
        outputVideoTrack.addEventListener("ended", cleanup);
      }

      return processedStream;
    }

    function applyVideoFilter(ctx, video, canvas, offscreenCanvas, offscreenCtx, state) {
      switch (state.filter) {
        case "grayscale":
          ctx.filter = "grayscale(100%)";
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.filter = "none";
          break;
          
        case "blur":
          ctx.filter = `blur(${state.blurPx}px)`;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.filter = "none";
          break;
          
        case "pixelate":
          applyPixelateFilter(ctx, video, canvas, offscreenCanvas, offscreenCtx, state);
          break;
          
        default:
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    }

    function applyPixelateFilter(ctx, video, canvas, offscreenCanvas, offscreenCtx, state) {
      const pixelSize = Math.max(1, Math.min(state.pixelSize, 100));
      const scaledWidth = Math.max(1, Math.floor(canvas.width / pixelSize));
      const scaledHeight = Math.max(1, Math.floor(canvas.height / pixelSize));
      
      if (offscreenCanvas.width !== scaledWidth || offscreenCanvas.height !== scaledHeight) {
        offscreenCanvas.width = scaledWidth;
        offscreenCanvas.height = scaledHeight;
      }
      
      offscreenCtx.imageSmoothingEnabled = false;
      offscreenCtx.drawImage(video, 0, 0, scaledWidth, scaledHeight);
      
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offscreenCanvas, 0, 0, scaledWidth, scaledHeight, 0, 0, canvas.width, canvas.height);
    }

    return {
      buildProcessedStream
    };
  })();

  // =============================================================================
  // FILTER PANEL MODULE
  // =============================================================================

  const FilterPanel = (() => {
    
    function createFilterPanel() {
      if (document.getElementById("omtv-filter-panel")) return;

      const panel = document.createElement("div");
      panel.id = "omtv-filter-panel";
      
      applyPanelStyles(panel);
      panel.innerHTML = getPanelHTML();
      
      document.documentElement.appendChild(panel);
      attachEventListeners(panel);
      initializePanelState(panel);
      
      console.log('[FilterPanel] Control panel created and initialized');
    }

    function applyPanelStyles(panel) {
      Object.assign(panel.style, {
        position: "fixed",
        zIndex: "2147483647",
        right: "16px",
        bottom: "16px",
        background: "rgba(0, 0, 0, 0.9)",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        minWidth: "280px",
        userSelect: "none",
      });
    }

    function getPanelHTML() {
      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <strong style="font-size: 16px; font-weight: 600; color: #4f46e5;">🎥 OmeTV Filters</strong>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input id="omtv-enabled" type="checkbox" checked 
                     style="accent-color: #4f46e5; cursor: pointer; transform: scale(1.2);" />
              <span style="font-size: 13px; font-weight: 500;">Enable</span>
            </label>
          </div>
          
          <div style="display: flex; align-items: center; gap: 12px;">
            <label style="min-width: 70px; font-size: 13px; font-weight: 500; color: #e5e7eb;">Filter:</label>
            <select id="omtv-mode" style="
              flex: 1; 
              padding: 8px 12px; 
              border-radius: 8px; 
              border: 1px solid rgba(255, 255, 255, 0.2);
              background: rgba(255, 255, 255, 0.1);
              color: white;
              font-size: 13px;
              cursor: pointer;
              font-weight: 500;
            ">
              <option value="none">🚫 None</option>
              <option value="grayscale">⚫ Grayscale</option>
              <option value="blur">🌫️ Blur</option>
              <option value="pixelate">🟦 Pixelate</option>
            </select>
          </div>
          
          <div id="omtv-blur-controls" style="display: none; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <label style="min-width: 70px; font-size: 13px; font-weight: 500; color: #e5e7eb;">Blur:</label>
              <input id="omtv-blur" type="range" min="0" max="20" value="6" 
                     style="flex: 1; accent-color: #4f46e5; cursor: pointer;" />
              <span id="omtv-blur-val" style="min-width: 35px; font-size: 12px; text-align: center; color: #4f46e5; font-weight: 600;">6px</span>
            </div>
          </div>
          
          <div id="omtv-pixel-controls" style="display: none; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <label style="min-width: 70px; font-size: 13px; font-weight: 500; color: #e5e7eb;">Size:</label>
              <input id="omtv-pixel" type="range" min="2" max="40" value="8"
                     style="flex: 1; accent-color: #4f46e5; cursor: pointer;" />
              <span id="omtv-pixel-val" style="min-width: 35px; font-size: 12px; text-align: center; color: #4f46e5; font-weight: 600;">8px</span>
            </div>
          </div>
          
          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.6); text-align: center; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            Extension active and ready
          </div>
        </div>
      `;
    }

    function attachEventListeners(panel) {
      const enabledCheckbox = panel.querySelector("#omtv-enabled");
      const modeSelect = panel.querySelector("#omtv-mode");
      const blurControls = panel.querySelector("#omtv-blur-controls");
      const pixelControls = panel.querySelector("#omtv-pixel-controls");
      const blurSlider = panel.querySelector("#omtv-blur");
      const pixelSlider = panel.querySelector("#omtv-pixel");

      enabledCheckbox.addEventListener("change", () => {
        FilterState.update({ enabled: enabledCheckbox.checked });
      });

      modeSelect.addEventListener("change", () => {
        const selectedFilter = modeSelect.value;
        FilterState.update({ filter: selectedFilter });
        
        blurControls.style.display = selectedFilter === "blur" ? "block" : "none";
        pixelControls.style.display = selectedFilter === "pixelate" ? "block" : "none";
      });

      blurSlider.addEventListener("input", () => {
        const blurValue = parseInt(blurSlider.value);
        FilterState.update({ blurPx: blurValue });
        panel.querySelector("#omtv-blur-val").textContent = `${blurValue}px`;
      });

      pixelSlider.addEventListener("input", () => {
        const pixelValue = parseInt(pixelSlider.value);
        FilterState.update({ pixelSize: pixelValue });
        panel.querySelector("#omtv-pixel-val").textContent = `${pixelValue}px`;
      });
    }

    function initializePanelState(panel) {
      const state = FilterState.get();
      
      panel.querySelector("#omtv-enabled").checked = state.enabled;
      panel.querySelector("#omtv-mode").value = state.filter;
      panel.querySelector("#omtv-blur").value = state.blurPx;
      panel.querySelector("#omtv-blur-val").textContent = `${state.blurPx}px`;
      panel.querySelector("#omtv-pixel").value = state.pixelSize;
      panel.querySelector("#omtv-pixel-val").textContent = `${state.pixelSize}px`;
      
      // Initialize control visibility
      const blurControls = panel.querySelector("#omtv-blur-controls");
      const pixelControls = panel.querySelector("#omtv-pixel-controls");
      blurControls.style.display = state.filter === "blur" ? "block" : "none";
      pixelControls.style.display = state.filter === "pixelate" ? "block" : "none";
    }

    return {
      create: createFilterPanel
    };
  })();

  // =============================================================================
  // MEDIA HANDLER MODULE
  // =============================================================================

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

  // =============================================================================
  // MAIN INITIALIZATION
  // =============================================================================

  function initializeExtension() {
    try {
      // Initialize media handler (getUserMedia override)
      MediaHandler.initialize();
      
      // Create control panel
      FilterPanel.create();
      
      console.log('[OmeTV Filters] Extension initialization complete');
    } catch (error) {
      console.error('[OmeTV Filters] Failed to initialize extension:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeExtension);
  } else {
    initializeExtension();
  }

})();
