import test from 'node:test';
import assert from 'node:assert/strict';

import { createModelProvider, registerProvider } from '../src/modelFactory.js';
import { OllamaProvider } from '../src/providers/ollamaProvider.js';
import { AnthropicProvider } from '../src/providers/anthropicProvider.js';
import { OpenAICompatibleProvider } from '../src/providers/openaiCompatibleProvider.js';

test('createModelProvider returns the Ollama provider for local config', () => {
    const provider = createModelProvider({ provider: 'ollama', ollama: { model: 'qwen2.5:3b' } });
    assert.ok(provider instanceof OllamaProvider);
});

test('registerProvider allows custom providers to be added', () => {
    class FakeProvider { }
    registerProvider('fake', FakeProvider);
    const provider = createModelProvider({ provider: 'fake' });
    assert.ok(provider instanceof FakeProvider);
});

test('createModelProvider returns the Anthropic provider for cloud config', () => {
    const provider = createModelProvider({ provider: 'anthropic', anthropic: { apiKey: 'demo-key' } });
    assert.ok(provider instanceof AnthropicProvider);
});

test('createModelProvider returns the OpenAI-compatible provider for local config', () => {
    const provider = createModelProvider({ provider: 'openai-compatible', openaiCompatible: { baseUrl: 'http://localhost:1234/v1', model: 'local-model' } });
    assert.ok(provider instanceof OpenAICompatibleProvider);
});
