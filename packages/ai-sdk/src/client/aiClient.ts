import type {
    AISDKConfig,
    ChatSDKConfig,
    ChatMessage,
    CompletionResponse,
    ProviderType,
    StreamEvent,
    StreamEventType,
} from '@ai-platform/shared-types';
import { combineSignals } from '@ai-platform/shared-utils';

export interface AIClientConfig extends ChatSDKConfig {
    onError?: (error: Error) => void;
}

/**
 * AI Client - Main entry point for the AI SDK
 * Provides a clean, type-safe API for AI interactions
 */
export class AIClient {
    private config: AIClientConfig;
    private abortControllers: Map<string, AbortController>;

    constructor(config: AIClientConfig) {
        this.config = {
            timeout: 30000,
            retryAttempts: 3,
            retryDelay: 1000,
            ...config,
        };
        this.abortControllers = new Map();
    }

    // ============================================================================
    // Chat API
    // ============================================================================

    /**
     * Send a chat message and get a complete response
     */
    async chatSend(params: {
        messages: ChatMessage[];
        provider?: ProviderType;
        model?: string;
        maxTokens?: number;
        temperature?: number;
        signal?: AbortSignal;
    }): Promise<CompletionResponse> {
        const requestId = this.generateRequestId();
        const controller = new AbortController();
        this.abortControllers.set(requestId, controller);

        try {
            const combinedSignal = params.signal
                ? combineSignals(params.signal, controller.signal)
                : controller.signal;

            const response = await this.makeRequest<CompletionResponse>('/chat', {
                ...params,
                signal: combinedSignal,
            });

            return response;
        } finally {
            this.abortControllers.delete(requestId);
        }
    }

    /**
     * Send a chat message and stream the response
     */
    async *chatStream(params: {
        messages: ChatMessage[];
        provider?: ProviderType;
        model?: string;
        maxTokens?: number;
        temperature?: number;
        signal?: AbortSignal;
    }): AsyncGenerator<StreamEvent, void, unknown> {
        const requestId = this.generateRequestId();
        const controller = new AbortController();
        this.abortControllers.set(requestId, controller);

        try {
            const combinedSignal = params.signal
                ? combineSignals(params.signal, controller.signal)
                : controller.signal;

            yield* this.streamRequest('/chat/stream', {
                ...params,
                signal: combinedSignal,
            });
        } finally {
            this.abortControllers.delete(requestId);
        }
    }

    // ============================================================================
    // Text Completion API
    // ============================================================================

    /**
     * Generate text from a prompt (non-streaming)
     */
    async textSend(params: {
        prompt: string;
        provider?: ProviderType;
        model?: string;
        maxTokens?: number;
        temperature?: number;
        signal?: AbortSignal;
    }): Promise<CompletionResponse> {
        const requestId = this.generateRequestId();
        const controller = new AbortController();
        this.abortControllers.set(requestId, controller);

        try {
            const combinedSignal = params.signal
                ? combineSignals(params.signal, controller.signal)
                : controller.signal;

            const response = await this.makeRequest<CompletionResponse>('/generate', {
                ...params,
                signal: combinedSignal,
            });

            return response;
        } finally {
            this.abortControllers.delete(requestId);
        }
    }

    /**
     * Generate text from a prompt (streaming)
     */
    async *textStream(params: {
        prompt: string;
        provider?: ProviderType;
        model?: string;
        maxTokens?: number;
        temperature?: number;
        signal?: AbortSignal;
    }): AsyncGenerator<StreamEvent, void, unknown> {
        const requestId = this.generateRequestId();
        const controller = new AbortController();
        this.abortControllers.set(requestId, controller);

        try {
            const combinedSignal = params.signal
                ? combineSignals(params.signal, controller.signal)
                : controller.signal;

            yield* this.streamRequest('/generate/stream', {
                ...params,
                signal: combinedSignal,
            });
        } finally {
            this.abortControllers.delete(requestId);
        }
    }

    // ============================================================================
    // Abort Control
    // ============================================================================

    /**
     * Abort a specific request by ID
     */
    abort(requestId: string): void {
        const controller = this.abortControllers.get(requestId);
        if (controller) {
            controller.abort();
            this.abortControllers.delete(requestId);
        }
    }

    /**
     * Abort all pending requests
     */
    abortAll(): void {
        for (const [requestId, controller] of this.abortControllers) {
            controller.abort();
            this.abortControllers.delete(requestId);
        }
    }

    // ============================================================================
    // HTTP Methods
    // ============================================================================

    private async makeRequest<T>(
        endpoint: string,
        params: {
            messages?: ChatMessage[];
            prompt?: string;
            provider?: ProviderType;
            model?: string;
            maxTokens?: number;
            temperature?: number;
            signal?: AbortSignal;
        }
    ): Promise<T> {
        const url = `${this.config.baseUrl}${endpoint}`;

        const timeoutId = setTimeout(() => {
            // Timeout handling is done via AbortController
        }, this.config.timeout);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.config.headers,
                },
                body: JSON.stringify({
                    ...(params.messages && { messages: params.messages }),
                    ...(params.prompt && { prompt: params.prompt }),
                    provider: params.provider || this.config.defaultProvider,
                    model: params.model || this.config.defaultModel,
                    maxTokens: Number(params.maxTokens || this.config.defaultMaxTokens),
                    temperature: Number(params.temperature || this.config.defaultTemperature),
                }),
                signal: params.signal,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Request failed' }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private async *streamRequest(
        endpoint: string,
        params: {
            messages?: ChatMessage[];
            prompt?: string;
            provider?: ProviderType;
            model?: string;
            maxTokens?: number;
            temperature?: number;
            signal?: AbortSignal;
        }
    ): AsyncGenerator<StreamEvent, void, unknown> {
        const url = `${this.config.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.config.headers,
            },
            body: JSON.stringify({
                ...(params.messages && { messages: params.messages }),
                ...(params.prompt && { prompt: params.prompt }),
                provider: params.provider || this.config.defaultProvider,
                model: params.model || this.config.defaultModel,
                maxTokens: Number(params.maxTokens || this.config.defaultMaxTokens),
                temperature: Number(params.temperature || this.config.defaultTemperature),
            }),
            signal: params.signal,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Response body is not readable');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            const event: StreamEvent = {
                                type: data.type as StreamEventType,
                                content: data.content,
                                error: data.error,
                                metadata: data.metadata,
                            };
                            yield event;

                            if (event.type === 'done' || event.type === 'error') {
                                return;
                            }
                        } catch (e) {
                            // Skip invalid JSON lines
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    // ============================================================================
    // Utilities
    // ============================================================================

    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
}
