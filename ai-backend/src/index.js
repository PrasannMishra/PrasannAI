import http from 'http';
import fs from 'fs';
import path from 'path';
import { loadConfig } from './config.js';
import { createModelProvider } from './modelFactory.js';

function printUsage() {
    console.log(`
Usage: node index.js [options]

Options:
  -p, --prompt "TEXT"         Prompt text to send to the model
  -f, --file PATH             Read prompt text from file (use - for stdin)
  --provider NAME             Provider name (ollama|anthropic|openai-compatible)
  --model NAME                Model name to use (provider-specific)
  -o, --out PATH              Write output to file (defaults to stdout)
  --max-tokens N              Max tokens (overrides config)
  --temperature N             Temperature (overrides config)
  --server                    Run HTTP server instead of CLI
  --port N                    Port used by HTTP server
  -h, --help                  Show this help message
`);
}

function parseArgs(argv) {
    const args = argv.slice(2);
    const opts = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '-p':
            case '--prompt':
                opts.prompt = args[++i];
                break;
            case '-f':
            case '--file':
                opts.file = args[++i];
                break;
            case '--provider':
                opts.provider = args[++i];
                break;
            case '--model':
                opts.model = args[++i];
                break;
            case '-o':
            case '--out':
                opts.out = args[++i];
                break;
            case '--max-tokens':
                opts.maxTokens = Number(args[++i]);
                break;
            case '--temperature':
                opts.temperature = Number(args[++i]);
                break;
            case '--server':
                opts.server = true;
                break;
            case '--port':
                opts.port = Number(args[++i]);
                break;
            case '-h':
            case '--help':
                opts.help = true;
                break;
            default:
                console.warn(`Unknown option: ${arg}`);
                opts.help = true;
                break;
        }
    }
    return opts;
}

async function readStdin() {
    return new Promise((resolve, reject) => {
        let data = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => {
            data += chunk;
        });
        process.stdin.on('end', () => resolve(data));
        process.stdin.on('error', reject);
    });
}

function buildGenerateOptions({ model, maxTokens, temperature }) {
    const opts = {};
    if (model) opts.model = model;
    if (maxTokens != null) opts.maxTokens = maxTokens;
    if (temperature != null) opts.temperature = temperature;
    return opts;
}

function resolvePromptFromArgs(opts) {
    if (opts.prompt) return opts.prompt;
    if (opts.file) {
        if (opts.file === '-') {
            return readStdin();
        }
        const fullPath = path.resolve(process.cwd(), opts.file);
        return fs.promises.readFile(fullPath, 'utf8');
    }
    if (!process.stdin.isTTY) {
        return readStdin();
    }
    return Promise.resolve('');
}

async function runCli(opts) {
    if (opts.help) {
        printUsage();
        return;
    }

    const promptText = (await resolvePromptFromArgs(opts)).trim();
    if (!promptText) {
        console.error('No prompt provided. Use --prompt, --file, or pipe text to stdin.');
        printUsage();
        process.exit(1);
    }

    const configOverrides = {};
    if (opts.provider) configOverrides.provider = opts.provider;
    if (opts.port != null) configOverrides.server = { port: opts.port };
    if (opts.maxTokens != null || opts.temperature != null) {
        configOverrides.defaults = {};
        if (opts.maxTokens != null) configOverrides.defaults.maxTokens = opts.maxTokens;
        if (opts.temperature != null) configOverrides.defaults.temperature = opts.temperature;
    }

    const config = loadConfig(configOverrides);
    const provider = createModelProvider(config);
    const generateOptions = buildGenerateOptions(opts);

    const response = await provider.generateText(promptText, generateOptions);

    if (opts.out) {
        await fs.promises.writeFile(path.resolve(process.cwd(), opts.out), response, 'utf8');
        console.log(`Wrote output to ${opts.out}`);
    } else {
        console.log(response);
    }
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
    });
    res.end(JSON.stringify(payload, null, 2));
}

async function runServer(opts) {
    const configOverrides = {};
    if (opts.provider) configOverrides.provider = opts.provider;
    if (opts.port != null) configOverrides.server = { port: opts.port };

    const config = loadConfig(configOverrides);
    const port = config.server.port;
    const host = config.server.host;

    const server = http.createServer(async (req, res) => {
        if (req.method !== 'POST' || req.url !== '/generate') {
            if (req.url === '/' && req.method === 'GET') {
                sendJson(res, 200, {
                    status: 'ok',
                    message: 'POST /generate with JSON {prompt, provider?, model?, maxTokens?, temperature?}',
                });
                return;
            }
            sendJson(res, 404, { error: 'Not found' });
            return;
        }

        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', async () => {
            try {
                const parsed = body ? JSON.parse(body) : {};
                const promptText = String(parsed.prompt || '').trim();
                if (!promptText) {
                    sendJson(res, 400, { error: 'Missing prompt' });
                    return;
                }

                const requestOverrides = {};
                if (parsed.provider) requestOverrides.provider = parsed.provider;
                const requestConfig = loadConfig(requestOverrides);
                const provider = createModelProvider(requestConfig);
                const generateOptions = buildGenerateOptions(parsed);

                const output = await provider.generateText(promptText, generateOptions);
                const providerConfigKey = requestConfig.provider === 'anthropic'
                    ? 'anthropic'
                    : requestConfig.provider === 'ollama'
                        ? 'ollama'
                        : 'openaiCompatible';
                sendJson(res, 200, {
                    success: true,
                    provider: requestConfig.provider,
                    model: parsed.model || requestConfig[providerConfigKey]?.model,
                    output,
                });
            } catch (err) {
                sendJson(res, 500, { error: err.message || 'Internal server error' });
            }
        });

        req.on('error', (err) => {
            sendJson(res, 500, { error: err.message || 'Request error' });
        });
    });

    server.listen(port, host, () => {
        console.log(`AI API server listening at http://${host}:${port}`);
        console.log('POST /generate with JSON body { prompt, provider?, model?, maxTokens?, temperature? }');
    });
}

async function main() {
    const opts = parseArgs(process.argv);
    if (opts.server) {
        await runServer(opts);
    } else {
        await runCli(opts);
    }
}

if (process.argv[1] && process.argv[1].endsWith('index.js')) {
    main().catch((err) => {
        console.error('Error:', err.message || err);
        process.exit(1);
    });
}
