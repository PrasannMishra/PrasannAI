/**
 * useGenerateResponse Hook
 * Manages the state and logic for generating AI responses
 */

import { useEffect, useRef, useState } from 'react';
import { generateResponse, generateResponseStream } from '../services/aiService.js';
import { buildConversationTitle, createEmptyConversation, loadStoredConversations, saveStoredConversations } from '../utils/storage.js';

export function useGenerateResponse() {
    const [conversations, setConversations] = useState(() => loadStoredConversations());
    const [activeConversationId, setActiveConversationId] = useState(() => loadStoredConversations()[0]?.id || null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [useStreaming, setUseStreaming] = useState(true); // Enable streaming by default
    const responseRef = useRef(null);
    const abortControllerRef = useRef(null);

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

    const deleteAllConversations = () => {
        setConversations([]);
        setActiveConversationId(null);
        setError('');
    };

    const deleteConversation = (conversationId) => {
        setConversations((current) => current.filter((conversation) => conversation.id !== conversationId));
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

        const assistantMessage = { role: 'assistant', content: '', status: 'streaming' };
        setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
            ? { ...conversation, messages: [...nextMessages, assistantMessage] }
            : conversation));

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        try {
            if (useStreaming) {
                // Use streaming response
                let fullContent = '';

                const result = await generateResponseStream({
                    ...params,
                    messages: nextMessages,
                    signal: abortControllerRef.current.signal,
                    onChunk: (chunk) => {
                        fullContent += chunk;
                        setConversations((currentConversations) => currentConversations.map((conversation) => conversation.id === activeConversationId
                            ? {
                                ...conversation,
                                messages: [
                                    ...nextMessages,
                                    { ...assistantMessage, content: fullContent, status: 'streaming' },
                                ],
                            }
                            : conversation));
                    },
                });

                if (!result.success) {
                    setError(result.error);
                    setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
                        ? { ...conversation, messages: nextMessages, title: buildConversationTitle(nextMessages) }
                        : conversation));
                } else if (result.stopped) {
                    // Mark as stopped if user cancelled
                    setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            messages: conversation.messages.map((msg) =>
                                msg.role === 'assistant' && msg.status === 'streaming'
                                    ? { ...msg, status: 'stopped' }
                                    : msg
                            ),
                        }
                        : conversation));
                } else {
                    // Mark as completed
                    setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            messages: conversation.messages.map((msg) =>
                                msg.role === 'assistant' && msg.status === 'streaming'
                                    ? { ...msg, status: 'completed' }
                                    : msg
                            ),
                        }
                        : conversation));
                }
            } else {
                // Use non-streaming response
                const result = await generateResponse({
                    ...params,
                    messages: nextMessages,
                    signal: abortControllerRef.current.signal,
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
                                    { ...assistantMessage, content: current, status: 'completed' },
                                ],
                            }
                            : conversation));
                    }
                }
            }

            setTimeout(() => {
                responseRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    };

    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    };

    const continueGeneration = async (params) => {
        if (!activeConversation) return;

        setError('');
        setLoading(true);

        // Find the last assistant message with 'stopped' status
        const lastAssistantMessage = [...messages].reverse().find((msg) => msg.role === 'assistant' && msg.status === 'stopped');

        if (!lastAssistantMessage) {
            setLoading(false);
            return;
        }

        // Get the index of the stopped message
        const messageIndex = messages.findIndex((msg) => msg === lastAssistantMessage);
        const messagesUpToStopped = messages.slice(0, messageIndex + 1);

        // Create continuation instruction
        const continuationPrompt = {
            role: 'user',
            content: `Continue the previous assistant response from where it stopped.\n\nDo not repeat any previously generated content.\n\nContinue naturally from the last completed sentence if possible.\n\nDo not restart the explanation.`
        };

        const nextMessages = [...messagesUpToStopped, continuationPrompt];

        // Store the index for later updates
        const targetMessageIndex = messageIndex;

        // Update the stopped message to streaming status
        setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
            ? {
                ...conversation,
                messages: conversation.messages.map((msg, idx) =>
                    idx === targetMessageIndex
                        ? { ...msg, status: 'streaming' }
                        : msg
                ),
            }
            : conversation));

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        try {
            if (useStreaming) {
                // Use streaming response
                let fullContent = lastAssistantMessage.content;

                const result = await generateResponseStream({
                    ...params,
                    messages: nextMessages,
                    signal: abortControllerRef.current.signal,
                    onChunk: (chunk) => {
                        fullContent += chunk;
                        setConversations((currentConversations) => currentConversations.map((conversation) => conversation.id === activeConversationId
                            ? {
                                ...conversation,
                                messages: conversation.messages.map((msg, idx) =>
                                    idx === targetMessageIndex
                                        ? { ...msg, content: fullContent, status: 'streaming' }
                                        : msg
                                ),
                            }
                            : conversation));
                    },
                });

                if (!result.success) {
                    setError(result.error);
                    // Mark as error
                    setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            messages: conversation.messages.map((msg, idx) =>
                                idx === targetMessageIndex
                                    ? { ...msg, status: 'error' }
                                    : msg
                            ),
                        }
                        : conversation));
                } else if (result.stopped) {
                    // Mark as stopped again
                    setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            messages: conversation.messages.map((msg, idx) =>
                                idx === targetMessageIndex
                                    ? { ...msg, status: 'stopped' }
                                    : msg
                            ),
                        }
                        : conversation));
                } else {
                    // Mark as completed
                    setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            messages: conversation.messages.map((msg, idx) =>
                                idx === targetMessageIndex
                                    ? { ...msg, status: 'completed' }
                                    : msg
                            ),
                        }
                        : conversation));
                }
            } else {
                // Use non-streaming response
                const result = await generateResponse({
                    ...params,
                    messages: nextMessages,
                    signal: abortControllerRef.current.signal,
                });

                if (!result.success) {
                    setError(result.error);
                    setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            messages: conversation.messages.map((msg, idx) =>
                                idx === targetMessageIndex
                                    ? { ...msg, status: 'error' }
                                    : msg
                            ),
                        }
                        : conversation));
                } else {
                    const continuedContent = lastAssistantMessage.content + result.output;
                    setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
                        ? {
                            ...conversation,
                            messages: conversation.messages.map((msg, idx) =>
                                idx === targetMessageIndex
                                    ? { ...msg, content: continuedContent, status: 'completed' }
                                    : msg
                            ),
                        }
                        : conversation));
                }
            }

            setTimeout(() => {
                responseRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    };

    return {
        conversations,
        activeConversationId,
        messages,
        error,
        loading,
        useStreaming,
        setUseStreaming,
        responseRef,
        handleSubmit,
        stopGeneration,
        continueGeneration,
        selectConversation,
        createConversation,
        clearConversation,
        deleteAllConversations,
        deleteConversation,
        setMessages: (nextMessages) => setConversations((current) => current.map((conversation) => conversation.id === activeConversationId
            ? { ...conversation, messages: nextMessages, title: buildConversationTitle(nextMessages) }
            : conversation)),
        setError,
    };
}
