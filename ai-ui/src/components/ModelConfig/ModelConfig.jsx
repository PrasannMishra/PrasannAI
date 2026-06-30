import { PROVIDERS } from '../../config/providers.js';
import styles from './ModelConfig.module.css';

export function ModelConfig({ provider, model, onProviderChange, onModelChange }) {
    return (
        <section className={styles.section}>
            <h3 className={styles.title}>Model Configuration</h3>
            <div className={styles.fieldRow}>
                <label className={styles.label}>
                    Provider
                    <select
                        value={provider}
                        onChange={(e) => onProviderChange(e.target.value)}
                        className={styles.select}
                    >
                        {PROVIDERS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={styles.label}>
                    Model
                    <input
                        type="text"
                        value={model}
                        onChange={(e) => onModelChange(e.target.value)}
                        className={styles.input}
                    />
                </label>
            </div>
        </section>
    );
}
