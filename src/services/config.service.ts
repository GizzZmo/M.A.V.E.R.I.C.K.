/**
 * @fileoverview Configuration service for M.A.V.E.R.I.C.K.
 * Provides centralized configuration management for the application.
 */

import { Injectable, signal } from '@angular/core';

/**
 * Video generation configuration.
 */
export interface VideoConfig {
  /** Maximum video duration in seconds */
  maxDuration: number;
  /** Video generation timeout in milliseconds */
  timeout: number;
  /** Polling interval for status checks in milliseconds */
  pollingInterval: number;
  /** Maximum number of status checks before timeout */
  maxStatusChecks: number;
}

/**
 * Batch generation configuration.
 */
export interface BatchConfig {
  /** Maximum number of concurrent batch jobs */
  maxConcurrentJobs: number;
  /** Delay between batch items in milliseconds */
  delayBetweenItems: number;
  /** Maximum items per batch */
  maxItemsPerBatch: number;
}

/**
 * Application configuration.
 */
export interface AppConfig {
  /** Video generation settings */
  video: VideoConfig;
  /** Batch generation settings */
  batch: BatchConfig;
  /** Enable debug logging */
  debugMode: boolean;
  /** API request timeout in milliseconds */
  apiTimeout: number;
}

/**
 * Service for managing application configuration.
 * 
 * This service provides:
 * - Centralized configuration management
 * - Persistent configuration storage
 * - Configuration validation
 * - Default configuration values
 * 
 * @example
 * ```typescript
 * const configService = inject(ConfigService);
 * const videoConfig = configService.getVideoConfig();
 * configService.updateVideoConfig({ maxDuration: 120 });
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  /** Local storage key for configuration */
  private readonly CONFIG_KEY = 'maverick_config';

  /** Default video configuration */
  private readonly DEFAULT_VIDEO_CONFIG: VideoConfig = {
    maxDuration: 60, // 60 seconds (can be extended)
    timeout: 600000, // 10 minutes (increased from 5)
    pollingInterval: 10000, // 10 seconds
    maxStatusChecks: 60, // 60 checks * 10 seconds = 10 minutes
  };

  /** Default batch configuration */
  private readonly DEFAULT_BATCH_CONFIG: BatchConfig = {
    maxConcurrentJobs: 3,
    delayBetweenItems: 1000, // 1 second delay between batch items
    maxItemsPerBatch: 50,
  };

  /** Default application configuration */
  private readonly DEFAULT_CONFIG: AppConfig = {
    video: this.DEFAULT_VIDEO_CONFIG,
    batch: this.DEFAULT_BATCH_CONFIG,
    debugMode: false,
    apiTimeout: 60000, // 60 seconds
  };

  /** Current application configuration */
  config = signal<AppConfig>(this.DEFAULT_CONFIG);

  /**
   * Initializes the configuration service.
   * Loads configuration from local storage or uses defaults.
   */
  constructor() {
    this.loadConfig();
  }

  /**
   * Gets the current video configuration.
   * 
   * @returns {VideoConfig} Video configuration
   */
  getVideoConfig(): VideoConfig {
    return this.config().video;
  }

  /**
   * Updates video configuration.
   * 
   * @param {Partial<VideoConfig>} updates - Configuration updates
   */
  updateVideoConfig(updates: Partial<VideoConfig>): void {
    const currentConfig = this.config();
    const newConfig: AppConfig = {
      ...currentConfig,
      video: {
        ...currentConfig.video,
        ...updates,
      },
    };
    this.config.set(newConfig);
    this.saveConfig();
  }

  /**
   * Gets the current batch configuration.
   * 
   * @returns {BatchConfig} Batch configuration
   */
  getBatchConfig(): BatchConfig {
    return this.config().batch;
  }

  /**
   * Updates batch configuration.
   * 
   * @param {Partial<BatchConfig>} updates - Configuration updates
   */
  updateBatchConfig(updates: Partial<BatchConfig>): void {
    const currentConfig = this.config();
    const newConfig: AppConfig = {
      ...currentConfig,
      batch: {
        ...currentConfig.batch,
        ...updates,
      },
    };
    this.config.set(newConfig);
    this.saveConfig();
  }

  /**
   * Gets the full application configuration.
   * 
   * @returns {AppConfig} Application configuration
   */
  getConfig(): AppConfig {
    return this.config();
  }

  /**
   * Updates the entire configuration.
   * 
   * @param {Partial<AppConfig>} updates - Configuration updates
   */
  updateConfig(updates: Partial<AppConfig>): void {
    const currentConfig = this.config();
    const newConfig: AppConfig = {
      ...currentConfig,
      ...updates,
      video: updates.video ? { ...currentConfig.video, ...updates.video } : currentConfig.video,
      batch: updates.batch ? { ...currentConfig.batch, ...updates.batch } : currentConfig.batch,
    };
    this.config.set(newConfig);
    this.saveConfig();
  }

  /**
   * Resets configuration to defaults.
   */
  resetToDefaults(): void {
    this.config.set(this.DEFAULT_CONFIG);
    this.saveConfig();
  }

  /**
   * Enables debug mode.
   */
  enableDebugMode(): void {
    this.updateConfig({ debugMode: true });
  }

  /**
   * Disables debug mode.
   */
  disableDebugMode(): void {
    this.updateConfig({ debugMode: false });
  }

  /**
   * Checks if debug mode is enabled.
   * 
   * @returns {boolean} True if debug mode is enabled
   */
  isDebugMode(): boolean {
    return this.config().debugMode;
  }

  /**
   * Exports configuration as JSON.
   * 
   * @returns {string} JSON string of configuration
   */
  exportConfig(): string {
    return JSON.stringify(this.config(), null, 2);
  }

  /**
   * Imports configuration from JSON.
   * 
   * @param {string} jsonString - JSON string of configuration
   * @returns {boolean} True if import was successful
   */
  importConfig(jsonString: string): boolean {
    try {
      const importedConfig = JSON.parse(jsonString);
      
      // Validate structure
      if (!importedConfig.video || !importedConfig.batch) {
        throw new Error('Invalid configuration format');
      }

      this.config.set(importedConfig);
      this.saveConfig();
      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }

  /**
   * Loads configuration from local storage.
   * @private
   */
  private loadConfig(): void {
    const stored = localStorage.getItem(this.CONFIG_KEY);
    if (!stored) {
      this.config.set(this.DEFAULT_CONFIG);
      return;
    }

    try {
      const loadedConfig = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      const mergedConfig: AppConfig = {
        ...this.DEFAULT_CONFIG,
        ...loadedConfig,
        video: { ...this.DEFAULT_VIDEO_CONFIG, ...loadedConfig.video },
        batch: { ...this.DEFAULT_BATCH_CONFIG, ...loadedConfig.batch },
      };
      this.config.set(mergedConfig);
    } catch (error) {
      console.error('Failed to load configuration:', error);
      this.config.set(this.DEFAULT_CONFIG);
    }
  }

  /**
   * Saves configuration to local storage.
   * @private
   */
  private saveConfig(): void {
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config()));
  }
}
