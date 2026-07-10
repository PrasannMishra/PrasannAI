import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to automatically scroll the TOC container to keep the active item centered
 * This ensures the active heading is always visible without manual scrolling
 */
export function useAutoScrollTOC(activeId: string | null, itemRefs: Map<string, HTMLElement | null>) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const scrollToActive = useCallback(() => {
        if (!activeId || !containerRef.current) return;

        const activeElement = itemRefs.get(activeId);
        if (!activeElement || !containerRef.current) return;

        const container = containerRef.current;
        const containerHeight = container.clientHeight;
        const elementTop = activeElement.offsetTop;
        const elementHeight = activeElement.offsetHeight;

        // Calculate scroll position to center the active element
        const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);

        // Smooth scroll to center the active item
        container.scrollTo({
            top: scrollTop,
            behavior: 'smooth',
        });
    }, [activeId, itemRefs]);

    useEffect(() => {
        scrollToActive();
    }, [scrollToActive]);

    return { containerRef, scrollToActive };
}