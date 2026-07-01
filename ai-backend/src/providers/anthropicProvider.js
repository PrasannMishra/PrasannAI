import { Anthropic } from '@anthropic-ai/sdk';
import { BaseProvider } from './baseProvider.js';

export class AnthropicProvider extends BaseProvider {
    constructor(config = {}) {
        super(config);

        const apiKey = this.config.anthropic?.apiKey || process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('Anthropic API key is missing. Set ANTHROPIC_API_KEY or pass anthropic.apiKey.');
        }

        this.client = new Anthropic({ apiKey });
        this.model = this.config.anthropic?.model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
    }

    async generateText(prompt, options = {}) {
        const response = await this.client.messages.create({
            model: this.getModel(options),
            max_tokens: options.maxTokens || this.config.defaults?.maxTokens || 500,
            temperature: options.temperature ?? this.config.defaults?.temperature ?? 0.7,
            messages: [
                {
                    role: 'user',
                    content: typeof prompt === 'string' ? prompt : JSON.stringify(prompt),
                },
            ],
            ...options.requestOptions,
        });

        return response.content
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('');
    }

    async *generateTextStream(prompt, options = {}) {
        const stream = this.client.messages.stream({
            model: this.getModel(options),
            max_tokens: options.maxTokens || this.config.defaults?.maxTokens || 500,
            temperature: options.temperature ?? this.config.defaults?.temperature ?? 0.7,
            messages: [
                {
                    role: 'user',
                    content: typeof prompt === 'string' ? prompt : JSON.stringify(prompt),
                },
            ],
            ...options.requestOptions,
        });

        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                yield chunk.delta.text;
            }
        }
    }

    async generateChat(messages, options = {}) {
        const response = await this.client.messages.create({
            model: this.getModel(options),
            max_tokens: options.maxTokens || this.config.defaults?.maxTokens || 500,
            temperature: options.temperature ?? this.config.defaults?.temperature ?? 0.7,
            messages: Array.isArray(messages) ? messages.map((message) => ({
                role: message.role === 'assistant' ? 'assistant' : 'user',
                content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content ?? ''),
            })) : [{ role: 'user', content: String(messages ?? '') }],
            ...options.requestOptions,
        });

        return response.content
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('');
    }

    async *generateChatStream(messages, options = {}) {
        const stream = this.client.messages.stream({
            model: this.getModel(options),
            max_tokens: options.maxTokens || this.config.defaults?.maxTokens || 500,
            temperature: options.temperature ?? this.config.defaults?.temperature ?? 0.7,
            messages: Array.isArray(messages) ? messages.map((message) => ({
                role: message.role === 'assistant' ? 'assistant' : 'user',
                content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content ?? ''),
            })) : [{ role: 'user', content: String(messages ?? '') }],
            ...options.requestOptions,
        });

        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                yield chunk.delta.text;
            }
        }
    }
}
