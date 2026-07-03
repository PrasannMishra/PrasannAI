import { createProvider, registerProvider } from '@ai-platform/ai-core';
import { loadConfig } from './config.js';

// Re-export for backward compatibility
export { registerProvider, createProvider };

// Create a convenience function that matches the old API
export function createModelProvider(config = loadConfig()) {
    return createProvider(config);
}
