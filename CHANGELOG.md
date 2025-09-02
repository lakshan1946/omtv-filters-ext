# Changelog

## Version 2.0.0 - Complete Architecture Refactor

### Major Changes

- **Complete code restructure** with modular architecture
- **ES6 modules** throughout the codebase
- **Class-based design** with proper inheritance
- **Separation of concerns** across multiple focused modules

### New Architecture

- `src/core/` - Core stream processing logic
- `src/filters/` - Modular filter implementations
- `src/ui/` - User interface components
- `src/utils/` - Shared utilities and state management

### Improvements

- **Better error handling** with proper fallbacks
- **Resource management** with cleanup methods
- **State management** with observer pattern
- **Extensible filter system** using factory pattern
- **Improved performance** with optimized canvas operations
- **Better code documentation** and inline comments

### Technical Improvements

- Eliminated monolithic injected.js file (233 lines → modular structure)
- Implemented proper separation of concerns
- Added comprehensive error handling
- Improved memory management with cleanup methods
- Better abstraction with base classes and interfaces

## Version 1.0.0 - Initial Release

- Basic video filter functionality
- Grayscale, blur, and pixelate filters
- Simple floating UI panel
- Single-file implementation
