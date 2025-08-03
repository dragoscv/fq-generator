# Contributing to Professional Frequency Generator

Thank you for your interest in contributing to the Professional Frequency Generator! This document provides guidelines and information for contributors.

## 🎯 Ways to Contribute

### 🐛 Bug Reports
- Use the [GitHub Issues](https://github.com/dragoscv/fq-generator/issues) page
- Check existing issues before creating new ones
- Provide detailed reproduction steps
- Include browser version and operating system
- Add screenshots or recordings when helpful

### 💡 Feature Requests  
- Use [GitHub Discussions](https://github.com/dragoscv/fq-generator/discussions) for feature ideas
- Explain the use case and benefit
- Consider implementation complexity
- Be open to alternative solutions

### 🔧 Code Contributions
- Fork the repository and create a feature branch
- Follow the coding standards and conventions
- Write tests for new functionality
- Update documentation as needed
- Submit a pull request with clear description

## 🛠️ Development Setup

### Prerequisites
- Node.js 18 or higher
- npm, yarn, or pnpm
- Git
- Modern web browser

### Local Setup
1. **Fork and clone**
   ```bash
   git clone https://github.com/your-username/fq-generator.git
   cd fq-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm run test
   npm run test:e2e
   ```

## 📝 Coding Standards

### TypeScript
- Use strict TypeScript configuration
- Provide proper type annotations
- Avoid `any` types when possible
- Use meaningful variable and function names

### React Components
- Use functional components with hooks
- Follow React best practices
- Implement proper error boundaries
- Use memo for performance optimization when needed

### Styling
- Use Tailwind CSS utility classes
- Follow responsive design principles
- Maintain consistent spacing and typography
- Support both light and dark themes

### Testing
- Write unit tests for all utility functions
- Test component behavior, not implementation
- Include integration tests for user workflows
- Maintain good test coverage (aim for 80%+)

## 🔄 Pull Request Process

### Before Submitting
1. **Ensure all tests pass**
   ```bash
   npm run test
   npm run test:e2e
   npm run lint
   npm run type-check
   ```

2. **Follow commit conventions**
   ```bash
   feat: add new waveform type
   fix: resolve audio context initialization
   docs: update API documentation
   style: improve button hover states
   refactor: optimize audio processing
   test: add spectrum analyzer tests
   ```

3. **Update documentation**
   - Update README if needed
   - Add JSDoc comments for new functions
   - Update type definitions

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

## 🎨 Design Guidelines

### UI/UX Principles
- **Accessibility First**: WCAG 2.1 AA compliance
- **Progressive Enhancement**: Works without JavaScript
- **Mobile Responsive**: Touch-friendly interfaces
- **Performance**: Fast loading and smooth interactions

### Audio Safety
- **Volume Limits**: Prevent hearing damage
- **Warning Systems**: Alert users of potentially harmful frequencies
- **Emergency Stop**: Quick audio cutoff capability
- **Safe defaults**: Conservative initial settings

## 🧪 Testing Guidelines

### Unit Tests
- Test individual functions and components
- Mock external dependencies
- Focus on business logic
- Use descriptive test names

### Integration Tests  
- Test component interactions
- Verify audio system integration
- Test user workflows
- Check error handling

### E2E Tests
- Test complete user journeys
- Verify cross-browser compatibility
- Test accessibility features
- Performance benchmarks

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Tone.js Documentation](https://tonejs.github.io/docs/)

### Tools & Libraries
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/introduction/)
- [Playwright Testing](https://playwright.dev/docs/intro)

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `audio` - Audio-related functionality
- `ui/ux` - User interface and experience
- `performance` - Performance improvements
- `accessibility` - Accessibility improvements
- `testing` - Testing-related issues

## 🎉 Recognition

Contributors will be:
- Listed in the contributors section
- Mentioned in release notes for significant contributions
- Invited to join the maintainer team for ongoing contributors

## 📞 Getting Help

- **Questions**: Use [GitHub Discussions](https://github.com/dragoscv/fq-generator/discussions)
- **Real-time Chat**: Join our Discord server (link in README)
- **Email**: Contact maintainers directly for sensitive issues

## 📜 Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

---

Thank you for contributing to making audio testing more accessible and professional! 🎵
