import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, BookOpen } from 'lucide-react';
import { Lesson } from '@/types';
import { useProgressStore } from '@/stores/useLessonStore';

interface LessonLinkProps {
    lesson: Lesson;
    isActive?: boolean;
}

export function LessonLink({ lesson, isActive }: LessonLinkProps) {
    const completedLessons = useProgressStore(state => state.progress.completedLessons);
    const isCompleted = completedLessons.includes(lesson.id);

    const baseClasses = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors duration-200';
    const activeClasses = isActive
        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
        : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50';

    return (
        <Link to={`/lesson/${lesson.id}`} className={`${baseClasses} ${activeClasses}`}>
            {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
                <Circle className="w-4 h-4 text-gray-400 dark:text-gray-600 flex-shrink-0" />
            )}
            <span className="flex-1 truncate">
                Day {lesson.day}: {lesson.title}
            </span>
            {lesson.difficulty && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                    {lesson.difficulty === 'Beginner' ? 'B' : lesson.difficulty === 'Intermediate' ? 'I' : 'A'}
                </span>
            )}
        </Link>
    );
}