import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeCompletionRequest, buildCompletionResponse } from '../src/services/aiService.js';

test('normalizeCompletionRequest converts prompt payloads into a chat message list', () => {
    const request = normalizeCompletionRequest({ prompt: 'Hello there' }, { provider: 'ollama' });

    assert.equal(request.mode, 'chat');
    assert.deepEqual(request.messages, [{ role: 'user', content: 'Hello there' }]);
    assert.equal(request.options.model, undefined);
});

test('normalizeCompletionRequest preserves chat messages and metadata', () => {
    const request = normalizeCompletionRequest({
        messages: [
            { role: 'system', content: 'You are helpful.' },
            { role: 'user', content: 'Summarize this' },
        ],
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-latest',
        maxTokens: 256,
        temperature: 0.2,
    }, { provider: 'ollama' });

    assert.equal(request.mode, 'chat');
    assert.equal(request.messages.length, 2);
    assert.equal(request.options.model, 'claude-3-5-sonnet-latest');
    assert.equal(request.options.maxTokens, 256);
    assert.equal(request.options.temperature, 0.2);
});

test('buildCompletionResponse includes mode and provider metadata', () => {
    const response = buildCompletionResponse({
        providerName: 'ollama',
        providerModel: 'qwen2.5:3b',
        output: 'done',
        mode: 'chat',
    });

    assert.equal(response.success, true);
    assert.equal(response.mode, 'chat');
    assert.equal(response.provider, 'ollama');
    assert.equal(response.output, 'done');
});
