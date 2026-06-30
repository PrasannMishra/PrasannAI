import { loadConfig } from './config.js';
import { AnthropicProvider } from './providers/anthropicProvider.js';
import { OllamaProvider } from './providers/ollamaProvider.js';
import { OpenAICompatibleProvider } from './providers/openaiCompatibleProvider.js';

const providers = new Map();

export function registerProvider(name, ProviderClass) {
    providers.set(name.toLowerCase(), ProviderClass);
    return ProviderClass;
}

registerProvider('ollama', OllamaProvider);
registerProvider('anthropic', AnthropicProvider);
registerProvider('openai-compatible', OpenAICompatibleProvider);

export function createModelProvider(config = loadConfig()) {
    const providerName = (config?.provider || 'ollama').toLowerCase();
    const ProviderClass = providers.get(providerName);

    if (!ProviderClass) {
        throw new Error(`Unknown provider '${providerName}'. Register it with registerProvider().`);
    }

    return new ProviderClass(config);
}
