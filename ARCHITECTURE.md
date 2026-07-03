# AI Platform Architecture

## Overview

The AI Platform is a modular, reusable architecture for building AI-powered applications. It separates concerns into distinct packages, enabling code reuse across multiple applications while maintaining clean architecture principles.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Applications Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  Chat App    │  │ Learning     │  │ PR Reviewer  │  ...      │
│  │  (ai-ui)     │  │ Portal       │  │              │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ uses
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Frontend SDK (ai-sdk)                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  AIClient  │  useChat Hook  │  Streaming  │  AbortControl   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/Streaming
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Backend API (ai-backend)                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Express Server  │  Auth  │  Validation  │  Rate Limiting   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ uses
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Core Engine (ai-core)                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Providers  │  ModelFactory  │  AIService  │  Business Logic │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ uses
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Shared Packages                                 │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐   │
│  │ shared-types         │  │ shared-utils                     │   │
│  │ (TypeScript types)   │  │ (Utility functions)              │   │
│  └──────────────────────┘  └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ calls
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    External AI Providers                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │ Anthropic  │  │   Ollama   │  │   OpenAI   │  │   Gemini   │  │
│  │   Claude   │  │  (Local)   │  │   GPT      │  │            │  │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Package Structure

```
PrasannAI/
├── package.json                    # Monorepo root
├── apps/
│   ├── chat-app/                   # Future: Standalone chat app
│   ├── learning-portal/            # Future: Learning platform
│   └── pr-reviewer/                # Future: PR review tool
├── packages/
│   ├── shared-types/               # TypeScript type definitions
│   │   ├── src/index.ts
│   │   └── package.json
│   ├── shared-utils/               # Shared utility functions
│   │   ├── src/index.ts
│   │   └── package.json
│   ├── ai-core/                    # Core AI engine (backend)
│   │   ├── src/
│   │   │   ├── providers/          # Provider implementations
│   │   │   ├── services/           # AI service logic
│   │   │   └── index.ts
│   │   └── package.json
│   └── ai-sdk/                     # Frontend SDK
│       ├── src/
│       │   ├── client/             # AIClient
│       │   ├── hooks/              # React hooks
│       │   └── index.ts
│       └── package.json
├── ai-backend/                     # Backend API (existing)
│   └── src/
│       └── (uses ai-core)
└── ai-ui/                          # Frontend app (existing)
    └── src/
        └── (uses ai-sdk)
```

## Package Responsibilities

### @ai-platform/shared-types

**Purpose**: Single source of truth for all TypeScript types

**Contains**:
- Core types (ChatMessage, Conversation, ProviderConfig)
- Completion types (CompletionRequest, CompletionResponse)
- Streaming types (StreamEvent, StreamChunk)
- Context types (ContextProvider, ContextResult)
- Error types (AIError, AIErrorCode)
- Future types (Tool, Agent, Memory, RAG)

**Dependencies**: None

**Used by**: ai-core, ai-sdk, applications

### @ai-platform/shared-utils

**Purpose**: Reusable utility functions

**Contains**:
- Validation utilities
- Token estimation
- Retry logic
- Debounce/throttle
- Object/array utilities
- String/date utilities
- ID generation
- Error utilities
- Async utilities
- Environment utilities

**Dependencies**: None

**Used by**: ai-core, ai-sdk, applications

### @ai-platform/ai-core

**Purpose**: Core AI business logic (provider-agnostic)

**Contains**:
- Provider implementations (Anthropic, Ollama, OpenAI)
- Model factory for provider creation
- AI service for completion logic
- Request/response normalization

**Does NOT contain**:
- HTTP server code
- Database operations
- Authentication
- Framework-specific code

**Dependencies**: shared-types, shared-utils

**Used by**: ai-backend, applications

### @ai-platform/ai-sdk

**Purpose**: Frontend SDK for AI interactions

**Contains**:
- AIClient: Type-safe HTTP client
- React hooks (useChat, useStreaming)
- Streaming support
- AbortController integration
- Error normalization

**Does NOT contain**:
- AI business logic
- Provider implementations
- UI components

**Dependencies**: shared-types, shared-utils

**Used by**: ai-ui, applications

## Data Flow

### Non-Streaming Request

