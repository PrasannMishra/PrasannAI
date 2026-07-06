# AI Learning Hub

A local-first Learning Management System (LMS) for AI Engineering education. Built with React, TypeScript, and Tailwind CSS.

## Features (Milestone 1)

- ✅ **React + Vite + TypeScript** setup
- ✅ **Tailwind CSS** for styling
- ✅ **MDX** content rendering
- ✅ **Auto-discovery** of lessons from content directory
- ✅ **Dashboard** with progress tracking
- ✅ **Sidebar navigation** with categorized lessons
- ✅ **Lesson pages** with reading progress
- ✅ **Dark/Light mode** support
- ✅ **Search functionality** across all content
- ✅ **Progress tracking** with LocalStorage

## Tech Stack

- **Framework**: React 18 + Vite 5 + TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS v3
- **Content**: MDX with syntax highlighting
- **State Management**: Zustand
- **Icons**: Lucide React
- **Markdown**: react-markdown with remark-gfm, rehype-highlight, rehype-mermaid

## Project Structure

```
ai-learning-hub/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx      # Main layout wrapper
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   ├── Header.tsx      # Top header with search
│   │   └── MDXContent.tsx  # MDX content renderer
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── LessonPage.tsx  # Individual lesson view
│   │   ├── SearchPage.tsx  # Search functionality
│   │   └── SettingsPage.tsx # User settings
│   ├── stores/             # Zustand state management
│   │   └── useLessonStore.ts # Lessons, progress, settings
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   └── contentLoader.ts # MDX content loader
│   ├── content/            # MDX lesson files
│   │   ├── day-001/
│   │   │   └── lesson.mdx
│   │   └── day-002/
│   │       └── lesson.mdx
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 8+

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### From Monorepo Root

```bash
# Install all dependencies
npm install

# Run the learning hub
npm run dev:learning-hub
```

## Content Structure

### Adding New Lessons

Simply add a new folder in `src/content/` with a `lesson.mdx` file:

```
src/content/
└── day-003/
    └── lesson.mdx
```

The application will automatically:
- Detect the new lesson
- Parse front matter
- Add it to the dashboard
- Include it in search
- Update navigation

### Lesson Front Matter

Every lesson must include front matter:

```yaml
---
day: 3
title: Your Lesson Title
description: Brief description
difficulty: Beginner | Intermediate | Advanced
estimatedTime: 2 Hours
status: not-started | in-progress | completed
topics:
  - Topic 1
  - Topic 2
prerequisites:
  - day-001
resources:
  - Resource Title
    - https://example.com
assignment: true
project: Project Name
interviewLevel: Junior | Mid | Senior
tags:
  - tag1
  - tag2
summary: Brief summary
---
```

## Features in Detail

### Dashboard
- Overall progress tracking
- Completed/remaining lessons
- Current lesson with quick resume
- Recent lessons list
- Statistics cards

### Lesson Page
- Reading progress bar
- Mark complete functionality
- Previous/Next navigation
- Table of contents (coming soon)
- Topics and resources sidebar
- Code syntax highlighting
- Mermaid diagram support

### Search
- Instant search across titles, content, topics, and tags
- Search result highlighting
- Quick navigation to lessons

### Settings
- Theme selection (Light/Dark/System)
- Font size adjustment
- Reading width control
- Animation toggle
- Progress reset

### Progress Tracking
- Completed lessons
- Reading progress per lesson
- Last opened lesson
- All data stored in LocalStorage

## Design Principles

1. **Content-Driven**: No code changes needed to add lessons
2. **Local-First**: All data stored locally
3. **Git-Friendly**: Content as MDX files
4. **Offline Capable**: Works without internet
5. **Zero Backend**: No server required for v1

## Future Enhancements

- [ ] Personal notes
- [ ] Bookmarks
- [ ] Resources library
- [ ] Projects section
- [ ] Cheat sheets
- [ ] Interview preparation
- [ ] Export functionality
- [ ] Mermaid diagrams
- [ ] Learning analytics
- [ ] AI-powered features (v2)

## Development

### Scripts

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

### Adding New Dependencies

```bash
# Add to ai-learning-hub
npm install <package> --workspace=ai-learning-hub

# Add dev dependency
npm install -D <package> --workspace=ai-learning-hub
```

## Architecture

This project is part of the PrasannAI monorepo:

```
PrasannAI/
├── apps/
│   └── ai-learning-hub/  # This project
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   ├── shared-utils/     # Shared utilities
│   ├── ai-core/          # Core AI engine
│   └── ai-sdk/           # Frontend SDK
├── ai-ui/                # Chat application
└── ai-backend/           # Backend API
```

## License

ISC

## Contributing

Contributions are welcome! Please ensure:
- TypeScript strict mode compliance
- Tailwind CSS for styling
- Proper MDX front matter for new lessons
- Follow the existing code structure