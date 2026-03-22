# M.A.V.E.R.I.C.K. Services Implementation Guide

This document provides an overview of the newly implemented services and how to integrate them into the UI.

## Overview

The M.A.V.E.R.I.C.K. roadmap implementation adds 12 services that provide comprehensive backend functionality for user authentication, project management, batch processing, sharing, data integration, export capabilities, real-time collaboration, team management, and cloud storage.

## Services Summary

### 1. AuthService (`src/services/auth.service.ts`)

**Purpose:** User authentication and session management

**Key Features:**
- User registration and login
- JWT token management
- Session persistence via localStorage
- User state tracking with Angular signals

**Usage Example:**
```typescript
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

const authService = inject(AuthService);

// Sign up
await authService.signup('user@example.com', 'password123', 'John Doe');

// Login
await authService.login('user@example.com', 'password123');

// Check authentication
const isLoggedIn = authService.isAuthenticated();
const currentUser = authService.user();

// Logout
authService.logout();
```

**UI Integration Points:**
- Login/Signup modal or page
- User profile dropdown in header
- Protected route guards
- Session status indicator

---

### 2. ProjectService (`src/services/project.service.ts`)

**Purpose:** Project and content organization management

**Key Features:**
- Create and manage projects
- Add content items to projects
- Export/import projects as JSON
- Track creation and update timestamps

**Usage Example:**
```typescript
import { inject } from '@angular/core';
import { ProjectService } from './services/project.service';

const projectService = inject(ProjectService);

// Create project
const project = projectService.createProject(
  'My Marvel Series',
  'A new series concept',
  userId,
  ['action', 'sci-fi']
);

// Set current project
projectService.setCurrentProject(project.id);

// Add content
const content = projectService.createContent(
  'A tech hero concept',
  'character',
  generatedConcept
);
projectService.addContentToCurrentProject(content);

// Export project
const json = projectService.exportProject(project.id);
```

**UI Integration Points:**
- Project dashboard/gallery
- Project creation modal
- Content organization view
- Project import/export buttons
- Project switcher dropdown

---

### 3. BatchGenerationService (`src/services/batch-generation.service.ts`)

**Purpose:** Batch processing of multiple generation requests

**Key Features:**
- Generate multiple items simultaneously
- Progress tracking with signals
- Error handling for individual failures
- Queue management

**Usage Example:**
```typescript
import { inject } from '@angular/core';
import { BatchGenerationService } from './services/batch-generation.service';

const batchService = inject(BatchGenerationService);

// Batch generate characters
const job = await batchService.batchGenerateCharacters([
  'A time-traveling hero',
  'A psychic villain',
  'A tech genius sidekick'
]);

// Track progress
const currentJob = batchService.currentJob();
console.log(`Progress: ${currentJob?.progress}%`);

// Get results
job.results.forEach((result, index) => {
  if (result) {
    console.log(`Generated: ${result.name}`);
  } else {
    console.log(`Failed: ${job.errors[index]}`);
  }
});
```

**UI Integration Points:**
- Batch generation modal/wizard
- Progress bars and status indicators
- Results preview grid
- Error handling notifications
- Job history view

---

### 4. ShareService (`src/services/share.service.ts`)

**Purpose:** Create and manage shareable links for content

**Key Features:**
- Generate shareable links (local storage or embedded)
- Content encoding/decoding for URL sharing
- Clipboard copy functionality
- View count tracking

**Usage Example:**
```typescript
import { inject } from '@angular/core';
import { ShareService } from './services/share.service';

const shareService = inject(ShareService);

// Create share link
const shareLink = shareService.createShareLink(
  'character',
  'Original prompt',
  characterConcept,
  undefined,
  userId,
  'John Doe'
);

// Copy to clipboard
await shareService.copyToClipboard(shareLink);

// Create embedded link (no backend storage)
const embeddedLink = shareService.createEmbeddedShareLink(
  'character',
  'Original prompt',
  characterConcept,
  'John Doe'
);

// Retrieve shared content
const sharedContent = shareService.getSharedContent(shareId);
```

**UI Integration Points:**
- Share button on generated content
- Share modal with link preview
- Shared content view page
- Social sharing integrations
- Copy link notification

---

### 5. MarvelApiService (`src/services/marvel-api.service.ts`)

