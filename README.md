# OmeTV Custom Video Filters

A Chrome extension that applies real-time video filters to OmeTV streams with a modular, maintainable architecture.

## Features

- **Real-time video filters**: Grayscale, Blur, and Pixelate effects
- **Intuitive UI**: Floating control panel with easy-to-use controls
- **Modular architecture**: Clean, maintainable code structure
- **Extensible design**: Easy to add new filters

## Architecture

### Folder Structure

```
src/
├── main.js                 # Application entry point
├── content.js              # Content script for injection
├── core/                   # Core functionality
│   ├── StreamManager.js    # getUserMedia patching and stream handling
│   └── StreamProcessor.js  # Canvas-based video processing
├── filters/                # Filter implementations
│   ├── BaseFilter.js       # Abstract base filter class
│   ├── FilterRegistry.js   # Filter factory and registry
│   ├── NoneFilter.js       # Pass-through filter
│   ├── GrayscaleFilter.js  # Grayscale effect
│   ├── BlurFilter.js       # Blur effect
│   └── PixelateFilter.js   # Pixelation effect
├── ui/                     # User interface
│   ├── FilterPanel.js      # Main control panel component
│   └── PanelTemplate.js    # UI templates and styles
└── utils/                  # Utilities
    ├── constants.js        # Application constants
    └── state.js           # State management
```

### Key Components

#### StreamManager

Handles patching of `navigator.mediaDevices.getUserMedia()` to intercept video streams and apply filters.

#### StreamProcessor

Canvas-based video processing engine that applies filters frame-by-frame using `requestAnimationFrame`.

#### FilterRegistry

Factory pattern implementation for managing and applying different filter types.

#### FilterPanel

Reactive UI component that provides user controls and syncs with application state.

#### StateManager

Centralized state management with observer pattern for reactive updates.

## Development

### Adding New Filters

1. Create a new filter class extending `BaseFilter`:

```javascript
import { BaseFilter } from "./BaseFilter.js";

export class MyCustomFilter extends BaseFilter {
  constructor() {
    super("my-custom");
  }

  apply(ctx, video, width, height, params) {
    // Apply your filter logic here
    ctx.filter = "sepia(100%)";
    ctx.drawImage(video, 0, 0, width, height);
    ctx.filter = "none";
  }
}
```

2. Register it in `FilterRegistry.js`:

```javascript
import { MyCustomFilter } from "./MyCustomFilter.js";

// In registerDefaultFilters():
this.register("my-custom", new MyCustomFilter());
```

3. Add to constants and UI templates.

### Code Quality

- **ES6 Modules**: Clean imports/exports
- **Class-based architecture**: Object-oriented design
- **Separation of concerns**: Each module has a single responsibility
- **Error handling**: Proper try/catch blocks and fallbacks
- **Resource cleanup**: Proper disposal of canvas contexts and streams

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. Navigate to OmeTV and the filter panel will appear

## Browser Compatibility

- Chrome/Chromium 88+
- Edge 88+
- Other Chromium-based browsers with Manifest V3 support
