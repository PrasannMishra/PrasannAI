import styles from './MarkdownRenderer.module.css';

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function toHtml(markdown) {
    const escaped = escapeHtml(markdown);
    return escaped
        .replace(/^### (.*)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/\n/g, '<br />');
}

export function MarkdownRenderer({ content }) {
    const html = toHtml(content ?? '');

    return <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />;
}
