import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Lesson } from '@/types';
import { useLessonStore } from '@/stores/useLessonStore';
import { useProgressStore } from '@/stores/useLessonStore';
import { SidebarItem } from './SidebarItem';
import { RoadmapSection } from './RoadmapSection';
import { ConceptSection } from './ConceptSection';

export function Sidebar() {
    const location = useLocation();
    const lessons = useLessonStore(state => state.lessons) || [];
    const completedLessons = useProgressStore(state => state.progress.completedLessons);

    const currentLessonId = useMemo(() => {
        const match = location.pathname.match(/\/lesson\/(.+)/);
        return match ? match[1] : undefined;
    }, [location.pathname]);

    const totalCompleted = completedLessons.length;
    const totalLessons = lessons.length;
    const progressPercentage = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

    // Check if we have metadata-driven lessons
    const hasPhaseData = useMemo(() => lessons.some(lesson => lesson.phase), [lessons]);
    const hasCategoryData = useMemo(() => lessons.some(lesson => lesson.categories && lesson.categories.length > 0), [lessons]);

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 mb-6">
                    <GraduationCap className="w-8 h-8 text-primary-600" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            AI Learning Hub
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Master AI Engineering
                        </p>
                    </div>
                </Link>

                {/* Progress Indicator */}
                {totalLessons > 0 && (
                    <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Progress
                            </span>
                            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                {progressPercentage}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {totalCompleted} of {totalLessons} lessons completed
                        </p>
                    </div>
                )}

                {/* Navigation */}
                <nav className="space-y-1">
                    {/* Main Navigation Links */}
                    <div className="space-y-1">
                        <SidebarItem name="Dashboard" path="/" />
                        {/* <SidebarItem name="Search" path="/search" />
                        <SidebarItem name="Settings" path="/settings" /> */}
                    </div>

                    {/* Learning Path Section - Always show if we have lessons */}
                    {totalLessons > 0 && (
                        <div className="mt-4">
                            <div className="border-t border-gray-200 dark:border-gray-700 mb-2" />
                            <RoadmapSection
                                lessons={lessons}
                                currentLessonId={currentLessonId}
                            />
                        </div>
                    )}

                    {/* Concepts Section - Always show if we have lessons */}
                    {totalLessons > 0 && (
                        <div className="mt-4">
                            <div className="border-t border-gray-200 dark:border-gray-700 mb-2" />
                            <ConceptSection
                                lessons={lessons}
                                currentLessonId={currentLessonId}
                            />
                        </div>
                    )}

                    {/* Other Section */}
                    <div className="mt-4">
                        <div className="border-t border-gray-200 dark:border-gray-700 mb-2" />
                        <div className="space-y-1">
                            <SidebarItem name="Projects" />
                            <SidebarItem name="Interview Preparation" />
                        </div>
                    </div>
                </nav>
            </div>
        </aside>
    );
}