**Purpose:** Integration with official Marvel API for character data

**Key Features:**
- Search Marvel characters by name
- Retrieve character details
- Popular characters discovery
- Response caching for performance

**Note:** Currently uses demo keys. In production, implement a backend proxy to protect API keys.

**Usage Example:**
```typescript
import { inject } from '@angular/core';
import { MarvelApiService } from './services/marvel-api.service';

const marvelApi = inject(MarvelApiService);

// Search characters
const characters = await marvelApi.searchCharacters('Spider-Man');

// Get specific character
const character = await marvelApi.getCharacter(1009610);

// Get popular characters
const popular = await marvelApi.getPopularCharacters(10);

// Get character image
const imageUrl = marvelApi.getCharacterImageUrl(character);
```

**UI Integration Points:**
- Character search autocomplete
- Character selector with thumbnails
- Character detail cards
- Integration with plot generation
- Character inspiration browser

---

### 6. CustomCharacterService (`src/services/custom-character.service.ts`)

**Purpose:** Manage custom character databases

**Key Features:**
- Create multiple character databases
- Add, edit, remove characters
- Search and filter capabilities
- Import/export databases as JSON
- Tag-based organization

**Usage Example:**
```typescript
import { inject } from '@angular/core';
import { CustomCharacterService } from './services/custom-character.service';

const charDbService = inject(CustomCharacterService);

// Create database
const db = charDbService.createDatabase(
  'My Custom Characters',
  userId,
  'Original characters for my series',
  ['original', 'heroes']
);

// Add character
const character = charDbService.addCharacter(db.id, {
  name: 'Quantum Knight',
  type: 'hero',
  description: 'A hero who can manipulate quantum states',
  powers: ['Quantum manipulation', 'Teleportation'],
  weaknesses: ['Energy overload'],
  affiliations: ['The Quantum League'],
  tags: ['quantum', 'tech'],
  metadata: {},
});

// Search characters
const results = charDbService.searchCharacters('quantum');

// Export database
const json = charDbService.exportDatabase(db.id);
```

**UI Integration Points:**
- Character database manager
- Character creation form
- Character gallery/list view
- Database import/export UI
- Character search interface

---

### 7. ExportService (`src/services/export.service.ts`)

**Purpose:** Export content to various industry-standard formats

**Key Features:**
- PDF export (browser print)
- JSON/XML export
- FBX metadata export for 3D pipelines
- CSV export for tabular data
- Markdown export

**Usage Example:**
```typescript
import { inject } from '@angular/core';
import { ExportService } from './services/export.service';

const exportService = inject(ExportService);

// Export to PDF
await exportService.exportToPDF(characterConcept, 'character.pdf');

// Export to JSON
exportService.exportToJSON(characterConcept, 'character.json');

// Export to FBX metadata
exportService.exportToFBXMetadata(characterConcept, 'character-metadata.xml');

// Export to Markdown
exportService.exportToMarkdown(characterConcept, 'character.md');

// Export multiple items to CSV
exportService.exportToCSV(
  items,
  ['name', 'type', 'description'],
  'characters.csv'
);
```

**UI Integration Points:**
- Export menu/dropdown
- Format selector modal
- Batch export for projects
- Export confirmation notifications
- Download progress indicators

---

### 8. ConfigService (`src/services/config.service.ts`)

**Purpose:** Centralized application configuration management

**Key Features:**
- Video generation settings (timeout, polling)
- Batch processing configuration
- Debug mode toggle
- Configuration import/export
- Persistent storage

**Usage Example:**
```typescript
import { inject } from '@angular/core';
import { ConfigService } from './services/config.service';

const configService = inject(ConfigService);

// Get video config
const videoConfig = configService.getVideoConfig();

// Update video timeout
configService.updateVideoConfig({
  maxDuration: 120,
  timeout: 900000, // 15 minutes
});

// Get batch config
const batchConfig = configService.getBatchConfig();

// Enable debug mode
configService.enableDebugMode();

// Reset to defaults
configService.resetToDefaults();
```

**UI Integration Points:**
- Settings page/modal
- Advanced options panel
- Configuration wizard
- Export/import config buttons
- Debug console toggle

---

### 9. CollaborationService (`src/services/collaboration.service.ts`)

