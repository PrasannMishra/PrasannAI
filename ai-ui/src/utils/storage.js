const STORAGE_KEY = 'prasannai-chat-history';

function createConversation(title = 'New chat', messages = []) {
    return {
        id: `conversation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        messages,
        createdAt: new Date().toISOString(),
    };
}

export function loadStoredConversations() {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [createConversation('New chat', [])];
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            return [createConversation('New chat', [])];
        }

        return parsed;
    } catch (error) {
        console.warn('Unable to read stored chat history', error);
        return [createConversation('New chat', [])];
    }
}

export function saveStoredConversations(conversations) {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
        console.warn('Unable to save chat history', error);
    }
}

export function buildConversationTitle(messages) {
    const firstUserMessage = messages.find((message) => message.role === 'user');
    const content = firstUserMessage?.content?.trim() || '';
    if (!content) {
        return 'New chat';
    }

    return content.length > 28 ? `${content.slice(0, 28)}...` : content;
}

export function createEmptyConversation() {
    return createConversation('New chat', []);
}
