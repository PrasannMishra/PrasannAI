# @ai-platform/shared-types

Shared TypeScript type definitions for the AI Platform.

## Purpose

This package contains all TypeScript interfaces and types used across the AI Platform. It ensures type safety and consistency between frontend (ai-sdk) and backend (ai-core) packages.

## Installation

```bash
npm install @ai-platform/shared-types
```

## Usage

```typescript
import type { ChatMessage, ProviderType, CompletionRequest } from '@ai-platform/shared-types';

const message: ChatMessage = {
    role: 'user',
    content: 'Hello, AI!',
};

const request: CompletionRequest = {
    mode: 'chat',
    provider: 'anthropic',
    messages: [message],
    options: {
        maxTokens: 100,
        temperature: 0.7,
    },
};
```

## Key Types

### Core Types
- `ChatMessage` - Message structure for conversations
- `Conversation` - Conversation container with metadata
- `ProviderType` - Supported AI providers
- `ProviderConfig` - Provider configuration

### Completion Types
- `CompletionRequest` - Request structure for AI completions
- `CompletionResponse` - Response structure from AI providers
- `CompletionOptions` - Options for controlling generation
- `CompletionMetadata` - Metadata about the completion

### Streaming Types
- `StreamEvent` - Event structure for streaming responses
- `StreamEventType` - Types of stream events
- `StreamChunk` - Individual chunk in a stream

### Context Types
- `ContextProvider` - Interface for context providers
- `ContextOptions` - Options for context building
- `ContextResult` - Result from context provider

### Error Types
- `AIError` - Error structure
- `AIErrorCode` - Error code enumeration

### Future Types
- `Tool` / `ToolCall` / `ToolResult` - Tool calling support
- `Agent` / `AgentStep` - Agent support
- `Memory` - Memory management
- `Document` / `SearchResult` / `RAGConfig` - RAG support

## Design Principles

- **Framework Agnostic**: Types work with any framework or runtime
- **Versioned**: Types are versioned with the platform
- **Strict**: All types are strictly defined with no `any` types
- **Extensible**: Easy to extend for future features

## Notes

- This package has no dependencies
- It only contains TypeScript type definitions
- Both frontend and backend applications depend on this package