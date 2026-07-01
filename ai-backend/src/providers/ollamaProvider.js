import { BaseProvider } from './baseProvider.js';

export class OllamaProvider extends BaseProvider {
    constructor(config = {}) {
        super(config);

        this.baseUrl = (this.config.ollama?.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
        this.model = this.config.ollama?.model || process.env.OLLAMA_MODEL || 'qwen2.5:3b';
    }

    async generateText(prompt, options = {}) {
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

        const data = await response.json();

        if (typeof data.response === 'string') {
            return data.response;
        }

        throw new Error('Ollama response did not contain text content');
    }

    async *generateTextStream(prompt, options = {}) {
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

        const reader = response.body.getReader();
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

    async generateChat(messages, options = {}) {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.getModel(options),
                messages: Array.isArray(messages) ? messages : [{ role: 'user', content: String(messages ?? '') }],
                stream: false,
                ...options.requestBody,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ollama chat request failed (${response.status}): ${errorBody}`);
        }

        const data = await response.json();

        if (typeof data.message?.content === 'string') {
            return data.message.content;
        }

        return this.generateText(messages.map((message) => `${message.role}: ${message.content}`).join('\n'), options);
    }

    async *generateChatStream(messages, options = {}) {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.getModel(options),
                messages: Array.isArray(messages) ? messages : [{ role: 'user', content: String(messages ?? '') }],
                stream: true,
                ...options.requestBody,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ollama chat stream request failed (${response.status}): ${errorBody}`);
        }

        const reader = response.body.getReader();
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
