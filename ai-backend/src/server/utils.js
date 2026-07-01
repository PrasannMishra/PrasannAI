/**
 * HTTP server utilities
 */

export function sendJson(res, statusCode, payload, headers = {}) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        ...headers,
    });
    res.end(JSON.stringify(payload, null, 2));
}

export function getCorsHeaders(req, config) {
    const origin = req.headers.origin;
    const allowedOrigins = config.server.allowedOrigins || [];
    const isAllowedOrigin = origin && allowedOrigins.includes(origin);

    return {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin : (allowedOrigins[0] || '*'),
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    };
}

export function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(new Error(`Invalid JSON body: ${error.message}`));
            }
        });
        req.on('error', reject);
    });
}

export function buildRequestPayload(parsed = {}, defaults = {}) {
    const prompt = typeof parsed.prompt === 'string' ? parsed.prompt.trim() : '';
    const rawMessages = Array.isArray(parsed.messages) ? parsed.messages : [];
    const payload = {
        provider: parsed.provider || defaults.provider,
        model: parsed.model,
        maxTokens: parsed.maxTokens ?? defaults.maxTokens,
        temperature: parsed.temperature ?? defaults.temperature,
        requestBody: parsed.requestBody,
        requestOptions: parsed.requestOptions,
    };

    if (prompt) {
        payload.prompt = prompt;
    }

    if (rawMessages.length > 0) {
        payload.messages = rawMessages;
    }

    return payload;
}