**Purpose:** Real-time collaboration using the BroadcastChannel API

**Key Features:**
- User presence indicators (who is online and on which tab)
- Cross-tab content synchronization within the same browser origin
- Periodic heartbeats to detect offline collaborators
- Color-coded collaborator identities (deterministic palette based on user ID)
- Clean session teardown on component/service destroy
- Designed for extension to multi-device collaboration (WebSocket / Firebase)

**Usage Example:**
```typescript
import { inject } from '@angular/core';
import { CollaborationService } from './services/collaboration.service';

const collab = inject(CollaborationService);

// Start a session on the 'character' tab
collab.startSession('character');

// Notify peers when the user switches tabs
collab.broadcastTabChange('video-shot');

// Notify peers of a content update
collab.broadcastContentUpdate('character', 'Generated Sonic Sage');

// Read reactive state
const isActive = collab.sessionActive();   // boolean
const peers = collab.peers();              // PresenceInfo[]
const count = collab.peerCount();          // number

// End the session
collab.endSession();
```

**UI Integration Points:**
- Collaborator avatar row in the header
- Active tab indicators per collaborator
- "Content updated by …" toast notifications
- Online/offline status badges
- Session start/stop toggle button

---

### 10. TeamService (`src/services/team.service.ts`)

**Purpose:** Team creation, membership management, and role-based permission checks

**Key Features:**
- Create and delete teams
- Invite and remove members
- Update member roles (`owner`, `editor`, `viewer`)
- Permission helpers (`canEdit`, `canManage`)
- Associate projects with teams
- Persistent storage via localStorage

**Usage Example:**
```typescript
import { inject } from '@angular/core';
import { TeamService } from './services/team.service';

const teamService = inject(TeamService);

// Create a team (current user becomes owner)
const team = teamService.createTeam('Avengers Initiative', 'Core MCU team');

// Add a member
teamService.addMember(team.id, {
  userId: 'user_2',
  name: 'Natasha Romanoff',
  email: 'nat@shield.gov',
  role: 'editor',
});

// Update a member's role
teamService.updateMemberRole(team.id, 'user_2', 'viewer');

// Check permissions
const canEdit = teamService.canEdit(team.id);    // true for owner/editor
const canManage = teamService.canManage(team.id); // true for owner only

// Associate a project
teamService.addProject(team.id, 'project_abc');

// Select the active team
teamService.selectTeam(team.id);
const current = teamService.currentTeam(); // Team | null

// Remove a member
teamService.removeMember(team.id, 'user_2');

// Delete the team (owner only)
teamService.deleteTeam(team.id);
```

**UI Integration Points:**
- Team creation modal
- Team member list with role badges
- Role selector dropdown per member
- "Invite member" form
- Team switcher in the header/sidebar
- Project sharing within a team

---

### 11. CloudStorageService (`src/services/cloud-storage.service.ts`)

**Purpose:** Abstract cloud storage layer for saving and loading application data

**Key Features:**
- Save/load arbitrary JSON documents with a stable local ID
- Sync status tracking per item (`synced`, `pending`, `error`, `local_only`)
- List all tracked sync records
- Delete remote records
- Global sync-in-progress indicator
- Currently backed by localStorage; replace `remoteWrite`/`remoteRead`/`remoteDelete` with real HTTP/SDK calls to switch backends

**Usage Example:**
```typescript
import { inject } from '@angular/core';
import { CloudStorageService } from './services/cloud-storage.service';

const cloud = inject(CloudStorageService);

// Save a document
const remoteId = await cloud.save('project_abc', myProjectData);

// Load a document
const data = await cloud.load<MyProjectType>('project_abc');

// Delete a document
await cloud.delete('project_abc');

// Check sync record
const record = cloud.getRecord('project_abc');
console.log(record?.status); // 'synced' | 'pending' | 'error' | 'local_only'

// Mark as local-only (offline creation)
cloud.markLocalOnly('project_xyz');

// Reactive state
const syncing = cloud.isSyncing();          // boolean
const records = cloud.allRecords();         // CloudSyncRecord[]
const pending = cloud.pendingCount();       // number
```

