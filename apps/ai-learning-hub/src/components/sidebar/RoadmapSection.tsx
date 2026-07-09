import { useMemo } from 'react';
import { Lesson } from '@/types';
import { SidebarItem } from './SidebarItem';
import { LessonLink } from './LessonLink';
import { useSidebarState } from './useSidebarState';

interface RoadmapSectionProps {
    lessons: Lesson[];
    currentLessonId?: string;
}

interface PhaseGroup {
    phase: string;
    lessons: Lesson[];
}

export function RoadmapSection({ lessons, currentLessonId }: RoadmapSectionProps) {
    const { isExpanded, toggleSection } = useSidebarState();
    const sectionId = 'roadmap-section';

    console.log('RoadmapSection render:', { lessonsCount: lessons.length, lessons: lessons.slice(0, 2) });

    const phaseGroups = useMemo(() => {
        const groups: Map<string, Lesson[]> = new Map();

        lessons.forEach(lesson => {
            const phase = lesson.phase || 'General';
            if (!groups.has(phase)) {
                groups.set(phase, []);
            }
            groups.get(phase)!.push(lesson);
        });

        return Array.from(groups.entries()).map(([phase, phaseLessons]) => ({
            phase,
            lessons: phaseLessons.sort((a, b) => a.day - b.day),
        }));
    }, [lessons]);

    console.log('RoadmapSection phaseGroups:', phaseGroups.length);

    if (phaseGroups.length === 0) {
        return null;
    }

    return (
        <div className="space-y-1">
            <SidebarItem
                name="AI Engineer Roadmap"
                isCollapsible
                isExpanded={isExpanded(sectionId)}
                onToggle={() => toggleSection(sectionId)}
            />
            {isExpanded(sectionId) && (
                <div className="ml-4 space-y-2">
                    {phaseGroups.map(({ phase, lessons: phaseLessons }) => {
                        const phaseId = `phase-${phase.toLowerCase().replace(/\s+/g, '-')}`;

                        return (
                            <div key={phase} className="space-y-1">
                                <SidebarItem
                                    name={phase}
                                    isCollapsible
                                    isExpanded={isExpanded(phaseId)}
                                    onToggle={() => toggleSection(phaseId)}
                                />
                                {isExpanded(phaseId) && (
                                    <div className="ml-4 space-y-0.5">
                                        {phaseLessons.map(lesson => (
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