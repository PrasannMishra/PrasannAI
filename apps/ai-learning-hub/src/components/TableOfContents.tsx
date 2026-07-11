import { useState, useRef, useCallback, useEffect } from 'react';
import { CheckCircle2, Play, Circle, ChevronUp } from 'lucide-react';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { useAutoScrollTOC } from '@/hooks/useAutoScrollTOC';
import type { Heading } from '@/hooks/useScrollSpy';

interface TableOfContentsProps {
    headings: Heading[];
}

/**
 * Premium Table of Contents component with scrollspy, auto-scroll, and mobile swipe drawer
 * Inspired by GitBook, Notion, Vercel Docs, and Anthropic Docs
 */
export default function TableOfContents({ headings }: TableOfContentsProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const itemRefs = useRef<Map<string, HTMLAnchorElement | null>>(new Map());
    const drawerRef = useRef<HTMLDivElement>(null);

    // Scroll spy to track active and visited headings
    const { activeId, visitedIds } = useScrollSpy({ headings, offset: 100 });

    // Auto-scroll TOC to keep active item centered
    const { containerRef } = useAutoScrollTOC(activeId, itemRefs.current);

    // Smooth scroll to heading
    const scrollToHeading = useCallback((id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close mobile drawer after clicking
            setIsMobileOpen(false);
        }
    }, []);

    // Scroll to top
    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsMobileOpen(false);
    }, []);

    // Touch handlers for mobile swipe drawer
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStart) return;

        const touchEnd = e.touches[0].clientX;
        const diff = touchStart - touchEnd;

        // Swipe left to close (drag more than 50px)
        if (diff > 50) {
            setIsMobileOpen(false);
        }
    }, [touchStart]);

    const handleTouchEnd = useCallback(() => {
        setTouchStart(null);
    }, []);

    // Close drawer when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                setIsMobileOpen(false);
            }
        };

        if (isMobileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isMobileOpen]);

    // Prevent body scroll when mobile drawer is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileOpen]);

    // Get icon for heading based on state
    const getHeadingIcon = (headingId: string) => {
        if (activeId === headingId) {
            return <Play className="w-3.5 h-3.5 fill-current" />;
        }
        if (visitedIds.has(headingId)) {
            return <CheckCircle2 className="w-3.5 h-3.5" />;
        }
        return <Circle className="w-3.5 h-3.5" />;
    };

    // Get heading styles based on state
    const getHeadingStyles = (headingId: string, _level: number) => {
        const isActive = activeId === headingId;
        const isVisited = visitedIds.has(headingId);

        if (isActive) {
            return {
                className: 'group flex items-start gap-2 py-1.5 px-2 -ml-2 pr-2 rounded-md transition-all duration-200 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium border-l-2 border-primary-600 dark:border-primary-400',
                iconClassName: 'text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0',
                textClassName: 'text-sm leading-relaxed',
            };
        }

        if (isVisited) {
            return {
                className: 'group flex items-start gap-2 py-1.5 px-2 -ml-2 pr-2 rounded-md transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200',
                iconClassName: 'text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0',
                textClassName: 'text-sm leading-relaxed',
            };
        }

        return {
            className: 'group flex items-start gap-2 py-1.5 px-2 -ml-2 pr-2 rounded-md transition-all duration-200 text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300',
            iconClassName: 'text-gray-400 dark:text-gray-600 mt-0.5 flex-shrink-0',
            textClassName: 'text-sm leading-relaxed',
        };
    };

    // Mobile swipe handle
    const MobileSwipeHandle = () => (
        <div className="lg:hidden fixed top-0 right-0 bottom-0 w-16 z-40"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd} />
    );

    if (headings.length === 0) {
        return null;
    }

    return (
        <>
            {/* Mobile FAB to open TOC */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-30 p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
                aria-label="Open table of contents"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
            </button>

            {/* Mobile Swipe Handle */}
            <MobileSwipeHandle />

            {/* Mobile Drawer */}
            {isMobileOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                        onClick={() => setIsMobileOpen(false)}
                    />

                    {/* Drawer */}
                    <div
                        ref={drawerRef}
                        className="lg:hidden fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-out"
                        style={{ transform: isMobileOpen ? 'translateX(0)' : 'translateX(100%)' }}
                    >
                        <div className="flex flex-col h-full">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-white">On This Page</h3>
                                <button
                                    onClick={() => setIsMobileOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    aria-label="Close table of contents"
                                >
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <nav className="space-y-0.5" aria-label="Table of contents">
                                    {headings.map((heading) => {
                                        const styles = getHeadingStyles(heading.id, heading.level);
                                        const isActive = activeId === heading.id;

                                        return (
                                            <a
                                                key={heading.id}
                                                ref={(el) => { itemRefs.current.set(heading.id, el); }}
                                                href={`#${heading.id}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    scrollToHeading(heading.id);
                                                }}
                                                className={styles.className}
                                                aria-current={isActive ? 'true' : undefined}
                                            >
                                                <span className={styles.iconClassName} aria-hidden="true">
                                                    {getHeadingIcon(heading.id)}
                                                </span>
                                                <span className={styles.textClassName}>{heading.text}</span>
                                            </a>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Back to Top Button */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={scrollToTop}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                                    aria-label="Scroll back to top"
                                >
                                    <ChevronUp className="w-4 h-4" />
                                    Back to Top
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Desktop TOC */}
            <div className="sticky top-0 hidden lg:block">
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">On This Page</h3>

                    {/* Scrollable TOC Container */}
                    <div
                        ref={containerRef}
                        className="overflow-y-auto scrollbar-thin max-h-[calc(100vh-12rem)]"
                        role="navigation"
                        aria-label="Table of contents"
                    >
                        <nav className="space-y-0.5">
                            {headings.map((heading) => {
                                const styles = getHeadingStyles(heading.id, heading.level);
                                const isActive = activeId === heading.id;

                                return (
                                    <a
                                        key={heading.id}
                                        ref={(el) => { itemRefs.current.set(heading.id, el); }}
                                        href={`#${heading.id}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            scrollToHeading(heading.id);
                                        }}
                                        className={styles.className}
                                        aria-current={isActive ? 'true' : undefined}
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                scrollToHeading(heading.id);
                                            }
                                        }}
                                    >
                                        <span className={styles.iconClassName} aria-hidden="true">
                                            {getHeadingIcon(heading.id)}
                                        </span>
                                        <span className={styles.textClassName}>{heading.text}</span>
                                    </a>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Back to Top Button - Always visible */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <button
                            onClick={scrollToTop}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                            aria-label="Scroll back to top"
                        >
                            <ChevronUp className="w-4 h-4" />
                            Back to Top
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}