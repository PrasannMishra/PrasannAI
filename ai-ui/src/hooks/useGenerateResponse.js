/**
 * useGenerateResponse Hook
 * Manages the state and logic for generating AI responses
 */

import { useState, useRef } from 'react';
import { generateResponse } from '../services/aiService.js';

export function useGenerateResponse() {
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const responseRef = useRef(null);

    /**
     * Handle form submission and generate response
     */
    const handleSubmit = async (event, params) => {
        event.preventDefault();
        setError('');
        setResponse('');

        if (!params.prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }

        setLoading(true);
        try {
            const result = await generateResponse(params);

            if (!result.success) {
                setError(result.error);
            } else {
                setResponse(result.output);
                // Auto-scroll to response on mobile
                setTimeout(() => {
                    responseRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        response,
        error,
        loading,
        responseRef,
        handleSubmit,
        setResponse,
        setError,
    };
}
