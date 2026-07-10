import { useEffect, useState, useCallback } from 'react';

export interface Heading {
    id: string;
    text: string;
    level: number;
}

interface UseScrollSpyOptions {
    headings: Heading[];
    offset?: number;
}

interface UseScrollSpyReturn {
    activeId: string | null;
    visitedIds: Set<string>;
}

/**
 * Custom hook for scroll spy functionality using IntersectionObserver
 * Tracks which heading is currently in view and which have been visited
 */
export function useScrollSpy({ headings, offset = 100 }: UseScrollSpyOptions): UseScrollSpyReturn {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());

    const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
            const id = entry.target.id;

            // Track visited sections
            if (entry.isIntersecting) {
                setVisitedIds(prev => new Set(prev).add(id));
            }

            // Update active heading
            if (entry.isIntersecting && entry.intersectionRatio > 0) {
                // Find the first visible heading (topmost)
                const visibleHeadings = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                if (visibleHeadings.length > 0) {
                    setActiveId(visibleHeadings[0].target.id);
                }
            }
        });
    }, []);

    useEffect(() => {
        if (headings.length === 0) return;

        // Create observer
        const observer = new IntersectionObserver(handleIntersection, {
            root: null,
            rootMargin: `-${offset}px 0px -80% 0px`, // Trigger when heading is near top
            threshold: [0, 1],
        });

        // Observe all heading elements
        const elements = headings
            .map(h => document.getElementById(h.id))
            .filter((el): el is HTMLElement => el !== null);

        elements.forEach(el => observer.observe(el));

        return () => {
            elements.forEach(el => observer.unobserve(el));
            observer.disconnect();
        };
    }, [headings, offset, handleIntersection]);

    return { activeId, visitedIds };
}