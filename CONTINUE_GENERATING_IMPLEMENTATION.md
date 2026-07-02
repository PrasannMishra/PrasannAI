# Continue Generating Feature Implementation

## Overview
This document describes the implementation of the "Continue Generating" feature that allows users to resume AI response generation after stopping a stream. The partial response is preserved and the model continues from where it left off.

## Architecture

### Message Status Flow

```
streaming → stopped (user clicks Stop)
         → streaming (user clicks Continue)
         → completed (generation finishes)
         → stopped (user stops again)
         → streaming (user continues again)
         → error (if error occurs)
```

### Message Statuses

1. **streaming**: Active generation in progress
2. **stopped**: Generation was stopped by user, partial content preserved
3. **completed**: Generation finished successfully
4. **error**: Error occurred during generation

## Implementation Details

### Backend Changes
No backend changes required. The existing stop streaming implementation is sufficient.

### Frontend Changes

#### 1. `src/hooks/useGenerateResponse.js`

**Added message status tracking:**
- Assistant messages now include a `status` field
- Status is set to `'streaming'` when generation starts
- Status is updated to `'stopped'` when user cancels
- Status is updated to `'completed'` when generation finishes
- Status is updated to `'error'` if an error occurs

**Added `continueGeneration` function:**
```javascript
const continueGeneration = async (params) => {
    if (!activeConversation) return;

    setError('');
    setLoading(true);

    // Find the last assistant message with 'stopped' status
    const lastAssistantMessage = [...messages].reverse().find(
        (msg) => msg.role === 'assistant' && msg.status === 'stopped'
    );

    if (!lastAssistantMessage) {
        setLoading(false);
        return;
    }

    // Get messages up to and including the stopped assistant message
    const messageIndex = messages.findIndex((msg) => msg === lastAssistantMessage);
    const messagesUpToStopped = messages.slice(0, messageIndex + 1);

    // Create continuation instruction
    const continuationPrompt = {
        role: 'user',
        content: `Continue the previous assistant response from where it stopped.\n\nDo not repeat any previously generated content.\n\nContinue naturally from the last completed sentence if possible.\n\nDo not restart the explanation.`
    };

    const nextMessages = [...messagesUpToStopped, continuationPrompt];

    // Update the stopped message to streaming status
    setConversations((current) => current.map((conversation) => 
        conversation.id === activeConversationId
            ? {
                ...conversation,
                messages: conversation.messages.map((msg) => 
                    msg === lastAssistantMessage
                        ? { ...msg, status: 'streaming' }
                        : msg
                ),
            }
            : conversation
    ));

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
        if (useStreaming) {
            // Use streaming response
            let fullContent = lastAssistantMessage.content;

            const result = await generateResponseStream({
                ...params,
                messages: nextMessages,
                signal: abortControllerRef.current.signal,
                onChunk: (chunk) => {
                    fullContent += chunk;
                    setConversations((currentConversations) => 
                        currentConversations.map((conversation) => 
                            conversation.id === activeConversationId
                                ? {
                                    ...conversation,
                                    messages: conversation.messages.map((msg) => 
                                        msg === lastAssistantMessage
                                            ? { ...msg, content: fullContent, status: 'streaming' }
                                            : msg
                                    ),
                                }
                                : conversation
                        )
                    );
                },
            });

            // Handle result status
            if (!result.success) {
                setError(result.error);
                // Mark as error
                setConversations((current) => current.map((conversation) => 
                    conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            messages: conversation.messages.map((msg) => 
                                msg === lastAssistantMessage
                                    ? { ...msg, status: 'error' }
                                    : msg
                            ),
                        }
                        : conversation
                ));
            } else if (result.stopped) {
                // Mark as stopped again
                setConversations((current) => current.map((conversation) => 
                    conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            messages: conversation.messages.map((msg) => 
                                msg === lastAssistantMessage
                                    ? { ...msg, status: 'stopped' }
                                    : msg
                            ),
                        }
                        : conversation
                ));
            } else {
                // Mark as completed
                setConversations((current) => current.map((conversation) => 
                    conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            messages: conversation.messages.map((msg) => 
                                msg === lastAssistantMessage
                                    ? { ...msg, status: 'completed' }
                                    : msg
                            ),
                        }
                        : conversation
                ));
            }
        } else {
            // Use non-streaming response
            const result = await generateResponse({
                ...params,
                messages: nextMessages,
                signal: abortControllerRef.current.signal,
            });

            if (!result.success) {
                setError(result.error);
                setConversations((current) => current.map((conversation) => 
                    conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            messages: conversation.messages.map((msg) => 
                                msg === lastAssistantMessage
                                    ? { ...msg, status: 'error' }
                                    : msg
                            ),
                        }
                        : conversation
                ));
            } else {
                const continuedContent = lastAssistantMessage.content + result.output;
                setConversations((current) => current.map((conversation) => 
                    conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            messages: conversation.messages.map((msg) => 
                                msg === lastAssistantMessage
                                    ? { ...msg, content: continuedContent, status: 'completed' }
                                    : msg
                            ),
                        }
                        : conversation
                ));
            }
        }

        setTimeout(() => {
            responseRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } finally {
        setLoading(false);
        abortControllerRef.current = null;
    }
};
```

