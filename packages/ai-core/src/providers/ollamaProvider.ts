import { BaseProvider } from './baseProvider.js';
import type {
    ChatMessage,
    CompletionOptions,
    CompletionResponse,
    ProviderConfig,
} from '@ai-platform/shared-types';

/**
 * Ollama Provider Implementation
 */
export class OllamaProvider extends BaseProvider {
    private baseUrl: string;
    private model: string;

    constructor(config: ProviderConfig = {}) {
        super(config);

        this.baseUrl = (this.config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
        this.model = this.config.model || process.env.OLLAMA_MODEL || 'qwen2.5:3b';
    }

    getModel(options?: Partial<CompletionOptions>): string {
        return options?.model || this.model;
    }

    async generateText(prompt: string, options: CompletionOptions = {}): Promise<string> {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.getModel(options),
                prompt: typeof prompt === 'string' ? prompt : JSON.stringify(prompt),
                stream: false,
                ...options.requestBody,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ollama request failed (${response.status}): ${errorBody}`);
        }

        const data = await response.json() as { response?: string };

        if (typeof data.response === 'string') {
            return data.response;
        }

        throw new Error('Ollama response did not contain text content');
    }

    async *generateTextStream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<string, void, unknown> {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.getModel(options),
                prompt: typeof prompt === 'string' ? prompt : JSON.stringify(prompt),
                stream: true,
                ...options.requestBody,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ollama stream request failed (${response.status}): ${errorBody}`);
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
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            if (typeof data.response === 'string') {
                                yield data.response;
                            }
                        } catch (e) {
                            // Skip invalid JSON lines
                        }
                    }
                }
            }

            // Process remaining buffer
            if (buffer.trim()) {
                try {
                    const data = JSON.parse(buffer);
                    if (typeof data.response === 'string') {
                        yield data.response;
                    }
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    async generateChat(messages: ChatMessage[], options: CompletionOptions = {}): Promise<string> {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.getModel(options),
                messages: messages.map((message) => ({
                    role: message.role === 'assistant' ? 'assistant' : 'user',
                    content: message.content,
                })),
                stream: false,
                ...options.requestBody,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ollama chat request failed (${response.status}): ${errorBody}`);
        }

        const data = await response.json() as { message?: { content?: string } };

        if (typeof data.message?.content === 'string') {
            return data.message.content;
        }

        // Fallback to text generation
        const prompt = messages.map((message) => `${message.role}: ${message.content}`).join('\n');
        return this.generateText(prompt, options);
    }

    async *generateChatStream(messages: ChatMessage[], options: CompletionOptions = {}): AsyncGenerator<string, void, unknown> {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.getModel(options),
                messages: messages.map((message) => ({
                    role: message.role === 'assistant' ? 'assistant' : 'user',
                    content: message.content,
                })),
                stream: true,
                ...options.requestBody,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ollama chat stream request failed (${response.status}): ${errorBody}`);
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
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            if (typeof data.message?.content === 'string') {
                                yield data.message.content;
                            }
                        } catch (e) {
                            // Skip invalid JSON lines
                        }
                    }
                }
            }

            // Process remaining buffer
            if (buffer.trim()) {
                try {
                    const data = JSON.parse(buffer);
                    if (typeof data.message?.content === 'string') {
                        yield data.message.content;
                    }
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        } finally {
            reader.releaseLock();
        }
    }
}