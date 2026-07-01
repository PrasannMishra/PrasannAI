export class BaseProvider {
    constructor(config = {}) {
        this.config = config;
    }

    getModel(options = {}) {
        return options.model || this.model || null;
    }

    async generateText(prompt, options = {}) {
        throw new Error('generateText must be implemented by a provider');
    }

    async *generateTextStream(prompt, options = {}) {
        throw new Error('generateTextStream must be implemented by a provider');
    }

    async generateChat(messages, options = {}) {
        const prompt = Array.isArray(messages) ? messages.map((message) => `${message.role}: ${message.content}`).join('\n') : '';
        return this.generateText(prompt, options);
    }

    async *generateChatStream(messages, options = {}) {
        const prompt = Array.isArray(messages) ? messages.map((message) => `${message.role}: ${message.content}`).join('\n') : '';
        yield* this.generateTextStream(prompt, options);
    }
}
