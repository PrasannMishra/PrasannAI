import { AIService, normalizeCompletionRequest, buildCompletionResponse } from '@ai-platform/ai-core';

// Re-export for backward compatibility
export { normalizeCompletionRequest, buildCompletionResponse };

// Create a singleton instance or allow passing provider
export async function generateCompletion(provider, payload = {}, config = {}) {
    const request = normalizeCompletionRequest(payload, config.defaults || {});
    const aiService = new AIService({ provider });

    let output;
    if (request.mode === 'chat') {
        output = await aiService.generateChat(request.messages, request.options);
    } else {
        output = await aiService.generateText(request.prompt || '', request.options);
    }

    return buildCompletionResponse({
        providerName: request.provider,
        providerModel: request.options.model || provider.getModel?.(request.options),
        output,
        mode: request.mode,
    });
}
