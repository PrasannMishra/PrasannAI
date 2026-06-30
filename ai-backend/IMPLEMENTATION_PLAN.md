# Implementation Plan: Local Model Adapter

## Goal
Replace the current Anthropic-only call with a provider-based architecture so the app can use a local model such as qwen2.5:3b through Ollama, while keeping future model swaps simple.

## Current State
The app in [claude-day1/src/index.js](claude-day1/src/index.js) directly uses the Anthropic SDK and hard-codes a cloud model.

## Target Architecture
Create a small abstraction layer with:
- a common interface for text generation
- one implementation for Ollama/local models
- one implementation for Anthropic/cloud models
- configuration driven by environment variables

## Recommended File Structure
- [claude-day1/src/config.js](claude-day1/src/config.js) – load environment-based settings
- [claude-day1/src/providers/baseProvider.js](claude-day1/src/providers/baseProvider.js) – shared interface
- [claude-day1/src/providers/ollamaProvider.js](claude-day1/src/providers/ollamaProvider.js) – local model implementation
- [claude-day1/src/providers/anthropicProvider.js](claude-day1/src/providers/anthropicProvider.js) – existing cloud implementation
- [claude-day1/src/modelFactory.js](claude-day1/src/modelFactory.js) – select provider by configuration
- [claude-day1/src/index.js](claude-day1/src/index.js) – use the selected provider instead of calling the SDK directly

## Implementation Steps
1. Introduce a provider interface
   - Define a method such as `generateText(prompt, options)`.
   - Keep the contract simple so any future provider can implement it.

2. Add configuration support
   - Use environment variables such as:
     - `MODEL_PROVIDER=ollama`
     - `OLLAMA_MODEL=qwen2.5:3b`
     - `OLLAMA_BASE_URL=http://localhost:11434`
     - `ANTHROPIC_API_KEY=...`
   - This makes switching providers a config change instead of a code rewrite.

3. Implement the Ollama provider
   - Call the local Ollama API endpoint.
   - Send the prompt as a request body.
   - Return the generated text in a normalized format.
   - Example payload:
     - `model: qwen2.5:3b`
     - `prompt: ...`
     - `stream: false`

4. Preserve the current Anthropic behavior
   - Move the existing SDK logic into an Anthropic provider.
   - Keep the same request shape but route it through the adapter interface.

5. Add a factory layer
   - `modelFactory.js` will choose the provider based on `MODEL_PROVIDER`.
   - Future models only need a new provider class and a config entry.

6. Update the app entry point
   - Replace direct Anthropic SDK usage in [claude-day1/src/index.js](claude-day1/src/index.js) with:
     - load config
     - create provider
     - call `generateText()`

7. Add basic validation and error handling
   - Handle missing config values.
   - Gracefully report connection errors when Ollama is not running.

8. Add a simple smoke test
   - Test that the factory returns the correct provider.
   - Test that the Ollama provider formats requests correctly.

## Example Provider Flow
```js
const provider = createModelProvider();
const response = await provider.generateText("Explain React hooks like I am 10 years old");
console.log(response);
```

## Migration Notes
- For the first version, use Ollama as the default provider for local development.
- Keep the Anthropic provider available so the project can still run against cloud models.
- This approach makes the app future-proof for other backends such as OpenAI, LM Studio, or a remote inference service.

## Suggested First Milestone
Implement the adapter with:
- one local Ollama provider
- one Anthropic provider
- one factory
- one working end-to-end example using the local model
