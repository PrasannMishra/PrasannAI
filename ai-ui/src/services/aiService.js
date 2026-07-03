/**
 * AI Service
 * Handles all API communication with the backend using @ai-platform/ai-sdk
 */

import { AIClient } from '@ai-platform/ai-sdk';
import { API_CONFIG } from '../config/constants.js';

// Create a singleton client instance
let clientInstance = null;

/**
 * Get or create the AI client instance
 */
export function getAIClient() {
    if (!clientInstance) {
        clientInstance = new AIClient({
            baseUrl: API_CONFIG.baseUrl,
            defaultProvider: API_CONFIG.defaultProvider || 'ollama',
            defaultModel: API_CONFIG.defaultModel,
            defaultMaxTokens: API_CONFIG.defaultMaxTokens,
            defaultTemperature: API_CONFIG.defaultTemperature,
        });
    }
    return clientInstance;
}

/**
 * Send a chat payload to the AI backend and get a response
 * @param {Object} params - Request parameters
 * @param {Array} params.messages - The conversation history
 * @param {string} params.provider - The AI provider to use
 * @param {string} params.model - The model to use
 * @param {number} params.maxTokens - Maximum tokens in response
 * @param {number} params.temperature - Temperature for response generation
 * @param {AbortSignal} params.signal - Abort signal for stopping the request
 * @returns {Promise<Object>} Response from the API
 */
export async function generateResponse({
    messages,
    provider,
    model,
    maxTokens,
    temperature,
    signal,
}) {
    const client = getAIClient();

    try {
        const response = await client.chatSend({
            messages,
            provider,
            model,
            maxTokens,
            temperature,
            signal,
        });

        return {
            success: true,
            output: response.output,
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            // User clicked stop - this is not an error
            return {
                success: true,
                stopped: true,
            };
        }
        return {
            success: false,
            error: error.message || 'Network error',
        };
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
 * @param {AbortSignal} params.signal - Abort signal for stopping the stream
 * @returns {Promise<Object>} Response status
 */
export async function generateResponseStream({
    messages,
    provider,
    model,
    maxTokens,
    temperature,
    onChunk,
    signal,
}) {
    const client = getAIClient();

    try {
        const streamGenerator = client.chatStream({
            messages,
            provider,
            model,
            maxTokens,
            temperature,
            signal,
        });

        for await (const event of streamGenerator) {
            if (event.type === 'chunk' && event.content) {
                onChunk(event.content);
            } else if (event.type === 'error' && event.error) {
                throw new Error(event.error);
            } else if (event.type === 'done') {
                return { success: true };
            } else if (event.type === 'stopped') {
                return { success: true, stopped: true };
            }
        }

        return { success: true };
    } catch (error) {
        if (error.name === 'AbortError') {
            // User clicked stop - this is not an error
            return {
                success: true,
                stopped: true,
            };
        }
        return {
            success: false,
            error: error.message || 'Network error',
        };
    }
}
