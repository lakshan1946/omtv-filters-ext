/**
 * Simple Build Script for OmeTV Filters Extension
 * Combines modular files into a single injected.js for browser compatibility
 */

const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, 'modules');
const outputFile = path.join(__dirname, 'injected.js');

const moduleFiles = [
  'filterState.js',
  'videoProcessor.js', 
  'filterPanel.js',
  'mediaHandler.js'
];

function buildInjectedScript() {
  console.log('🔨 Building injected.js from modules...');
  
  let combinedContent = `/**
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
  // BUNDLED MODULES
  // =============================================================================

`;

  // Read and combine all module files
  moduleFiles.forEach(filename => {
    const filePath = path.join(modulesDir, filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      combinedContent += `  // ${filename.toUpperCase()}\n`;
      combinedContent += `  ${content.replace(/^/gm, '  ')}\n\n`;
    } else {
      console.warn(`⚠️  Module not found: ${filename}`);
    }
  });

  // Add main initialization code
  combinedContent += `  // =============================================================================
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

})();`;

  // Write the combined file
  fs.writeFileSync(outputFile, combinedContent, 'utf8');
  
  const stats = fs.statSync(outputFile);
  console.log(`✅ Built injected.js successfully!`);
  console.log(`📦 File size: ${Math.round(stats.size / 1024)}KB`);
  console.log(`📁 Output: ${outputFile}`);
}

// Run if called directly
if (require.main === module) {
  buildInjectedScript();
}

module.exports = { buildInjectedScript };
