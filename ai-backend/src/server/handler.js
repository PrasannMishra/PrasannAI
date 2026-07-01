import { loadConfig } from '../config.js';
import { createModelProvider } from '../modelFactory.js';
import { generateCompletion } from '../services/aiService.js';
import { sendJson, getCorsHeaders, readJsonBody, buildRequestPayload } from './utils.js';

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
            message: 'POST /generate or /chat with JSON payloads',
        }, corsHeaders);
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
