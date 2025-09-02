(() => {
  // Avoid double-inject
  if (window.__omtv_filter_patch_applied) return;
  window.__omtv_filter_patch_applied = true;

  const originalGUM = navigator.mediaDevices.getUserMedia.bind(
    navigator.mediaDevices
  );

  // Global, controlled by our small on-page panel
  const state = {
    filter: "none", // 'none' | 'grayscale' | 'blur' | 'pixelate'
    blurPx: 6, // for blur
    pixelSize: 8, // for pixelate
    enabled: true,
  };

  // Small floating UI
  function createPanel() {
    const wrap = document.createElement("div");
    wrap.id = "omtv-filter-panel";
    Object.assign(wrap.style, {
      position: "fixed",
      zIndex: "2147483647",
      right: "16px",
      bottom: "16px",
      background: "rgba(0,0,0,0.75)",
      color: "#fff",
      fontFamily: "system-ui, sans-serif",
      fontSize: "12px",
      padding: "10px 12px",
      borderRadius: "12px",
      boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
    });

    wrap.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-width:220px;">
        <strong style="font-size:12px;">Video Filters</strong>
        <label style="display:flex;gap:6px;align-items:center;">
          <input id="omtv-enabled" type="checkbox" checked />
          <span>Enabled</span>
        </label>
        <div style="display:flex;gap:6px;align-items:center;width:100%;">
          <span style="min-width:50px;">Mode</span>
          <select id="omtv-mode" style="flex:1;">
            <option value="none">None</option>
            <option value="grayscale">Grayscale</option>
            <option value="blur">Blur</option>
            <option value="pixelate">Pixelate</option>
          </select>
        </div>
        <div id="omtv-blur-row" style="display:none;gap:6px;align-items:center;width:100%;">
          <span style="min-width:50px;">Blur</span>
          <input id="omtv-blur" type="range" min="0" max="20" value="6" style="flex:1;"/>
          <span id="omtv-blur-val">6</span>
        </div>
        <div id="omtv-pixel-row" style="display:none;gap:6px;align-items:center;width:100%;">
          <span style="min-width:50px;">Pixel</span>
          <input id="omtv-pixel" type="range" min="2" max="40" value="8" style="flex:1;"/>
          <span id="omtv-pixel-val">8</span>
        </div>
      </div>
    `;

    document.documentElement.appendChild(wrap);

    const enabledEl = wrap.querySelector("#omtv-enabled");
    const modeEl = wrap.querySelector("#omtv-mode");
    const blurRow = wrap.querySelector("#omtv-blur-row");
    const pixelRow = wrap.querySelector("#omtv-pixel-row");
    const blurEl = wrap.querySelector("#omtv-blur");
    const blurVal = wrap.querySelector("#omtv-blur-val");
    const pixelEl = wrap.querySelector("#omtv-pixel");
    const pixelVal = wrap.querySelector("#omtv-pixel-val");

    enabledEl.addEventListener("change", () => {
      state.enabled = enabledEl.checked;
    });
    modeEl.addEventListener("change", () => {
      state.filter = modeEl.value;
      blurRow.style.display = state.filter === "blur" ? "flex" : "none";
      pixelRow.style.display = state.filter === "pixelate" ? "flex" : "none";
    });
    blurEl.addEventListener("input", () => {
      state.blurPx = +blurEl.value;
      blurVal.textContent = blurEl.value;
    });
    pixelEl.addEventListener("input", () => {
      state.pixelSize = +pixelEl.value;
      pixelVal.textContent = pixelEl.value;
    });

    // Initialize visibility
    blurRow.style.display = "none";
    pixelRow.style.display = "none";
  }

  // Build a processed stream from a raw cam stream
  async function buildProcessedStream(rawStream, constraints) {
    const videoTrack = rawStream.getVideoTracks()[0];
    if (!videoTrack) return rawStream; // no video track -> nothing to do

    const settings = videoTrack.getSettings ? videoTrack.getSettings() : {};
    const fps =
      settings.frameRate ||
      (constraints?.video && constraints.video.frameRate) ||
      30;

    // Hidden <video> that plays the raw stream
    const v = document.createElement("video");
    v.style.position = "fixed";
    v.style.opacity = "0";
    v.muted = true;
    v.playsInline = true;
    v.srcObject = rawStream;

    // Make sure it can play
    await v.play().catch(() => {
      /* autoplay might be blocked until user gesture; page will call once allowed */
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });

    // For pixelate
    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d", { alpha: false, desynchronized: true });

    function resize() {
      const w = v.videoWidth || 640;
      const h = v.videoHeight || 480;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let running = true;
    function draw() {
      if (!running) return;
      resize();

      if (!state.enabled || state.filter === "none") {
        // No filter
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      } else if (state.filter === "grayscale") {
        // Use 2D canvas filter
        ctx.filter = "grayscale(100%)";
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
      } else if (state.filter === "blur") {
        ctx.filter = `blur(${state.blurPx}px)`;
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
      } else if (state.filter === "pixelate") {
        const px = Math.max(1, Math.min(state.pixelSize, 100));
        const w = Math.max(1, Math.floor(canvas.width / px));
        const h = Math.max(1, Math.floor(canvas.height / px));
        if (off.width !== w || off.height !== h) {
          off.width = w;
          off.height = h;
        }
        // Downscale -> then upscale without smoothing
        offCtx.imageSmoothingEnabled = false;
        offCtx.drawImage(v, 0, 0, w, h);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(off, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
      }

      // Keep going
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    const processed = canvas.captureStream(fps);

    // Forward original audio (don't touch mic)
    rawStream.getAudioTracks().forEach((t) => processed.addTrack(t));

    // When consumer stops our returned track, stop underlying loop/tracks
    const outVideoTrack = processed.getVideoTracks()[0];
    if (outVideoTrack) {
      const endAll = () => {
        running = false;
        // Stop raw tracks as well (mirror typical page behavior)
        rawStream.getTracks().forEach((tr) => tr.stop());
      };
      outVideoTrack.addEventListener("ended", endAll);
      outVideoTrack.addEventListener("mute", () => {
        /* no-op */
      });
      outVideoTrack.addEventListener("unmute", () => {
        /* no-op */
      });
    }

    return processed;
  }

  // Override getUserMedia
  navigator.mediaDevices.getUserMedia = async function patchedGetUserMedia(
    constraints = {}
  ) {
    // Call the real gUM first with original constraints
    const raw = await originalGUM(constraints);

    // If no video requested, just return as-is
    const wantsVideo =
      (typeof constraints.video === "boolean" && constraints.video) ||
      typeof constraints.video === "object";
    if (!wantsVideo) return raw;

    try {
      const processed = await buildProcessedStream(raw, constraints);
      return processed || raw;
    } catch (e) {
      console.warn(
        "[OmeTV Filters] Failed to process stream, falling back to raw:",
        e
      );
      return raw;
    }
  };

  // Install panel once DOM is ready (or now, if already ready)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createPanel);
  } else {
    createPanel();
  }
})();
