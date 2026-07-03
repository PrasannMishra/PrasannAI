# Migration Guide

This guide explains how to migrate the existing ai-backend and ai-ui applications to use the new AI Platform packages.

## Overview

The refactoring separates AI logic into reusable packages while maintaining backward compatibility. The existing applications will continue to work while gradually adopting the new packages.

## Package Structure

```
packages/
├── shared-types/     # Type definitions (no dependencies)
├── shared-utils/     # Utility functions (no dependencies)
├── ai-core/          # Backend AI logic (depends on shared-*)
└── ai-sdk/           # Frontend SDK (depends on shared-*)
```

## Phase 1: Package Creation ✅

All packages have been created with:
- ✅ shared-types - Complete type definitions
- ✅ shared-utils - Complete utility functions
- ✅ ai-core - Provider implementations and AI service
- ✅ ai-sdk - AIClient and React hooks
- ✅ Documentation for all packages

## Phase 2: Backend Migration (ai-backend)

### Current State
The ai-backend currently has AI logic embedded in:
- `src/providers/` - Provider implementations
- `src/services/aiService.js` - AI service logic
- `src/modelFactory.js` - Provider factory

### Migration Steps

#### Step 1: Install Dependencies

```bash
cd ai-backend
npm install @ai-platform/ai-core @ai-platform/shared-types @ai-platform/shared-utils
npm install --save-dev @types/node typescript ts-node
```

#### Step 2: Update Imports

**Before:**
```javascript
import { AnthropicProvider } from '../providers/anthropicProvider.js';
import { generateCompletion } from '../services/aiService.js';
import { createModelProvider } from '../modelFactory.js';
```

**After:**
```typescript
import { AnthropicProvider, createProvider, AIService } from '@ai-platform/ai-core';
```

#### Step 3: Update Handler

**Before:**
```javascript
const provider = createModelProvider(requestConfig);
const response = await generateCompletion(provider, payload, requestConfig);
```

**After:**
```typescript
const provider = createProvider(requestConfig);
const aiService = new AIService();
const response = await aiService.generateCompletion(provider, payload);
```

#### Step 4: Add TypeScript Support

Create `tsconfig.json` in ai-backend:
```json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "lib": ["ES2020"],
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
}
```

#### Step 5: Update package.json

```json
{
    "name": "ai-backend",
    "version": "1.0.0",
    "type": "module",
    "main": "dist/index.js",
    "scripts": {
        "dev": "ts-node --esm src/index.ts",
        "build": "tsc",
        "start": "node dist/index.js"
    },
    "dependencies": {
        "@ai-platform/ai-core": "1.0.0",
        "@ai-platform/shared-types": "1.0.0",
        "@ai-platform/shared-utils": "1.0.0",
        "express": "^4.18.2",
        "dotenv": "^17.4.2"
    },
    "devDependencies": {
        "@types/express": "^4.17.17",
        "@types/node": "^20.0.0",
        "typescript": "^5.0.0",
        "ts-node": "^10.9.0"
    }
}
```

### Backend Migration Complete

After migration:
- ✅ All AI logic comes from ai-core
- ✅ No provider code in ai-backend
- ✅ Type-safe with TypeScript
- ✅ Easy to test and maintain

## Phase 3: Frontend Migration (ai-ui)

### Current State
The ai-ui currently has AI communication logic in:
- `src/services/aiService.js` - API communication
- `src/hooks/useGenerateResponse.js` - React hook

### Migration Steps

#### Step 1: Install Dependencies

```bash
cd ai-ui
npm install @ai-platform/ai-sdk @ai-platform/shared-types @ai-platform/shared-utils
```

#### Step 2: Update Service Layer

**Before:**
```javascript
import { generateResponse, generateResponseStream } from '../services/aiService.js';

const response = await generateResponse({
    messages,
    provider,
    model,
    maxTokens,
    temperature,
});
```

**After:**
```typescript
import { AIClient } from '@ai-platform/ai-sdk';

const client = new AIClient({
    baseUrl: import.meta.env.VITE_API_URL,
    defaultProvider: 'anthropic',
    defaultModel: 'claude-sonnet-4-5',
});

const response = await client.chatSend({
    messages,
    provider,
    model,
    maxTokens,
    temperature,
});
```

#### Step 3: Update Hooks

**Before:**
```javascript
import { useGenerateResponse } from '../hooks/useGenerateResponse.js';

const { generate, isLoading, error } = useGenerateResponse();
```

