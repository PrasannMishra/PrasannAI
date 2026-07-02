import { useEffect, useState } from 'react';
import styles from './ChatComposer.module.css';

export function ChatComposer({ onSend, scrollToBottom, loading, onStop }) {
    const [draft, setDraft] = useState('');

    // useEffect(() => {
    //     scrollToBottom([0])
    // })

    const handleSubmit = (event) => {
        event.preventDefault();
        scrollToBottom();
        if (!draft.trim()) {
            return;
        }

        onSend(draft.trim());
        setDraft('');
    };

    const handleKeyDown = (event) => {
        // Ignore if IME is composing (for Chinese, Japanese, Korean input)
        if (event.isComposing) {
            return;
        }

        // Shift + Enter: allow newline (default behavior)
        if (event.shiftKey && event.key === 'Enter') {
            return;
        }

        // Enter: send message
        if (event.key === 'Enter') {
            event.preventDefault();

            // Don't send if loading or if input is empty/whitespace
            if (loading || !draft.trim()) {
                return;
            }

            handleSubmit(event);
        }
    };

    const handleStop = () => {
        if (onStop) {
            onStop();
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.composer}>
            <div className={styles.inputShell}>
                <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={4}
                    placeholder="Ask the assistant anything..."
                    className={styles.input}
                    disabled={loading}
                />
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