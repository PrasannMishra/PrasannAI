# AI Platform

A modular, reusable AI platform for building AI-powered applications. Extract AI logic into reusable packages that can power multiple applications without duplication.

## 🎯 Objective

Refactor AI logic into reusable packages (ai-core, ai-sdk) that can be used by any application (chat, learning portal, PR reviewer, VS Code extension, CLI, etc.) without duplicating code.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Applications                              │
│  Chat App │ Learning Portal │ PR Reviewer │ VS Code │ CLI   │
└─────────────────────────────────────────────────────────────┘
                          │ uses
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend SDK (ai-sdk)                                      │
│  AIClient │ useChat Hook │ Streaming │ AbortController      │
└─────────────────────────────────────────────────────────────┘
                          │ HTTP/Streaming
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend API (ai-backend)                                   │
│  Express │ Auth │ Validation │ Rate Limiting │ Logging      │
└─────────────────────────────────────────────────────────────┘
                          │ uses
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Core Engine (ai-core)                                      │
│  Providers │ ModelFactory │ AIService │ Business Logic      │
└─────────────────────────────────────────────────────────────┘
                          │ uses
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Shared Packages                                            │
│  shared-types (Types) │ shared-utils (Utilities)            │
└─────────────────────────────────────────────────────────────┘
                          │ calls
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  AI Providers                                               │
│  Anthropic │ Ollama │ OpenAI │ Gemini                       │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Packages

### @ai-platform/shared-types
**TypeScript type definitions** - Single source of truth for all types across the platform.

- Core types (ChatMessage, Conversation, ProviderConfig)
- Completion types (CompletionRequest, CompletionResponse)
- Streaming types (StreamEvent, StreamChunk)
- Context types (ContextProvider, ContextResult)
- Error types (AIError, AIErrorCode)
- Future types (Tool, Agent, Memory, RAG)

**Dependencies**: None

### @ai-platform/shared-utils
**Shared utility functions** - Reusable utilities for both frontend and backend.

- Validation utilities
- Token estimation
- Retry logic with exponential backoff
- Debounce/throttle
- Object/array utilities
- String/date utilities
- ID generation
- Error utilities
- Async utilities
- Environment utilities

**Dependencies**: None

### @ai-platform/ai-core
**Core AI engine** - Provider-agnostic AI business logic.

- Provider implementations (Anthropic, Ollama, OpenAI-compatible)
- Model factory for provider creation
- AI service for completion logic
- Request/response normalization

**Does NOT contain**: HTTP server, database, auth, framework code

**Dependencies**: shared-types, shared-utils

### @ai-platform/ai-sdk
**Frontend SDK** - Type-safe API for frontend applications.

- AIClient: HTTP client with streaming support
- React hooks (useChat, useStreaming)
- AbortController integration
- Error normalization
- Retry logic

**Does NOT contain**: AI business logic, UI components

**Dependencies**: shared-types, shared-utils

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Build all packages
npm run build:packages
```

### Using ai-core (Backend)

```typescript
import { createProvider, AIService } from '@ai-platform/ai-core';

// Create a provider
const provider = createProvider({
    type: 'anthropic',
    apiKey: 'your-api-key',
    model: 'claude-sonnet-4-5',
});

// Create AI service
const aiService = new AIService({
    defaults: {
        maxTokens: 500,
        temperature: 0.7,
    },
});

// Generate completion
const response = await aiService.generateCompletion(provider, {
    messages: [
        { role: 'user', content: 'Hello, AI!' }
    ],
});

console.log(response.output);
```

### Using ai-sdk (Frontend)

```typescript
import { AIClient } from '@ai-platform/ai-sdk';

// Create client
const client = new AIClient({
    baseUrl: 'http://localhost:8080',
    defaultProvider: 'anthropic',
    defaultModel: 'claude-sonnet-4-5',
});

// Send a chat message
const response = await client.chatSend({
    messages: [
        { role: 'user', content: 'Hello, AI!' }
    ],
});

console.log(response.output);

// Stream a response
for await (const event of client.chatStream({
    messages: [
        { role: 'user', content: 'Tell me a story' }
    ],
})) {
    if (event.type === 'chunk' && event.content) {
        console.log(event.content);
    }
}
```

### Using React Hook

```typescript
import { useChat } from '@ai-platform/ai-sdk';
import { AIClient } from '@ai-platform/ai-sdk';

const client = new AIClient({
    baseUrl: 'http://localhost:8080',
});

