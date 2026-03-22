/**
 * @fileoverview Cloud storage service for M.A.V.E.R.I.C.K.
 * Provides an abstraction layer for cloud storage operations.
 * Currently backed by localStorage; designed for easy replacement with a
 * real cloud backend (e.g., Firebase Firestore, AWS S3, custom REST API).
 */

import { Injectable, signal, computed } from '@angular/core';
import type { CloudSyncRecord } from '../models/marvel-concept.model.js';

/** localStorage key for cloud sync metadata */
const SYNC_METADATA_KEY = 'maverick_cloud_sync';

/**
 * Service providing a cloud storage abstraction layer.
 *
 * All data is currently persisted in localStorage and exposed through a
 * promise-based API that mirrors a typical cloud REST/SDK interface.
 * To switch to a real backend, replace the private read/write helpers.
 *
 * Features:
 * - Save/load arbitrary JSON documents with a stable ID
 * - Sync status tracking per item (synced, pending, error, local_only)
 * - List all synced items
 * - Delete remote records
 * - Global sync-in-progress indicator
 *
 * @example
 * ```typescript
 * const cloud = inject(CloudStorageService);
 * await cloud.save('project_abc', myProjectData);
 * const data = await cloud.load('project_abc');
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class CloudStorageService {
  /** Sync records keyed by local ID */
  private syncRecords = signal<Map<string, CloudSyncRecord>>(
    this.loadSyncRecords()
  );

  /** Number of in-flight save operations */
  private pendingOps = signal(0);

  // ── Public reactive state ────────────────────────────────────────────────

  /** True while any save/delete operation is in progress */
  readonly isSyncing = computed(() => this.pendingOps() > 0);

  /** All tracked sync records as an array */
  readonly allRecords = computed<CloudSyncRecord[]>(() =>
    Array.from(this.syncRecords().values())
  );

  /** Count of items not yet synced to the cloud */
  readonly pendingCount = computed(
    () => this.allRecords().filter(r => r.status === 'pending').length
  );

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Saves a document to cloud storage.
   * Updates the sync record for the given ID.
   *
   * @param localId - Stable local identifier for the document
   * @param data    - Serialisable data to save
   * @returns       The remote ID assigned to this document
   */
  async save(localId: string, data: unknown): Promise<string> {
    this.pendingOps.update(n => n + 1);
    this.upsertRecord(localId, { status: 'pending' });

    try {
      const remoteId = await this.remoteWrite(localId, data);
      this.upsertRecord(localId, {
        remoteId,
        lastSynced: new Date().toISOString(),
        status: 'synced',
      });
      return remoteId;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.upsertRecord(localId, { status: 'error', errorMessage: message });
      throw error;
    } finally {
      this.pendingOps.update(n => n - 1);
    }
  }

  /**
   * Loads a document from cloud storage.
   *
   * @param localId - The local ID of the document to load
   * @returns The stored data, or null if not found
   */
  async load<T = unknown>(localId: string): Promise<T | null> {
    return this.remoteRead<T>(localId);
  }

  /**
   * Deletes a document from cloud storage and removes its sync record.
   *
   * @param localId - The local ID of the document to delete
   */
  async delete(localId: string): Promise<void> {
    this.pendingOps.update(n => n + 1);
    try {
      await this.remoteDelete(localId);
      const updated = new Map(this.syncRecords());
      updated.delete(localId);
      this.syncRecords.set(updated);
      this.persistSyncRecords();
    } finally {
      this.pendingOps.update(n => n - 1);
    }
  }

  /**
   * Returns the sync record for a specific item.
   *
   * @param localId - Local item ID
   */
  getRecord(localId: string): CloudSyncRecord | undefined {
    return this.syncRecords().get(localId);
  }

  /**
   * Marks an item as local-only (not yet uploaded) without performing I/O.
   * Useful when creating items offline.
   *
   * @param localId - Local item ID
   */
  markLocalOnly(localId: string): void {
    this.upsertRecord(localId, {
      remoteId: null,
      lastSynced: null,
      status: 'local_only',
    });
  }

  // ── Private: localStorage-backed remote simulation ────────────────────────

  /**
   * Simulates a remote write by persisting data to localStorage.
   * Replace this method with real HTTP/SDK calls when adding a cloud backend.
   *
   * @param localId - Document ID
   * @param data    - Data to store
   * @returns Remote ID (currently identical to localId for the mock backend)
   */
  private async remoteWrite(localId: string, data: unknown): Promise<string> {
    // Simulate network latency
    await this.delay(120);
    const remoteId = `remote_${localId}`;
    localStorage.setItem(remoteId, JSON.stringify(data));
    return remoteId;
  }

  /**
   * Simulates a remote read from localStorage.
   */
  private async remoteRead<T>(localId: string): Promise<T | null> {
    await this.delay(60);
    const remoteId = `remote_${localId}`;
    const raw = localStorage.getItem(remoteId);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /**
   * Simulates a remote delete from localStorage.
   */
  private async remoteDelete(localId: string): Promise<void> {
    await this.delay(60);
    localStorage.removeItem(`remote_${localId}`);
  }

  // ── Private: sync record persistence ──────────────────────────────────────

  private upsertRecord(
    localId: string,
    patch: Partial<Omit<CloudSyncRecord, 'localId'>>
  ): void {
    const updated = new Map(this.syncRecords());
    const existing: CloudSyncRecord = updated.get(localId) ?? {
      localId,
      remoteId: null,
      lastSynced: null,
      status: 'local_only',
    };
    updated.set(localId, { ...existing, ...patch });
    this.syncRecords.set(updated);
    this.persistSyncRecords();
  }

  private persistSyncRecords(): void {
    const records = Array.from(this.syncRecords().values());
    localStorage.setItem(SYNC_METADATA_KEY, JSON.stringify(records));
  }

  private loadSyncRecords(): Map<string, CloudSyncRecord> {
    try {
      const raw = localStorage.getItem(SYNC_METADATA_KEY);
      if (!raw) return new Map();
      const records: CloudSyncRecord[] = JSON.parse(raw);
      return new Map(records.map(r => [r.localId, r]));
    } catch {
      return new Map();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
