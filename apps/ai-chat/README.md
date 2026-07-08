# PrasannAI - AI Chat Interface

Modern React-based chat interface for the PrasannAI platform.

## Purpose

This is the frontend application that provides a beautiful, intuitive chat interface for interacting with AI models. It uses the @ai-platform/ai-sdk package for all AI communications.

## Features

- 💬 Modern chat interface with conversation management
- 🎨 Beautiful UI with smooth animations
- ⚡ Real-time streaming responses
- 🛑 Stop/continue generation
- ⚙️ Provider and model selection
- 📜 Conversation history
- 🎯 Settings panel for customization
- 📱 Responsive design

## Tech Stack

- React 18
- Vite
- @ai-platform/ai-sdk
- React Icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm 8+
- AI backend running (ai-backend)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This will start the development server at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Configuration

The app connects to the AI backend via the API configuration in `src/config/constants.js`:

```javascript
export const API_CONFIG = {
    baseUrl: 'http://127.0.0.1:8080',
    endpoint: '/chat',
    method: 'POST',
    timeout: 60000,
    defaultProvider: 'ollama',
    defaultModel: 'qwen2.5:3b',
    defaultMaxTokens: 500,
    defaultTemperature: 0.7,
};
```

## Architecture

```
ai-ui (React App)
    ↓ uses
@ai-platform/ai-sdk
    ↓ HTTP/Streaming
ai-backend (Express Server)
    ↓ uses
@ai-platform/ai-core
    ↓ calls
AI Providers (Ollama, Anthropic, OpenAI)
```

## Key Components

### App.jsx
Main application component that manages:
- Provider and model selection
- Conversation state
- Settings management
- UI layout

### useGenerateResponse Hook
Custom hook that manages:
- Conversation state
- Message handling
- Streaming/non-streaming responses
- Error handling
- Stop/continue functionality

### Chat Components
- **ChatMessages**: Displays message list
- **ChatComposer**: Message input with send/stop buttons
- **ConversationList**: Sidebar with conversation history
- **SettingsDrawer**: Provider/model configuration
- **ErrorBox**: Error display

## Usage

The app uses the @ai-platform/ai-sdk package:

```typescript
import { AIClient } from '@ai-platform/ai-sdk';
import { generateResponse, generateResponseStream } from './services/aiService';

// Create client
const client = new AIClient({
    baseUrl: 'http://127.0.0.1:8080',
    defaultProvider: 'ollama',
    defaultModel: 'qwen2.5:3b',
});

// Send message
const response = await generateResponse({
    messages: [...],
    provider: 'ollama',
    model: 'qwen2.5:3b',
});
```

## Project Structure

```
ai-ui/
├── src/
│   ├── components/          # React components
│   │   ├── ChatMessages/
│   │   ├── ChatComposer/
│   │   ├── ConversationList/
│   │   ├── ErrorBox/
│   │   └── SettingsDrawer/
│   ├── hooks/               # Custom React hooks
│   │   └── useGenerateResponse.js
│   ├── services/            # API services
│   │   └── aiService.js
│   ├── config/              # Configuration
│   │   ├── constants.js
│   │   └── providers.js
│   ├── utils/               # Utilities
│   │   └── storage.js
│   ├── styles/              # CSS styles
│   │   └── globals.css
│   └── App.jsx              # Main app component
├── package.json
└── vite.config.js
```

## Environment Variables

Create a `.env` file (optional):

```env
VITE_API_BASE_URL=http://127.0.0.1:8080
VITE_DEFAULT_PROVIDER=ollama
VITE_DEFAULT_MODEL=qwen2.5:3b
```

## Scripts

From the PrasannAI root:

```bash
# Start frontend dev server
npm run dev:frontend

# Or from ai-ui directory
npm run dev
```

## Dependencies

- **react**: UI library
- **react-dom**: React DOM bindings
- **react-icons**: Icon library
- **@ai-platform/ai-sdk**: AI communication SDK

## Notes

- This app is designed to work with the ai-backend server
- Make sure ai-backend is running before using this app
- The app uses localStorage for conversation persistence
- Streaming is enabled by default for better UX

## Contributing

This is a frontend application that demonstrates the use of @ai-platform/ai-sdk. For contributing to the SDK itself, see the main README.md.