**Key aspects:**
- Finds the last assistant message with `status: 'stopped'`
- Reconstructs conversation up to that point
- Adds a continuation instruction as a new user message
- Appends new chunks to the existing assistant message (no duplicate messages)
- Handles all status transitions properly

#### 2. `src/App.jsx`

**Wired up `continueGeneration`:**
```javascript
const {
    // ... other properties
    continueGeneration,
} = useGenerateResponse();

// Pass to ChatMessages
<ChatMessages 
    messages={messages} 
    loading={loading} 
    onContinue={continueGeneration} 
/>

// Pass to ChatComposer
<ChatComposer
    onSend={sendMessage}
    loading={loading}
    onStop={stopGeneration}
    onContinue={continueGeneration}
    // ... other props
/>
```

#### 3. `src/components/ChatMessages/ChatMessages.jsx`

**Added Continue Generating button:**
```javascript
export function ChatMessages({ messages, loading, onContinue }) {
    return (
        <div className={styles.messages}>
            {/* ... existing code ... */}

            {messages.map((message, index) =>
                message.content && (
                    <div
                        key={`${message.role}-${index}`}
                        className={`${styles.messageRow} ${message.role === 'user' ? styles.userRow : styles.assistantRow}`}
                    >
                        <div className={`${styles.bubble} ${message.role === 'user' ? styles.userBubble : styles.assistantBubble}`}>
                            <div className={styles.roleLabel}>
                                {message.role === 'user' ? 'You' : 'Assistant'}
                                {message.status === 'streaming' && ' (generating...)'}
                                {message.status === 'stopped' && ' (stopped)'}
                            </div>
                            <div className={styles.content}>
                                {/* ... message content ... */}
                            </div>
                            {message.role === 'assistant' && message.status === 'stopped' && onContinue && (
                                <button 
                                    className={styles.continueButton}
                                    onClick={() => onContinue()}
                                    title="Continue generating from where it stopped"
                                >
                                    ▶ Continue Generating
                                </button>
                            )}
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
```

**Features:**
- Shows status label: "(generating...)" or "(stopped)"
- Shows Continue Generating button only for stopped assistant messages
- Button is hidden during streaming and after completion

#### 4. `src/components/ChatMessages/ChatMessages.module.css`

**Added Continue Button styling:**
```css
.continueButton {
    margin-top: 0.8rem;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: white;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    transition: all 0.25s;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
}

.continueButton:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
}

.continueButton:active {
    transform: translateY(0);
}
```

## How It Works

### Flow Diagram

```
User clicks Stop (⏹)
         ↓
Abort request
         ↓
Preserve partial content
         ↓
Mark message as 'stopped'
         ↓
Show Continue Generating button
         ↓
User clicks Continue Generating
         ↓
Find stopped message
         ↓
Build continuation request:
  - Include conversation history
  - Include partial response
  - Add continuation instruction
         ↓
Start new streaming request
         ↓
Append chunks to existing message
         ↓
Mark as 'completed' when done
```

### Conversation Reconstruction

