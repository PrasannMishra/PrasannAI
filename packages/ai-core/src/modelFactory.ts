import type { ProviderConfig } from '@ai-platform/shared-types';
import { BaseProvider } from './providers/baseProvider.js';
import { AnthropicProvider } from './providers/anthropicProvider.js';
import { OllamaProvider } from './providers/ollamaProvider.js';
import { OpenAICompatibleProvider } from './providers/openaiCompatibleProvider.js';

const providers = new Map<string, new (config: ProviderConfig) => BaseProvider>();

/**
 * Register a provider with the factory
 */
export function registerProvider(name: string, ProviderClass: new (config: ProviderConfig) => BaseProvider): void {
    providers.set(name.toLowerCase(), ProviderClass);
}

// Register built-in providers
registerProvider('ollama', OllamaProvider);
registerProvider('anthropic', AnthropicProvider);
registerProvider('openai-compatible', OpenAICompatibleProvider);
registerProvider('openai', OpenAICompatibleProvider);

/**
 * Create a provider instance from configuration
 */
export function createProvider(config: ProviderConfig = {}): BaseProvider {
    const providerName = (config.type || 'ollama').toLowerCase();
    const ProviderClass = providers.get(providerName);

    if (!ProviderClass) {
        const availableProviders = Array.from(providers.keys()).join(', ');
        throw new Error(
            `Unknown provider '${providerName}'. ` +
            `Available providers: ${availableProviders}. ` +
            `Register it with registerProvider() if it's a custom provider.`
        );
    }

    return new ProviderClass(config);
}

/**
 * Get list of registered provider names
 */
export function getRegisteredProviders(): string[] {
    return Array.from(providers.keys());
}

/**
 * Check if a provider is registered
 */
export function isProviderRegistered(name: string): boolean {
    return providers.has(name.toLowerCase());
}