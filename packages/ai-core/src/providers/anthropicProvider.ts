import { Anthropic } from '@anthropic-ai/sdk';
import { BaseProvider } from './baseProvider.js';
import type {
    ChatMessage,
    CompletionOptions,
    CompletionResponse,
    ProviderConfig,
} from '@ai-platform/shared-types';

/**
 * Anthropic Claude Provider Implementation
 */
export class AnthropicProvider extends BaseProvider {
    private client: Anthropic;
    private model: string;

    constructor(config: ProviderConfig = {}) {
        super(config);

        const apiKey = this.config.apiKey || process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('Anthropic API key is missing. Set ANTHROPIC_API_KEY or pass apiKey in config.');
        }

        this.client = new Anthropic({ apiKey });
        this.model = this.config.model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
    }

    getModel(options?: Partial<CompletionOptions>): string {
        return options?.model || this.model;
    }

    async generateText(prompt: string, options: CompletionOptions = {}): Promise<string> {
        const response = await this.client.messages.create({
            model: this.getModel(options),
            max_tokens: options.maxTokens || this.defaults.maxTokens || 500,
            temperature: options.temperature ?? this.defaults.temperature ?? 0.7,
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

    async *generateTextStream(prompt: string, options: CompletionOptions = {}): AsyncGenerator<string, void, unknown> {
        const stream = this.client.messages.stream({
            model: this.getModel(options),
            max_tokens: options.maxTokens || this.defaults.maxTokens || 500,
            temperature: options.temperature ?? this.defaults.temperature ?? 0.7,
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

    async generateChat(messages: ChatMessage[], options: CompletionOptions = {}): Promise<string> {
        const response = await this.client.messages.create({
            model: this.getModel(options),
            max_tokens: options.maxTokens || this.defaults.maxTokens || 500,
            temperature: options.temperature ?? this.defaults.temperature ?? 0.7,
            messages: messages.map((message) => ({
                role: message.role === 'assistant' ? 'assistant' : 'user',
                content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content ?? ''),
            })),
            ...options.requestOptions,
        });

        return response.content
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('');
    }

    async *generateChatStream(messages: ChatMessage[], options: CompletionOptions = {}): AsyncGenerator<string, void, unknown> {
        const stream = this.client.messages.stream({
            model: this.getModel(options),
            max_tokens: options.maxTokens || this.defaults.maxTokens || 500,
            temperature: options.temperature ?? this.defaults.temperature ?? 0.7,
            messages: messages.map((message) => ({
                role: message.role === 'assistant' ? 'assistant' : 'user',
                content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content ?? ''),
            })),
            ...options.requestOptions,
        });

        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                yield chunk.delta.text;
            }
        }
    }
}