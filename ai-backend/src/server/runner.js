import http from 'http';
import { loadConfig } from '../config.js';
import { handleRequest } from './handler.js';

/**
 * HTTP server mode runner
 */

export async function runServer(opts) {
    const configOverrides = {};
    if (opts.provider) configOverrides.provider = opts.provider;
    if (opts.port != null) configOverrides.server = { port: opts.port };

    const config = loadConfig(configOverrides);
    const port = config.server.port;
    const host = config.server.host;

    const server = http.createServer(async (req, res) => {
        try {
            await handleRequest(req, res, config, opts);
        } catch (err) {
            console.error('Unexpected error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });

    server.listen(port, host, () => {
        console.log(`AI API server listening at http://${host}:${port}`);
        console.log('POST /generate or /chat with JSON body { prompt?, messages?, provider?, model?, maxTokens?, temperature? }');
    });
}
