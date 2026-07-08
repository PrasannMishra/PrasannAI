import { useState } from 'react';
import styles from './AdvancedSettings.module.css';

export function AdvancedSettings({ maxTokens, temperature, onMaxTokensChange, onTemperatureChange }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className={styles.section}>
            <button
                type="button"
                className={styles.collapsibleBtn}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>⚙️ Advanced Settings</span>
                <span className={`${styles.toggleIcon} ${isOpen ? styles.open : ''}`}>▾</span>
            </button>

            {isOpen && (
                <div className={styles.settingsContainer}>
                    <div className={styles.fieldRow}>
                        <label className={styles.label}>
                            Max Tokens
                            <input
                                type="number"
                                value={maxTokens}
                                min="1"
                                onChange={(e) => onMaxTokensChange(e.target.value)}
                                className={styles.input}
                            />
                            <span className={styles.hint}>Maximum length of the response</span>
                        </label>
                        <label className={styles.label}>
                            Temperature
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={temperature}
                                onChange={(e) => onTemperatureChange(e.target.value)}
                                className={styles.input}
                            />
                            <span className={styles.hint}>0=focused, 1=creative</span>
                        </label>
                    </div>
                </div>
            )}
        </section>
    );
}
