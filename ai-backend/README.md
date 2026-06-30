# Claude-Day1 Backend

This folder contains the AI backend for the PrasannAI project.

## What it does

- Provides a provider-based abstraction for model inference
- Supports local Ollama models, Anthropic cloud, and OpenAI-compatible local servers
- Exposes both CLI and REST-style interfaces

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment example:
   ```bash
   copy .env.example .env
   ```

3. Configure your provider and model in `.env`.

## Local Ollama Setup

1. Install Ollama from https://ollama.ai/docs/installation.
2. Pull the desired model:
   ```bash
   ollama pull qwen2.5:3b
   ```
3. Start the local server:
   ```bash
   ollama serve
   ```
4. Configure `.env`:
   ```env
   MODEL_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=qwen2.5:3b
   ```

## Running the Backend

### CLI mode

Send a prompt directly:

```bash
node src/index.js --prompt "Explain recursion simply"
```

Read a prompt from a file:

```bash
node src/index.js --file prompt.txt --out response.txt
```

### API mode

Start the backend server:

```bash
npm run serve
```

Then call the API:

```bash
curl -X POST http://127.0.0.1:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Summarize this text", "provider":"ollama", "model":"qwen2.5:3b"}'
```

## Supported Providers

- `ollama` — local Ollama models
- `anthropic` — Anthropic cloud models
- `openai-compatible` — local OpenAI-compatible inference servers

## Environment

Use `.env` to set values like:

```env
MODEL_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-5
OPENAI_COMPATIBLE_BASE_URL=http://localhost:1234/v1
OPENAI_COMPATIBLE_MODEL=local-model
OPENAI_COMPATIBLE_API_KEY=dummy-key
MAX_TOKENS=500
TEMPERATURE=0.7
SERVER_HOST=127.0.0.1
SERVER_PORT=3000
```

## Testing

```bash
npm test
```

## Extending Providers

1. Create a new provider in `src/providers/`.
2. Implement `generateText(prompt, options)`.
3. Register the provider in `src/modelFactory.js`.
4. Add config support in `src/config.js` and `.env.example`.
