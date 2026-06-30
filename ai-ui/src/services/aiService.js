/**
 * AI Service
 * Handles all API communication with the backend
 */

import { API_CONFIG } from '../config/constants.js';

/**
 * Send a prompt to the AI backend and get a response
 * @param {Object} params - Request parameters
 * @param {string} params.prompt - The user's prompt
 * @param {string} params.provider - The AI provider to use
 * @param {string} params.model - The model to use
 * @param {number} params.maxTokens - Maximum tokens in response
 * @param {number} params.temperature - Temperature for response generation
 * @returns {Promise<Object>} Response from the API
 */
export async function generateResponse({
    prompt,
    provider,
    model,
    maxTokens,
    temperature,
}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
        const response = await fetch(API_CONFIG.endpoint, {
            method: API_CONFIG.method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
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
