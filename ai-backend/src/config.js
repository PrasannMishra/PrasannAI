import dotenv from 'dotenv';

dotenv.config();

function normalizeOrigins(value) {
    if (Array.isArray(value)) {
        return value.map((item) => item.trim()).filter(Boolean);
    }

    return (value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

export function loadConfig(overrides = {}) {
    const baseConfig = {
        provider: overrides.provider || process.env.MODEL_PROVIDER || 'ollama',
        ollama: {
            baseUrl: overrides.ollama?.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
            model: overrides.ollama?.model || process.env.OLLAMA_MODEL || 'qwen2.5:3b',
        },
        anthropic: {
            apiKey: overrides.anthropic?.apiKey || process.env.ANTHROPIC_API_KEY || '',
            model: overrides.anthropic?.model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
        },
        openaiCompatible: {
            baseUrl: overrides.openaiCompatible?.baseUrl || process.env.OPENAI_COMPATIBLE_BASE_URL || 'http://localhost:1234/v1',
            model: overrides.openaiCompatible?.model || process.env.OPENAI_COMPATIBLE_MODEL || 'local-model',
            apiKey: overrides.openaiCompatible?.apiKey || process.env.OPENAI_COMPATIBLE_API_KEY || 'dummy-key',
        },
        defaults: {
            maxTokens: Number(overrides.defaults?.maxTokens || process.env.MAX_TOKENS || 500),
            temperature: Number(overrides.defaults?.temperature || process.env.TEMPERATURE || 0.7),
        },
        server: {
            host: overrides.server?.host || process.env.SERVER_HOST || '0.0.0.0',
            port: Number(overrides.server?.port || process.env.SERVER_PORT || 3000),
            allowedOrigins: normalizeOrigins(overrides.server?.allowedOrigins || process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173'),
        },
    };

    return {
        ...baseConfig,
        ...overrides,
        ollama: {
            ...baseConfig.ollama,
            ...(overrides.ollama || {}),
        },
        anthropic: {
            ...baseConfig.anthropic,
            ...(overrides.anthropic || {}),
        },
        openaiCompatible: {
            ...baseConfig.openaiCompatible,
            ...(overrides.openaiCompatible || {}),
        },
        defaults: {
            ...baseConfig.defaults,
            ...(overrides.defaults || {}),
        },
        server: {
            ...baseConfig.server,
            ...(overrides.server || {}),
        },
    };
}
