<div align="center">
<img width="1200" height="475" alt="M.A.V.E.R.I.C.K. Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# M.A.V.E.R.I.C.K.
### Marvel Advanced Visual Entertainment Research & Intelligent Creative Kit

[![Build Status](https://github.com/GizzZmo/M.A.V.E.R.I.C.K./workflows/Build%20and%20Deploy/badge.svg)](https://github.com/GizzZmo/M.A.V.E.R.I.C.K./actions)
[![License](https://img.shields.io/github/license/GizzZmo/M.A.V.E.R.I.C.K.)](LICENSE)
[![Version](https://img.shields.io/github/package-json/v/GizzZmo/M.A.V.E.R.I.C.K.)](package.json)

</div>

## 🎬 About

M.A.V.E.R.I.C.K. is an advanced, AI-powered pre-production blueprint generator specialized for the Marvel universe. Built with Angular and powered by Google's Gemini AI, this tool revolutionizes the creative process by generating:

- **Character Concepts**: Detailed character designs and backstories
- **Episode Plots**: Compelling storylines and narrative arcs
- **Visual Styles**: Unique artistic directions and themes

Originally developed as "Marvel Pre-Production Blueprint" in AI Studio, M.A.V.E.R.I.C.K. brings professional-grade creative tools to writers, artists, and producers working on Marvel-inspired content.

## ✨ Features

- 🤖 **AI-Powered Generation**: Leverages Google Gemini API for intelligent content creation
- 🎨 **Modern UI**: Sleek, high-tech interface built with Tailwind CSS
- ⚡ **Fast & Responsive**: Built on Angular 20 with zoneless change detection
- 🎯 **Specialized Content**: Tailored specifically for Marvel universe aesthetics
- 🔄 **Real-time Processing**: Instant feedback and generation

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GizzZmo/M.A.V.E.R.I.C.K..git
   cd M.A.V.E.R.I.C.K.
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   
   Create a `.env.local` file in the root directory:
   ```bash
   echo "GEMINI_API_KEY=your_api_key_here" > .env.local
   ```
   
   Replace `your_api_key_here` with your actual Gemini API key.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build

### Build Output

The production build creates optimized bundles in the `dist/` directory:
- `index.html` - Entry HTML file
- `main-*.js` - Compiled application bundle (~173 KB gzipped)
- `3rdpartylicenses.txt` - Third-party license information

### Technology Stack

- **Framework**: Angular 20
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini API
- **HTTP Client**: Angular HttpClient
- **State Management**: RxJS 7.8
- **Build Tool**: Angular CLI with esbuild

## 📦 Project Structure

```
M.A.V.E.R.I.C.K./
├── src/
│   ├── app.component.ts       # Main application component
│   ├── app.component.html     # Main template
│   ├── services/              # API and business logic services
│   ├── models/                # TypeScript interfaces and types
│   └── data/                  # Static data and configurations
├── index.tsx                  # Application entry point
├── index.html                 # HTML template
├── angular.json               # Angular configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## 🌐 Deployment

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory, ready for deployment to any static hosting service.

### Recommended Hosting Platforms

- **Vercel**: Zero-config deployment with excellent performance
- **Netlify**: Simple drag-and-drop deployment
- **GitHub Pages**: Free hosting for public repositories
- **Firebase Hosting**: Google's hosting solution with CDN

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **AI Studio App**: https://ai.studio/apps/drive/1mhQT-7WSSSLY9hEgTwvuONhuRGNVOUnE
- **GitHub Repository**: https://github.com/GizzZmo/M.A.V.E.R.I.C.K.
- **Issue Tracker**: https://github.com/GizzZmo/M.A.V.E.R.I.C.K./issues

## 🙏 Acknowledgments

- Built with [Google Gemini AI](https://ai.google.dev/)
- Inspired by the Marvel Cinematic Universe
- Powered by Angular and modern web technologies

## ⚠️ Disclaimer

This is a fan project and is not officially associated with Marvel Entertainment, LLC or The Walt Disney Company. All Marvel characters and related intellectual property belong to their respective owners.

---

<div align="center">
Made with ❤️ by the M.A.V.E.R.I.C.K. team
</div>
