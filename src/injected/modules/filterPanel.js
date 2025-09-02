/**
 * Filter Control Panel UI
 * Creates and manages the floating control panel interface
 */

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
