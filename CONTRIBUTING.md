# Contributing to M.A.V.E.R.I.C.K.

First off, thank you for considering contributing to M.A.V.E.R.I.C.K.! It's people like you that make this tool amazing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Code Contributions](#code-contributions)
- [Development Setup](#development-setup)
- [Style Guidelines](#style-guidelines)
  - [Git Commit Messages](#git-commit-messages)
  - [TypeScript Style Guide](#typescript-style-guide)
  - [Documentation Style Guide](#documentation-style-guide)
- [Additional Notes](#additional-notes)

## Code of Conduct

This project and everyone participating in it is governed by the [M.A.V.E.R.I.C.K. Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

**Bug Report Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g., Windows 10, macOS 13, Ubuntu 22.04]
 - Browser: [e.g., Chrome 120, Firefox 121]
 - Node.js Version: [e.g., 20.11.0]
 - App Version: [e.g., 1.0.5]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful** to most users
- **List some examples** of how this enhancement would be used
- **Specify the current behavior** and **explain the behavior you'd like to see**

### Code Contributions

#### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/M.A.V.E.R.I.C.K.git
   ```
3. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes (see [Git Commit Messages](#git-commit-messages))
7. Push to your fork
8. Create a Pull Request

#### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the documentation with any new features or changes
3. Ensure all tests pass and the code builds successfully
4. Add tests for new features
5. Request review from maintainers
6. Address any review comments

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- A Google Gemini API key

### Setup Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file:
   ```bash
   API_KEY=your_gemini_api_key_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build the project:
   ```bash
   npm run build
   ```

### Project Structure

```
M.A.V.E.R.I.C.K./
├── src/
│   ├── app.component.ts          # Main component
│   ├── app.component.html        # Main template
│   ├── services/
│   │   ├── gemini.service.ts     # AI service
│   │   ├── auth.service.ts       # Authentication
│   │   ├── project.service.ts    # Project management
│   │   ├── batch-generation.service.ts  # Batch processing
│   │   ├── share.service.ts      # Content sharing
│   │   ├── marvel-api.service.ts # Marvel API integration
│   │   ├── custom-character.service.ts  # Custom character databases
│   │   ├── export.service.ts     # Multi-format export
│   │   ├── config.service.ts     # Configuration management
│   │   ├── collaboration.service.ts     # Real-time collaboration
│   │   ├── team.service.ts       # Team management & permissions
│   │   └── cloud-storage.service.ts     # Cloud storage abstraction
│   ├── models/
│   │   └── marvel-concept.model.ts
│   └── data/
│       └── marvel-data.ts
├── .github/
│   └── workflows/                # CI/CD workflows
├── README.md
├── CONTRIBUTING.md               # This file
├── SERVICES_GUIDE.md             # Services implementation guide
└── package.json
```

## Style Guidelines

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Consider starting the commit message with an applicable emoji:
  - 🎨 `:art:` when improving the format/structure of the code
  - 🐛 `:bug:` when fixing a bug
  - ✨ `:sparkles:` when adding a new feature
  - 📝 `:memo:` when writing docs
  - 🚀 `:rocket:` when improving performance
  - ✅ `:white_check_mark:` when adding tests
  - 🔒 `:lock:` when dealing with security
  - ⬆️ `:arrow_up:` when upgrading dependencies
  - ⬇️ `:arrow_down:` when downgrading dependencies

**Examples:**

```
✨ Add comic strip generation feature
🐛 Fix video generation timeout issue
📝 Update API documentation with new examples
```

### TypeScript Style Guide

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for all public functions and classes
- Use interfaces for type definitions
- Prefer `const` over `let`, avoid `var`
- Use template literals for string concatenation
- Use arrow functions for callbacks
- Use async/await instead of callbacks or `.then()`

**Example:**

```typescript
/**
 * Generates a character concept from a description.
 * 
 * @param {string} description - Core character concept
 * @returns {Promise<CharacterConcept>} Generated character data
 * @throws {Error} If the API call fails
 */
async generateCharacter(description: string): Promise<CharacterConcept> {
  const response = await this.geminiService.generateCharacterConcept(description);
  return { ...response, type: 'character' };
}
```

### Documentation Style Guide

- Use Markdown for all documentation
- Keep line length under 120 characters when possible
- Use code blocks with language specification
- Add screenshots for UI changes
- Update the README.md for user-facing changes
- Add inline comments for complex logic
- Use JSDoc format for TypeScript documentation

## Additional Notes

### Issue and Pull Request Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `wontfix` - This will not be worked on
- `duplicate` - This issue or pull request already exists
- `invalid` - This doesn't seem right

### Financial Contributions

We currently do not accept financial contributions. The best way to support the project is through code contributions, bug reports, and spreading the word!

### Questions?

Feel free to open an issue with the `question` label, or reach out to the maintainers directly through GitHub Discussions.

---

Thank you for contributing to M.A.V.E.R.I.C.K.! 🦸‍♂️
