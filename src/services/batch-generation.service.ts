/**
 * @fileoverview Batch generation service for M.A.V.E.R.I.C.K.
 * Provides batch processing capabilities for generating multiple content items.
 */

import { Injectable, signal } from '@angular/core';
import { GeminiService } from './gemini.service.js';
import type { GeneratedConcept } from '../models/marvel-concept.model.js';

/**
 * Represents a single batch job.
 */
export interface BatchJob {
  /** Unique job identifier */
  id: string;
  /** Job type */
  type: 'character' | 'plot' | 'style' | 'intel' | 'concept-art' | 'comic-strip';
  /** Input prompts for generation */
  inputs: string[];
  /** Job status */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** Current progress (0-100) */
  progress: number;
  /** Results array */
  results: Array<GeneratedConcept | string[] | null>;
  /** Error messages (if any) */
  errors: Array<string | null>;
  /** Creation timestamp */
  createdAt: Date;
  /** Completion timestamp */
  completedAt?: Date;
}

/**
 * Service for batch processing multiple generation requests.
 * 
 * This service provides:
 * - Batch character, plot, style, and intel generation
 * - Queue management for batch jobs
 * - Progress tracking
 * - Error handling for failed items
 * 
 * @example
 * ```typescript
 * const batchService = inject(BatchGenerationService);
 * const job = await batchService.batchGenerateCharacters([
 *   'A time-traveling hero',
 *   'A psychic villain',
 *   'A tech genius sidekick'
 * ]);
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class BatchGenerationService {
  /** Current batch jobs */
  jobs = signal<BatchJob[]>([]);

  /** Currently processing job */
  currentJob = signal<BatchJob | null>(null);

  /**
   * Initializes the batch generation service.
   * 
   * @param {GeminiService} geminiService - Injected Gemini service
   */
  constructor(private geminiService: GeminiService) {}

  /**
   * Generates multiple character concepts in batch.
   * 
   * @param {string[]} coreConcepts - Array of character concept descriptions
   * @returns {Promise<BatchJob>} The batch job with results
   */
  async batchGenerateCharacters(coreConcepts: string[]): Promise<BatchJob> {
    const job = this.createJob('character', coreConcepts);
    return this.processJob(job, async (input) => {
      const result = await this.geminiService.generateCharacterConcept(input);
      return { ...result, type: 'character' };
    });
  }

  /**
   * Generates multiple plot outlines in batch.
   * 
   * @param {Array<{hero: string, villain: string, theme: string}>} inputs - Array of plot parameters
   * @returns {Promise<BatchJob>} The batch job with results
   */
  async batchGeneratePlots(
    inputs: Array<{ hero: string; villain: string; theme: string }>
  ): Promise<BatchJob> {
    const job = this.createJob(
      'plot',
      inputs.map(i => `${i.hero} vs ${i.villain} - ${i.theme}`)
    );
    return this.processJob(job, async (_, index) => {
      const { hero, villain, theme } = inputs[index];
      const result = await this.geminiService.generatePlotOutline(hero, villain, theme);
      return { ...result, type: 'plot' };
    });
  }

  /**
   * Generates multiple visual style guides in batch.
   * 
   * @param {string[]} keywords - Array of style keywords
   * @returns {Promise<BatchJob>} The batch job with results
   */
  async batchGenerateStyles(keywords: string[]): Promise<BatchJob> {
    const job = this.createJob('style', keywords);
    return this.processJob(job, async (input) => {
      const result = await this.geminiService.generateVisualStyle(input);
      return { ...result, type: 'style' };
    });
  }

  /**
   * Generates multiple intelligence briefings in batch.
   * 
   * @param {string[]} characterNames - Array of character names
   * @returns {Promise<BatchJob>} The batch job with results
   */
  async batchGenerateIntel(characterNames: string[]): Promise<BatchJob> {
    const job = this.createJob('intel', characterNames);
    return this.processJob(job, async (input) => {
      const result = await this.geminiService.generateCharacterIntel(input);
      return { ...result, type: 'intel' };
    });
  }

  /**
   * Generates multiple concept art images in batch.
   * 
   * @param {string[]} prompts - Array of concept art prompts
   * @returns {Promise<BatchJob>} The batch job with results
   */
  async batchGenerateConceptArt(prompts: string[]): Promise<BatchJob> {
    const job = this.createJob('concept-art', prompts);
    return this.processJob(job, async (input) => {
      return await this.geminiService.generateConceptArt(input);
    });
  }

  /**
   * Generates multiple comic strips in batch.
   * 
   * @param {Array<{story: string, panels: number, style: string}>} inputs - Array of comic strip parameters
   * @returns {Promise<BatchJob>} The batch job with results
   */
  async batchGenerateComicStrips(
    inputs: Array<{ story: string; panels: number; style: string }>
  ): Promise<BatchJob> {
    const job = this.createJob(
      'comic-strip',
      inputs.map(i => `${i.story} (${i.panels} panels, ${i.style})`)
    );
    return this.processJob(job, async (_, index) => {
      const { story, panels, style } = inputs[index];
      return await this.geminiService.generateComicStrip(story, panels, style);
    });
  }

  /**
   * Cancels a batch job (if it's still processing).
   * 
   * @param {string} jobId - ID of the job to cancel
   * @returns {boolean} True if job was cancelled
   */
  cancelJob(jobId: string): boolean {
    const jobs = this.jobs();
    const job = jobs.find(j => j.id === jobId);
    
    if (!job || job.status !== 'processing') {
      return false;
    }

    job.status = 'failed';
    job.completedAt = new Date();
    this.jobs.set([...jobs]);

    if (this.currentJob()?.id === jobId) {
      this.currentJob.set(null);
    }

    return true;
  }

  /**
   * Gets a batch job by ID.
   * 
   * @param {string} jobId - Job ID
   * @returns {BatchJob | null} The job, or null if not found
   */
  getJob(jobId: string): BatchJob | null {
    return this.jobs().find(j => j.id === jobId) || null;
  }

  /**
   * Removes a completed or failed job from the list.
   * 
   * @param {string} jobId - Job ID
   * @returns {boolean} True if job was removed
   */
  removeJob(jobId: string): boolean {
    const jobs = this.jobs();
    const index = jobs.findIndex(j => j.id === jobId);
    
    if (index === -1) return false;

    const job = jobs[index];
    if (job.status === 'processing') {
      return false; // Can't remove processing jobs
    }

    jobs.splice(index, 1);
    this.jobs.set([...jobs]);

    return true;
  }

  /**
   * Creates a new batch job.
   * 
   * @param {BatchJob['type']} type - Job type
   * @param {string[]} inputs - Input prompts
   * @returns {BatchJob} The created job
   * @private
   */
  private createJob(type: BatchJob['type'], inputs: string[]): BatchJob {
    const job: BatchJob = {
      id: this.generateId(),
      type,
      inputs,
      status: 'pending',
      progress: 0,
      results: new Array(inputs.length).fill(null),
      errors: new Array(inputs.length).fill(null),
      createdAt: new Date(),
    };

    const jobs = this.jobs();
    this.jobs.set([...jobs, job]);

    return job;
  }

  /**
   * Processes a batch job by executing the generation function for each input.
   * 
   * @template T - Result type
   * @param {BatchJob} job - The job to process
   * @param {function} generateFn - Function to generate content for each input
   * @returns {Promise<BatchJob>} The completed job
   * @private
   */
  private async processJob<T>(
    job: BatchJob,
    generateFn: (input: string, index: number) => Promise<T>
  ): Promise<BatchJob> {
    job.status = 'processing';
    this.currentJob.set(job);
    this.updateJob(job);

    for (let i = 0; i < job.inputs.length; i++) {
      try {
        const result = await generateFn(job.inputs[i], i);
        job.results[i] = result as any;
        job.errors[i] = null;
      } catch (error: any) {
        job.results[i] = null;
        job.errors[i] = error.message || 'Unknown error';
      }

      // Update progress
      job.progress = Math.round(((i + 1) / job.inputs.length) * 100);
      this.updateJob(job);
    }

    job.status = 'completed';
    job.completedAt = new Date();
    this.currentJob.set(null);
    this.updateJob(job);

    return job;
  }

  /**
   * Updates a job in the jobs list.
   * 
   * @param {BatchJob} job - Job to update
   * @private
   */
  private updateJob(job: BatchJob): void {
    const jobs = this.jobs();
    const index = jobs.findIndex(j => j.id === job.id);
    if (index !== -1) {
      jobs[index] = { ...job };
      this.jobs.set([...jobs]);
    }
  }

  /**
   * Generates a unique identifier.
   * @returns {string} Unique identifier
   * @private
   */
  private generateId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
