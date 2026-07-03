# @ai-platform/ai-sdk

Frontend SDK for AI Platform - Type-safe API for AI interactions. This package is used by ai-ui and other frontend applications to communicate with the AI backend.

## Purpose

This package provides a clean, type-safe API for frontend applications to interact with the AI backend. It abstracts away HTTP details, streaming protocols, and error handling, allowing applications to focus on UI/UX.

## Installation

```bash
npm install @ai-platform/ai-sdk
```

## Usage

```typescript
import { AIClient } from '@ai-platform/ai-sdk';

// Create client
const client = new AIClient({
    baseUrl: 'http://localhost:8080',
    defaultProvider: 'anthropic',
    defaultModel: 'claude-sonnet-4-5',
    timeout: 30000,
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

## React Hook

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
        onError: (error) => console.error('Chat error:', error),
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
            <button onClick={clear}>Clear</button>
        </div>
    );
}
```

## Key Components

### AIClient

Main client class for AI interactions:

- `chatSend(params)` - Send chat message, get complete response
- `chatStream(params)` - Send chat message, stream response
- `textSend(params)` - Generate text from prompt
- `textStream(params)` - Stream text generation
- `abort(requestId)` - Abort specific request
- `abortAll()` - Abort all pending requests

### useChat Hook

React hook for chat functionality:

- `messages` - Array of chat messages
- `isLoading` - Loading state
- `error` - Error object if any
- `send(messages)` - Send messages and get response
- `stream(messages, onChunk)` - Stream response with chunk callback
- `stop()` - Stop current generation
- `clear()` - Clear messages and stop

## Features

### Streaming Support

```typescript
for await (const event of client.chatStream({ messages })) {
    switch (event.type) {
        case 'chunk':
            console.log('Chunk:', event.content);
            break;
        case 'done':
            console.log('Complete:', event.metadata);
            break;
        case 'error':
            console.error('Error:', event.error);
            break;
        case 'stopped':
            console.log('Stopped by user');
            break;
    }
}
```

### AbortController

```typescript
const controller = new AbortController();

const response = await client.chatSend({
    messages,
    signal: controller.signal,
});

// Abort the request
controller.abort();
```

### Error Handling

```typescript
try {
    const response = await client.chatSend({ messages });
} catch (error) {
    console.error('Request failed:', error.message);
}
```

### Type Safety

All APIs are fully typed with TypeScript:

```typescript
const messages: ChatMessage[] = [
    { role: 'user', content: 'Hello' }
];

const response: CompletionResponse = await client.chatSend({ messages });
// response.output is typed as string
// response.provider is typed as ProviderType
// response.metadata is typed as CompletionMetadata
```

## Architecture

```
Application (React, Vue, Svelte, etc.)
         ↓
   React Hooks (useChat, useStreaming)
         ↓
   AIClient
         ↓
   HTTP/Streaming Layer
         ↓
   AI Backend API
```

## Design Principles

- **Framework Agnostic Core**: AIClient works with any framework
- **React Hooks Optional**: Hooks are provided for React apps, but AIClient can be used directly
- **Type Safe**: Full TypeScript support
- **Abort Support**: Proper AbortController integration
- **Error Normalization**: Consistent error handling
- **No Business Logic**: SDK only handles communication, not AI logic

## What's NOT Included

This package intentionally excludes:

- AI business logic (that's in ai-core)
- Provider implementations (that's in ai-core)
- UI components
- State management
- Routing

## Configuration

```typescript
const client = new AIClient({
    baseUrl: string,           // Required: API base URL
    timeout?: number,          // Optional: Request timeout (default: 30000)
    headers?: Record<string, string>,  // Optional: Custom headers
    retryAttempts?: number,    // Optional: Retry attempts (default: 3)
    retryDelay?: number,       // Optional: Retry delay (default: 1000)
    defaultProvider?: ProviderType,   // Optional: Default provider
    defaultModel?: string,     // Optional: Default model
    defaultMaxTokens?: number, // Optional: Default max tokens
    defaultTemperature?: number, // Optional: Default temperature
});
```

## Dependencies

- `@ai-platform/shared-types` - Type definitions
- `@ai-platform/shared-utils` - Utility functions

## Notes

- This package is framework-agnostic at its core
- React hooks require React 16.8+
- All streaming uses AsyncGenerators for modern JavaScript support
- AbortController is used for request cancellation
- Error normalization provides consistent error format across providers