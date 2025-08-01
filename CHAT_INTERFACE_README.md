# INOK Memory - Chat Interface

A clean, minimalist, and responsive chat interface similar to ChatGPT, built with Next.js, shadcn/ui, and Tailwind CSS, with full internationalization support.

## 🎯 Features

### Core Features
- ✅ **Full-height vertical layout** with scrollable message history
- ✅ **Fixed input bar** at the bottom (ChatGPT-style)
- ✅ **Different message styles** for user, assistant, and system messages
- ✅ **Markdown support** with syntax highlighting for code blocks
- ✅ **Auto-expanding textarea** with keyboard shortcuts
- ✅ **Responsive design** for mobile, tablet, and desktop
- ✅ **Light and dark mode** support with system preference detection
- ✅ **Typing animation** when assistant is responding
- ✅ **Auto-scroll to bottom** when new messages are added

### Internationalization (i18n)
- ✅ **Multi-language support**: English, Portuguese, and Spanish
- ✅ **Dynamic language switching** with dropdown selector
- ✅ **Localized interface elements** (placeholders, buttons, labels)
- ✅ **URL-based locale routing** (`/en`, `/pt`, `/es`)

### Design & UX
- ✅ **Clean, minimalist aesthetic** inspired by ChatGPT
- ✅ **Smooth animations** and transitions
- ✅ **Soft shadows** and elegant rounded corners
- ✅ **Good vertical rhythm** between messages
- ✅ **Accessible design** with proper ARIA labels and keyboard navigation

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── chat/
│   │   ├── ChatContainer.tsx      # Main chat layout and state management
│   │   ├── ChatMessage.tsx        # Individual message rendering
│   │   ├── ChatInput.tsx          # Message input with auto-resize
│   │   ├── LanguageSelector.tsx   # Language switching dropdown
│   │   ├── ThemeToggle.tsx        # Light/dark mode toggle
│   │   └── index.ts               # Component exports
│   └── ui/                        # shadcn/ui components
│       ├── button.tsx
│       ├── textarea.tsx
│       └── select.tsx
├── types/
│   └── chat.ts                    # TypeScript interfaces
├── lib/
│   └── utils.ts                   # Utility functions
└── app/
    └── [locale]/                  # Internationalized routing
        ├── layout.tsx
        └── page.tsx
```

### Internationalization Setup
```
├── messages/                      # Translation files
│   ├── en.json                   # English translations
│   ├── pt.json                   # Portuguese translations
│   └── es.json                   # Spanish translations
├── i18n.ts                       # i18n configuration
└── middleware.ts                 # Locale routing middleware
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at:
- English: `http://localhost:3000/en`
- Portuguese: `http://localhost:3000/pt` 
- Spanish: `http://localhost:3000/es`

## 🎨 Design System

### Color Scheme
The interface uses a comprehensive design system with CSS custom properties that adapt to light and dark modes:

- **Background**: Clean whites in light mode, dark grays in dark mode
- **Primary**: High contrast for important actions (send button, user messages)
- **Muted**: Subtle backgrounds for assistant messages and input fields
- **Borders**: Soft borders that maintain hierarchy without being distracting

### Typography
- **Font**: Inter for excellent readability across all screen sizes
- **Code**: Monospace font for code blocks with syntax highlighting
- **Hierarchy**: Clear typography scale for headers, body text, and metadata

### Responsive Breakpoints
- **Mobile**: 640px and below - Compact layout with adjusted spacing
- **Tablet**: 641px - 1024px - Balanced layout with medium spacing  
- **Desktop**: 1025px+ - Full layout with generous spacing and max-width containers

## 🔧 Customization

### Adding New Languages
1. Create a new translation file in `messages/[locale].json`
2. Add the locale to the `locales` array in:
   - `i18n.ts`
   - `middleware.ts` 
   - `src/components/chat/LanguageSelector.tsx`

### Modifying the Design
The design is fully customizable through:
- **CSS Variables**: Modify `src/app/globals.css` for colors and spacing
- **Tailwind Config**: Extend `tailwind.config.ts` for custom utilities
- **Component Props**: All components accept `className` props for styling overrides

### Integrating with AI Backend
Replace the mock response in `ChatContainer.tsx`:

```typescript
const handleSendMessage = async (content: string) => {
  // Replace this simulation with your actual API call
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: content })
  });
  
  const data = await response.json();
  // Handle the response...
};
```

## 📱 Mobile Experience

The interface is fully optimized for mobile devices:
- **Touch-friendly**: Large tap targets and appropriate spacing
- **Responsive typography**: Font sizes adapt to screen size
- **Mobile input**: Native mobile keyboard optimization
- **Gesture support**: Smooth scrolling and touch interactions
- **Adaptive layout**: Content reflows appropriately on small screens

## ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: WCAG AA compliant color ratios
- **Reduced Motion**: Respects user's motion preferences

## 🔒 Security Considerations

- **XSS Prevention**: Safe rendering of user input with React's built-in protections
- **Content Sanitization**: Markdown rendering with safe defaults
- **Input Validation**: Client-side validation with server-side verification
- **CSRF Protection**: Built-in Next.js protections

## 📈 Performance

- **Optimized Rendering**: Efficient re-renders with React optimization techniques
- **Code Splitting**: Automatic code splitting with Next.js App Router
- **Image Optimization**: Built-in Next.js image optimization
- **Bundle Size**: Minimal dependencies and tree-shaking
- **Caching**: Proper caching strategies for static assets

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build for production
npm run build
```

## 🔄 Deployment

The interface is ready for deployment on any platform that supports Next.js:

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Other Platforms
- **Netlify**: Use the Next.js plugin
- **Docker**: Include the provided Dockerfile
- **Static Export**: Configure for static generation if needed

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add appropriate TypeScript types for new features
3. Include translations for all new text content
4. Test across different screen sizes and devices
5. Ensure accessibility compliance

## 📄 License

This project is part of the INOK Memory system. Please refer to the main project license.

---

**Built with ❤️ using:**
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [next-intl](https://next-intl-docs.vercel.app/)
- [React Markdown](https://github.com/remarkjs/react-markdown)
- [Lucide React](https://lucide.dev/)