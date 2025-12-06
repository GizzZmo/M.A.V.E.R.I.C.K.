/**
 * @fileoverview Share service for M.A.V.E.R.I.C.K.
 * Provides functionality for creating shareable links and viewing shared content.
 */

import { Injectable } from '@angular/core';
import type { GeneratedConcept } from '../models/marvel-concept.model.js';

/**
 * Represents shareable content.
 */
export interface ShareableContent {
  /** Unique share ID */
  id: string;
  /** Content type */
  type: 'character' | 'plot' | 'style' | 'intel' | 'concept-art' | 'comic-strip' | 'video';
  /** Generated concept data */
  concept?: GeneratedConcept;
  /** Image URLs (for image content) */
  imageUrls?: string[];
  /** Original prompt */
  prompt: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Creator user ID */
  creatorId?: string;
  /** Creator name */
  creatorName?: string;
  /** View count */
  viewCount: number;
}

/**
 * Service for creating and managing shareable links.
 * 
 * This service provides:
 * - Generation of shareable links for content
 * - Content encoding/decoding for URL sharing
 * - Tracking of shared content
 * - View-only mode for shared content
 * 
 * @example
 * ```typescript
 * const shareService = inject(ShareService);
 * const shareLink = shareService.createShareLink(content);
 * const sharedContent = shareService.getSharedContent(shareId);
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ShareService {
  /** Local storage key for shared content */
  private readonly SHARED_CONTENT_KEY = 'maverick_shared_content';

  /**
   * Creates a shareable link for generated content.
   * 
   * @param {ShareableContent['type']} type - Content type
   * @param {string} prompt - Original prompt
   * @param {GeneratedConcept} concept - Generated concept (optional)
   * @param {string[]} imageUrls - Image URLs (optional)
   * @param {string} creatorId - Creator user ID (optional)
   * @param {string} creatorName - Creator name (optional)
   * @returns {string} Shareable link URL
   */
  createShareLink(
    type: ShareableContent['type'],
    prompt: string,
    concept?: GeneratedConcept,
    imageUrls?: string[],
    creatorId?: string,
    creatorName?: string
  ): string {
    const shareContent: ShareableContent = {
      id: this.generateId(),
      type,
      concept,
      imageUrls,
      prompt,
      createdAt: new Date(),
      creatorId,
      creatorName,
      viewCount: 0,
    };

    // Store in local storage
    this.saveSharedContent(shareContent);

    // Generate shareable URL
    // In production, this would be a real backend URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${shareContent.id}`;
  }

  /**
   * Retrieves shared content by ID.
   * 
   * @param {string} shareId - Share ID
   * @returns {ShareableContent | null} The shared content, or null if not found
   */
  getSharedContent(shareId: string): ShareableContent | null {
    const allShared = this.getAllSharedContent();
    const content = allShared.find(c => c.id === shareId);
    
    if (content) {
      // Increment view count
      content.viewCount++;
      this.updateSharedContent(content);
    }

    return content || null;
  }

  /**
   * Encodes content data as a URL-safe string.
   * This allows sharing via URL parameters without backend storage.
   * 
   * @param {ShareableContent} content - Content to encode
   * @returns {string} Base64-encoded URL-safe string
   */
  encodeContentForUrl(content: ShareableContent): string {
    try {
      const jsonString = JSON.stringify(content);
      // Use base64 encoding
      const base64 = btoa(jsonString);
      // Make URL-safe
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    } catch (error) {
      console.error('Failed to encode content:', error);
      throw new Error('Failed to encode content for sharing');
    }
  }

  /**
   * Decodes content data from a URL-safe string.
   * 
   * @param {string} encodedString - Encoded content string
   * @returns {ShareableContent | null} Decoded content, or null if invalid
   */
  decodeContentFromUrl(encodedString: string): ShareableContent | null {
    try {
      // Restore base64 format
      let base64 = encodedString.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      while (base64.length % 4) {
        base64 += '=';
      }
      
      const jsonString = atob(base64);
      const content = JSON.parse(jsonString);
      
      // Restore Date objects
      content.createdAt = new Date(content.createdAt);
      
      return content;
    } catch (error) {
      console.error('Failed to decode content:', error);
      return null;
    }
  }

  /**
   * Generates a full shareable URL with embedded content.
   * This method embeds the content in the URL itself, allowing sharing without backend.
   * 
   * @param {ShareableContent['type']} type - Content type
   * @param {string} prompt - Original prompt
   * @param {GeneratedConcept} concept - Generated concept (optional)
   * @param {string} creatorName - Creator name (optional)
   * @returns {string} Full shareable URL with embedded content
   */
  createEmbeddedShareLink(
    type: ShareableContent['type'],
    prompt: string,
    concept?: GeneratedConcept,
    creatorName?: string
  ): string {
    const shareContent: ShareableContent = {
      id: this.generateId(),
      type,
      concept,
      prompt,
      createdAt: new Date(),
      creatorName,
      viewCount: 0,
    };

    const encoded = this.encodeContentForUrl(shareContent);
    const baseUrl = window.location.origin;
    return `${baseUrl}/view?data=${encoded}`;
  }

  /**
   * Gets all shared content created by the current session.
   * 
   * @returns {ShareableContent[]} Array of shared content
   */
  getAllSharedContent(): ShareableContent[] {
    const storedContent = localStorage.getItem(this.SHARED_CONTENT_KEY);
    if (!storedContent) return [];

    try {
      const content = JSON.parse(storedContent);
      return content.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
      }));
    } catch (error) {
      console.error('Failed to load shared content:', error);
      return [];
    }
  }

  /**
   * Deletes shared content.
   * 
   * @param {string} shareId - Share ID
   * @returns {boolean} True if deletion was successful
   */
  deleteSharedContent(shareId: string): boolean {
    const allShared = this.getAllSharedContent();
    const index = allShared.findIndex(c => c.id === shareId);
    
    if (index === -1) return false;

    allShared.splice(index, 1);
    localStorage.setItem(this.SHARED_CONTENT_KEY, JSON.stringify(allShared));
    
    return true;
  }

  /**
   * Copies a share link to the clipboard.
   * 
   * @param {string} shareLink - The link to copy
   * @returns {Promise<boolean>} True if copy was successful
   */
  async copyToClipboard(shareLink: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(shareLink);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      return this.fallbackCopyToClipboard(shareLink);
    }
  }

  /**
   * Fallback method for copying to clipboard in older browsers.
   * 
   * @param {string} text - Text to copy
   * @returns {boolean} True if copy was successful
   * @private
   */
  private fallbackCopyToClipboard(text: string): boolean {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (error) {
      document.body.removeChild(textArea);
      return false;
    }
  }

  /**
   * Saves shareable content to local storage.
   * 
   * @param {ShareableContent} content - Content to save
   * @private
   */
  private saveSharedContent(content: ShareableContent): void {
    const allShared = this.getAllSharedContent();
    allShared.push(content);
    localStorage.setItem(this.SHARED_CONTENT_KEY, JSON.stringify(allShared));
  }

  /**
   * Updates existing shareable content.
   * 
   * @param {ShareableContent} content - Content to update
   * @private
   */
  private updateSharedContent(content: ShareableContent): void {
    const allShared = this.getAllSharedContent();
    const index = allShared.findIndex(c => c.id === content.id);
    
    if (index !== -1) {
      allShared[index] = content;
      localStorage.setItem(this.SHARED_CONTENT_KEY, JSON.stringify(allShared));
    }
  }

  /**
   * Generates a unique identifier.
   * @returns {string} Unique identifier
   * @private
   */
  private generateId(): string {
    return `share_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