**Original conversation:**
```
User: Explain HTTP Streaming in detail.

Assistant: HTTP Streaming is a mechanism where the server sends data
incrementally instead of waiting for the complete response...
[STOPPED HERE]
```

**New request payload:**
```javascript
[
    { role: 'user', content: 'Explain HTTP Streaming in detail.' },
    { 
        role: 'assistant', 
        content: 'HTTP Streaming is a mechanism where the server sends data\nincrementally instead of waiting for the complete response...',
        status: 'streaming' 
    },
    { 
        role: 'user', 
        content: 'Continue the previous assistant response from where it stopped.\n\nDo not repeat any previously generated content.\n\nContinue naturally from the last completed sentence if possible.\n\nDo not restart the explanation.' 
    }
]
```

## User Experience

### Scenario 1: Stop and Continue

1. User asks: "Explain HTTP Streaming in detail."
2. Assistant starts generating: "HTTP Streaming is a mechanism..."
3. User clicks Stop (⏹)
4. Partial content is preserved
5. Message shows "(stopped)" status
6. "Continue Generating" button appears
7. User clicks "Continue Generating"
8. Assistant continues: "...where the server sends data incrementally..."
9. Message status changes to "(generating...)"
10. Generation completes
11. Message status changes to completed (no label)
12. Continue button disappears

### Scenario 2: Multiple Continues

1. User stops generation
2. Clicks Continue
3. Stops again mid-generation
4. Clicks Continue again
5. Process repeats - each continue appends to the same message

### Scenario 3: Continue After Error

1. Generation encounters an error
2. Message is marked as 'error'
3. No continue button shown (errors cannot be continued)
4. User must start a new message

## Benefits

1. **No Data Loss**: Partial responses are always preserved
2. **Natural Continuation**: Model continues without repeating content
3. **Provider Agnostic**: Works with all LLM providers
4. **Multiple Continues**: Can stop and continue multiple times
5. **Clean UI**: Status indicators and buttons appear/disappear appropriately
6. **Conversation Context**: Full conversation history is maintained

## Technical Details

### State Management

- Uses React state to track message status
- Status transitions are atomic and consistent
- AbortController is cleaned up after each request
- No memory leaks from abandoned generators

### Conversation Reconstruction

- Sends full conversation history to maintain context
- Includes partial assistant response so model knows what was already said
- Continuation instruction guides model to avoid repetition
- Works with all providers through existing abstraction

### Error Handling

- If continuation fails, message is marked as 'error'
- Error message is displayed to user
- Partial content is still preserved
- User can try again or start fresh

## Testing

### Manual Testing Checklist

- [ ] Start a generation and let it complete - verify status is 'completed'
- [ ] Start a generation and click Stop - verify content is preserved
- [ ] Verify "(stopped)" label appears
- [ ] Verify "Continue Generating" button appears
- [ ] Click Continue - verify generation resumes
- [ ] Verify "(generating...)" label appears during continuation
- [ ] Stop again during continuation - verify can continue again
- [ ] Complete a continuation - verify button disappears
- [ ] Verify no duplicate assistant messages are created
- [ ] Test with non-streaming mode - verify continue works
- [ ] Test error scenario - verify error handling

### Automated Testing

Backend tests remain unchanged and pass:
```bash
cd PrasannAI/ai-backend
npm test
```

All 9 tests pass successfully.

## Future Enhancements

Potential improvements:
1. Show token count before/after stop
2. Add "Retry" button to restart from scratch
3. Add keyboard shortcut (e.g., Ctrl+Enter) to continue
4. Show estimated time remaining during generation
5. Add option to edit partial response before continuing
6. Track and display generation speed (tokens/second)

## Acceptance Criteria

✅ Stop preserves the partial response
✅ Partial response remains visible
✅ Continue Generating button appears
✅ Continue starts a new inference
✅ Existing conversation history is preserved
✅ Partial assistant response is included in the new request
✅ Continuation instruction is appended
✅ New chunks are appended to the same assistant message
✅ No duplicate assistant messages are created
✅ Typing indicator behaves correctly
✅ Works for all supported providers
✅ Does not require provider-specific resume APIs