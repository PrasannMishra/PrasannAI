import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';
import styles from './ResponseSection.module.css';

export function ResponseSection({ response, responseRef }) {
    const { copied, copy } = useCopyToClipboard();

    const handleCopy = () => {
        copy(response);
    };

    return (
        <section className={styles.responseBox} ref={responseRef}>
            <div className={styles.responseHeader}>
                <h3 className={styles.title}>✅ Response</h3>
                <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={handleCopy}
                    title="Copy response to clipboard"
                >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
            </div>
            <pre className={styles.responseContent}>{response}</pre>
        </section>
    );
}
