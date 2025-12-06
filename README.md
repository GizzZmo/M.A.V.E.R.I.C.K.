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
- 💾 **Export Capabilities**: Download all generated content in standard formats
- 🎯 **Marvel-Focused**: Specialized prompts and data for authentic Marvel content
- ⚡ **Real-Time Generation**: Fast, responsive AI generation with progress tracking

---

## ✨ Features

### 🦸‍♂️ Character Concept Generator
Create detailed character blueprints including:
- Creative character names
- Compelling 2-3 paragraph backstories
- Unique powers and abilities
- Meaningful weaknesses that create conflict
- Detailed visual descriptions for concept artists

### 📖 Plot Outline Generator
Generate three distinct episode plot outlines featuring:
- Customizable hero and villain pairings
- Rich narrative themes
- Three-act story structures
- Catchy episode titles

### 🎨 Visual Style Guide Generator
Develop comprehensive style guides with:
- Overall aesthetic and mood descriptions
- Character design approaches
- Color palette guidelines
- Background and environment styling notes

### 🕵️ Intelligence Briefing Generator
Create SHIELD-style tactical dossiers including:
- Character aliases and identities
- Base of operations
- Abilities assessment
- Psychological profiles
- Exploitable weaknesses

### 🖼️ Concept Art Generator
Generate high-quality cinematic concept art:
- Dynamic action shots
- Character portraits
- Environment designs
- 1:1 aspect ratio JPEG output

### 📚 Comic Strip Generator
Create multi-panel comic strips with:
- 2-4 panel sequences
- Multiple art styles (Classic, Manga, Noir, etc.)
- Coherent visual storytelling
- Individual panel downloads

### 🎬 Cinematic Video Generator
Produce short video shots featuring:
- High-definition quality
- Marvel movie-style cinematography
- Progress tracking with themed messages
- MP4 format output

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Google Gemini API Key** - [Get one here](https://aistudio.google.com/app/apikey)

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

3. **Configure API Key**
   
   Create a `.env.local` file in the project root:
   ```bash
   API_KEY=your_gemini_api_key_here
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

- [ ] Add user authentication
- [ ] Implement project/session management
- [ ] Add batch generation capabilities
- [ ] Create shareable links for generated content
- [ ] Integrate with Marvel API for character data
- [ ] Add support for custom character databases
- [ ] Implement collaborative features
- [ ] Add more art styles and themes
- [ ] Support for longer video generation
- [ ] Export to industry-standard formats (PDF, FBX, etc.)

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
