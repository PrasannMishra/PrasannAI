import { loadConfig } from '../config.js';
import { createModelProvider } from '../modelFactory.js';
import { generateCompletion } from '../services/aiService.js';
import { printUsage, resolvePromptFromArgs } from './parser.js';

/**
 * CLI mode runner
 */

export async function runCli(opts) {
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
    const payload = {
        prompt: promptText,
        provider: config.provider,
        model: opts.model,
        maxTokens: opts.maxTokens,
        temperature: opts.temperature,
    };

    const response = await generateCompletion(provider, payload, config);

    if (opts.out) {
        const fs = await import('fs');
        const path = await import('path');
        await fs.promises.writeFile(path.resolve(process.cwd(), opts.out), JSON.stringify(response, null, 2), 'utf8');
        console.log(`Wrote output to ${opts.out}`);
    } else {
        console.log(response.output);
    }
}