```
User Input
    ↓
React Component
    ↓
useChat Hook
    ↓
AIClient.chatSend()
    ↓
HTTP POST /chat
    ↓
Express Handler (ai-backend)
    ↓
AIService.generateCompletion()
    ↓
Provider.generateChat()
    ↓
External AI API (Anthropic/OpenAI/Ollama)
    ↓
Response flows back up
    ↓
UI Update
```

### Streaming Request

```
User Input
    ↓
React Component
    ↓
useChat Hook
    ↓
AIClient.chatStream()
    ↓
HTTP POST /chat/stream (SSE)
    ↓
Express Handler (ai-backend)
    ↓
AIService.generateCompletion()
    ↓
Provider.generateChatStream()
    ↓
External AI API (streaming)
    ↓
SSE chunks flow back
    ↓
AIClient parses SSE
    ↓
React Hook receives events
    ↓
UI updates in real-time
```

## Design Principles

### 1. Separation of Concerns

Each package has a single, well-defined responsibility:
- **shared-types**: Type definitions only
- **shared-utils**: Utility functions only
- **ai-core**: AI business logic only
- **ai-sdk**: Frontend communication only
- **ai-backend**: HTTP orchestration only
- **ai-ui**: UI components only

### 2. Dependency Direction

Dependencies flow in one direction:

```
Applications → ai-sdk → shared-types
Applications → ai-backend → ai-core → shared-types
```

Applications never depend on implementation details.

### 3. Framework Agnostic

- **ai-core**: Works with Express, NestJS, Fastify, or any backend framework
- **ai-sdk**: Works with React, Vue, Svelte, or vanilla JavaScript
- **shared-utils**: Works in Node.js and browser environments

### 4. Provider Agnostic

Applications don't know which AI provider is used:

```typescript
// Same code works with any provider
const response = await client.chatSend({
    messages,
    provider: 'anthropic',  // Can be 'ollama', 'openai', etc.
});
```

### 5. Type Safety

All packages are written in TypeScript with strict mode enabled. No `any` types unless absolutely necessary.

### 6. Extensibility

New features can be added without breaking existing APIs:

- New providers: Extend BaseProvider
- New context providers: Implement ContextProvider interface
- New tools: Implement Tool interface
- New apps: Install packages and build UI

## Extensibility Points

### Adding a New Provider

1. Extend `BaseProvider` in ai-core
2. Implement required methods
3. Register with `registerProvider()`
4. Use in applications without code changes

### Adding a New Context Provider

1. Implement `ContextProvider` interface
2. Inject into ChatEngine
3. Application-specific, no core changes needed

### Adding a New Application

1. Install ai-sdk and/or ai-core
2. Connect to ai-backend (or create own backend)
3. Build application-specific UI
4. Optionally provide custom context providers

## Benefits

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

### Testability

- Pure functions in shared-utils are easy to test
- Provider interface allows mocking
- No framework dependencies in ai-core

### Flexibility

- Swap providers without changing application code
- Add new apps without duplicating AI logic
- Customize per-app without affecting others

## Migration Strategy

### Phase 1: Package Creation (Current)
- ✅ Create shared-types
- ✅ Create shared-utils
- ✅ Create ai-core
- ✅ Create ai-sdk
- ✅ Add documentation

### Phase 2: Backend Migration
- Refactor ai-backend to use ai-core
- Keep existing API endpoints
- Maintain backward compatibility

### Phase 3: Frontend Migration
- Refactor ai-ui to use ai-sdk
- Keep existing UI components
- Maintain backward compatibility

### Phase 4: New Applications
- Build new apps using packages
- Demonstrate reusability

## Success Criteria

After full implementation:

1. ✅ New chat app can be created by installing ai-sdk + ai-core
2. ✅ No AI logic duplicated across apps
3. ✅ Provider can be switched by changing one config value
4. ✅ All apps share same type definitions
5. ✅ All apps share same business logic
6. ✅ Framework-agnostic core packages
7. ✅ Full TypeScript support
8. ✅ Comprehensive documentation

## Future Enhancements

- **Tool Calling**: Allow AI to use external tools
- **MCP (Model Context Protocol)**: Standardize tool integration
- **RAG (Retrieval-Augmented Generation)**: Add vector search
- **Agents**: Multi-step reasoning with tool use
- **Memory**: Long-term conversation memory
- **Analytics**: Usage tracking and insights
- **Multi-provider routing**: Intelligent provider selection
- **Caching**: Response caching for common queries
- **Rate limiting**: Built-in rate limiting in ai-core