import styles from './LoadingState.module.css';

export function LoadingState() {
    return (
        <div className={styles.loadingState}>
            <div className={styles.spinnerLarge}></div>
            <p className={styles.text}>Generating response...</p>
        </div>
    );
}
