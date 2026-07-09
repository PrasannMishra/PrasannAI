import { useMemo } from 'react';
import { Lesson } from '@/types';
import { SidebarItem } from './SidebarItem';
import { LessonLink } from './LessonLink';
import { useSidebarState } from './useSidebarState';

interface ConceptSectionProps {
    lessons: Lesson[];
    currentLessonId?: string;
}

interface ConceptGroup {
    category: string;
    lessons: Lesson[];
}

export function ConceptSection({ lessons, currentLessonId }: ConceptSectionProps) {
    const { isExpanded, toggleSection } = useSidebarState();

    const conceptGroups = useMemo(() => {
        const groups: Map<string, Lesson[]> = new Map();

        lessons.forEach(lesson => {
            const categories = lesson.categories || [];
            categories.forEach(category => {
                if (!groups.has(category)) {
                    groups.set(category, []);
                }
                groups.get(category)!.push(lesson);
            });
        });

        return Array.from(groups.entries())
            .map(([category, categoryLessons]) => ({
                category,
                lessons: categoryLessons.sort((a, b) => a.day - b.day),
            }))
            .filter(group => group.lessons.length > 0);
    }, [lessons]);

    const sectionId = 'concepts-section';

    if (conceptGroups.length === 0) {
        return null;
    }

    return (
        <div className="space-y-1">
            <SidebarItem
                name="Concepts"
                isCollapsible
                isExpanded={isExpanded(sectionId)}
                onToggle={() => toggleSection(sectionId)}
            />
            {isExpanded(sectionId) && (
                <div className="ml-4 space-y-1">
                    {conceptGroups.map(({ category, lessons: categoryLessons }) => {
                        const categoryId = `concept-${category.toLowerCase().replace(/\s+/g, '-')}`;

                        return (
                            <div key={category} className="space-y-1">
                                <SidebarItem
                                    name={formatCategoryName(category)}
                                    isCollapsible
                                    isExpanded={isExpanded(categoryId)}
                                    onToggle={() => toggleSection(categoryId)}
                                />
                                {isExpanded(categoryId) && (
                                    <div className="ml-4 space-y-0.5">
                                        {categoryLessons.map(lesson => (
                                            <LessonLink
                                                key={lesson.id}
                                                lesson={lesson}
                                                isActive={lesson.id === currentLessonId}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function formatCategoryName(category: string): string {
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}