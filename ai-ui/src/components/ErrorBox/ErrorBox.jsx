import styles from './ErrorBox.module.css';

export function ErrorBox({ error }) {
    return (
        <div className={styles.errorBox}>
            <h3 className={styles.title}>⚠️ Error</h3>
            <p className={styles.message}>{error}</p>
        </div>
    );
}
