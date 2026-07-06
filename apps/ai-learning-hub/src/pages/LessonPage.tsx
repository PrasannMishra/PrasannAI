import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, Clock, CheckCircle2, Circle, Share2, Bookmark } from 'lucide-react';
import { useLessonStore } from '@/stores/useLessonStore';
import { useProgressStore } from '@/stores/useLessonStore';
import MDXContent from '@/components/MDXContent';
import { extractHeadings } from '@/utils/tableOfContents';

export default function LessonPage() {
    const { id } = useParams<{ id: string }>();
    const lessons = useLessonStore(state => state.lessons);
    const getAdjacentLessons = useLessonStore(state => state.getAdjacentLessons);
    const progress = useProgressStore(state => state.progress);
    const markLessonComplete = useProgressStore(state => state.markLessonComplete);
    const updateReadingProgress = useProgressStore(state => state.updateReadingProgress);

    console.log("LessonPage - Current lesson ID:", lessons, id);

    const lesson = lessons.find(l => l.id === id);

    const { previous, next } = useMemo(() => {
        if (!id) return { previous: undefined, next: undefined };
        return getAdjacentLessons(id);
    }, [id, getAdjacentLessons]);

    useEffect(() => {
        if (lesson) {
            useProgressStore.getState().updateProgress({
                lastOpenedLesson: lesson.id,
            });
        }
    }, [lesson]);

    const handleScroll = () => {
        if (!id) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
        updateReadingProgress(id, scrollPercentage);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id]);

    if (!lesson) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lesson not found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">The lesson you're looking for doesn't exist.</p>
                    <Link to="/" className="btn-primary">Go to Dashboard</Link>
                </div>
            </div>
        );
    }

    const isCompleted = progress.completedLessons.includes(lesson.id);
    const readingProgress = progress.readingProgress[lesson.id] || 0;
    const headings = extractHeadings(lesson.content);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <Link to="/" className="hover:text-primary-600">Dashboard</Link>
                    <span>/</span>
                    <span>Day {lesson.day}</span>
                </div>

                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                Day {lesson.day}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${lesson.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                lesson.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {lesson.difficulty}
                            </span>
                            {isCompleted && (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Completed
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{lesson.title}</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">{lesson.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {lesson.estimatedTime}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => markLessonComplete(lesson.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isCompleted
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                            {isCompleted ? 'Completed' : 'Mark Complete'}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <Bookmark className="w-4 h-4" />
                            Bookmark
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8">
                    <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${readingProgress}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="card prose-content">
                        <MDXContent content={lesson.content} />
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        {previous ? (
                            <Link
                                to={`/lesson/${previous.id}`}
                                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <div>
                                    <p className="text-sm text-gray-500">Previous</p>
                                    <p className="font-medium">Day {previous.day}: {previous.title}</p>
                                </div>
                            </Link>
                        ) : (
                            <div />
                        )}
                        {next ? (
                            <Link
                                to={`/lesson/${next.id}`}
                                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                            >
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Next</p>
                                    <p className="font-medium">Day {next.day}: {next.title}</p>
                                </div>
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        ) : (
                            <div />
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="card sticky top-24">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">On This Page</h3>
                        <div className="space-y-2 text-sm">
                            {headings.length > 0 ? (
                                <nav>
                                    {headings.map((heading, idx) => (
                                        <a
                                            key={idx}
                                            href={`#${heading.id}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const element = document.getElementById(heading.id);
                                                if (element) {
                                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }
                                            }}
                                            className={`block py-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${heading.level === 1 ? 'font-medium' :
                                                heading.level === 2 ? 'pl-2' :
                                                    heading.level === 3 ? 'pl-4' :
                                                        'pl-6'
                                                }`}
                                        >
                                            {heading.text}
                                        </a>
                                    ))}
                                </nav>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No headings found in this lesson.</p>
                            )}
                        </div>

                        {lesson.topics.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Topics</h4>
                                <div className="flex flex-wrap gap-2">
                                    {lesson.topics.map(topic => (
                                        <span
                                            key={topic}
                                            className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs rounded"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {lesson.resources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Resources</h4>
                                <div className="space-y-2">
                                    {lesson.resources.map((resource, idx) => (
                                        <a
                                            key={idx}
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-sm text-primary-600 hover:text-primary-700"
                                        >
                                            {resource.title}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}