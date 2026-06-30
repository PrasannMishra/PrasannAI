/**
 * useCopyToClipboard Hook
 * Manages copy-to-clipboard functionality
 */

import { useState } from 'react';

export function useCopyToClipboard(timeout = 2000) {
    const [copied, setCopied] = useState(false);

    const copy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), timeout);
            return true;
        } catch (error) {
            console.error('Failed to copy:', error);
            return false;
        }
    };

    return {
        copied,
        copy,
    };
}
