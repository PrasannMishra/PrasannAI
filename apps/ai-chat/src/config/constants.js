/**
 * Application constants
 */

export const DEFAULT_SETTINGS = {
    maxTokens: 500,
    temperature: 0.7,
};

export const INPUT_CONSTRAINTS = {
    maxTokens: { min: 1, default: 500 },
    temperature: { min: 0, max: 1, step: 0.1, default: 0.7 },
};

export const API_CONFIG = {
    baseUrl: (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, ''),
    endpoint: '/chat',
    method: 'POST',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT || 300000),
};

export const UI_TEXT = {
    PROMPT_PLACEHOLDER: 'Type your prompt here...',
    CHAR_COUNT: 'characters',
    PROVIDER_LABEL: 'Provider',
    MODEL_LABEL: 'Model',
    MAX_TOKENS_LABEL: 'Max Tokens',
    MAX_TOKENS_HINT: 'Maximum length of the response',
    TEMPERATURE_LABEL: 'Temperature',
    TEMPERATURE_HINT: '0=focused, 1=creative',
    SUBMIT_BTN: '✨ Generate Response',
    SUBMIT_LOADING: 'Generating...',
    RESPONSE_HEADER: '✅ Response',
    COPY_BTN: '📋 Copy',
    COPY_SUCCESS: '✓ Copied!',
    ERROR_HEADER: '⚠️ Error',
    EMPTY_STATE: '👈 Fill out the form and click "Generate Response" to get started.',
    LOADING_STATE: 'Generating response...',
    VALIDATION_ERROR: 'Please enter a prompt.',
    REQUEST_ERROR: 'Request failed',
    NETWORK_ERROR: 'Network error',
};
