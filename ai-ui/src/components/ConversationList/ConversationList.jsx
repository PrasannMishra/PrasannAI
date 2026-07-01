import styles from './ConversationList.module.css';
import { MdDeleteForever } from "react-icons/md";

export function ConversationList({ conversations, activeConversationId, onSelectConversation, onNewConversation, onClearConversation, onDeleteConversation }) {
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
                    <span className={styles.title}>
                        <div style={{ display: "flex", alignItems: "center", width: '100%' }}>
                            <div>{conversation.title}</div>
                            <MdDeleteForever style={{ marginLeft: 'auto' }} size={20} onClick={(e) => {
                                e.stopPropagation();
                                onDeleteConversation(conversation.id);
                            }} />
                        </div>

                    </span>
                    <span className={styles.meta}>{conversation.messages.length} messages</span>
                </button>
            ))}

            {activeConversationId && (
                <button type="button" className={styles.clearButton} onClick={onClearConversation}>
                    Clear chats
                </button>
            )}
        </div>
    );
}
