import { DEFAULT_CONFIG } from "./constants.js";

/**
 * Application state manager
 */
class StateManager {
  constructor() {
    this.state = { ...DEFAULT_CONFIG };
    this.listeners = new Set();
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update state and notify listeners
   */
  updateState(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };

    this.listeners.forEach((listener) => {
      listener(this.state, prevState);
    });
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get specific state property
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Set specific state property
   */
  set(key, value) {
    this.updateState({ [key]: value });
  }
}

export const stateManager = new StateManager();
