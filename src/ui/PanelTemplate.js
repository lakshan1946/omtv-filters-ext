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
        <option value="${FILTER_TYPES.BACKGROUND_BLUR}">Background Blur</option>
        <option value="${FILTER_TYPES.VINTAGE}">Vintage Film</option>
        <option value="${FILTER_TYPES.EDGE_ENHANCE}">Edge Enhance</option>
        <option value="${FILTER_TYPES.CAT_OVERLAY}">🐱 Cats!</option>
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
    
    <div id="omtv-bg-blur-row" style="display:none;gap:6px;align-items:center;width:100%;">
      <span style="min-width:50px;">BG Blur</span>
      <input id="omtv-bg-blur" type="range" min="${UI_CONFIG.backgroundBlur.min}" max="${UI_CONFIG.backgroundBlur.max}" value="10" style="flex:1;"/>
      <span id="omtv-bg-blur-val">10</span>
    </div>
    
    <div id="omtv-vintage-row" style="display:none;gap:6px;align-items:center;width:100%;">
      <span style="min-width:50px;">Vintage</span>
      <input id="omtv-vintage" type="range" min="${UI_CONFIG.vintage.min}" max="${UI_CONFIG.vintage.max}" value="70" style="flex:1;"/>
      <span id="omtv-vintage-val">70</span>
    </div>
    
    <div id="omtv-edge-row" style="display:none;gap:6px;align-items:center;width:100%;">
      <span style="min-width:50px;">Edge</span>
      <input id="omtv-edge" type="range" min="${UI_CONFIG.edge.min}" max="${UI_CONFIG.edge.max}" value="50" style="flex:1;"/>
      <span id="omtv-edge-val">50</span>
    </div>
    
    <div id="omtv-cat-row" style="display:none;gap:4px;align-items:center;width:100%;flex-wrap:wrap;">
      <div style="display:flex;gap:6px;align-items:center;width:100%;">
        <span style="min-width:50px;">Speed</span>
        <input id="omtv-cat-speed" type="range" min="${UI_CONFIG.catSpeed.min}" max="${UI_CONFIG.catSpeed.max}" value="50" style="flex:1;"/>
        <span id="omtv-cat-speed-val">50</span>
      </div>
      <div style="display:flex;gap:6px;align-items:center;width:100%;">
        <span style="min-width:50px;">Size</span>
        <input id="omtv-cat-size" type="range" min="${UI_CONFIG.catSize.min}" max="${UI_CONFIG.catSize.max}" value="30" style="flex:1;"/>
        <span id="omtv-cat-size-val">30</span>
      </div>
    </div>
  </div>
`;
