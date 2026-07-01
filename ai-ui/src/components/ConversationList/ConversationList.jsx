import styles from './ConversationList.module.css';

export function ConversationList({ conversations, activeConversationId, onSelectConversation, onNewConversation, onClearConversation }) {
    return (
        <div className={styles.list}>
            <div className={styles.header}>
                <h3>Conversations</h3>
                <button type="button" className={styles.newButton} onClick={onNewConversation}>+ New</button>
            </div>

            {conversations.map((conversation) => (
                <button
                    key={conversation.id}
                    type="button"
                    className={`${styles.item} ${conversation.id === activeConversationId ? styles.active : ''}`}
                    onClick={() => onSelectConversation(conversation.id)}
                >
                    <span className={styles.title}>{conversation.title}</span>
                    <span className={styles.meta}>{conversation.messages.length} messages</span>
                </button>
            ))}

            {activeConversationId && (
                <button type="button" className={styles.clearButton} onClick={onClearConversation}>
                    Clear chat
                </button>
            )}
        </div>
    );
}
