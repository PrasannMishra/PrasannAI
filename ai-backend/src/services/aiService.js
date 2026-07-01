function toMessage(entry, index) {
    if (typeof entry === 'string') {
        return { role: 'user', content: entry };
    }

    if (entry && typeof entry === 'object') {
        const role = typeof entry.role === 'string' ? entry.role : 'user';
        const content = typeof entry.content === 'string'
            ? entry.content
            : JSON.stringify(entry.content ?? '');

        return { role, content };
    }

    return { role: 'user', content: String(entry ?? '') };
}

export function normalizeCompletionRequest(payload = {}, defaults = {}) {
    const provider = payload.provider || defaults.provider || 'ollama';
    const prompt = typeof payload.prompt === 'string' ? payload.prompt.trim() : '';
    const rawMessages = Array.isArray(payload.messages) ? payload.messages : [];
    const messages = rawMessages.length > 0
        ? rawMessages.map((entry, index) => toMessage(entry, index))
        : (prompt ? [{ role: 'user', content: prompt }] : []);

    const mode = messages.length > 0 ? 'chat' : 'text';

    return {
        mode,
        provider,
        messages,
        prompt,
        options: {
            model: payload.model,
            maxTokens: payload.maxTokens ?? defaults.maxTokens,
            temperature: payload.temperature ?? defaults.temperature,
            requestBody: payload.requestBody,
            requestOptions: payload.requestOptions,
        },
    };
}

export function buildCompletionResponse({ providerName, providerModel, output, mode }) {
    return {
        success: true,
        provider: providerName,
        model: providerModel,
        output,
        mode,
    };
}

export async function generateCompletion(provider, payload = {}, config = {}) {
    const request = normalizeCompletionRequest(payload, config.defaults || {});

    let output;
    if (request.mode === 'chat') {
        output = await provider.generateChat(request.messages, request.options);
    } else {
        output = await provider.generateText(request.prompt || '', request.options);
    }

    return buildCompletionResponse({
        providerName: request.provider,
        providerModel: request.options.model || provider.getModel?.(request.options),
        output,
        mode: request.mode,
    });
}
