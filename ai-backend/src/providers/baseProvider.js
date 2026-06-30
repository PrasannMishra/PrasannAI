export class BaseProvider {
    constructor(config = {}) {
        this.config = config;
    }

    async generateText(prompt, options = {}) {
        throw new Error('generateText must be implemented by a provider');
    }
}
