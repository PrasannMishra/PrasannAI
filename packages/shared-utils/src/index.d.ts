/**
 * Shared Utility Functions for AI Platform
 * These utilities are used by both frontend (ai-sdk) and backend (ai-core)
 */
export declare function isValidProvider(provider: string): boolean;
export declare function validateChatMessage(message: unknown): message is {
    role: string;
    content: string;
};
export declare function sanitizePrompt(prompt: string): string;
export declare function clamp(value: number, min: number, max: number): number;
export declare function estimateTokenCount(text: string): number;
export declare function estimateMessagesTokenCount(messages: Array<{
    content: string;
}>): number;
export interface RetryOptions {
    maxAttempts: number;
    delay: number;
    backoffFactor?: number;
    retryableErrors?: string[];
}
export declare function withRetry<T>(operation: () => Promise<T>, options: RetryOptions): Promise<T>;
export declare function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void;
export declare function throttle<T extends (...args: unknown[]) => unknown>(func: T, limit: number): (...args: Parameters<T>) => void;
export declare function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T;
export declare function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
export declare function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
export declare function chunk<T>(array: T[], size: number): T[][];
export declare function unique<T>(array: T[]): T[];
export declare function groupBy<T, K extends string | number | symbol>(array: T[], keyFn: (item: T) => K): Record<K, T[]>;
export declare function truncate(str: string, maxLength: number, suffix?: string): string;
export declare function capitalize(str: string): string;
export declare function camelCase(str: string): string;
export declare function snakeCase(str: string): string;
export declare function formatDate(date: Date): string;
export declare function formatRelativeTime(date: Date): string;
export declare function generateId(prefix?: string): string;
export declare function generateConversationId(): string;
export declare function generateMessageId(): string;
export declare function createError(code: string, message: string, details?: Record<string, unknown>): Error & {
    code: string;
    details?: Record<string, unknown>;
};
export declare function isAIError(error: unknown): error is {
    code: string;
    message: string;
};
export declare function parallel<T>(tasks: Array<() => Promise<T>>, concurrency?: number): Promise<T[]>;
export declare function sequential<T>(tasks: Array<() => Promise<T>>): Promise<T[]>;
export declare function getEnvVar(name: string, defaultValue?: string): string;
export declare function getEnvVarAsNumber(name: string, defaultValue?: number): number;
export declare function getEnvVarAsBoolean(name: string, defaultValue?: boolean): boolean;
//# sourceMappingURL=index.d.ts.map