function ChatComponent() {
    const { messages, isLoading, error, send, stop, clear } = useChat({
        client,
        provider: 'anthropic',
        model: 'claude-sonnet-4-5',
    });

    const handleSend = async () => {
        await send([{ role: 'user', content: 'Hello!' }]);
    };

    return (
        <div>
            {messages.map((msg, i) => (
                <div key={i}>{msg.role}: {msg.content}</div>
            ))}
            <button onClick={handleSend} disabled={isLoading}>
                Send
            </button>
            <button onClick={stop}>Stop</button>
        </div>
    );
}
```

## 🎨 Design Principles

### 1. Separation of Concerns
Each package has a single, well-defined responsibility.

### 2. Dependency Direction
Dependencies flow in one direction - applications depend on packages, not the other way around.

### 3. Framework Agnostic
- **ai-core**: Works with Express, NestJS, Fastify, or any backend framework
- **ai-sdk**: Works with React, Vue, Svelte, or vanilla JavaScript

### 4. Provider Agnostic
Switch between AI providers without changing application code.

### 5. Type Safety
All packages are written in TypeScript with strict mode enabled.

### 6. Extensibility
New features can be added without breaking existing APIs.

## 📁 Project Structure

```
PrasannAI/
├── package.json                 # Monorepo root with workspaces
├── ARCHITECTURE.md              # Detailed architecture documentation
├── apps/                        # Future applications
│   ├── chat-app/
│   ├── learning-portal/
│   └── pr-reviewer/
├── packages/
│   ├── shared-types/            # Type definitions
│   │   ├── src/index.ts
│   │   ├── package.json
│   │   └── README.md
│   ├── shared-utils/            # Utility functions
│   │   ├── src/index.ts
│   │   ├── package.json
│   │   └── README.md
│   ├── ai-core/                 # Core AI engine
│   │   ├── src/
│   │   │   ├── providers/       # Provider implementations
│   │   │   ├── services/        # AI service logic
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md
│   └── ai-sdk/                  # Frontend SDK
│       ├── src/
│       │   ├── client/          # AIClient
│       │   ├── hooks/           # React hooks
│       │   └── index.ts
│       ├── package.json
│       └── README.md
├── ai-backend/                  # Backend API (uses ai-core)
│   └── src/
└── ai-ui/                       # Frontend app (uses ai-sdk)
    └── src/
```

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm 8+
- TypeScript 5+

### Scripts

```bash
# Install all dependencies
npm install

# Build all packages
npm run build:packages

# Run backend
npm run dev:backend

# Run frontend
npm run dev:frontend

# Run tests
npm test
```

### Adding a New Provider

```typescript
import { BaseProvider } from '@ai-platform/ai-core';
import type { ChatMessage, CompletionOptions, ProviderConfig } from '@ai-platform/shared-types';

class CustomProvider extends BaseProvider {
    constructor(config: ProviderConfig) {
        super(config);
        // Initialize your provider
    }

    async generateText(prompt: string, options?: CompletionOptions): Promise<string> {
        // Implement text generation
    }

    async *generateTextStream(prompt: string, options?: CompletionOptions): AsyncGenerator<string> {
        // Implement streaming
    }
}

// Register the provider
import { registerProvider } from '@ai-platform/ai-core';
registerProvider('custom', CustomProvider);
```

## 🎯 Benefits

### Code Reuse
- AI logic written once in ai-core
- Frontend SDK written once in ai-sdk
- All applications share the same code

### Consistency
- All apps use the same AI providers
- Same error handling
- Same streaming behavior
- Same type definitions

### Maintainability
- Bug fixes in one place benefit all apps
- New features added once, available everywhere
- Clear separation of concerns

### Flexibility
- Swap providers without changing application code
- Add new apps without duplicating AI logic
- Customize per-app without affecting others

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- [packages/shared-types/README.md](./packages/shared-types/README.md) - Shared types documentation
- [packages/shared-utils/README.md](./packages/shared-utils/README.md) - Shared utilities documentation
- [packages/ai-core/README.md](./packages/ai-core/README.md) - AI core documentation
- [packages/ai-sdk/README.md](./packages/ai-sdk/README.md) - AI SDK documentation

## 🔮 Future Enhancements

- **Tool Calling**: Allow AI to use external tools
- **MCP (Model Context Protocol)**: Standardize tool integration
- **RAG (Retrieval-Augmented Generation)**: Add vector search
- **Agents**: Multi-step reasoning with tool use
- **Memory**: Long-term conversation memory
- **Analytics**: Usage tracking and insights
- **Multi-provider routing**: Intelligent provider selection
- **Caching**: Response caching for common queries
- **Rate limiting**: Built-in rate limiting in ai-core

## 📄 License

ISC

## 👥 Contributing

Contributions are welcome! Please read the architecture documentation before contributing.

## 🔗 Related Projects

- ai-backend: Backend API implementation
- ai-ui: Frontend chat application