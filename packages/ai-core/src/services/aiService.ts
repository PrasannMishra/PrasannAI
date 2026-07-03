import type {
    ChatMessage,
    CompletionMode,
    CompletionOptions,
    CompletionRequest,
    CompletionResponse,
    ProviderConfig,
    ProviderType,
} from '@ai-platform/shared-types';
import { BaseProvider } from '../providers/baseProvider.js';
import { createProvider } from '../modelFactory.js';
import { sanitizePrompt, validateChatMessage, estimateTokenCount } from '@ai-platform/shared-utils';

export interface AIServiceConfig {
    defaults?: Partial<CompletionOptions>;
}

/**
 * Convert various message formats to ChatMessage
 */
function toMessage(entry: unknown, _index: number): ChatMessage {
    if (typeof entry === 'string') {
        return { role: 'user', content: entry };
    }

    if (entry && typeof entry === 'object') {
        const msg = entry as Record<string, unknown>;
        const role = typeof msg.role === 'string' ? msg.role : 'user';
        const content = typeof msg.content === 'string'
            ? msg.content
            : JSON.stringify(msg.content ?? '');

        return { role: role as ChatMessage['role'], content };
    }

    return { role: 'user', content: String(entry ?? '') };
}

/**
 * Normalize a completion request
 */
export function normalizeCompletionRequest(
    payload: Partial<CompletionRequest> = {},
    defaults: Partial<CompletionOptions> = {}
): CompletionRequest {
    const provider = (payload.provider || 'ollama') as ProviderType;
    const prompt = typeof payload.prompt === 'string' ? sanitizePrompt(payload.prompt) : '';
    const rawMessages = Array.isArray(payload.messages) ? payload.messages : [];
    const messages: ChatMessage[] = rawMessages.length > 0
        ? rawMessages.map((entry, index) => toMessage(entry, index))
        : (prompt ? [{ role: 'user', content: prompt }] : []);

    const mode: CompletionMode = messages.length > 0 ? 'chat' : 'text';

    return {
        mode,
        provider,
        messages,
        prompt,
        options: {
            model: payload.options?.model,
            maxTokens: payload.options?.maxTokens ?? defaults.maxTokens,
            temperature: payload.options?.temperature ?? defaults.temperature,
            requestBody: payload.options?.requestBody,
            requestOptions: payload.options?.requestOptions,
        },
    };
}

/**
 * Build a completion response
 */
export function buildCompletionResponse({
    providerName,
    providerModel,
    output,
    mode,
}: {
    providerName: ProviderType;
    providerModel: string;
    output: string;
    mode: CompletionMode;
}): CompletionResponse {
    return {
        success: true,
        provider: providerName,
        model: providerModel,
        output,
        mode,
    };
}

/**
 * AI Service - Core business logic for AI completions
 */
export class AIService {
    private config: AIServiceConfig;

    constructor(config: AIServiceConfig = {}) {
        this.config = config;
    }

    /**
     * Generate a completion using the specified provider
     */
    async generateCompletion(
        provider: BaseProvider,
        payload: Partial<CompletionRequest> = {},
        config: ProviderConfig = {}
    ): Promise<CompletionResponse> {
        const request = normalizeCompletionRequest(payload, this.config.defaults || {});

        let output: string;
        if (request.mode === 'chat') {
            output = await provider.generateChat(request.messages || [], request.options);
        } else {
            output = await provider.generateText(request.prompt || '', request.options);
        }

        return buildCompletionResponse({
            providerName: request.provider,
            providerModel: request.options.model || provider.getModel(request.options),
            output,
            mode: request.mode,
        });
    }

    /**
     * Create a provider instance from configuration
     */
    createProvider(config: ProviderConfig = {}): BaseProvider {
        return createProvider(config);
    }

    /**
     * Estimate token count for a request
     */
    estimateTokenCount(payload: Partial<CompletionRequest>): number {
        const request = normalizeCompletionRequest(payload);

        if (request.messages && request.messages.length > 0) {
            return estimateTokenCount(request.messages.map(m => m.content).join(' '));
        }

        return estimateTokenCount(request.prompt || '');
    }
}