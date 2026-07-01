import fs from 'fs';
import path from 'path';

/**
 * CLI utilities and argument parsing
 */

export function printUsage() {
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

export function parseArgs(argv) {
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

export async function readStdin() {
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

export function buildGenerateOptions({ model, maxTokens, temperature }) {
    const opts = {};
    if (model) opts.model = model;
    if (maxTokens != null) opts.maxTokens = maxTokens;
    if (temperature != null) opts.temperature = temperature;
    return opts;
}

export function resolvePromptFromArgs(opts) {
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
