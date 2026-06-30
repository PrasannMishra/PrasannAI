import styles from './Header.module.css';

export function Header() {
    return (
        <header className={styles.header}>
            <h1 className={styles.title}>🤖 PrasannAI</h1>
            <p className={styles.subtitle}>Send prompts to the local AI API and view generated responses.</p>
        </header>
    );
}
