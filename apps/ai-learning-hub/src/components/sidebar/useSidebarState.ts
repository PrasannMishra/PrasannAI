import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'sidebar-expanded-state';

interface SidebarState {
    [key: string]: boolean;
}

export function useSidebarState() {
    const [expandedSections, setExpandedSections] = useState<SidebarState>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading sidebar state:', error);
        }
        // Default expanded sections
        return {
            'roadmap-section': true,
            'concepts-section': true,
        };
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedSections));
        } catch (error) {
            console.error('Error saving sidebar state:', error);
        }
    }, [expandedSections]);

    const toggleSection = useCallback((sectionId: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    }, []);

    const isExpanded = useCallback((sectionId: string) => {
        return expandedSections[sectionId] ?? false;
    }, [expandedSections]);

    const expandAll = useCallback(() => {
        setExpandedSections(prev => {
            const allExpanded = { ...prev };
            // This will be called with specific section IDs
            return allExpanded;
        });
    }, []);

    const collapseAll = useCallback(() => {
        setExpandedSections({});
    }, []);

    return {
        expandedSections,
        toggleSection,
        isExpanded,
        expandAll,
        collapseAll,
    };
}