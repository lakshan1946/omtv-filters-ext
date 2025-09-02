/**
 * Video Processing Engine
 * Handles canvas-based video filtering and processing
 */

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
