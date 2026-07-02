import test from 'node:test';
import assert from 'node:assert/strict';
import { handleStreamingRequest } from '../src/server/streaming.js';

test('handleStreamingRequest accepts signal parameter', async () => {
    const mockRes = {
        writeHead: () => { },
        write: () => { },
        end: () => { },
    };

    const mockProvider = {
        generateChatStream: async function* () {
            yield 'test';
        },
        getModel: () => 'test-model',
    };

    const mockConfig = {
        provider: 'test',
    };

    const mockPayload = {
        messages: [{ role: 'user', content: 'test' }],
        options: {},
    };

    const mockReq = {
        url: '/chat/stream',
        headers: { host: 'localhost' },
    };

    const controller = new AbortController();

    // This should not throw
    const promise = handleStreamingRequest(
        mockReq,
        mockRes,
        mockConfig,
        mockProvider,
        mockPayload,
        {},
        controller.signal
    );

    // Abort immediately
    controller.abort();

    await promise;

    // If we get here without throwing, the test passes
    assert.ok(true);
});

test('handleStreamingRequest handles abort signal', async () => {
    const writes = [];
    let ended = false;

    const mockRes = {
        writeHead: () => { },
        write: (data) => {
            writes.push(data);
        },
        end: () => {
            ended = true;
        },
    };

    async function* slowGenerator() {
        yield 'chunk1';
        await new Promise(resolve => setTimeout(resolve, 100));
        yield 'chunk2';
    }

    const mockProvider = {
        generateChatStream: slowGenerator,
        getModel: () => 'test-model',
    };

    const mockConfig = {
        provider: 'test',
    };

    const mockPayload = {
        messages: [{ role: 'user', content: 'test' }],
        options: {},
    };

    const mockReq = {
        url: '/chat/stream',
        headers: { host: 'localhost' },
    };

    const controller = new AbortController();

    const promise = handleStreamingRequest(
        mockReq,
        mockRes,
        mockConfig,
        mockProvider,
        mockPayload,
        {},
        controller.signal
    );

    // Abort after a short delay
    setTimeout(() => controller.abort(), 50);

    await promise;

    // Should have received a 'stopped' event
    const stoppedEvent = writes.find(w => w.includes('"type":"stopped"'));
    assert.ok(stoppedEvent, 'Should have received stopped event');
    assert.ok(ended, 'Response should be ended');
});