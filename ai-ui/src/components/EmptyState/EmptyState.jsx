import styles from './EmptyState.module.css';

export function EmptyState() {
    return (
        <div className={styles.emptyState}>
            <p className={styles.text}>👈 Fill out the form and click "Generate Response" to get started.</p>
        </div>
    );
}
