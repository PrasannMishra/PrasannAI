# @ai-platform/shared-utils

Shared utility functions for the AI Platform.

## Purpose

This package contains reusable utility functions used by both frontend (ai-sdk) and backend (ai-core) packages. It provides common functionality that doesn't depend on framework-specific code.

## Installation

```bash
npm install @ai-platform/shared-utils
```

## Usage

```typescript
import { sanitizePrompt, estimateTokenCount, withRetry } from '@ai-platform/shared-utils';

const cleanPrompt = sanitizePrompt('  Hello   World  ');
const tokens = estimateTokenCount('Hello, how are you?');

const result = await withRetry(
    async () => await fetchData(),
    {
        maxAttempts: 3,
        delay: 1000,
        backoffFactor: 2,
    }
);
```

## Key Utilities

### Validation
- `isValidProvider(provider)` - Validate provider name
- `validateChatMessage(message)` - Type guard for chat messages
- `sanitizePrompt(prompt)` - Clean and normalize prompts
- `clamp(value, min, max)` - Clamp value to range

### Token Estimation
- `estimateTokenCount(text)` - Estimate token count for text
- `estimateMessagesTokenCount(messages)` - Estimate tokens for messages

### Retry Logic
- `withRetry(operation, options)` - Execute operation with retry logic
  - Configurable max attempts, delay, and backoff
  - Retryable error types
  - Exponential backoff support

### Debounce & Throttle
- `debounce(func, wait)` - Debounce function calls
- `throttle(func, limit)` - Throttle function calls

### Object Utilities
- `deepMerge(target, source)` - Deep merge objects
- `omit(obj, keys)` - Omit keys from object
- `pick(obj, keys)` - Pick keys from object

### Array Utilities
- `chunk(array, size)` - Split array into chunks
- `unique(array)` - Remove duplicates from array
- `groupBy(array, keyFn)` - Group array by key function

### String Utilities
- `truncate(str, maxLength, suffix)` - Truncate string
- `capitalize(str)` - Capitalize string
- `camelCase(str)` - Convert to camelCase
- `snakeCase(str)` - Convert to snake_case

### Date Utilities
- `formatDate(date)` - Format date as ISO string
- `formatRelativeTime(date)` - Format as relative time (e.g., "2 hours ago")

### ID Generation
- `generateId(prefix)` - Generate unique ID
- `generateConversationId()` - Generate conversation ID
- `generateMessageId()` - Generate message ID

### Error Utilities
- `createError(code, message, details)` - Create structured error
- `isAIError(error)` - Type guard for AI errors

### Async Utilities
- `parallel(tasks, concurrency)` - Run tasks in parallel
- `sequential(tasks)` - Run tasks sequentially

### Environment Utilities
- `getEnvVar(name, defaultValue)` - Get environment variable
- `getEnvVarAsNumber(name, defaultValue)` - Get env var as number
- `getEnvVarAsBoolean(name, defaultValue)` - Get env var as boolean

## Design Principles

- **Framework Agnostic**: Works in Node.js and browser environments
- **Tree Shakable**: Import only what you need
- **Type Safe**: Full TypeScript support
- **Zero Dependencies**: No external dependencies

## Notes

- This package has no external dependencies
- Utilities are designed to be pure functions where possible
- All functions are thoroughly typed