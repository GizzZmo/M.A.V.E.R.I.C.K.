<div align="center">

<img width="1200" height="475" alt="M.A.V.E.R.I.C.K. - Marvel AI-Vision Engine for Rapid Interactive Content Kreation" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# M.A.V.E.R.I.C.K.

### Marvel AI-Vision Engine for Rapid Interactive Content Kreation

[![Build Status](https://img.shields.io/github/actions/workflow/status/GizzZmo/M.A.V.E.R.I.C.K./ci.yml?branch=main&style=for-the-badge&logo=github)](https://github.com/GizzZmo/M.A.V.E.R.I.C.K./actions)
[![Version](https://img.shields.io/github/v/tag/GizzZmo/M.A.V.E.R.I.C.K.?style=for-the-badge&logo=semver&label=Version)](https://github.com/GizzZmo/M.A.V.E.R.I.C.K./tags)
[![License](https://img.shields.io/github/license/GizzZmo/M.A.V.E.R.I.C.K.?style=for-the-badge)](LICENSE)
[![Angular](https://img.shields.io/badge/Angular-20.1.0-DD0031?style=for-the-badge&logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)

**An advanced, AI-powered pre-production blueprint generator for the Marvel Universe.**  
Create character concepts, episode plots, visual styles, intelligence briefings, concept art, comic strips, and cinematic video shots with cutting-edge AI technology.

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 🦸 Overview

**M.A.V.E.R.I.C.K.** is a comprehensive pre-production tool designed for Marvel Universe content creators. Powered by Google's state-of-the-art **Gemini 2.5 Flash** AI model, **Imagen 3.0** for image generation, and **Veo 2.0** for video creation, this application streamlines the creative process by generating high-quality content across multiple mediums.

### What Makes M.A.V.E.R.I.C.K. Special?

- 🎨 **Multi-Modal Generation**: Text, images, and videos - all in one platform
- 🧠 **AI-Powered Creativity**: Leverages cutting-edge Gemini AI technology
- 🎬 **Production-Ready**: Generates content suitable for professional pre-production workflows
- 💾 **Export Capabilities**: PDF, JSON, XML, FBX metadata, CSV, and Markdown formats
- 🎯 **Marvel-Focused**: Specialized prompts and data for authentic Marvel content
- ⚡ **Real-Time Generation**: Fast, responsive AI generation with progress tracking
- 🔐 **User Authentication**: Secure user accounts with session management
- 📁 **Project Management**: Organize and manage multiple projects
- 🚀 **Batch Processing**: Generate multiple items simultaneously
- 🔗 **Content Sharing**: Create shareable links for generated content
- 🦸 **Marvel API Integration**: Access official Marvel character data
- 🎭 **Custom Characters**: Build and manage your own character databases

---

## ✨ Features

### Core Generation Features

#### 🦸‍♂️ Character Concept Generator
Create detailed character blueprints including:
- Creative character names
- Compelling 2-3 paragraph backstories
- Unique powers and abilities
- Meaningful weaknesses that create conflict
- Detailed visual descriptions for concept artists

#### 📖 Plot Outline Generator
Generate three distinct episode plot outlines featuring:
- Customizable hero and villain pairings
- 20 rich narrative themes to choose from
- Three-act story structures
- Catchy episode titles

#### 🎨 Visual Style Guide Generator
Develop comprehensive style guides with:
- Overall aesthetic and mood descriptions
- Character design approaches
- Color palette guidelines
- Background and environment styling notes
- 8 preset visual styles for quick selection

#### 🕵️ Intelligence Briefing Generator
Create SHIELD-style tactical dossiers including:
- Character aliases and identities
- Base of operations
- Abilities assessment
- Psychological profiles
- Exploitable weaknesses

#### 🖼️ Concept Art Generator
Generate high-quality cinematic concept art:
- Dynamic action shots
- Character portraits
- Environment designs
- 1:1 aspect ratio JPEG output
- 30+ art styles to choose from

#### 📚 Comic Strip Generator
Create multi-panel comic strips with:
- 2-4 panel sequences
- 30 art styles (Classic, Manga, Noir, Cyberpunk, and more)
- Coherent visual storytelling
- Individual panel downloads

#### 🎬 Cinematic Video Generator
Produce short video shots featuring:
- High-definition quality
- Marvel movie-style cinematography
- Configurable generation timeout (up to 10 minutes)
- Progress tracking with themed messages
- MP4 format output

### Advanced Features

#### 🔐 User Authentication
- Secure signup and login
- JWT-based session management
- Local storage persistence
- User profile management

#### 📁 Project & Session Management
- Create and organize projects
- Save multiple content items per project
- Export/import projects as JSON
- Track creation and update timestamps
- Tag-based organization

#### 🚀 Batch Generation
- Generate multiple characters, plots, styles, or intel simultaneously
- Real-time progress tracking
- Error handling for individual failures
- Queue management
- Configurable batch size and concurrency

#### 🔗 Content Sharing
- Create shareable links for any generated content
- Embedded content in URLs (no backend required)
- Copy to clipboard functionality
- View count tracking
- Shareable link management

#### 🦸 Marvel API Integration
- Search official Marvel characters
- Retrieve detailed character information
- Popular characters discovery
- Response caching for performance
- Seamless integration with generation workflows

#### 🎭 Custom Character Databases
- Create unlimited character databases
- Add heroes, villains, anti-heroes, and more
- Import/export databases as JSON
- Search and filter capabilities
- Tag-based organization
- Public/private database options

#### 📤 Industry-Standard Export
- **PDF**: Print-ready documents with formatted content
- **JSON**: Structured data for integration
- **XML**: Standardized data format
- **FBX Metadata**: 3D pipeline compatibility
- **CSV**: Tabular data for spreadsheets
- **Markdown**: Documentation-ready format

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Google Gemini API Key** - [Get one here](https://aistudio.google.com/app/apikey)
- **Marvel API Keys** (Optional) - [Get them here](https://developer.marvel.com/) for Marvel character integration

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/GizzZmo/M.A.V.E.R.I.C.K.git
   cd M.A.V.E.R.I.C.K.
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Keys**
   
   Create a `.env.local` file in the project root:
   ```bash
   # Required: Google Gemini API Key
   API_KEY=your_gemini_api_key_here
   
   # Optional: Marvel API Keys (for character data integration)
   MARVEL_API_PUBLIC_KEY=your_marvel_public_key
   MARVEL_API_PRIVATE_KEY=your_marvel_private_key
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage

### Character Concept Generation

1. Navigate to the **Character** tab
2. Enter a core concept description in the text area
3. Click **Generate**
4. Review the generated character blueprint
5. Click **Save Output** to download as a text file

**Example Input:**
```
A tech-based hero from a futuristic Wakandan outpost who can manipulate sound waves
```

**Example Output:**
```
Name: Sonic Sage
Backstory: Born in the advanced technological hub of Wakanda's satellite city...
Powers: 
  - Sound wave manipulation for offense and defense
  - Sonic flight capabilities
  - Enhanced hearing and echolocation
Weaknesses:
  - Vulnerable in soundproof environments
  - Sensory overload from loud, chaotic noise
```

### Plot Outline Generation

1. Navigate to the **Plot** tab
2. Select a **Hero** from the dropdown
3. Select a **Villain** from the dropdown
4. Choose a **Theme**
5. Click **Generate** to create three unique plot outlines

### Visual Style Guide

1. Navigate to the **Style** tab
2. Describe the desired visual style using keywords
3. Click **Generate**
4. Save the comprehensive style guide

### Intelligence Briefing

1. Navigate to the **Intel** tab
2. Enter a character name
3. Click **Generate** to create a SHIELD-style dossier

### Concept Art Generation

1. Navigate to the **Concept Art** tab
2. Describe the scene or character you want to visualize
3. Click **Generate** (this may take 10-30 seconds)
4. Download the generated image

### Comic Strip Creation

1. Navigate to the **Comic Strip** tab
2. Enter your story description
3. Select the number of panels (2-4)
4. Choose an art style
5. Click **Generate** to create all panels
6. Download individual panels as needed

### Video Shot Generation

1. Navigate to the **Video Shot** tab
2. Describe the cinematic shot you want
3. Click **Generate**
4. Wait for generation (typically 2-5 minutes)
5. Watch progress updates with Marvel-themed messages
6. Preview and download the video when complete

---

## 🏗️ Architecture

### Technology Stack

```
┌─────────────────────────────────────┐
│         Frontend Layer              │
│  Angular 20.1 + TypeScript 5.8      │
│  Signals for State Management       │
│  TailwindCSS for Styling            │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│        Service Layer                │
│  GeminiService (AI Integration)     │
│  Dependency Injection (Angular)     │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         AI Layer                    │
│  Google Gemini 2.5 Flash (Text)     │
│  Imagen 3.0 (Images)                │
│  Veo 2.0 (Videos)                   │
└─────────────────────────────────────┘
```

### Project Structure

```
M.A.V.E.R.I.C.K./
├── src/
│   ├── app.component.ts          # Main component with UI logic
│   ├── app.component.html        # Application template
│   ├── services/
│   │   └── gemini.service.ts     # AI integration service
│   ├── models/
│   │   └── marvel-concept.model.ts  # TypeScript interfaces
│   └── data/
│       └── marvel-data.ts        # Marvel heroes, villains, themes
├── index.tsx                     # Application entry point
├── angular.json                  # Angular configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

### Key Components

#### AppComponent
The main application component that:
- Manages UI state with Angular Signals
- Handles user interactions
- Orchestrates AI generation workflows
- Provides download functionality

#### GeminiService
Core service for AI integration:
- Manages Google Gemini API client
- Provides type-safe generation methods
- Handles structured JSON responses
- Manages image and video generation
- Implements polling for async video operations

#### Data Models
Type-safe interfaces for:
- Character concepts
- Plot outlines
- Visual style guides
- Intelligence briefings
- Video metadata

---

## 📚 API Reference

### GeminiService Methods

#### `generateCharacterConcept(coreConcept: string): Promise<RawCharacterConcept>`

Generates a complete character blueprint.

**Parameters:**
- `coreConcept` (string): Core description of the character

**Returns:** Promise resolving to a `RawCharacterConcept` object

**Example:**
```typescript
const character = await geminiService.generateCharacterConcept(
  "A hero who can control time"
);
console.log(character.name); // "Chronos Knight"
```

#### `generatePlotOutline(hero: string, villain: string, theme: string): Promise<RawPlotOutline>`

Creates three episode plot outlines.

**Parameters:**
- `hero` (string): Hero character name
- `villain` (string): Villain character name
- `theme` (string): Central narrative theme

**Returns:** Promise resolving to a `RawPlotOutline` object

#### `generateVisualStyle(keywords: string): Promise<RawVisualStyle>`

Develops a visual style guide.

**Parameters:**
- `keywords` (string): Style description and keywords

**Returns:** Promise resolving to a `RawVisualStyle` object

#### `generateCharacterIntel(characterName: string): Promise<RawCharacterIntel>`

Creates an intelligence briefing.

**Parameters:**
- `characterName` (string): Name of the character

**Returns:** Promise resolving to a `RawCharacterIntel` object

#### `generateConceptArt(prompt: string): Promise<string[]>`

Generates concept art images.

**Parameters:**
- `prompt` (string): Image description

**Returns:** Promise resolving to an array of base64-encoded image URLs

#### `generateComicStrip(story: string, panels: number, style: string): Promise<string[]>`

Creates a multi-panel comic strip.

**Parameters:**
- `story` (string): Comic story description
- `panels` (number): Number of panels (2-4)
- `style` (string): Art style name

**Returns:** Promise resolving to an array of base64-encoded image URLs

#### `generateVideoShot(prompt: string, onProgress: (message: string) => void): Promise<Blob>`

Generates a cinematic video shot.

**Parameters:**
- `prompt` (string): Video description
- `onProgress` (function): Progress callback

**Returns:** Promise resolving to a video Blob

### New Services

The following new services have been added to support the roadmap features:

#### AuthService

Handles user authentication and session management.

**Key Methods:**
- `signup(email, password, name)` - Register new user
- `login(email, password)` - Authenticate user
- `logout()` - End session
- `isAuthenticated()` - Check authentication status

#### ProjectService

Manages projects and content organization.

**Key Methods:**
- `createProject(name, description, ownerId)` - Create new project
- `addContentToCurrentProject(content)` - Add content to active project
- `exportProject(projectId)` - Export project as JSON
- `importProject(jsonString)` - Import project from JSON

#### BatchGenerationService

Enables batch processing of multiple generation requests.

**Key Methods:**
- `batchGenerateCharacters(coreConcepts)` - Generate multiple characters
- `batchGeneratePlots(inputs)` - Generate multiple plots
- `batchGenerateConceptArt(prompts)` - Generate multiple images
- `cancelJob(jobId)` - Cancel running batch job

#### ShareService

Creates and manages shareable links for content.

**Key Methods:**
- `createShareLink(type, prompt, concept)` - Generate shareable link
- `getSharedContent(shareId)` - Retrieve shared content
- `encodeContentForUrl(content)` - Encode content for URL sharing
- `copyToClipboard(shareLink)` - Copy link to clipboard

#### MarvelApiService

Integrates with the official Marvel API.

**Key Methods:**
- `searchCharacters(query)` - Search Marvel characters
- `getCharacter(characterId)` - Get character by ID
- `getPopularCharacters(count)` - Get popular characters
- `isConfigured()` - Check API configuration

#### CustomCharacterService

Manages custom character databases.

**Key Methods:**
- `createDatabase(name, ownerId)` - Create character database
- `addCharacter(databaseId, characterData)` - Add custom character
- `searchCharacters(query)` - Search custom characters
- `exportDatabase(databaseId)` - Export database as JSON

#### ExportService

Exports content to various formats.

**Key Methods:**
- `exportToPDF(content, filename)` - Export to PDF
- `exportToJSON(content, filename)` - Export to JSON
- `exportToXML(content, filename)` - Export to XML
- `exportToFBXMetadata(character, filename)` - Export FBX metadata
- `exportToMarkdown(content, filename)` - Export to Markdown

#### ConfigService

Manages application configuration.

**Key Methods:**
- `getVideoConfig()` - Get video generation settings
- `updateVideoConfig(updates)` - Update video settings
- `getBatchConfig()` - Get batch processing settings
- `resetToDefaults()` - Reset all settings

---

## 🎯 Development

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Run Development Server

```bash
npm run dev
```

Runs on [http://localhost:3000](http://localhost:3000) with hot reload.

### Preview Production Build

```bash
npm run preview
```

---

## 🧪 Testing

Currently, this project focuses on manual testing through the UI. Future versions will include:
- Unit tests for service methods
- Integration tests for AI workflows
- E2E tests for user flows

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add JSDoc comments for new functions
- Test your changes thoroughly
- Update documentation as needed

---

## 📋 Roadmap

### ✅ Completed Features

- [x] **Add user authentication** - Full authentication system with JWT support, session management, and local storage persistence
- [x] **Implement project/session management** - Create, save, load, and organize projects with multiple content items
- [x] **Add batch generation capabilities** - Generate multiple items simultaneously with progress tracking
- [x] **Create shareable links for generated content** - Share content via links with embedded data or local storage
- [x] **Integrate with Marvel API for character data** - Search and retrieve official Marvel character data
- [x] **Add support for custom character databases** - Create and manage custom character collections
- [x] **Add more art styles and themes** - Expanded to 30 art styles and 20 narrative themes with visual style presets
- [x] **Support for longer video generation** - Configurable timeouts up to 10 minutes (600 seconds)
- [x] **Export to industry-standard formats** - Export to PDF, JSON, XML, FBX metadata, CSV, and Markdown

### 🚧 In Progress

- [ ] **Implement collaborative features** - Real-time collaboration with user presence indicators

### 🔮 Future Enhancements

- [ ] Add UI components for all new features (authentication, project management, batch generation)
- [ ] Implement real-time collaborative editing
- [ ] Add cloud storage integration
- [ ] Support for video chunking and longer sequences
- [ ] Advanced 3D export formats
- [ ] Team management and permissions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google DeepMind** for the incredible Gemini AI platform
- **Marvel Comics** for inspiring this tool
- **Angular Team** for the fantastic framework
- **TailwindCSS** for the utility-first CSS framework
- All contributors and users of this project

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/GizzZmo/M.A.V.E.R.I.C.K./issues)
- **Discussions**: [GitHub Discussions](https://github.com/GizzZmo/M.A.V.E.R.I.C.K./discussions)
- **Wiki**: [Project Wiki](https://github.com/GizzZmo/M.A.V.E.R.I.C.K./wiki)

---

## ⚠️ Disclaimer

This project is a fan-made tool and is not affiliated with, endorsed by, or sponsored by Marvel Comics, Disney, or Google. Marvel and all related characters are trademarks of Marvel Entertainment, LLC. This tool is intended for educational and creative purposes only.

---

<div align="center">

**Built with ❤️ by the M.A.V.E.R.I.C.K. Team**

[![GitHub stars](https://img.shields.io/github/stars/GizzZmo/M.A.V.E.R.I.C.K.?style=social)](https://github.com/GizzZmo/M.A.V.E.R.I.C.K./stargazers)
[![GitHub forks](https://img.shields.io/github/forks/GizzZmo/M.A.V.E.R.I.C.K.?style=social)](https://github.com/GizzZmo/M.A.V.E.R.I.C.K./network/members)

</div>
