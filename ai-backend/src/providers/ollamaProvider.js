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
                model: options.model || this.model,
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
}
