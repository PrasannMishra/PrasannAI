import { loadConfig } from '../config.js';
import { createModelProvider } from '../modelFactory.js';
import { generateCompletion } from '../services/aiService.js';
import { sendJson, getCorsHeaders, readJsonBody, buildRequestPayload } from './utils.js';
import { handleStreamingRequest } from './streaming.js';

/**
 * HTTP request handler
 */

export async function handleRequest(req, res, config, opts) {
    const corsHeaders = getCorsHeaders(req, config);
    const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }

    // Health check endpoint
    if (req.method === 'GET' && url.pathname === '/') {
        sendJson(res, 200, {
            status: 'ok',
            message: 'POST /generate or /chat with JSON payloads. Add /stream suffix for streaming responses.',
        }, corsHeaders);
        return;
    }

    // Handle streaming endpoints
    const streamingEndpoints = ['/generate/stream', '/chat/stream', '/complete/stream', '/stream'];
    if (req.method === 'POST' && streamingEndpoints.includes(url.pathname)) {
        try {
            const parsed = await readJsonBody(req);
            const requestConfig = loadConfig({ provider: parsed.provider || opts.provider });
            const provider = createModelProvider(requestConfig);
            const payload = buildRequestPayload(parsed, config.defaults);

            // Create abort controller for this request
            const abortController = new AbortController();

            // Handle client disconnect
            req.on('close', () => {
                abortController.abort();
            });

            await handleStreamingRequest(req, res, requestConfig, provider, payload, corsHeaders, abortController.signal);
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders });
            res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
        }
        return;
    }

    // Reject invalid endpoints
    if (req.method !== 'POST' || !['/generate', '/chat', '/complete'].includes(url.pathname)) {
        sendJson(res, 404, { error: 'Not found' }, corsHeaders);
        return;
    }

    try {
        const parsed = await readJsonBody(req);
        const requestConfig = loadConfig({ provider: parsed.provider || opts.provider });
        const provider = createModelProvider(requestConfig);
        const payload = buildRequestPayload(parsed, config.defaults);
        const response = await generateCompletion(provider, payload, requestConfig);

        sendJson(res, 200, {
            success: true,
            ...response,
        }, corsHeaders);
    } catch (err) {
        sendJson(res, 500, { error: err.message || 'Internal server error' }, corsHeaders);
    }
}
