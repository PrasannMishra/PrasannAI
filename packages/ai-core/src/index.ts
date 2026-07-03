/**
 * AI Core Package
 * Provider-agnostic AI engine for the AI Platform
 *
 * This package contains:
 * - Provider implementations (Anthropic, Ollama, OpenAI-compatible)
 * - Model factory for creating provider instances
 * - AI service for completion logic
 * - Business logic for AI interactions
 *
 * This package should NOT contain:
 * - HTTP/Express/NestJS logic
 * - Database operations
 * - React/UI components
 * - Framework-specific code
 */

// Providers
export { BaseProvider } from './providers/baseProvider.js';
export { AnthropicProvider } from './providers/anthropicProvider.js';
export { OllamaProvider } from './providers/ollamaProvider.js';
export { OpenAICompatibleProvider } from './providers/openaiCompatibleProvider.js';

// Model Factory
export {
    registerProvider,
    createProvider,
    getRegisteredProviders,
    isProviderRegistered,
} from './modelFactory.js';

// Services
export { AIService, normalizeCompletionRequest, buildCompletionResponse } from './services/aiService.js';
export type { AIServiceConfig } from './services/aiService.js';