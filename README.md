# 🎵 Professional Frequency Generator

A modern, professional-grade frequency generator and audio signal tester built with Next.js, React, and the Web Audio API. Generate precise sine, square, sawtooth, and triangle waves for audio testing, calibration, and sound engineering applications.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge&logo=vercel)](https://fq-generator.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/dragoscv/fq-generator)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

## ✨ Features

### 🎛️ Professional Audio Controls
- **Precise Frequency Control**: Generate frequencies from 1Hz to 20kHz with fine-tuning
- **Multiple Waveforms**: Sine, Square, Sawtooth, and Triangle waves
- **Real-time Volume Control**: Professional-grade audio level management
- **Quick Frequency Presets**: Common test frequencies (440Hz, 1kHz, 10kHz, etc.)
- **Emergency Stop**: Instant audio cutoff for safety

### 📊 Advanced Features
- **Spectrum Analyzer**: Real-time frequency visualization
- **Audio Device Management**: Select and manage output devices
- **Safety Warnings**: Visual alerts for potentially harmful frequencies
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme detection and manual toggle

### 🛡️ Safety & Accessibility
- **Hearing Protection**: Built-in volume limits and warnings
- **WCAG 2.1 AA Compliant**: Full accessibility support
- **Progressive Enhancement**: Works without JavaScript (basic functionality)
- **Keyboard Navigation**: Full keyboard accessibility

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dragoscv/fq-generator.git
   cd fq-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
fq-generator/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout with SEO
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── ui/                 # UI components (Button, Slider)
│   │   ├── ClientOutputDevice.tsx
│   │   ├── FrequencyGenerator.tsx
│   │   └── FrequencyGenerator.professional.tsx
│   ├── lib/                    # Utility functions
│   │   └── utils.ts
│   ├── store/                  # State management
│   │   └── audioStore.ts       # Zustand audio store
│   ├── test/                   # Test files
│   │   ├── __mocks__/          # Mock implementations
│   │   ├── e2e/                # End-to-end tests
│   │   ├── integration/        # Integration tests
│   │   └── unit/               # Unit tests
│   └── types/                  # TypeScript definitions
│       └── audio.ts
├── public/                     # Static assets
├── playwright.config.ts        # E2E test configuration
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## 🛠️ Built With

### Core Technologies
- **[Next.js 14](https://nextjs.org)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org)** - Type-safe JavaScript
- **[React 18](https://reactjs.org)** - UI library with concurrent features
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework

### Audio & Animation
- **[Tone.js](https://tonejs.github.io)** - Web Audio API framework
- **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)** - Native browser audio
- **[Framer Motion](https://www.framer.com/motion)** - Animation library
- **[Lucide React](https://lucide.dev)** - Beautiful icons

### State & Testing
- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management
- **[Playwright](https://playwright.dev)** - End-to-end testing
- **[Vitest](https://vitest.dev)** - Unit testing framework
- **[Jest](https://jestjs.io)** - JavaScript testing

### Development Tools
- **[ESLint](https://eslint.org)** - Code linting
- **[Prettier](https://prettier.io)** - Code formatting
- **[Husky](https://typicode.github.io/husky)** - Git hooks
- **[PostCSS](https://postcss.org)** - CSS processing

## 🎯 Use Cases

### Audio Engineering
- **Speaker Testing**: Verify frequency response across the audible spectrum
- **Room Acoustics**: Test room resonances and acoustic properties
- **Equipment Calibration**: Calibrate audio equipment with precise test tones
- **Hearing Tests**: Basic hearing range assessment (under professional guidance)

### Music & Production
- **Tuning Reference**: Generate precise reference tones (440Hz A, etc.)
- **Mix Analysis**: Identify frequency gaps in musical arrangements
- **Monitor Testing**: Verify studio monitor frequency response
- **Sound Design**: Create base tones for synthesis and sound design

### Education & Research
- **Physics Demonstrations**: Visualize wave properties and behavior
- **Audio Education**: Teach frequency, amplitude, and waveform concepts
- **Research Applications**: Generate precise signals for acoustic research
- **STEM Learning**: Interactive tool for understanding sound and waves

## 📱 Browser Compatibility

| Browser | Version | Audio Support | Full Features |
|---------|---------|---------------|---------------|
| Chrome | 66+ | ✅ Excellent | ✅ All features |
| Firefox | 60+ | ✅ Excellent | ✅ All features |
| Safari | 14.1+ | ✅ Good | ⚠️ Limited device selection |
| Edge | 79+ | ✅ Excellent | ✅ All features |
| Mobile Chrome | 66+ | ✅ Good | ⚠️ Autoplay restrictions |
| Mobile Safari | 14.1+ | ✅ Good | ⚠️ Autoplay restrictions |

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run E2E tests with Playwright
npm run test:coverage # Generate test coverage report

# Utilities
npm run clean        # Clean build artifacts
npm run analyze      # Analyze bundle size
```

### Environment Variables

Create a `.env.local` file for local development:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Professional Frequency Generator"

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Development
NODE_ENV=development
```

### Testing Strategy

#### Unit Tests
- Component rendering and behavior
- Audio store state management
- Utility functions
- Custom hooks

#### Integration Tests
- Audio system initialization
- Frequency generation accuracy
- User interaction flows
- Device selection and management

#### End-to-End Tests
- Complete user workflows
- Cross-browser compatibility
- Performance benchmarks
- Accessibility compliance

## 🚀 Deployment

### Vercel (Recommended)

1. **Deploy to Vercel**
   ```bash
   npm run deploy
   # or
   vercel --prod
   ```

2. **Environment Setup**
   Configure environment variables in Vercel dashboard

### Other Platforms

The application is a standard Next.js app and can be deployed to:
- **Netlify**: Use `npm run build` and deploy the `out` folder
- **AWS Amplify**: Connect your GitHub repository
- **Docker**: Use the included Dockerfile
- **Static Export**: Configure for static hosting

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm run test
   npm run test:e2e
   ```
5. **Commit using conventional commits**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push and create a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Tone.js](https://tonejs.github.io)** - Excellent Web Audio API framework
- **[Next.js Team](https://nextjs.org)** - Amazing React framework
- **[Vercel](https://vercel.com)** - Seamless deployment platform
- **[Claude AI](https://claude.ai)** - AI assistant for development

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/dragoscv/fq-generator/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/dragoscv/fq-generator/discussions)
- 📧 **Contact**: [GitHub Profile](https://github.com/dragoscv)

---

<div align="center">

**Built with ❤️ by [Dragos](https://github.com/dragoscv) using [Claude AI](https://claude.ai)**

⭐ **Star this repo if you find it useful!** ⭐

</div>
