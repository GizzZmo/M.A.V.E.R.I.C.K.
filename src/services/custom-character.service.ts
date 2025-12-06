/**
 * @fileoverview Custom character database service for M.A.V.E.R.I.C.K.
 * Provides functionality for managing user-created custom character databases.
 */

import { Injectable, signal } from '@angular/core';

/**
 * Represents a custom character in the database.
 */
export interface CustomCharacter {
  /** Unique character ID */
  id: string;
  /** Character name */
  name: string;
  /** Character type (hero, villain, anti-hero, etc.) */
  type: 'hero' | 'villain' | 'anti-hero' | 'sidekick' | 'civilian';
  /** Character description */
  description: string;
  /** Powers and abilities */
  powers: string[];
  /** Weaknesses */
  weaknesses: string[];
  /** Affiliations (teams, organizations) */
  affiliations: string[];
  /** First appearance (optional) */
  firstAppearance?: string;
  /** Character image URL or base64 data (optional) */
  imageUrl?: string;
  /** Custom metadata */
  metadata: Record<string, any>;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Creator user ID */
  creatorId?: string;
  /** Tags for categorization */
  tags: string[];
}

/**
 * Represents a custom character database/collection.
 */
export interface CharacterDatabase {
  /** Unique database ID */
  id: string;
  /** Database name */
  name: string;
  /** Database description */
  description: string;
  /** Characters in this database */
  characters: CustomCharacter[];
  /** Owner user ID */
  ownerId: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Database tags */
  tags: string[];
  /** Is this database public/shareable */
  isPublic: boolean;
}

