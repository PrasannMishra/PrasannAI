# PrasannAI

A multi-part AI demo repository with a local AI backend and a simple React UI.

## Projects

- `ai-backend/` — AI backend and provider adapter system
- `ai-ui/` — React frontend that calls `ai-backend` via the `/generate` endpoint

## Root Overview

`ai-backend` provides a provider-based architecture for generative AI. It supports:

- local models through Ollama
- cloud models through Anthropic
- OpenAI-compatible local servers
- CLI invocation and a REST `/generate` endpoint

`ai-ui` is a small React app that sends prompts to the backend API and displays responses.

## Backend Setup (`ai-backend`)

1. Open the backend folder:
   ```bash
   cd ai-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment example:
   ```bash
   copy .env.example .env
   ```

4. Configure your provider in `.env`.

### Local Ollama setup

1. Install Ollama from https://ollama.ai/docs/installation.
2. Pull the model you want to use:
   ```bash
   ollama pull qwen2.5:3b
   ```
3. Start the local Ollama server:
   ```bash
   ollama serve
   ```
4. Configure `.env`:
   ```env
   MODEL_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=qwen2.5:3b
   ```

### Example local model install notes

- `qwen2.5:3b` is an example Ollama model name. Adjust it if you use a different local model.
- If the model is large, ensure you have enough disk space and RAM before pulling.
- For Windows, use the Ollama installer or winget if available.

## Running the Backend

### CLI mode

Send a prompt:

```bash
node src/index.js --prompt "Explain recursion like I'm 10"
```

Read a prompt from a file and write output to a file:

```bash
node src/index.js --file prompt.txt --out response.txt
```

### API mode

Start the backend server:

```bash
npm run serve
```

Send a request:

```bash
curl -X POST http://127.0.0.1:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Summarize this text", "provider":"ollama", "model":"qwen2.5:3b"}'
```

Supported JSON fields:

- `prompt` (required)
- `provider` (optional; `ollama`, `anthropic`, `openai-compatible`)
- `model` (optional)
- `maxTokens` (optional)
- `temperature` (optional)

## Frontend Setup (`ai-ui`)

1. Open the UI folder:
   ```bash
   cd ai-ui
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the UI app:
   ```bash
   npm run dev
   ```

The UI uses a proxy to send requests to `http://127.0.0.1:3000/generate`, so make sure the backend is running.

## Running Tests

From `ai-backend`:

```bash
npm test
```

## Extending the Backend

To add more providers:

1. Create a new class in `ai-backend/src/providers/` extending the base provider.
2. Implement `generateText(prompt, options)`.
3. Register the provider in `ai-backend/src/modelFactory.js`.
4. Add config values to `ai-backend/src/config.js` and `.env.example`.
