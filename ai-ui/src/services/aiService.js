/**
 * AI Service
 * Handles all API communication with the backend
 */

import { API_CONFIG } from '../config/constants.js';

/**
 * Send a chat payload to the AI backend and get a response
 * @param {Object} params - Request parameters
 * @param {Array} params.messages - The conversation history
 * @param {string} params.provider - The AI provider to use
 * @param {string} params.model - The model to use
 * @param {number} params.maxTokens - Maximum tokens in response
 * @param {number} params.temperature - Temperature for response generation
 * @returns {Promise<Object>} Response from the API
 */
export async function generateResponse({
    messages,
    provider,
    model,
    maxTokens,
    temperature,
}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    console.log('API_CONFIG.baseUrl:', API_CONFIG.baseUrl);
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoint}`, {
            method: API_CONFIG.method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                provider,
                model,
                maxTokens: Number(maxTokens),
                temperature: Number(temperature),
            }),
            signal: controller.signal,
        });

        const payload = await response.json();

        if (!response.ok) {
            throw new Error(payload.error || 'Request failed');
        }

        return {
            success: true,
            output: payload.output || JSON.stringify(payload, null, 2),
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            return {
                success: false,
                error: 'Request timeout - taking too long to respond',
            };
        }
        return {
            success: false,
            error: error.message || 'Network error',
        };
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Generate a streamed response from the AI backend
 * @param {Object} params - Request parameters
 * @param {Array} params.messages - The conversation history
 * @param {string} params.provider - The AI provider to use
 * @param {string} params.model - The model to use
 * @param {number} params.maxTokens - Maximum tokens in response
 * @param {number} params.temperature - Temperature for response generation
 * @param {Function} params.onChunk - Callback for each chunk received
 * @returns {Promise<Object>} Response status
 */
export async function generateResponseStream({
    messages,
    provider,
    model,
    maxTokens,
    temperature,
    onChunk,
}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout * 10); // Longer timeout for streaming

    try {
        const response = await fetch(`http://127.0.0.1:8080/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                provider,
                model,
                maxTokens: Number(maxTokens),
                temperature: Number(temperature),
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            const payload = await response.json();
            throw new Error(payload.error || 'Request failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix

                        if (data.type === 'error') {
                            throw new Error(data.error);
                        } else if (data.type === 'chunk') {
                            onChunk(data.content);
                        } else if (data.type === 'done') {
                            return { success: true };
                        }
                    } catch (e) {
                        // Skip invalid JSON lines
                    }
                }
            }
        }

        return { success: true };
    } catch (error) {
        if (error.name === 'AbortError') {
            return {
                success: false,
                error: 'Request timeout - taking too long to respond',
            };
        }
        return {
            success: false,
            error: error.message || 'Network error',
        };
    } finally {
        clearTimeout(timeoutId);
    }
}
