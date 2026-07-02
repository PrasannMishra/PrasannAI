/**
 * Server-Sent Events (SSE) utilities for streaming responses
 */

import { getCorsHeaders } from './utils.js';

export function sendEventStream(res, corsHeaders) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders,
    });

    return {
        send: (data) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        },
        error: (error) => {
            res.write(`data: ${JSON.stringify({ error: error.message || 'Unknown error', type: 'error' })}\n\n`);
        },
        done: () => {
            res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
            res.end();
        },
    };
}

export async function handleStreamingRequest(req, res, config, provider, payload, corsHeaders, signal) {
    const stream = sendEventStream(res, corsHeaders);
    let aborted = false;

    // Handle abort signal
    if (signal) {
        signal.addEventListener('abort', () => {
            aborted = true;
        });
    }

    try {
        let streamGenerator;

        if (payload.messages && payload.messages.length > 0) {
            streamGenerator = provider.generateChatStream(payload.messages, payload.options);
        } else if (payload.prompt) {
            streamGenerator = provider.generateTextStream(payload.prompt, payload.options);
        } else {
            stream.error(new Error('No prompt or messages provided'));
            return;
        }

        // Send metadata
        stream.send({
            type: 'start',
            provider: config.provider,
            model: payload.options?.model || provider.getModel?.(payload.options),
        });

        // Stream chunks with abort checking
        for await (const chunk of streamGenerator) {
            if (aborted) {
                stream.send({
                    type: 'stopped',
                    message: 'Stream stopped by user',
                });
                stream.done();
                return;
            }

            if (chunk) {
                stream.send({
                    type: 'chunk',
                    content: chunk,
                });
            }
        }

        // Signal completion
        if (!aborted) {
            stream.done();
        }
    } catch (err) {
        if (!aborted) {
            stream.error(err);
        }
    }
}
