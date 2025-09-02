import { UI_CONFIG, FILTER_TYPES } from "../utils/constants.js";

/**
 * UI styles for the filter panel
 */
export const createPanelStyles = () => ({
  position: "fixed",
  zIndex: UI_CONFIG.panel.zIndex.toString(),
  right: UI_CONFIG.panel.position.right,
  bottom: UI_CONFIG.panel.position.bottom,
  background: "rgba(0,0,0,0.75)",
  color: "#fff",
  fontFamily: "system-ui, sans-serif",
  fontSize: "12px",
  padding: "10px 12px",
  borderRadius: "12px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
});

/**
 * Create the panel HTML template
 */
export const createPanelTemplate = () => `
  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-width:${UI_CONFIG.panel.minWidth};">
    <strong style="font-size:12px;">Video Filters</strong>
    
    <label style="display:flex;gap:6px;align-items:center;">
      <input id="omtv-enabled" type="checkbox" checked />
      <span>Enabled</span>
    </label>
    
    <div style="display:flex;gap:6px;align-items:center;width:100%;">
      <span style="min-width:50px;">Mode</span>
      <select id="omtv-mode" style="flex:1;">
        <option value="${FILTER_TYPES.NONE}">None</option>
        <option value="${FILTER_TYPES.GRAYSCALE}">Grayscale</option>
        <option value="${FILTER_TYPES.BLUR}">Blur</option>
        <option value="${FILTER_TYPES.PIXELATE}">Pixelate</option>
      </select>
    </div>
    
    <div id="omtv-blur-row" style="display:none;gap:6px;align-items:center;width:100%;">
      <span style="min-width:50px;">Blur</span>
      <input id="omtv-blur" type="range" min="${UI_CONFIG.blur.min}" max="${UI_CONFIG.blur.max}" value="6" style="flex:1;"/>
      <span id="omtv-blur-val">6</span>
    </div>
    
    <div id="omtv-pixel-row" style="display:none;gap:6px;align-items:center;width:100%;">
      <span style="min-width:50px;">Pixel</span>
      <input id="omtv-pixel" type="range" min="${UI_CONFIG.pixel.min}" max="${UI_CONFIG.pixel.max}" value="8" style="flex:1;"/>
      <span id="omtv-pixel-val">8</span>
    </div>
  </div>
`;
