/**
 * Shared Utility Functions for AI Platform
 * These utilities are used by both frontend (ai-sdk) and backend (ai-core)
 */
// ============================================================================
// Validation Utilities
// ============================================================================
export function isValidProvider(provider) {
    const validProviders = ['anthropic', 'ollama', 'openai-compatible', 'openai', 'gemini'];
    return validProviders.includes(provider.toLowerCase());
}
export function validateChatMessage(message) {
    if (typeof message !== 'object' || message === null) {
        return false;
    }
    const msg = message;
    return (typeof msg.role === 'string' &&
        ['user', 'assistant', 'system'].includes(msg.role) &&
        typeof msg.content === 'string');
}
export function sanitizePrompt(prompt) {
    return prompt.trim().replace(/\s+/g, ' ');
}
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
// ============================================================================
// Token Estimation Utilities
// ============================================================================
export function estimateTokenCount(text) {
    // Rough estimation: ~4 characters per token for English text
    // This is a simplified version - production would use actual tokenizer
    return Math.ceil(text.length / 4);
}
export function estimateMessagesTokenCount(messages) {
    return messages.reduce((total, message) => {
        return total + estimateTokenCount(message.content);
    }, 0);
}
export async function withRetry(operation, options) {
    const { maxAttempts, delay, backoffFactor = 2, retryableErrors = ['NETWORK_ERROR', 'TIMEOUT'] } = options;
    let lastError = null;
    let currentDelay = delay;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            const errorCode = extractErrorCode(error);
            const shouldRetry = attempt < maxAttempts && retryableErrors.includes(errorCode);
            if (!shouldRetry) {
                throw error;
            }
            // Wait before retrying
            await sleep(currentDelay);
            currentDelay *= backoffFactor;
        }
    }
    throw lastError || new Error('Max retry attempts exceeded');
}
function extractErrorCode(error) {
    if (typeof error === 'object' && error !== null) {
        const err = error;
        return err.code || err.name || 'UNKNOWN_ERROR';
    }
    return 'UNKNOWN_ERROR';
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// ============================================================================
// Debounce and Throttle Utilities
// ============================================================================
export function debounce(func, wait) {
    let timeoutId = null;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
            timeoutId = null;
        }, wait);
    };
}
export function throttle(func, limit) {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}
// ============================================================================
// Object Utilities
// ============================================================================
export function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const sourceValue = source[key];
            const targetValue = result[key];
            if (typeof sourceValue === 'object' &&
                sourceValue !== null &&
                !Array.isArray(sourceValue) &&
                typeof targetValue === 'object' &&
                targetValue !== null &&
                !Array.isArray(targetValue)) {
                result[key] = deepMerge(targetValue, sourceValue);
            }
            else if (sourceValue !== undefined) {
                result[key] = sourceValue;
            }
        }
    }
    return result;
}
export function omit(obj, keys) {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}
export function pick(obj, keys) {
    const result = {};
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = obj[key];
        }
    }
    return result;
}
// ============================================================================
// Array Utilities
// ============================================================================
export function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
export function unique(array) {
    return Array.from(new Set(array));
}
export function groupBy(array, keyFn) {
    return array.reduce((result, item) => {
        const key = keyFn(item);
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push(item);
        return result;
    }, {});
}
// ============================================================================
// String Utilities
// ============================================================================
export function truncate(str, maxLength, suffix = '...') {
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength - suffix.length) + suffix;
}
export function capitalize(str) {
    if (str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
export function camelCase(str) {
    return str
        .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
        .replace(/^[A-Z]/, (char) => char.toLowerCase());
}
export function snakeCase(str) {
    return str
        .replace(/([A-Z])/g, '_$1')
        .replace(/[-\s]+/g, '_')
        .toLowerCase()
        .replace(/^_/, '');
}
// ============================================================================
// Date Utilities
// ============================================================================
export function formatDate(date) {
    return date.toISOString();
}
export function formatRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) {
        return 'just now';
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}
// ============================================================================
// ID Generation
// ============================================================================
export function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 9);
    const id = `${timestamp}-${randomPart}`;
    return prefix ? `${prefix}_${id}` : id;
}
export function generateConversationId() {
    return generateId('conv');
}
export function generateMessageId() {
    return generateId('msg');
}
// ============================================================================
// Error Utilities
// ============================================================================
export function createError(code, message, details) {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    return error;
}
export function isAIError(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof error.code === 'string' &&
        'message' in error &&
        typeof error.message === 'string');
}
// ============================================================================
// Async Utilities
// ============================================================================
export async function parallel(tasks, concurrency = 5) {
    const results = [];
    const executing = [];
    for (const task of tasks) {
        const promise = task();
        executing.push(promise);
        results.push(await promise);
        if (executing.length >= concurrency) {
            await Promise.race(executing);
            // Remove completed promises
            executing.splice(0, executing.length);
        }
    }
    await Promise.all(executing);
    return results;
}
export async function sequential(tasks) {
    const results = [];
    for (const task of tasks) {
        results.push(await task());
    }
    return results;
}
// ============================================================================
// Environment Utilities
// ============================================================================
export function getEnvVar(name, defaultValue) {
    const value = process.env[name];
    if (value === undefined) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${name} is not set`);
    }
    return value;
}
export function getEnvVarAsNumber(name, defaultValue) {
    const value = getEnvVar(name, defaultValue?.toString());
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${name} is not a valid number: ${value}`);
    }
    return parsed;
}
export function getEnvVarAsBoolean(name, defaultValue) {
    const value = getEnvVar(name, defaultValue?.toString());
    return value.toLowerCase() === 'true';
}
//# sourceMappingURL=index.js.map