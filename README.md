# OmeTV Video Filters Chrome Extension

A powerful Chrome extension that adds real-time video filters to OmeTV video calls. Apply effects like grayscale, blur, and pixelation to your video stream before it's sent to other users.

## 🎥 Features

- **Real-time video processing** using HTML5 Canvas
- **Multiple filter options**: 
  - Grayscale filter
  - Blur effect (adjustable intensity)
  - Pixelate effect (adjustable size)
- **User-friendly control panel** with modern UI
- **Zero lag** video processing
- **Audio preservation** (filters only affect video)
- **Easy toggle** on/off functionality

## 📦 Installation

### From Source (Development)

1. **Clone or download** this repository
2. **Open Chrome/Brave** browser
3. **Navigate to** `chrome://extensions/` or `brave://extensions/`
4. **Enable Developer mode** (toggle in top-right corner)
5. **Click "Load unpacked"**
6. **Select** the extension folder

### Usage

1. **Go to** [ome.tv](https://ome.tv)
2. **Allow camera permissions** when prompted
3. **Look for the floating control panel** in the bottom-right corner
4. **Select your desired filter** and adjust settings
5. **Toggle filters** on/off as needed

## 🛠️ Technical Details

### Architecture

```
omtv-filters-ext/
├── manifest.json                 # Extension manifest
├── src/
│   ├── content/
│   │   └── content.js           # Content script injection
│   └── injected/
│       ├── injected.js          # Main bundled script (production)
│       ├── main.js              # Modular entry point (development)
│       ├── build.js             # Build script for bundling
│       └── modules/             # Modular components
│           ├── filterState.js   # State management
│           ├── videoProcessor.js # Video processing engine
│           ├── filterPanel.js   # UI components
│           └── mediaHandler.js  # getUserMedia override
├── assets/
│   └── icons/                   # Extension icons
└── docs/
    └── README.md                # This file
```

### How It Works

1. **Content Script Injection**: The extension injects a script into the page context
2. **getUserMedia Override**: Intercepts calls to `navigator.mediaDevices.getUserMedia()`
3. **Canvas Processing**: Creates hidden video element and canvas for real-time processing
4. **Stream Replacement**: Returns processed video stream while preserving audio
5. **UI Control**: Floating panel allows real-time filter adjustments

### Filter Types

- **None**: Pass-through (no processing)
- **Grayscale**: Converts video to black and white using CSS filters
- **Blur**: Applies Gaussian blur with adjustable radius (0-20px)
- **Pixelate**: Downscales and upscales video for retro pixelated effect

## 🚀 Performance

- **Optimized rendering** using `requestAnimationFrame`
- **Hardware acceleration** via Canvas 2D context
- **Minimal CPU impact** with efficient processing
- **No network overhead** (all processing is local)

## 🔧 Development

### File Structure Explanation

- **manifest.json**: Extension configuration and permissions
- **content.js**: Bridges extension context to page context  
- **injected.js**: Main functionality injected into page
- **Modular files**: Separated concerns for maintainability

### Building

The extension uses a bundled approach where modular ES6 files are combined into a single `injected.js` for compatibility.

### Testing

1. Load extension in developer mode
2. Open browser console on ome.tv
3. Look for `[OmeTV Filters]` log messages
4. Test different filter combinations

## 📋 Compatibility

- **Chrome** 88+
- **Brave** (Chromium-based)
- **Edge** (Chromium-based)
- **Opera** (Chromium-based)

## ⚠️ Limitations

- Only works on OmeTV and similar video chat platforms
- Requires camera permissions to function
- May impact battery life on mobile devices during heavy processing

## 🐛 Troubleshooting

### Extension Not Loading
- Check if Developer Mode is enabled
- Verify all files have proper UTF-8 encoding
- Look for errors in `chrome://extensions/`

### Filters Not Working
- Ensure camera permissions are granted
- Check browser console for error messages
- Try refreshing the page and reloading the extension

### Performance Issues
- Lower filter intensity (blur/pixelate values)
- Check if hardware acceleration is enabled
- Close unnecessary browser tabs

## 📝 License

This project is for educational purposes. Use responsibly and in accordance with OmeTV's terms of service.

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows existing style patterns
- UTF-8 encoding for all files
- Proper error handling and logging
- Testing on multiple browsers

## 📧 Support

For issues or questions, please check the troubleshooting section above or create an issue in the repository.
