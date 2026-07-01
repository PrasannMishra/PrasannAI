import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer.jsx';
import styles from './ChatMessages.module.css';

export function ChatMessages({ messages, loading }) {
    return (
        <div className={styles.messages}>
            {messages.length === 0 && (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>✨</div>
                    <h3>Start a conversation</h3>
                    <p>Ask anything and the AI will respond here as a polished chat thread.</p>
                </div>
            )}

            {messages.map((message, index) =>
                message.content && (
                    <div
                        key={`${message.role}-${index}`}
                        className={`${styles.messageRow} ${message.role === 'user' ? styles.userRow : styles.assistantRow}`}
                    >
                        <div className={`${styles.bubble} ${message.role === 'user' ? styles.userBubble : styles.assistantBubble}`}>
                            <div className={styles.roleLabel}>{message.role === 'user' ? 'You' : 'Assistant'}</div>
                            <div className={styles.content}>
                                {message.role === 'assistant' ? (
                                    <MarkdownRenderer content={message.content} />
                                ) : (
                                    message.content
                                )}
                            </div>
                        </div>
                    </div>
                )
            )}
            {/* {loading && (
                <div className={`${styles.messageRow} ${styles.assistantRow}`}>
                    <div className={`${styles.bubble} ${styles.assistantBubble}`}>
                        <div className={styles.roleLabel}>Assistant</div>
                        <div className={styles.content}>Thinking…</div>
                    </div>
                </div>
            )} */}
        </div>
    );
}
