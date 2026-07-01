import { BaseProvider } from './baseProvider.js';

export class OpenAICompatibleProvider extends BaseProvider {
    constructor(config = {}) {
        super(config);

        this.baseUrl = (this.config.openaiCompatible?.baseUrl || process.env.OPENAI_COMPATIBLE_BASE_URL || 'http://localhost:1234/v1').replace(/\/$/, '');
        this.model = this.config.openaiCompatible?.model || process.env.OPENAI_COMPATIBLE_MODEL || 'local-model';
        this.apiKey = this.config.openaiCompatible?.apiKey || process.env.OPENAI_COMPATIBLE_API_KEY || 'dummy-key';
    }

    async generateText(prompt, options = {}) {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.getModel(options),
                messages: [
                    {
                        role: 'user',
                        content: typeof prompt === 'string' ? prompt : JSON.stringify(prompt),
                    },
                ],
                temperature: options.temperature ?? this.config.defaults?.temperature ?? 0.7,
                max_tokens: options.maxTokens || this.config.defaults?.maxTokens || 500,
                ...options.requestBody,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenAI-compatible request failed (${response.status}): ${errorBody}`);
        }

        const data = await response.json();

        if (Array.isArray(data.choices) && data.choices[0]?.message?.content) {
            return data.choices[0].message.content;
        }

        throw new Error('OpenAI-compatible response did not contain text content');
    }

    async generateChat(messages, options = {}) {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.getModel(options),
                messages: Array.isArray(messages) ? messages.map((message) => ({
                    role: message.role === 'assistant' ? 'assistant' : 'user',
                    content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content ?? ''),
                })) : [{ role: 'user', content: String(messages ?? '') }],
                temperature: options.temperature ?? this.config.defaults?.temperature ?? 0.7,
                max_tokens: options.maxTokens || this.config.defaults?.maxTokens || 500,
                ...options.requestBody,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenAI-compatible chat request failed (${response.status}): ${errorBody}`);
        }

        const data = await response.json();

        if (Array.isArray(data.choices) && data.choices[0]?.message?.content) {
            return data.choices[0].message.content;
        }

        throw new Error('OpenAI-compatible chat response did not contain text content');
    }
}
