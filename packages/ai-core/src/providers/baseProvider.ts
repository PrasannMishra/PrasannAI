import type {
    ChatMessage,
    CompletionOptions,
    CompletionResponse,
    ProviderConfig,
    ProviderDefaults,
} from '@ai-platform/shared-types';

/**
 * Base Provider Interface
 * All AI providers must implement this interface
 */
export abstract class BaseProvider {
    protected config: ProviderConfig;
    protected defaults: ProviderDefaults;

    constructor(config: ProviderConfig = {}) {
        this.config = config;
        this.defaults = config.defaults || {};
    }

    /**
     * Get the model to use for generation
     */
    abstract getModel(options?: Partial<CompletionOptions>): string;

    /**
     * Generate text from a prompt (non-streaming)
     */
    abstract generateText(prompt: string, options?: CompletionOptions): Promise<string>;

    /**
     * Generate text from a prompt (streaming)
     */
    abstract generateTextStream(prompt: string, options?: CompletionOptions): AsyncGenerator<string, void, unknown>;

    /**
     * Generate a response from chat messages (non-streaming)
     */
    async generateChat(messages: ChatMessage[], options?: CompletionOptions): Promise<string> {
        const prompt = messages.map((message) => `${message.role}: ${message.content}`).join('\n');
        return this.generateText(prompt, options);
    }

    /**
     * Generate a response from chat messages (streaming)
     */
    async *generateChatStream(messages: ChatMessage[], options?: CompletionOptions): AsyncGenerator<string, void, unknown> {
        const prompt = messages.map((message) => `${message.role}: ${message.content}`).join('\n');
        yield* this.generateTextStream(prompt, options);
    }

    /**
     * Build a completion response
     */
    protected buildResponse(
        output: string,
        providerName: string,
        providerModel: string,
        mode: 'text' | 'chat'
    ): CompletionResponse {
        return {
            success: true,
            provider: providerName as any,
            model: providerModel,
            output,
            mode,
        };
    }
}