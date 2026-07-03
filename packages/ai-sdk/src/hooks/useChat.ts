import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, CompletionResponse, ProviderType, StreamEvent } from '@ai-platform/shared-types';
import { AIClient } from '../client/aiClient.js';

export interface UseChatOptions {
    client: AIClient;
    provider?: ProviderType;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    onError?: (error: Error) => void;
}

export interface UseChatReturn {
    messages: ChatMessage[];
    isLoading: boolean;
    error: Error | null;
    send: (messages: ChatMessage[]) => Promise<CompletionResponse>;
    stream: (messages: ChatMessage[], onChunk: (chunk: string) => void) => AsyncGenerator<StreamEvent, void, unknown>;
    stop: () => void;
    clear: () => void;
}

/**
 * React hook for chat functionality
 */
export function useChat(options: UseChatOptions): UseChatReturn {
    const { client, provider, model, maxTokens, temperature, onError } = options;

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    const send = useCallback(async (newMessages: ChatMessage[]): Promise<CompletionResponse> => {
        setIsLoading(true);
        setError(null);

        abortControllerRef.current = new AbortController();

        try {
            const response = await client.chatSend({
                messages: newMessages,
                provider,
                model,
                maxTokens,
                temperature,
                signal: abortControllerRef.current.signal,
            });

            if (response.success && response.output) {
                const assistantMessage: ChatMessage = {
                    role: 'assistant',
                    content: response.output,
                    timestamp: new Date(),
                };

                setMessages((prev: ChatMessage[]) => [...prev, assistantMessage]);
            }

            return response;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            onError?.(error);
            throw error;
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [client, provider, model, maxTokens, temperature, onError]);

    const stream = useCallback(async function* (
        newMessages: ChatMessage[],
        onChunk: (chunk: string) => void
    ): AsyncGenerator<StreamEvent, void, unknown> {
        setIsLoading(true);
        setError(null);

        abortControllerRef.current = new AbortController();

        try {
            const userMessage: ChatMessage = {
                role: 'user',
                content: newMessages[newMessages.length - 1]?.content || '',
                timestamp: new Date(),
            };

            setMessages((prev: ChatMessage[]) => [...prev, userMessage]);

            const streamGenerator = client.chatStream({
                messages: newMessages,
                provider,
                model,
                maxTokens,
                temperature,
                signal: abortControllerRef.current.signal,
            });

            let fullResponse = '';

            for await (const event of streamGenerator) {
                if (event.type === 'chunk' && event.content) {
                    fullResponse += event.content;
                    onChunk(event.content);
                } else if (event.type === 'error' && event.error) {
                    const error = new Error(event.error);
                    setError(error);
                    onError?.(error);
                    throw error;
                } else if (event.type === 'done') {
                    const assistantMessage: ChatMessage = {
                        role: 'assistant',
                        content: fullResponse,
                        timestamp: new Date(),
                    };

                    setMessages((prev: ChatMessage[]) => [...prev, assistantMessage]);
                }

                yield event;
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            onError?.(error);
            throw error;
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [client, provider, model, maxTokens, temperature, onError]);

    const stop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    }, []);

    const clear = useCallback(() => {
        setMessages([]);
        setError(null);
        stop();
    }, [stop]);

    return {
        messages,
        isLoading,
        error,
        send,
        stream,
        stop,
        clear,
    };
}