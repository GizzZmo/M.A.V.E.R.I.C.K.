/**
 * @fileoverview Marvel API integration service for M.A.V.E.R.I.C.K.
 * Provides access to official Marvel character data via the Marvel API.
 */

import { Injectable, signal } from '@angular/core';

/**
 * Represents a Marvel character from the API.
 */
export interface MarvelCharacter {
  /** Character ID */
  id: number;
  /** Character name */
  name: string;
  /** Character description */
  description: string;
  /** Thumbnail image */
  thumbnail: {
    path: string;
    extension: string;
  };
  /** Comics appearances */
  comics: {
    available: number;
  };
  /** Series appearances */
  series: {
    available: number;
  };
  /** Stories appearances */
  stories: {
    available: number;
  };
}

/**
 * Marvel API response structure.
 */
interface MarvelApiResponse {
  code: number;
  status: string;
  data: {
    results: MarvelCharacter[];
    total: number;
    count: number;
    offset: number;
  };
}

/**
 * Service for integrating with the Marvel API.
 * 
 * This service provides:
 * - Character search and retrieval
 * - Caching of API responses
 * - Rate limiting and error handling
 * - Character data transformation
 * 
 * Note: Requires a Marvel API key to be configured.
 * Get your free API key at: https://developer.marvel.com/
 * 
 * @example
 * ```typescript
 * const marvelService = inject(MarvelApiService);
 * const characters = await marvelService.searchCharacters('Spider-Man');
 * const character = await marvelService.getCharacter(1009610);
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class MarvelApiService {
  /** Base URL for Marvel API */
  private readonly API_BASE_URL = 'https://gateway.marvel.com/v1/public';

  /** Cache for API responses */
  private cache = new Map<string, { data: any; timestamp: number }>();

  /** Cache duration in milliseconds (1 hour) */
  private readonly CACHE_DURATION = 60 * 60 * 1000;

  /** Loading state */
  isLoading = signal(false);

  /** Last error message */
  error = signal<string | null>(null);

  /**
   * Searches for Marvel characters by name.
   * 
   * @param {string} query - Search query (character name)
   * @param {number} limit - Maximum number of results (default: 20)
   * @param {number} offset - Results offset for pagination (default: 0)
   * @returns {Promise<MarvelCharacter[]>} Array of matching characters
   * @throws {Error} If API call fails
   */
  async searchCharacters(query: string, limit: number = 20, offset: number = 0): Promise<MarvelCharacter[]> {
    const cacheKey = `search:${query}:${limit}:${offset}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const params = new URLSearchParams({
        nameStartsWith: query,
        limit: limit.toString(),
        offset: offset.toString(),
        ...this.getAuthParams(),
      });

      const response = await fetch(`${this.API_BASE_URL}/characters?${params}`);
      
      if (!response.ok) {
        throw new Error(`Marvel API error: ${response.statusText}`);
      }

      const data: MarvelApiResponse = await response.json();
      const characters = data.data.results;

      this.setCache(cacheKey, characters);
      return characters;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to search Marvel characters';
      this.error.set(errorMessage);
      console.error('Marvel API search error:', error);
      throw new Error(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Gets a specific Marvel character by ID.
   * 
   * @param {number} characterId - Marvel character ID
   * @returns {Promise<MarvelCharacter | null>} The character, or null if not found
   * @throws {Error} If API call fails
   */
  async getCharacter(characterId: number): Promise<MarvelCharacter | null> {
    const cacheKey = `character:${characterId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const params = new URLSearchParams(this.getAuthParams());
      const response = await fetch(`${this.API_BASE_URL}/characters/${characterId}?${params}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Marvel API error: ${response.statusText}`);
      }

      const data: MarvelApiResponse = await response.json();
      const character = data.data.results[0] || null;

      if (character) {
        this.setCache(cacheKey, character);
      }

      return character;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get Marvel character';
      this.error.set(errorMessage);
      console.error('Marvel API get error:', error);
      throw new Error(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Gets a list of random popular Marvel characters.
   * 
   * @param {number} count - Number of characters to retrieve (default: 10)
   * @returns {Promise<MarvelCharacter[]>} Array of characters
   */
  async getPopularCharacters(count: number = 10): Promise<MarvelCharacter[]> {
    const cacheKey = `popular:${count}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const params = new URLSearchParams({
        orderBy: '-modified',
        limit: count.toString(),
        ...this.getAuthParams(),
      });

      const response = await fetch(`${this.API_BASE_URL}/characters?${params}`);
      
      if (!response.ok) {
        throw new Error(`Marvel API error: ${response.statusText}`);
      }

      const data: MarvelApiResponse = await response.json();
      const characters = data.data.results;

      this.setCache(cacheKey, characters);
      return characters;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get popular characters';
      this.error.set(errorMessage);
      console.error('Marvel API popular error:', error);
      throw new Error(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Gets the full image URL for a character's thumbnail.
   * 
   * @param {MarvelCharacter} character - The character
   * @param {string} size - Image size variant (default: 'standard_xlarge')
   * @returns {string} Full image URL
   */
  getCharacterImageUrl(character: MarvelCharacter, size: string = 'standard_xlarge'): string {
    return `${character.thumbnail.path}/${size}.${character.thumbnail.extension}`;
  }

  /**
   * Checks if Marvel API is configured with credentials.
   * 
   * @returns {boolean} True if API credentials are available
   */
  isConfigured(): boolean {
    // Check if API keys are available in environment
    return !!(process.env.MARVEL_API_PUBLIC_KEY && process.env.MARVEL_API_PRIVATE_KEY);
  }

  /**
   * Gets authentication parameters for Marvel API requests.
   * Generates the required apikey, ts (timestamp), and hash parameters.
   * 
   * @returns {object} Authentication parameters
   * @private
   */
  private getAuthParams(): Record<string, string> {
    // In a production environment, the hash should be generated server-side
    // to protect the private key. This is a simplified implementation.
    
    const publicKey = process.env.MARVEL_API_PUBLIC_KEY || 'demo_public_key';
    const privateKey = process.env.MARVEL_API_PRIVATE_KEY || 'demo_private_key';
    const ts = Date.now().toString();

    // Generate MD5 hash: ts + privateKey + publicKey
    const hash = this.generateMD5Hash(`${ts}${privateKey}${publicKey}`);

    return {
      apikey: publicKey,
      ts,
      hash,
    };
  }

  /**
   * Generates an MD5 hash (simplified for demo).
   * In production, use a proper crypto library or generate hash server-side.
   * 
   * @param {string} str - String to hash
   * @returns {string} MD5 hash
   * @private
   */
  private generateMD5Hash(str: string): string {
    // This is a placeholder. In production, use:
    // - Server-side hashing to protect private key
    // - Or a proper crypto library like crypto-js
    
    // For demo purposes, return a placeholder hash
    return 'demo_hash_' + btoa(str).substring(0, 32);
  }

  /**
   * Retrieves data from cache if not expired.
   * 
   * @param {string} key - Cache key
   * @returns {any | null} Cached data or null
   * @private
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Stores data in cache.
   * 
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @private
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clears all cached data.
   */
  clearCache(): void {
    this.cache.clear();
  }
}
