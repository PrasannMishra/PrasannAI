import { parseArgs } from './cli/parser.js';
import { runCli } from './cli/runner.js';
import { runServer } from './server/runner.js';

/**
 * Entry point - delegates to CLI or HTTP server mode
 */

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

