import { Link } from 'react-router-dom';
import { BookOpen, Clock, Trophy, TrendingUp, Play } from 'lucide-react';
import { useLessonStore } from '@/stores/useLessonStore';
import { useProgressStore } from '@/stores/useLessonStore';

export default function Dashboard() {
    const lessons = useLessonStore(state => state.lessons);
    const isLoading = useLessonStore(state => state.isLoading);
    const progress = useProgressStore(state => state.progress);

    const completedCount = progress.completedLessons.length;
    const totalLessons = lessons.length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    const currentLesson = lessons.find(l => l.id === progress.lastOpenedLesson) || lessons[0];
    const recentLessons = lessons.slice(0, 5);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading lessons...</p>
                </div>
            </div>
        );
    }

    if (lessons.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No lessons found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Check content service for content to get started</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Check console for details</p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: 'Completed',
            value: `${completedCount}/${totalLessons}`,
            icon: Trophy,
            color: 'text-green-600',
        },
        {
            label: 'Progress',
            value: `${progressPercentage}%`,
            icon: TrendingUp,
            color: 'text-blue-600',
        },
        {
            label: 'In Progress',
            value: lessons.filter(l => l.status === 'in-progress').length.toString(),
            icon: Clock,
            color: 'text-yellow-600',
        },
        {
            label: 'Total Lessons',
            value: totalLessons.toString(),
            icon: BookOpen,
            color: 'text-purple-600',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Track your AI learning journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(stat => (
                    <div key={stat.label} className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                            </div>
                            <stat.icon className={`w-8 h-8 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            {currentLesson && (
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Continue Learning</h2>
                    <Link
                        to={`/lesson/${currentLesson.id}`}
                        className="block p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                        Day {currentLesson.day}
                                    </span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${currentLesson.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                        currentLesson.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {currentLesson.difficulty}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                    {currentLesson.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {currentLesson.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {currentLesson.estimatedTime}
                                    </span>
                                    <span>{currentLesson.topics.length} topics</span>
                                </div>
                            </div>
                            <button className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                <Play className="w-5 h-5" />
                            </button>
                        </div>
                    </Link>
                </div>
            )}

            <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Lessons</h2>
                <div className="space-y-3">
                    {recentLessons.map(lesson => (
                        <Link
                            key={lesson.id}
                            to={`/lesson/${lesson.id}`}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${progress.completedLessons.includes(lesson.id)
                                    ? 'bg-green-100 dark:bg-green-900/20'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                    }`}>
                                    <BookOpen className={`w-5 h-5 ${progress.completedLessons.includes(lesson.id)
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                        }`} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        Day {lesson.day}: {lesson.title}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {lesson.estimatedTime} • {lesson.difficulty}
                                    </p>
                                </div>
                            </div>
                            {progress.completedLessons.includes(lesson.id) && (
                                <Trophy className="w-5 h-5 text-green-600" />
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}