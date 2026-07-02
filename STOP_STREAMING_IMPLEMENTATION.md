# Stop Streaming Feature Implementation

## Overview
This document describes the implementation of a stop streaming feature that allows users to cancel AI response generation mid-stream in both the backend and frontend.

## Architecture

### Backend Changes

#### 1. `src/server/streaming.js`
- **Modified `handleStreamingRequest` function** to accept an optional `signal` parameter (AbortSignal)
- Added abort signal listener that sets an `aborted` flag when triggered
- Modified streaming loop to check the `aborted` flag before sending each chunk
- When aborted, sends a `stopped` event to the client before ending the stream
- Prevents error handling from executing if the stream was intentionally stopped

**Key changes:**
```javascript
export async function handleStreamingRequest(req, res, config, provider, payload, corsHeaders, signal) {
    const stream = sendEventStream(res, corsHeaders);
    let aborted = false;

    // Handle abort signal
    if (signal) {
        signal.addEventListener('abort', () => {
            aborted = true;
        });
    }

    // Stream chunks with abort checking
    for await (const chunk of streamGenerator) {
        if (aborted) {
            stream.send({
                type: 'stopped',
                message: 'Stream stopped by user',
            });
            stream.done();
            return;
        }
        // ... continue streaming
    }
}
```

#### 2. `src/server/handler.js`
- Created an `AbortController` for each streaming request
- Added event listener for client disconnect (`req.on('close')`) to automatically abort when client disconnects
- Passed the abort signal to `handleStreamingRequest`

**Key changes:**
```javascript
// Create abort controller for this request
const abortController = new AbortController();

// Handle client disconnect
req.on('close', () => {
    abortController.abort();
});

await handleStreamingRequest(req, res, requestConfig, provider, payload, corsHeaders, abortController.signal);
```

### Frontend Changes

#### 3. `src/services/aiService.js`
- **Modified `generateResponseStream` function** to accept an optional `signal` parameter
- Added `combineSignals` utility function to merge multiple abort signals (user-initiated + timeout)
- Updated error handling to recognize user-initiated aborts
- Added handling for the new `stopped` event type from the backend

**Key changes:**
```javascript
export async function generateResponseStream({
    messages,
    provider,
    model,
    maxTokens,
    temperature,
    onChunk,
    signal,  // NEW: Accept abort signal
}) {
    const controller = new AbortController();
    
    // Combine external signal with internal controller
    const combinedSignal = signal ? combineSignals(signal, controller.signal) : controller.signal;
    
    // Use combinedSignal in fetch
    const response = await fetch(url, {
        // ...
        signal: combinedSignal,
    });
    
    // Handle 'stopped' event
    if (data.type === 'stopped') {
        return { success: true, stopped: true };
    }
}
```

#### 4. `src/hooks/useGenerateResponse.js`
- Added `abortControllerRef` to track the current request's abort controller
- Created `stopGeneration` function that aborts the current request
- Modified `handleSubmit` to create an abort controller before each request
- Passed the abort signal to both streaming and non-streaming API calls
- Cleaned up the abort controller reference in the `finally` block
- Exposed `stopGeneration` in the hook's return value

**Key changes:**
```javascript
const abortControllerRef = useRef(null);

const handleSubmit = async (params) => {
    // Create abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
        if (useStreaming) {
            const result = await generateResponseStream({
                // ...
                signal: abortControllerRef.current.signal,
                onChunk: (chunk) => { /* ... */ },
            });
        } else {
            const result = await generateResponse({
                // ...
                signal: abortControllerRef.current.signal,
            });
        }
    } finally {
        setLoading(false);
        abortControllerRef.current = null;
    }
};

const stopGeneration = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
    }
};
```

#### 5. `src/App.jsx`
- Imported `stopGeneration` from the `useGenerateResponse` hook
- Passed `onStop` prop to `ChatComposer` component

**Key changes:**
```javascript
const {
    // ... other properties
    stopGeneration,
} = useGenerateResponse();

// Pass to ChatComposer
<ChatComposer
    onSend={sendMessage}
    loading={loading}
    onStop={stopGeneration}
    // ... other props
/>
```

#### 6. `src/components/ChatComposer/ChatComposer.jsx`
- Added `onStop` prop to component parameters
- Created `handleStop` function to call `onStop` when stop button is clicked
- Modified the button rendering to show a stop button (⏹) when loading, instead of the send button
- Stop button has distinct red styling to indicate its purpose

