# Development Documentation

## Architecture Overview

The OmeTV Video Filters extension is built with a modular architecture that separates concerns and maintains clean code organization.

### Component Breakdown

#### 1. Manifest (`manifest.json`)
- **Purpose**: Extension configuration and permissions
- **Key Features**: 
  - Manifest V3 compliance
  - Host permissions for OmeTV domains
  - Content script and web accessible resources configuration

#### 2. Content Script (`src/content/content.js`)
- **Purpose**: Bridge between extension context and page context
- **Functionality**: Injects the main script into the page's JavaScript context
- **Security**: Runs in isolated world but injects into main world

#### 3. Injected Script (`src/injected/injected.js`)
- **Purpose**: Main functionality that modifies page behavior
- **Features**:
  - getUserMedia override and interception
  - Video stream processing pipeline
  - UI control panel management
  - Filter state management

### Modular Architecture (Development Files)

#### State Management (`src/utils/filterState.js`)
- Centralized filter state storage
- State update functions
- Immutable state access patterns

#### Video Processing (`src/utils/videoProcessor.js`)
- Canvas-based video stream processing
- Filter application algorithms
- Stream lifecycle management

#### UI Components (`src/utils/filterPanel.js`)
- Control panel creation and styling
- Event handler attachment
- Dynamic UI state updates

## Data Flow

```
User Action → UI Panel → State Update → Video Processor → Canvas → Output Stream
                ↑                                                        ↓
            Event Listeners                                        getUserMedia Override
```

## Filter Implementation Details

### Grayscale Filter
- Uses CSS `filter: grayscale(100%)`
- Applied directly to canvas context
- Zero performance overhead

### Blur Filter
- Uses CSS `filter: blur(Npx)`
- Adjustable radius from 0-20px
- Real-time slider updates

### Pixelate Filter
- Two-stage process: downscale → upscale
- Uses separate offscreen canvas
- Disables image smoothing for crisp pixels
- Adjustable pixel size from 2-40px

## Performance Optimizations

1. **RequestAnimationFrame**: Smooth 60fps rendering
2. **Canvas Context Settings**: Optimized for performance
3. **Conditional Processing**: Only process when filters are enabled
4. **Memory Management**: Proper cleanup of video elements and streams

## Security Considerations

1. **Content Security Policy**: Compatible with strict CSP
2. **Isolated Execution**: Content script runs in isolated world
3. **Minimal Permissions**: Only requests necessary host permissions
4. **No External Resources**: All processing is local

## Browser Compatibility

- **Target**: Chromium-based browsers (Chrome 88+)
- **Manifest V3**: Future-proof extension format
- **Modern APIs**: Uses latest web standards

## Testing Strategy

1. **Manual Testing**: Load extension and test on ome.tv
2. **Console Logging**: Comprehensive logging for debugging
3. **Error Handling**: Graceful fallbacks for all operations
4. **Cross-browser Testing**: Test on Chrome, Brave, Edge

## Build Process

Currently uses a simple bundled approach:
- Modular ES6 files for development
- Single bundled file for production compatibility
- Manual build process (can be automated with webpack/rollup)

## Future Enhancements

1. **More Filters**: Sepia, brightness, contrast, etc.
2. **Custom Shaders**: WebGL-based filters for advanced effects
3. **Presets**: Save and load filter combinations
4. **Performance Monitoring**: Real-time FPS and performance metrics
