/**
 * Represents a complete character concept for a Marvel universe character.
 * This interface includes all necessary information for pre-production design.
 */
export interface CharacterConcept {
  /** The type discriminator for this concept */
  type: 'character';
  /** The character's unique name */
  name: string;
  /** The character's origin story and background (2-3 paragraphs) */
  backstory: string;
  /** List of unique powers and abilities the character possesses */
  powers: string[];
  /** List of meaningful weaknesses or vulnerabilities */
  weaknesses: string[];
  /** Detailed visual description for concept artists */
  visualDescription: string;
}

/**
 * Represents a single episode plot outline.
 */
export interface SinglePlotOutline {
  /** A catchy, descriptive title for the episode */
  title: string;
  /** Key plot points covering beginning, middle, and end */
  plotPoints: string[];
}

/**
 * Collection of plot outlines for an animated series.
 * Typically contains 3 distinct episode outlines.
 */
export interface PlotOutline {
  /** The type discriminator for this concept */
  type: 'plot';
  /** Array of individual episode plot outlines */
  outlines: SinglePlotOutline[];
}

/**
 * Comprehensive visual style guide for animated series pre-production.
 * Defines the artistic direction and aesthetic choices.
 */
export interface VisualStyle {
  /** The type discriminator for this concept */
  type: 'style';
  /** A catchy name for this visual style */
  styleName: string;
  /** Overall aesthetic and mood of the visual style */
  aesthetic: string;
  /** Approach to character design and visual representation */
  characterDesign: string;
  /** Primary color scheme and its narrative purpose */
  colorPalette: string;
  /** Style guidelines for backgrounds and environments */
  backgroundStyle: string;
}

/**
 * Intelligence briefing on a Marvel character in SHIELD database format.
 * Contains tactical and psychological analysis.
 */
export interface CharacterIntel {
  /** The type discriminator for this concept */
  type: 'intel';
  /** The character's full legal name */
  characterName: string;
  /** Known aliases, codenames, and alter egos */
  aliases: string[];
  /** Primary base of operations or headquarters */
  baseOfOperations: string;
  /** Key powers, abilities, and skill assessments */
  abilities: string[];
  /** Psychological analysis including motivations and personality traits */
  psychologicalProfile: string;
  /** Exploitable weaknesses (physical and psychological) */
  weaknesses: string[];
}

/**
 * Represents a generated cinematic video shot.
 * Used as a marker for video content generation.
 */
export interface VideoShot {
  /** The type discriminator for this concept */
  type: 'video';
}

/**
 * Union type representing all possible generated concepts.
 * Used for type-safe handling of different generation results.
 */
export type GeneratedConcept = CharacterConcept | PlotOutline | VisualStyle | CharacterIntel | VideoShot;

/**
 * Raw character concept data returned by the Gemini API.
 * This interface represents the API response before being hydrated with a 'type' discriminator.
 */
export interface RawCharacterConcept {
  /** The character's unique name */
  name: string;
  /** The character's origin story */
  backstory: string;
  /** List of powers and abilities */
  powers: string[];
  /** List of weaknesses */
  weaknesses: string[];
  /** Visual description for artists */
  visualDescription: string;
}

/**
 * Raw plot outline data returned by the Gemini API.
 * This interface represents the API response before being hydrated with a 'type' discriminator.
 */
export interface RawPlotOutline {
  /** Array of episode outlines */
  outlines: SinglePlotOutline[];
}

/**
 * Raw visual style data returned by the Gemini API.
 * This interface represents the API response before being hydrated with a 'type' discriminator.
 */
export interface RawVisualStyle {
  /** Name of the visual style */
  styleName: string;
  /** Overall aesthetic description */
  aesthetic: string;
  /** Character design approach */
  characterDesign: string;
  /** Color scheme description */
  colorPalette: string;
  /** Background style guidelines */
  backgroundStyle: string;
}

/**
 * Raw character intelligence data returned by the Gemini API.
 * This interface represents the API response before being hydrated with a 'type' discriminator.
 */
export interface RawCharacterIntel {
  /** Character's full name */
  characterName: string;
  /** Known aliases */
  aliases: string[];
  /** Base of operations */
  baseOfOperations: string;
  /** Assessed abilities */
  abilities: string[];
  /** Psychological analysis */
  psychologicalProfile: string;
  /** Known weaknesses */
  weaknesses: string[];
}

// ─── Team & Collaboration Models ─────────────────────────────────────────────

/**
 * Roles available within a team. Determines what actions a member can perform.
 */
export type TeamRole = 'owner' | 'editor' | 'viewer';

/**
 * Represents a single member of a team.
 */
export interface TeamMember {
  /** User ID of the member */
  userId: string;
  /** Display name of the member */
  name: string;
  /** Email address of the member */
  email: string;
  /** Role assigned to this member within the team */
  role: TeamRole;
  /** ISO timestamp when the member joined */
  joinedAt: string;
}

/**
 * Represents a team that can own and collaborate on projects.
 */
export interface Team {
  /** Unique identifier for the team */
  id: string;
  /** Display name for the team */
  name: string;
  /** Optional description of the team's purpose */
  description: string;
  /** User ID of the team owner */
  ownerId: string;
  /** List of all team members (including owner) */
  members: TeamMember[];
  /** IDs of projects owned by this team */
  projectIds: string[];
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
}

/**
 * Represents a user's live presence in a collaborative session.
 */
export interface PresenceInfo {
  /** User ID */
  userId: string;
  /** Display name */
  name: string;
  /** The tab/generation mode the user is currently working in */
  activeTab: string;
  /** ISO timestamp of the last heartbeat */
  lastSeen: string;
  /** Optional colour used for cursor/avatar highlighting */
  color: string;
}

/**
 * Message types used by the real-time collaboration channel.
 */
export type CollaborationMessageType =
  | 'presence_join'
  | 'presence_leave'
  | 'presence_heartbeat'
  | 'content_update'
  | 'tab_change';

/**
 * A message broadcast over the collaboration channel.
 */
export interface CollaborationMessage {
  /** Type of the message */
  type: CollaborationMessageType;
  /** Sender's user ID */
  senderId: string;
  /** Sender's display name */
  senderName: string;
  /** ISO timestamp */
  timestamp: string;
  /** Optional payload specific to the message type */
  payload?: Record<string, unknown>;
}

/**
 * Represents a cloud storage sync record for a piece of content.
 */
export interface CloudSyncRecord {
  /** Local item ID */
  localId: string;
  /** Remote/cloud ID (null if not yet synced) */
  remoteId: string | null;
  /** ISO timestamp of the last successful cloud sync */
  lastSynced: string | null;
  /** Current sync status */
  status: 'synced' | 'pending' | 'error' | 'local_only';
  /** Optional error message */
  errorMessage?: string;
}

/**
 * Represents a chunk of a longer video sequence.
 */
export interface VideoChunk {
  /** Zero-based chunk index */
  index: number;
  /** Total number of chunks in the sequence */
  total: number;
  /** Prompt used for this specific chunk */
  prompt: string;
  /** Generated video Blob for this chunk (null until generated) */
  blob: Blob | null;
  /** Object URL for playback (null until blob is available) */
  url: string | null;
  /** Status of this chunk */
  status: 'pending' | 'generating' | 'done' | 'error';
  /** Error message if status is 'error' */
  error?: string;
}