**UI Integration Points:**
- Sync status indicator in the header (spinning icon while syncing)
- Per-item sync badges (cloud icon / error icon)
- "Sync now" / "Upload pending" button
- Offline mode banner when items are `local_only`
- Settings page: switch storage backend

---

### Art Styles (30 total)

The `artStyles` array in `src/data/marvel-data.ts` now includes:
- Classic Comic, Manga, Noir, Gritty 90s
- Cyberpunk, Steampunk, Watercolor, Sketch/Line Art
- Retro 1960s, Modern Minimalist, Anime
- Pop Art, Cel-Shaded, Graffiti Style
- And 16 more...

### Narrative Themes (20 total)

The `marvelThemes` array now includes:
- Family legacy and betrayal
- Time travel and alternate realities
- Artificial intelligence and humanity
- Cosmic threats to Earth
- And 16 more...

### Visual Style Presets (8 total)

The `visualStylePresets` array includes:
- Cosmic Marvel
- Street Level Grit
- Modern MCU
- Animated Series
- Manga Fusion
- Retro Silver Age
- Cosmic Horror
- Futuristic Tech

---

## Integration Checklist

### Authentication Flow
- [ ] Add login/signup form components
- [ ] Add route guards for protected pages
- [ ] Add user menu in header
- [ ] Add logout functionality
- [ ] Add "Remember me" option

### Project Management
- [ ] Add project creation modal
- [ ] Add project dashboard/gallery
- [ ] Add project details page
- [ ] Add content organization view
- [ ] Add import/export buttons

### Batch Generation
- [ ] Add batch generation wizard
- [ ] Add progress tracking UI
- [ ] Add results preview grid
- [ ] Add job history panel
- [ ] Add cancel/retry functionality

### Sharing
- [ ] Add share button on content cards
- [ ] Add share modal with link preview
- [ ] Add social media integrations
- [ ] Add view-only content page
- [ ] Add shared content analytics

### Marvel API
- [ ] Add character search autocomplete
- [ ] Add character browser/gallery
- [ ] Add character detail modal
- [ ] Add "Use for generation" button
- [ ] Set up backend proxy (production)

### Custom Characters
- [ ] Add character database manager
- [ ] Add character creation form
- [ ] Add character edit modal
- [ ] Add database import/export UI
- [ ] Add character selector integration

### Export
- [ ] Add export menu dropdown
- [ ] Add format selector
- [ ] Add batch export for projects
- [ ] Add download notifications
- [ ] Add export history

### Configuration
- [ ] Add settings page
- [ ] Add video config panel
- [ ] Add batch config panel
- [ ] Add debug mode toggle
- [ ] Add config import/export

### Collaboration
- [ ] Add collaborator avatar row in the header
- [ ] Add per-tab presence indicators
- [ ] Add "Content updated by …" toast notifications
- [ ] Add session start/stop toggle button
- [ ] Extend to multi-device via WebSocket or Firebase

### Teams
- [ ] Add team creation modal
- [ ] Add team member list with role badges
- [ ] Add role selector dropdown per member
- [ ] Add "Invite member" form
- [ ] Add team switcher in header/sidebar

### Cloud Storage
- [ ] Add sync status indicator in the header
- [ ] Add per-item sync badges (synced / pending / error)
- [ ] Add "Upload pending" button for local-only items
- [ ] Add offline mode banner
- [ ] Replace localStorage backend with real cloud API

---

## Best Practices

1. **Use Angular Signals:** All services use signals for reactive state management
2. **Error Handling:** Wrap service calls in try-catch blocks and show user-friendly errors
3. **Loading States:** Use service loading signals to show spinners/progress indicators
4. **Local Storage:** Services persist data locally; consider adding backend sync in future
5. **Type Safety:** All services are fully typed with TypeScript interfaces
6. **Dependency Injection:** Use Angular's `inject()` function for service injection

---

## Future Enhancements

1. **Backend Integration:** Replace localStorage with a real backend API (REST, Firebase, etc.)
2. **Multi-Device Collaboration:** Extend CollaborationService with WebSocket or Firebase Realtime Database
3. **Advanced Analytics:** Track usage patterns and optimize workflows
4. **Version Control:** Add versioning for projects and content
5. **Notifications:** Push notifications for collaboration and team events

---

For questions or issues, please refer to the individual service files or contact the development team.