**Key changes:**
```javascript
export function ChatComposer({ onSend, scrollToBottom, loading, onStop, /* ... */ }) {
    const handleStop = () => {
        if (onStop) {
            onStop();
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.composer}>
            <div className={styles.inputShell}>
                <textarea /* ... */ disabled={loading} />
                {loading ? (
                    <button type="button" className={styles.stopButton} onClick={handleStop} title="Stop generation">
                        ⏹
                    </button>
                ) : (
                    <button type="submit" className={styles.sendButton} disabled={!draft.trim()}>
                        ➜
                    </button>
                )}
            </div>
        </form>
    );
}
```

#### 7. `src/components/ChatComposer/ChatComposer.module.css`
- Added `.stopButton` CSS class with red gradient styling
- Stop button has hover effects similar to send button but with red color scheme
- Maintains consistent sizing and positioning with the send button

**Key changes:**
```css
.stopButton {
    border: none;
    border-radius: 999px;
    width: 2.5rem;
    height: 2.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    color: white;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 0 8px 16px rgba(220, 38, 38, 0.2);
    transition: var(--transition);
    flex-shrink: 0;
}

.stopButton:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 24px rgba(220, 38, 38, 0.25);
}
```

### Tests

#### 8. `tests/streaming.test.js` (NEW)
Created comprehensive tests for the stop streaming functionality:

1. **Test: handleStreamingRequest accepts signal parameter**
   - Verifies that the function accepts an AbortSignal without errors
   - Tests immediate abort scenario

2. **Test: handleStreamingRequest handles abort signal**
   - Creates a slow generator that yields multiple chunks
   - Aborts mid-stream after 50ms
   - Verifies that a `stopped` event is sent
   - Verifies that the response is properly ended

**Test Results:**
```
✔ handleStreamingRequest accepts signal parameter (1.8692ms)
✔ handleStreamingRequest handles abort signal (105.6623ms)
```

All 9 tests pass successfully.

## How It Works

### Flow Diagram

```
User clicks Stop Button (⏹)
         ↓
ChatComposer.handleStop()
         ↓
App.stopGeneration()
         ↓
useGenerateResponse.stopGeneration()
         ↓
abortControllerRef.current.abort()
         ↓
    ┌────┴────┐
    ↓         ↓
Frontend   Backend
    ↓         ↓
Fetch      Signal
aborted    received
    ↓         ↓
Stream     Check
reading    aborted
stops      flag
           ↓
       Send 'stopped'
       event
           ↓
       End stream
```

### Event Types

The SSE stream now supports the following event types:
- `start`: Initial metadata (provider, model)
- `chunk`: Text content chunk
- `done`: Stream completed successfully
- `error`: Error occurred
- `stopped`: Stream was stopped by user (NEW)

## Usage

### For Users
1. Start a message generation by typing a prompt and clicking send (➜)
2. While the response is streaming, a stop button (⏹) appears
3. Click the stop button to cancel the generation
4. The partial response is preserved in the conversation
5. You can send a new message immediately

### For Developers

#### Stopping a stream programmatically:
```javascript
const { stopGeneration } = useGenerateResponse();

// Stop the current generation
stopGeneration();
```

#### Backend - Handling client disconnect:
The backend automatically handles client disconnects via the `req.on('close')` event listener, which aborts the stream when the client closes the connection.

## Benefits

1. **User Control**: Users can stop long-running generations
2. **Resource Efficiency**: Frees up backend resources when generation is no longer needed
3. **Better UX**: Reduces frustration from waiting for unwanted responses
4. **Graceful Degradation**: Partial responses are preserved, conversation flow continues
5. **Automatic Cleanup**: Backend handles client disconnects automatically

## Technical Details

### AbortSignal Propagation
- Frontend creates an AbortController for each request
- The signal is passed through the hook → service → fetch API
- Backend receives the signal and monitors it during streaming
- Multiple signals can be combined using the `combineSignals` utility

### Thread Safety
- Uses async iteration with abort checks between chunks
- Backend checks the `aborted` flag before each `stream.send()` call
- No race conditions as abort is checked synchronously in the async loop

### Error Handling
- User-initiated aborts are distinguished from errors
- AbortError is caught and returns a user-friendly message
- Backend doesn't send error events for intentional stops

## Testing

Run the backend tests:
```bash
cd PrasannAI/ai-backend
npm test
```

All tests should pass, including the new streaming tests.

## Future Enhancements

Potential improvements for the future:
1. Add keyboard shortcut (e.g., Escape key) to stop generation
2. Show a visual indicator that the stream was stopped
3. Add confirmation dialog before stopping long generations
4. Track and display token usage before stop
5. Add option to regenerate the last response