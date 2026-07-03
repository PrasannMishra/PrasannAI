/**
 * Shared Utility Functions for AI Platform
 * These utilities are used by both frontend (ai-sdk) and backend (ai-core)
 */

// ============================================================================
// Validation Utilities
// ============================================================================

export function isValidProvider(provider: string): boolean {
    const validProviders = ['anthropic', 'ollama', 'openai-compatible', 'openai', 'gemini'];
    return validProviders.includes(provider.toLowerCase());
}

export function validateChatMessage(message: unknown): message is { role: string; content: string } {
    if (typeof message !== 'object' || message === null) {
        return false;
    }

    const msg = message as Record<string, unknown>;
    return (
        typeof msg.role === 'string' &&
        ['user', 'assistant', 'system'].includes(msg.role) &&
        typeof msg.content === 'string'
    );
}

export function sanitizePrompt(prompt: string): string {
    return prompt.trim().replace(/\s+/g, ' ');
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

// ============================================================================
// Token Estimation Utilities
// ============================================================================

export function estimateTokenCount(text: string): number {
    // Rough estimation: ~4 characters per token for English text
    // This is a simplified version - production would use actual tokenizer
    return Math.ceil(text.length / 4);
}

export function estimateMessagesTokenCount(messages: Array<{ content: string }>): number {
    return messages.reduce((total, message) => {
        return total + estimateTokenCount(message.content);
    }, 0);
}

// ============================================================================
// Retry Utilities
// ============================================================================

export interface RetryOptions {
    maxAttempts: number;
    delay: number;
    backoffFactor?: number;
    retryableErrors?: string[];
}

export async function withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions
): Promise<T> {
    const { maxAttempts, delay, backoffFactor = 2, retryableErrors = ['NETWORK_ERROR', 'TIMEOUT'] } = options;

    let lastError: Error | null = null;
    let currentDelay = delay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;

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

function extractErrorCode(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
        const err = error as { code?: string; name?: string };
        return err.code || err.name || 'UNKNOWN_ERROR';
    }
    return 'UNKNOWN_ERROR';
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Debounce and Throttle Utilities
// ============================================================================

export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func(...args);
            timeoutId = null;
        }, wait);
    };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return (...args: Parameters<T>) => {
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

export function deepMerge<T extends Record<string, unknown>>(
    target: T,
    source: Partial<T>
): T {
    const result = { ...target };

    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const sourceValue = source[key];
            const targetValue = result[key];

            if (
                typeof sourceValue === 'object' &&
                sourceValue !== null &&
                !Array.isArray(sourceValue) &&
                typeof targetValue === 'object' &&
                targetValue !== null &&
                !Array.isArray(targetValue)
            ) {
                result[key] = deepMerge(
                    targetValue as Record<string, unknown>,
                    sourceValue as Record<string, unknown>
                ) as T[Extract<keyof T, string>];
            } else if (sourceValue !== undefined) {
                result[key] = sourceValue as T[Extract<keyof T, string>];
            }
        }
    }

    return result;
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> {
    const result = { ...obj };

    for (const key of keys) {
        delete result[key];
    }

    return result;
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> {
    const result = {} as Pick<T, K>;

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

export function chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];

    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }

    return chunks;
}

export function unique<T>(array: T[]): T[] {
    return Array.from(new Set(array));
}

export function groupBy<T, K extends string | number | symbol>(
    array: T[],
    keyFn: (item: T) => K
): Record<K, T[]> {
    return array.reduce((result, item) => {
        const key = keyFn(item);
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push(item);
        return result;
    }, {} as Record<K, T[]>);
}

// ============================================================================
// String Utilities
// ============================================================================

export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength - suffix.length) + suffix;
}

export function capitalize(str: string): string {
    if (str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function camelCase(str: string): string {
    return str
        .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
        .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

export function snakeCase(str: string): string {
    return str
        .replace(/([A-Z])/g, '_$1')
        .replace(/[-\s]+/g, '_')
        .toLowerCase()
        .replace(/^_/, '');
}

// ============================================================================
// Date Utilities
// ============================================================================

export function formatDate(date: Date): string {
    return date.toISOString();
}

export function formatRelativeTime(date: Date): string {
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

export function generateId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 9);
    const id = `${timestamp}-${randomPart}`;

    return prefix ? `${prefix}_${id}` : id;
}

export function generateConversationId(): string {
    return generateId('conv');
}

export function generateMessageId(): string {
    return generateId('msg');
}

// ============================================================================
// Error Utilities
// ============================================================================

export function createError(
    code: string,
    message: string,
    details?: Record<string, unknown>
): Error & { code: string; details?: Record<string, unknown> } {
    const error = new Error(message) as Error & { code: string; details?: Record<string, unknown> };
    error.code = code;
    error.details = details;
    return error;
}

export function isAIError(error: unknown): error is { code: string; message: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as { code: unknown }).code === 'string' &&
        'message' in error &&
        typeof (error as { message: unknown }).message === 'string'
    );
}

// ============================================================================
// Async Utilities
// ============================================================================

export async function parallel<T>(
    tasks: Array<() => Promise<T>>,
    concurrency: number = 5
): Promise<T[]> {
    const results: T[] = [];
    const executing: Array<Promise<T>> = [];

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

export async function sequential<T>(
    tasks: Array<() => Promise<T>>
): Promise<T[]> {
    const results: T[] = [];

    for (const task of tasks) {
        results.push(await task());
    }

    return results;
}

// ============================================================================
// Environment Utilities
// ============================================================================

export function getEnvVar(name: string, defaultValue?: string): string {
    const value = process.env[name];
    if (value === undefined) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${name} is not set`);
    }
    return value;
}

export function getEnvVarAsNumber(name: string, defaultValue?: number): number {
    const value = getEnvVar(name, defaultValue?.toString());
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${name} is not a valid number: ${value}`);
    }

    return parsed;
}

export function getEnvVarAsBoolean(name: string, defaultValue?: boolean): boolean {
    const value = getEnvVar(name, defaultValue?.toString());
    return value.toLowerCase() === 'true';
}

// ============================================================================
// Signal Utilities
// ============================================================================

export function combineSignals(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    const abort = () => controller.abort();

    for (const signal of signals) {
        if (signal.aborted) {
            controller.abort();
            break;
        }
        signal.addEventListener('abort', abort);
    }

    return controller.signal;
}
