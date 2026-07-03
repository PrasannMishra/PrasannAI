/**
 * AI SDK Package
 * Frontend SDK for AI Platform
 *
 * This package provides:
 * - AIClient: Type-safe client for AI API interactions
 * - React hooks: useChat, useStreaming, etc.
 * - Streaming support with AbortController
 * - Error normalization and retry logic
 *
 * Applications should use this SDK instead of direct fetch calls
 */

// Client
export { AIClient } from './client/aiClient.js';
export type { AIClientConfig } from './client/aiClient.js';

// Hooks
export { useChat } from './hooks/useChat.js';
export type { UseChatOptions, UseChatReturn } from './hooks/useChat.js';