**After:**
```typescript
import { useChat } from '@ai-platform/ai-sdk';

const client = new AIClient({
    baseUrl: import.meta.env.VITE_API_URL,
});

const { messages, isLoading, error, send, stream, stop, clear } = useChat({
    client,
    provider: 'anthropic',
    model: 'claude-sonnet-4-5',
});
```

#### Step 4: Update Components

**Before:**
```javascript
function ChatComponent() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSend = async () => {
        setIsLoading(true);
        const response = await generateResponse({ messages });
        setMessages([...messages, response]);
        setIsLoading(false);
    };
}
```

**After:**
```typescript
function ChatComponent() {
    const { messages, isLoading, send, stop } = useChat({
        client,
        provider: 'anthropic',
    });
    
    const handleSend = async () => {
        await send([{ role: 'user', content: 'Hello!' }]);
    };
}
```

### Frontend Migration Complete

After migration:
- ✅ No direct fetch calls in components
- ✅ No API communication logic in app
- ✅ Type-safe with TypeScript
- ✅ Reusable across all frontend apps

## Phase 4: Testing

### Test ai-core

```bash
cd packages/ai-core
npm test
```

### Test ai-sdk

```bash
cd packages/ai-sdk
npm test
```

### Test ai-backend

```bash
cd ai-backend
npm test
```

### Test ai-ui

```bash
cd ai-ui
npm test
```

## Phase 5: New Applications

### Creating a New Application

```bash
# Create new app directory
mkdir apps/learning-portal
cd apps/learning-portal

# Initialize project
npm init -y

# Install AI packages
npm install @ai-platform/ai-sdk @ai-platform/ai-core @ai-platform/shared-types
```

### Backend Example

```typescript
import { createProvider, AIService } from '@ai-platform/ai-core';
import express from 'express';

const app = express();
const provider = createProvider({ type: 'anthropic' });
const aiService = new AIService();

app.post('/api/learn', async (req, res) => {
    const response = await aiService.generateCompletion(provider, req.body);
    res.json(response);
});

app.listen(3000);
```

### Frontend Example

```typescript
import { AIClient, useChat } from '@ai-platform/ai-sdk';

const client = new AIClient({
    baseUrl: 'http://localhost:3000',
});

function LearningPortal() {
    const { messages, send } = useChat({
        client,
        contextProvider: 'learning',  // Custom context
    });
    
    // Build your UI
}
```

## Backward Compatibility

### During Migration

Both old and new code can coexist:

```javascript
// Old code still works
import { generateResponse } from './services/aiService.js';

// New code can be adopted gradually
import { AIClient } from '@ai-platform/ai-sdk';
```

### After Migration

Old code can be removed:
- Delete `ai-backend/src/providers/`
- Delete `ai-backend/src/services/aiService.js`
- Delete `ai-backend/src/modelFactory.js`
- Delete `ai-ui/src/services/aiService.js`
- Delete `ai-ui/src/hooks/useGenerateResponse.js`

## Common Issues

### TypeScript Errors

If you see "Cannot find module" errors:

1. Build the packages first:
   ```bash
   npm run build:packages
   ```

2. Check tsconfig paths:
   ```json
   {
       "compilerOptions": {
           "moduleResolution": "bundler"
       }
   }
   ```

### Import Errors

Use `.js` extensions in TypeScript imports:
```typescript
import { AIClient } from '@ai-platform/ai-sdk/client/aiClient.js';
```

### Peer Dependencies

If you get peer dependency warnings:
```bash
npm install @anthropic-ai/sdk --save-peer
```

## Benefits After Migration

### Code Reuse
- AI logic in one place (ai-core)
- Frontend SDK in one place (ai-sdk)
- No duplication across apps

### Consistency
- Same providers across all apps
- Same error handling
- Same streaming behavior

### Maintainability
- Bug fixes benefit all apps
- New features added once
- Clear separation of concerns

### Type Safety
- Full TypeScript support
- Compile-time error checking
- Better IDE support

## Support

If you encounter issues during migration:

1. Check the ARCHITECTURE.md for design details
2. Review package README files
3. Check example code in this guide
4. Ensure all packages are built before use

## Next Steps

After successful migration:

1. ✅ Remove old AI logic from ai-backend
2. ✅ Remove old API logic from ai-ui
3. ✅ Build new applications using packages
4. ✅ Add more providers as needed
5. ✅ Implement advanced features (RAG, Agents, Tools)