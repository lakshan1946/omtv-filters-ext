import { StreamProcessor } from "./StreamProcessor.js";
import { filterRegistry } from "../filters/FilterRegistry.js";
import { stateManager } from "../utils/state.js";
import { CANVAS_CONFIG } from "../utils/constants.js";

/**
 * Main stream processing manager
 */
export class StreamManager {
  constructor() {
    this.originalGetUserMedia = null;
    this.isPatched = false;
  }

  /**
   * Initialize and patch getUserMedia
   */
  initialize() {
    if (this.isPatched) return;

    this.originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices
    );

    navigator.mediaDevices.getUserMedia = this.patchedGetUserMedia.bind(this);
    this.isPatched = true;
  }

  /**
   * Patched getUserMedia implementation
   */
  async patchedGetUserMedia(constraints = {}) {
    // Call original getUserMedia
    const rawStream = await this.originalGetUserMedia(constraints);

    // Check if video is requested
    const wantsVideo = this.isVideoRequested(constraints);
    if (!wantsVideo) {
      return rawStream;
    }

    try {
      const processedStream = await this.buildProcessedStream(
        rawStream,
        constraints
      );
      return processedStream || rawStream;
    } catch (error) {
      console.warn("[OmeTV Filters] Failed to process stream:", error);
      return rawStream;
    }
  }

  /**
   * Check if video is requested in constraints
   */
  isVideoRequested(constraints) {
    return (
      (typeof constraints.video === "boolean" && constraints.video) ||
      typeof constraints.video === "object"
    );
  }

  /**
   * Build processed stream from raw stream
   */
  async buildProcessedStream(rawStream, constraints) {
    const videoTrack = rawStream.getVideoTracks()[0];
    if (!videoTrack) {
      return rawStream;
    }

    // Create hidden video element
    const video = this.createVideoElement(rawStream);

    // Wait for video to be ready
    await this.waitForVideoReady(video);

    // Get stream properties
    const fps = this.extractFrameRate(videoTrack, constraints);

    // Create stream processor
    const processor = new StreamProcessor();
    processor.initialize(video);

    // Start processing with filter application
    processor.start((ctx, videoEl, width, height) => {
      this.applyCurrentFilter(ctx, videoEl, width, height);
    });

    // Get processed stream
    const processedStream = processor.getStream(fps);

    // Forward audio tracks
    this.forwardAudioTracks(rawStream, processedStream);

    // Setup cleanup
    this.setupStreamCleanup(processedStream, rawStream, processor);

    return processedStream;
  }

  /**
   * Create hidden video element for processing
   */
  createVideoElement(stream) {
    const video = document.createElement("video");
    video.style.position = "fixed";
    video.style.opacity = "0";
    video.style.pointerEvents = "none";
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;

    return video;
  }

  /**
   * Wait for video to be ready for processing
   */
  async waitForVideoReady(video) {
    try {
      await video.play();
    } catch (error) {
      // Autoplay might be blocked, but that's okay
      console.debug("Video autoplay blocked:", error);
    }
  }

  /**
   * Extract frame rate from video track or constraints
   */
  extractFrameRate(videoTrack, constraints) {
    const settings = videoTrack.getSettings ? videoTrack.getSettings() : {};
    return (
      settings.frameRate ||
      constraints?.video?.frameRate ||
      CANVAS_CONFIG.defaultFps
    );
  }

  /**
   * Apply current filter to the frame
   */
  applyCurrentFilter(ctx, video, width, height) {
    const state = stateManager.getState();

    if (!state.enabled) {
      // Just pass through without filter
      ctx.drawImage(video, 0, 0, width, height);
      return;
    }

    const filter = filterRegistry.getFilter(state.filter);
    filter.apply(ctx, video, width, height, state);
  }

  /**
   * Forward audio tracks from raw to processed stream
   */
  forwardAudioTracks(rawStream, processedStream) {
    rawStream.getAudioTracks().forEach((track) => {
      processedStream.addTrack(track);
    });
  }

  /**
   * Setup cleanup for when stream ends
   */
  setupStreamCleanup(processedStream, rawStream, processor) {
    const videoTrack = processedStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const cleanup = () => {
      processor.cleanup();
      rawStream.getTracks().forEach((track) => track.stop());
    };

    videoTrack.addEventListener("ended", cleanup);
  }

  /**
   * Restore original getUserMedia
   */
  restore() {
    if (this.isPatched && this.originalGetUserMedia) {
      navigator.mediaDevices.getUserMedia = this.originalGetUserMedia;
      this.isPatched = false;
    }
  }
}

export const streamManager = new StreamManager();
