import { useEffect, useState } from 'react';
import styles from './ChatComposer.module.css';
import ChatSettings from './ChatSettings';

export function ChatComposer({ onSend, scrollToBottom, loading, provider, onProviderChange, model, onModelChange, maxTokens, onMaxTokensChange, temperature, onTemperatureChange }) {
    const [draft, setDraft] = useState('');
    const [showSettings, setShowSettings] = useState(false);

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

    return (
        <form onSubmit={handleSubmit} className={styles.composer}>
            <div className={styles.inputShell}>
                <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={4}
                    placeholder="Ask the assistant anything..."
                    className={styles.input}
                    disabled={loading}
                />
                <button type="submit" className={styles.sendButton} disabled={loading || !draft.trim()}>
                    {loading ? '⏳' : '➜'}
                </button>
            </div>
            {showSettings && (
                <ChatSettings
                    onSend={onSend}
                    loading={loading}
                    provider={provider}
                    onProviderChange={onProviderChange}
                    model={model}
                    onModelChange={onModelChange}
                    maxTokens={maxTokens}
                    onMaxTokensChange={onMaxTokensChange}
                    temperature={temperature}
                    onTemperatureChange={onTemperatureChange}
                />
            )}
        </form>
    );
}
