/**
 * useGenerateResponse Hook
 * Manages the state and logic for generating AI responses
 */

import { useEffect, useRef, useState } from 'react';
import { generateResponse } from '../services/aiService.js';
import { buildConversationTitle, createEmptyConversation, loadStoredConversations, saveStoredConversations } from '../utils/storage.js';

export function useGenerateResponse() {
    const [conversations, setConversations] = useState(() => loadStoredConversations());
    const [activeConversationId, setActiveConversationId] = useState(() => loadStoredConversations()[0]?.id || null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const responseRef = useRef(null);

    const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) || conversations[0] || createEmptyConversation();
    const messages = activeConversation?.messages || [];

    useEffect(() => {
        saveStoredConversations(conversations);
    }, [conversations]);

    const selectConversation = (conversationId) => {
        setActiveConversationId(conversationId);
        setError('');
    };

    const createConversation = () => {
        const nextConversation = createEmptyConversation();
        setConversations((current) => [nextConversation, ...current]);
        setActiveConversationId(nextConversation.id);
        setError('');
    };

    const clearConversation = () => {
        setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
            ? { ...conversation, messages: [], title: 'New chat' }
            : conversation));
        setError('');
    };

    const handleSubmit = async (params) => {
        const trimmedPrompt = params.message?.trim();
        if (!trimmedPrompt) {
            setError('Please enter a prompt.');
            return;
        }

        setError('');
        const userMessage = { role: 'user', content: trimmedPrompt };
        const nextMessages = [...messages, userMessage];
        setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
            ? { ...conversation, messages: nextMessages, title: buildConversationTitle(nextMessages) }
            : conversation));
        setLoading(true);

        const assistantMessage = { role: 'assistant', content: '' };
        setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
            ? { ...conversation, messages: [...nextMessages, assistantMessage] }
            : conversation));

        try {
            const result = await generateResponse({
                ...params,
                messages: nextMessages,
            });

            if (!result.success) {
                setError(result.error);
                setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
                    ? { ...conversation, messages: nextMessages, title: buildConversationTitle(nextMessages) }
                    : conversation));
            } else {
                const parts = typeof result.output === 'string' ? result.output.split('') : [];
                let current = '';

                for (const part of parts) {
                    current += part;
                    setConversations((currentConversations) => currentConversations.map((conversation) => conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            messages: [
                                ...nextMessages,
                                { ...assistantMessage, content: current },
                            ],
                        }
                        : conversation));
                }

                setTimeout(() => {
                    responseRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        conversations,
        activeConversationId,
        messages,
        error,
        loading,
        responseRef,
        handleSubmit,
        selectConversation,
        createConversation,
        clearConversation,
        setMessages: (nextMessages) => setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
            ? { ...conversation, messages: nextMessages, title: buildConversationTitle(nextMessages) }
            : conversation)),
        setError,
    };
}
