import styles from './PromptInput.module.css';

export function PromptInput({ value, onChange }) {
    return (
        <div className={styles.wrapper}>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows="8"
                placeholder="Type your prompt here..."
                className={styles.input}
            />
            <span className={styles.charCount}>
                {value.length} characters
            </span>
        </div>
    );
}
