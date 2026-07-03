import { BaseProvider } from './baseProvider.js';
import type {
    ChatMessage,
    CompletionOptions,
    CompletionResponse,
    ProviderConfig,
} from '@ai-platform/shared-types';

/**
 * OpenAI-Compatible Provider Implementation
 * Works with OpenAI, local LLMs, and any OpenAI-compatible API
 */
export class OpenAICompatibleProvider extends BaseProvider {
    private baseUrl: string;
    private apiKey: string;
    private model: string;

    constructor(config: ProviderConfig = {}) {
        super(config);

        this.baseUrl = (this.config.baseUrl || process.env.OPENAI_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
        this.apiKey = this.config.apiKey || process.env.OPENAI_API_KEY || 'sk-placeholder';
        this.model = this.config.model || process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    }

    getModel(options?: Partial<CompletionOptions>): string {
        return options?.model || this.model;
    }

    async generateText(prompt: string, options: CompletionOptions = {}): Promise<string> {
        const response = await fetch(`${this.baseUrl}/v1/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.getModel(options),
                prompt: typeof prompt === 'string' ? prompt : JSON.stringify(prompt),
                max_tokens: options.maxTokens || this.defaults.maxTokens || 500,
                temperature: options.temperature ?? this.defaults.temperature ?? 0.7,
                ...options.requestBody,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenAI request failed (${response.status}): ${errorBody}`);
        }

        const data = await response.json() as { choices?: Array<{ text?: string }> };

        if (typeof data.choices?.[0]?.text === 'string') {
            return data.choices[0].text;
        }

        throw new Error('OpenAI response did not contain text content');
    }

    async *generateTextStream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<string, void, unknown> {
        const response = await fetch(`${this.baseUrl}/v1/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.getModel(options),
                prompt: typeof prompt === 'string' ? prompt : JSON.stringify(prompt),
                max_tokens: options.maxTokens || this.defaults.maxTokens || 500,
                temperature: options.temperature ?? this.defaults.temperature ?? 0.7,
                stream: true,
                ...options.requestBody,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenAI stream request failed (${response.status}): ${errorBody}`);
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
                            if (data.choices?.[0]?.text) {
                                yield data.choices[0].text;
                            } else if (data.choices?.[0]?.delta?.content) {
                                yield data.choices[0].delta.content;
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

    async generateChat(messages: ChatMessage[], options: CompletionOptions = {}): Promise<string> {
        const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.getModel(options),
                messages: messages.map((message) => ({
                    role: message.role,
                    content: message.content,
                })),
                max_tokens: options.maxTokens || this.defaults.maxTokens || 500,
                temperature: options.temperature ?? this.defaults.temperature ?? 0.7,
                ...options.requestBody,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenAI chat request failed (${response.status}): ${errorBody}`);
        }

        const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };

        if (typeof data.choices?.[0]?.message?.content === 'string') {
            return data.choices[0].message.content;
        }

        throw new Error('OpenAI response did not contain message content');
    }

    async *generateChatStream(messages: ChatMessage[], options: CompletionOptions = {}): AsyncGenerator<string, void, unknown> {
        const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.getModel(options),
                messages: messages.map((message) => ({
                    role: message.role,
                    content: message.content,
                })),
                max_tokens: options.maxTokens || this.defaults.maxTokens || 500,
                temperature: options.temperature ?? this.defaults.temperature ?? 0.7,
                stream: true,
                ...options.requestBody,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenAI chat stream request failed (${response.status}): ${errorBody}`);
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
                            if (data.choices?.[0]?.delta?.content) {
                                yield data.choices[0].delta.content;
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
}