/**
 * Service for managing custom character databases.
 * 
 * This service provides:
 * - Creation and management of character databases
 * - CRUD operations for custom characters
 * - Import/export of character databases
 * - Search and filtering capabilities
 * 
 * @example
 * ```typescript
 * const charDbService = inject(CustomCharacterService);
 * const db = charDbService.createDatabase('My Characters', userId);
 * const character = charDbService.addCharacter(db.id, characterData);
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class CustomCharacterService {
  /** Local storage key for character databases */
  private readonly DATABASES_KEY = 'maverick_character_databases';

  /** All character databases */
  databases = signal<CharacterDatabase[]>([]);

  /** Currently active database */
  currentDatabase = signal<CharacterDatabase | null>(null);

  /**
   * Initializes the custom character service.
   * Loads databases from local storage.
   */
  constructor() {
    this.loadDatabases();
  }

  /**
   * Creates a new character database.
   * 
   * @param {string} name - Database name
   * @param {string} ownerId - Owner user ID
   * @param {string} description - Database description (optional)
   * @param {string[]} tags - Database tags (optional)
   * @param {boolean} isPublic - Whether database is public (default: false)
   * @returns {CharacterDatabase} The created database
   */
  createDatabase(
    name: string,
    ownerId: string,
    description: string = '',
    tags: string[] = [],
    isPublic: boolean = false
  ): CharacterDatabase {
    const database: CharacterDatabase = {
      id: this.generateId(),
      name,
      description,
      characters: [],
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags,
      isPublic,
    };

    const databases = this.databases();
    this.databases.set([...databases, database]);
    this.saveDatabases();

    return database;
  }

  /**
   * Adds a character to a database.
   * 
   * @param {string} databaseId - Database ID
   * @param {Omit<CustomCharacter, 'id' | 'createdAt' | 'updatedAt'>} characterData - Character data
   * @returns {CustomCharacter | null} The created character, or null if database not found
   */
  addCharacter(
    databaseId: string,
    characterData: Omit<CustomCharacter, 'id' | 'createdAt' | 'updatedAt'>
  ): CustomCharacter | null {
    const database = this.getDatabaseById(databaseId);
    if (!database) return null;

    const character: CustomCharacter = {
      ...characterData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    database.characters.push(character);
    database.updatedAt = new Date();

    this.updateDatabase(database);
    return character;
  }

  /**
   * Updates an existing character.
   * 
   * @param {string} databaseId - Database ID
   * @param {string} characterId - Character ID
   * @param {Partial<CustomCharacter>} updates - Character updates
   * @returns {boolean} True if update was successful
   */
  updateCharacter(
    databaseId: string,
    characterId: string,
    updates: Partial<CustomCharacter>
  ): boolean {
    const database = this.getDatabaseById(databaseId);
    if (!database) return false;

    const character = database.characters.find(c => c.id === characterId);
    if (!character) return false;

    Object.assign(character, updates);
    character.updatedAt = new Date();
    database.updatedAt = new Date();

    this.updateDatabase(database);
    return true;
  }

  /**
   * Removes a character from a database.
   * 
   * @param {string} databaseId - Database ID
   * @param {string} characterId - Character ID
   * @returns {boolean} True if removal was successful
   */
  removeCharacter(databaseId: string, characterId: string): boolean {
    const database = this.getDatabaseById(databaseId);
    if (!database) return false;

    const index = database.characters.findIndex(c => c.id === characterId);
    if (index === -1) return false;

    database.characters.splice(index, 1);
    database.updatedAt = new Date();

    this.updateDatabase(database);
    return true;
  }

  /**
   * Searches for characters across all databases.
   * 
   * @param {string} query - Search query
   * @param {string} databaseId - Optional database ID to limit search
   * @returns {CustomCharacter[]} Matching characters
   */
  searchCharacters(query: string, databaseId?: string): CustomCharacter[] {
    const databases = databaseId 
      ? [this.getDatabaseById(databaseId)].filter(Boolean) as CharacterDatabase[]
      : this.databases();

    const lowerQuery = query.toLowerCase();
    const results: CustomCharacter[] = [];

    for (const db of databases) {
      for (const char of db.characters) {
        if (
          char.name.toLowerCase().includes(lowerQuery) ||
          char.description.toLowerCase().includes(lowerQuery) ||
          char.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
          char.affiliations.some(aff => aff.toLowerCase().includes(lowerQuery))
        ) {
          results.push(char);
        }
      }
    }

    return results;
  }

  /**
   * Gets characters by type.
   * 
   * @param {CustomCharacter['type']} type - Character type
   * @param {string} databaseId - Optional database ID to limit search
   * @returns {CustomCharacter[]} Matching characters
   */
  getCharactersByType(type: CustomCharacter['type'], databaseId?: string): CustomCharacter[] {
    const databases = databaseId 
      ? [this.getDatabaseById(databaseId)].filter(Boolean) as CharacterDatabase[]
      : this.databases();

    const results: CustomCharacter[] = [];

    for (const db of databases) {
      results.push(...db.characters.filter(c => c.type === type));
    }

    return results;
  }

  /**
   * Exports a character database to JSON.
   * 
   * @param {string} databaseId - Database ID
   * @returns {string | null} JSON string, or null if database not found
   */
  exportDatabase(databaseId: string): string | null {
    const database = this.getDatabaseById(databaseId);
    if (!database) return null;

    return JSON.stringify(database, null, 2);
  }

  /**
   * Imports a character database from JSON.
   * 
   * @param {string} jsonString - JSON string
   * @param {string} ownerId - Owner user ID for the imported database
   * @returns {CharacterDatabase | null} Imported database, or null if import failed
   */
  importDatabase(jsonString: string, ownerId: string): CharacterDatabase | null {
    try {
      const data = JSON.parse(jsonString);

      // Validate required fields
      if (!data.name || !data.characters) {
        throw new Error('Invalid database format');
      }

      // Create new database with imported data
      const database: CharacterDatabase = {
        id: this.generateId(), // New ID to avoid conflicts
        name: data.name,
        description: data.description || '',
        ownerId, // Override with current user
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: data.tags || [],
        isPublic: false, // Reset to private
        characters: data.characters.map((c: any) => ({
          ...c,
          id: this.generateId(), // New IDs for all characters
          createdAt: new Date(c.createdAt || Date.now()),
          updatedAt: new Date(c.updatedAt || Date.now()),
        })),
      };

      const databases = this.databases();
      this.databases.set([...databases, database]);
      this.saveDatabases();

      return database;
    } catch (error) {
      console.error('Failed to import database:', error);
      return null;
    }
  }

  /**
   * Deletes a character database.
   * 
   * @param {string} databaseId - Database ID
   * @returns {boolean} True if deletion was successful
   */
  deleteDatabase(databaseId: string): boolean {
    const databases = this.databases();
    const index = databases.findIndex(db => db.id === databaseId);

    if (index === -1) return false;

    databases.splice(index, 1);
    this.databases.set([...databases]);
    this.saveDatabases();

    // Clear current database if it was deleted
    if (this.currentDatabase()?.id === databaseId) {
      this.currentDatabase.set(null);
    }

    return true;
  }

  /**
   * Sets the current active database.
   * 
   * @param {string} databaseId - Database ID
   * @returns {boolean} True if database was found and set
   */
  setCurrentDatabase(databaseId: string): boolean {
    const database = this.getDatabaseById(databaseId);
    if (database) {
      this.currentDatabase.set(database);
      return true;
    }
    return false;
  }

  /**
   * Gets a database by ID.
   * 
   * @param {string} databaseId - Database ID
   * @returns {CharacterDatabase | null} The database, or null if not found
   */
  getDatabaseById(databaseId: string): CharacterDatabase | null {
    return this.databases().find(db => db.id === databaseId) || null;
  }

  /**
   * Gets all databases owned by a user.
   * 
   * @param {string} ownerId - Owner user ID
   * @returns {CharacterDatabase[]} User's databases
   */
  getDatabasesByOwner(ownerId: string): CharacterDatabase[] {
    return this.databases().filter(db => db.ownerId === ownerId);
  }

  /**
   * Gets all public databases.
   * 
   * @returns {CharacterDatabase[]} Public databases
   */
  getPublicDatabases(): CharacterDatabase[] {
    return this.databases().filter(db => db.isPublic);
  }

  /**
   * Loads databases from local storage.
   * @private
   */
  private loadDatabases(): void {
    const stored = localStorage.getItem(this.DATABASES_KEY);
    if (!stored) {
      this.databases.set([]);
      return;
    }

    try {
      const data = JSON.parse(stored);
      const databases: CharacterDatabase[] = data.map((db: any) => ({
        ...db,
        createdAt: new Date(db.createdAt),
        updatedAt: new Date(db.updatedAt),
        characters: db.characters?.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        })) || [],
      }));
      this.databases.set(databases);
    } catch (error) {
      console.error('Failed to load databases:', error);
      this.databases.set([]);
    }
  }

  /**
   * Saves databases to local storage.
   * @private
   */
  private saveDatabases(): void {
    localStorage.setItem(this.DATABASES_KEY, JSON.stringify(this.databases()));
  }

  /**
   * Updates a database in the list.
   * 
   * @param {CharacterDatabase} database - Database to update
   * @private
   */
  private updateDatabase(database: CharacterDatabase): void {
    const databases = this.databases();
    const index = databases.findIndex(db => db.id === database.id);
    if (index !== -1) {
      databases[index] = { ...database };
      this.databases.set([...databases]);
      this.saveDatabases();

      // Update current database if it's the one being updated
      if (this.currentDatabase()?.id === database.id) {
        this.currentDatabase.set({ ...database });
      }
    }
  }

  /**
   * Generates a unique identifier.
   * @returns {string} Unique identifier
   * @private
   */
  private generateId(): string {
    return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
