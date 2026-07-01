import styles from './ChatComposer.module.css';
export default function ChatSettings({ onSend, loading, provider, onProviderChange, model, onModelChange, maxTokens, onMaxTokensChange, temperature, onTemperatureChange }) {
    return (
        <div>
            <div className={styles.controlsRow}>
                <div className={styles.controlGroup}>
                    <label className={styles.controlLabel}>Provider</label>
                    <select value={provider} onChange={(event) => onProviderChange(event.target.value)} className={styles.select}>
                        <option value="ollama">Ollama</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="openai-compatible">OpenAI-compatible</option>
                    </select>
                </div>

                <div className={styles.controlGroup}>
                    <label className={styles.controlLabel}>Model</label>
                    <input value={model} onChange={(event) => onModelChange(event.target.value)} className={styles.inputField} />
                </div>
            </div>

            <div className={styles.controlsRow}>
                <div className={styles.controlGroup}>
                    <label className={styles.controlLabel}>Max Tokens</label>
                    <input type="number" value={maxTokens} min="1" onChange={(event) => onMaxTokensChange(Number(event.target.value))} className={styles.inputField} />
                </div>

                <div className={styles.controlGroup}>
                    <label className={styles.controlLabel}>Temperature</label>
                    <input type="number" step="0.1" min="0" max="1" value={temperature} onChange={(event) => onTemperatureChange(Number(event.target.value))} className={styles.inputField} />
                </div>
            </div>
        </div>
    )
};