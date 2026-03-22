/**
 * @fileoverview Collaboration service for M.A.V.E.R.I.C.K.
 * Provides real-time collaborative editing and user presence using the BroadcastChannel API.
 * Designed to be extended with a WebSocket or Firebase backend for multi-device collaboration.
 */

import { Injectable, OnDestroy, inject, signal, computed } from '@angular/core';
import type { PresenceInfo, CollaborationMessage, CollaborationMessageType } from '../models/marvel-concept.model.js';
import { AuthService } from './auth.service.js';

/** Name of the BroadcastChannel used for cross-tab collaboration */
const CHANNEL_NAME = 'maverick_collaboration';

/** Interval between presence heartbeats (ms) */
const HEARTBEAT_INTERVAL = 5_000;

/** How long before a peer is considered offline (ms) */
const PRESENCE_TIMEOUT = 15_000;

/** Palette of colours assigned to collaborators for visual distinction */
const PRESENCE_COLORS = [
  '#38bdf8', // sky-400
  '#fb923c', // orange-400
  '#34d399', // emerald-400
  '#a78bfa', // violet-400
  '#f472b6', // pink-400
  '#facc15', // yellow-400
  '#60a5fa', // blue-400
  '#4ade80', // green-400
];

/**
 * Service that manages real-time collaboration using the BroadcastChannel API.
 *
 * Features:
 * - User presence indicators (who is online, what tab they are on)
 * - Cross-tab content sync (same browser origin)
 * - Periodic heartbeats to detect offline peers
 * - Clean teardown on component/service destroy
 *
 * To extend to multi-device real-time, replace the BroadcastChannel calls with
 * WebSocket or Firebase Realtime Database messages while keeping the same public API.
 *
 * @example
 * ```typescript
 * const collab = inject(CollaborationService);
 * collab.startSession('character');
 * // Later...
 * collab.broadcastTabChange('video-shot');
 * collab.endSession();
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class CollaborationService implements OnDestroy {
  private authService = inject(AuthService);

  /** BroadcastChannel instance for cross-tab messaging */
  private channel: BroadcastChannel | null = null;

  /** Handle for the heartbeat timer */
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  /** Handle for the stale-peer cleanup timer */
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  /** All known live peers (keyed by userId) */
  private peersMap = signal<Map<string, PresenceInfo>>(new Map());

  /** Whether this session is active */
  private _sessionActive = signal(false);

  /** The colour assigned to the current user */
  private myColor = '';

  // ── Public reactive state ────────────────────────────────────────────────

  /** True when a collaboration session is in progress */
  readonly sessionActive = computed(() => this._sessionActive());

  /**
   * Live list of collaborators (peers only – does not include the current user).
   */
  readonly peers = computed<PresenceInfo[]>(() =>
    Array.from(this.peersMap().values())
  );

  /**
   * Count of currently online collaborators (peers only).
   */
  readonly peerCount = computed(() => this.peersMap().size);

  // ── Session management ───────────────────────────────────────────────────

  /**
   * Starts a collaboration session.
   * Opens the BroadcastChannel, announces presence, and begins heartbeats.
   *
   * @param activeTab - The current generation tab the user is on
   */
  startSession(activeTab: string): void {
    if (this._sessionActive() || !this.authService.isAuthenticated()) return;

    this.myColor = this.pickColor();

    try {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent<CollaborationMessage>) =>
        this.handleMessage(event.data);
    } catch {
      // BroadcastChannel not supported (e.g., some older environments) – graceful no-op
      return;
    }

    this._sessionActive.set(true);
    this.broadcast('presence_join', { activeTab, color: this.myColor });

    // Regular heartbeats so peers know we are still alive
    this.heartbeatTimer = setInterval(() => {
      this.broadcast('presence_heartbeat', {
        activeTab,
        color: this.myColor,
      });
    }, HEARTBEAT_INTERVAL);

    // Periodically evict peers we haven't heard from
    this.cleanupTimer = setInterval(() => this.evictStalePeers(), PRESENCE_TIMEOUT);
  }

  /**
   * Ends the collaboration session.
   * Notifies peers and tears down the channel.
   */
  endSession(): void {
    if (!this._sessionActive()) return;

    this.broadcast('presence_leave', {});
    this.teardown();
  }

  /**
   * Broadcasts a tab-change event so peers can update their presence view.
   *
   * @param activeTab - New tab identifier
   */
  broadcastTabChange(activeTab: string): void {
    if (!this._sessionActive()) return;
    this.broadcast('tab_change', { activeTab, color: this.myColor });
    this.updateHeartbeatPayload(activeTab);
  }

  /**
   * Broadcasts a content update to all collaborators.
   *
   * @param contentType - The type of content being updated
   * @param summary - Short human-readable description of the change
   */
  broadcastContentUpdate(contentType: string, summary: string): void {
    if (!this._sessionActive()) return;
    this.broadcast('content_update', { contentType, summary });
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Sends a message on the BroadcastChannel.
   */
  private broadcast(
    type: CollaborationMessageType,
    payload: Record<string, unknown>
  ): void {
    const user = this.authService.currentUser();
    if (!this.channel || !user) return;

    const message: CollaborationMessage = {
      type,
      senderId: user.id,
      senderName: user.name,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.channel.postMessage(message);
  }

  /**
   * Handles an incoming collaboration message.
   */
  private handleMessage(message: CollaborationMessage): void {
    const currentUser = this.authService.currentUser();
    // Ignore our own echoes (BroadcastChannel does not echo back by default,
    // but guard defensively)
    if (currentUser && message.senderId === currentUser.id) return;

    switch (message.type) {
      case 'presence_join':
      case 'presence_heartbeat':
      case 'tab_change':
        this.upsertPeer(message);
        break;
      case 'presence_leave':
        this.removePeer(message.senderId);
        break;
      case 'content_update':
        // Content update notifications are consumed by the component via peers list
        this.upsertPeer(message);
        break;
    }
  }

  /**
   * Adds or refreshes a peer in the presence map.
   */
  private upsertPeer(message: CollaborationMessage): void {
    const updated = new Map(this.peersMap());
    const existing = updated.get(message.senderId);
    updated.set(message.senderId, {
      userId: message.senderId,
      name: message.senderName,
      activeTab: (message.payload?.['activeTab'] as string) ?? existing?.activeTab ?? 'unknown',
      lastSeen: message.timestamp,
      color: (message.payload?.['color'] as string) ?? existing?.color ?? '#94a3b8',
    });
    this.peersMap.set(updated);
  }

  /**
   * Removes a peer from the presence map.
   */
  private removePeer(userId: string): void {
    const updated = new Map(this.peersMap());
    updated.delete(userId);
    this.peersMap.set(updated);
  }

  /**
   * Removes peers whose last heartbeat is older than PRESENCE_TIMEOUT.
   */
  private evictStalePeers(): void {
    const cutoff = Date.now() - PRESENCE_TIMEOUT;
    const updated = new Map(this.peersMap());
    let changed = false;
    for (const [id, info] of updated.entries()) {
      if (new Date(info.lastSeen).getTime() < cutoff) {
        updated.delete(id);
        changed = true;
      }
    }
    if (changed) this.peersMap.set(updated);
  }

  /**
   * Updates the payload used in subsequent heartbeat broadcasts.
   * Re-registers the interval with the new tab name.
   */
  private updateHeartbeatPayload(activeTab: string): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
    }
    this.heartbeatTimer = setInterval(() => {
      this.broadcast('presence_heartbeat', {
        activeTab,
        color: this.myColor,
      });
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * Picks a colour from the palette based on the current user ID to ensure
   * the same user always gets the same colour within a session.
   */
  private pickColor(): string {
    const user = this.authService.currentUser();
    if (!user) return PRESENCE_COLORS[0];
    let hash = 0;
    for (let i = 0; i < user.id.length; i++) {
      hash = (hash << 5) - hash + user.id.charCodeAt(i);
      hash |= 0;
    }
    return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length];
  }

  /**
   * Tears down timers and channel without broadcasting (used on destroy).
   */
  private teardown(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.channel?.close();
    this.channel = null;
    this.peersMap.set(new Map());
    this._sessionActive.set(false);
  }

  /** Angular lifecycle: clean up when the service is destroyed. */
  ngOnDestroy(): void {
    this.teardown();
  }
}
