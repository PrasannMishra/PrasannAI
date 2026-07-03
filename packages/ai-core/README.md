# @ai-platform/ai-core

Core AI engine - Provider-agnostic AI logic for the AI Platform. This package is used by ai-backend and other backend applications to interact with AI providers.

## Purpose

This package contains the core AI business logic for the AI Platform. It provides provider-agnostic AI interactions that can be used by any backend application. It has NO dependencies on web frameworks, databases, or UI libraries.

## Installation

```bash
npm install @ai-platform/ai-core
```

## Usage

```typescript
import { createProvider, AIService, normalizeCompletionRequest } from '@ai-platform/ai-core';

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

## Key Components

### Providers

Provider implementations for different AI services:

- `BaseProvider` - Abstract base class for all providers
- `AnthropicProvider` - Anthropic Claude implementation
- `OllamaProvider` - Ollama local LLM implementation
- `OpenAICompatibleProvider` - OpenAI-compatible API implementation

All providers implement the same interface:
- `generateText(prompt, options)` - Generate text from prompt
- `generateTextStream(prompt, options)` - Stream text generation
- `generateChat(messages, options)` - Generate from chat messages
- `generateChatStream(messages, options)` - Stream from chat messages

### Model Factory

Factory for creating provider instances:

- `createProvider(config)` - Create provider from configuration
- `registerProvider(name, ProviderClass)` - Register custom provider
- `getRegisteredProviders()` - Get list of registered providers
- `isProviderRegistered(name)` - Check if provider is registered

### AI Service

Core business logic for AI interactions:

- `AIService` - Main service class for completions
- `normalizeCompletionRequest(payload, defaults)` - Normalize request format
- `buildCompletionResponse(...)` - Build standardized response

## Architecture

```
Applications (Express, NestJS, Fastify, etc.)
         ↓
   AI Service
         ↓
   Model Factory
         ↓
   Provider Interface
         ↓
   Provider Implementation (Anthropic, Ollama, OpenAI, etc.)
         ↓
   AI Provider API
```

## Design Principles

- **Framework Agnostic**: Works with Express, NestJS, Fastify, or any backend framework
- **Provider Agnostic**: Switch between AI providers without changing application code
- **No Side Effects**: No database, no HTTP server, no framework dependencies
- **Type Safe**: Full TypeScript support with strict typing
- **Testable**: Pure functions and dependency injection for easy testing

## What's NOT Included

This package intentionally excludes:

- HTTP server code (Express, Fastify, etc.)
- Database operations
- Authentication/Authorization
- Logging/Monitoring
- Caching
- Rate limiting

These concerns should be handled by the application layer (ai-backend).

## Extending

### Adding a Custom Provider

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

// Use it
const provider = createProvider({ type: 'custom' });
```

## Dependencies

- `@ai-platform/shared-types` - Type definitions
- `@ai-platform/shared-utils` - Utility functions
- `@anthropic-ai/sdk` (optional) - Anthropic SDK

## Notes

- This is a pure TypeScript package
- Providers handle their own API communication
- All async operations return Promises or AsyncGenerators
- Error handling is done through standard Error objects