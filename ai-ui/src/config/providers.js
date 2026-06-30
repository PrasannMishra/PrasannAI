/**
 * Provider configuration
 * Manages the list of available AI providers
 */

export const PROVIDERS = [
    { label: 'Ollama', value: 'ollama' },
    { label: 'Anthropic', value: 'anthropic' },
    { label: 'OpenAI-compatible', value: 'openai-compatible' },
];

export const DEFAULT_PROVIDER = 'ollama';
export const DEFAULT_MODEL = 'qwen2.5:3b';
