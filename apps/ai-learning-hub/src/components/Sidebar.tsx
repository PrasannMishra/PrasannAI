import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Search,
    Settings,
    FolderOpen,
    BookMarked,
    FileText,
    GraduationCap,
    Puzzle,
    Network,
    FlaskConical,
    Lightbulb,
    Code2,
} from 'lucide-react';
import { useLessonStore } from '@/stores/useLessonStore';

const categories = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    // { id: 'search', name: 'Search', icon: Search, path: '/search' },
    // { id: 'settings', name: 'Settings', icon: Settings, path: '/settings' },
    { id: 'divider-1', name: '', icon: null, path: '' },
    { id: 'introduction', name: 'Introduction', icon: BookOpen, path: null },
    { id: 'core-ai', name: 'Core AI', icon: Lightbulb, path: null },
    { id: 'llms', name: 'LLMs', icon: Network, path: null },
    { id: 'prompt-engineering', name: 'Prompt Engineering', icon: FileText, path: null },
    { id: 'context-engineering', name: 'Context Engineering', icon: FlaskConical, path: null },
    { id: 'rag', name: 'RAG', icon: Puzzle, path: null },
    { id: 'embeddings', name: 'Embeddings', icon: Code2, path: null },
    { id: 'agents', name: 'Agents', icon: GraduationCap, path: null },
    { id: 'mcp', name: 'MCP', icon: Network, path: null },
    { id: 'divider-2', name: '', icon: null, path: '' },
    { id: 'projects', name: 'Projects', icon: FolderOpen, path: null },
    { id: 'interview', name: 'Interview Preparation', icon: BookMarked, path: null },
];

export default function Sidebar() {
    const location = useLocation();
    const lessons = useLessonStore(state => state.lessons);

    const getLessonsForCategory = (categoryId: string) => {
        const categoryMap: Record<string, string[]> = {
            'introduction': ['introduction', 'getting-started', 'setup'],
            'core-ai': ['ai', 'artificial-intelligence', 'machine-learning'],
            'llms': ['llm', 'language-model', 'gpt', 'claude'],
            'prompt-engineering': ['prompt', 'prompt-engineering'],
            'context-engineering': ['context', 'context-engineering'],
            'rag': ['rag', 'retrieval', 'vector'],
            'embeddings': ['embedding', 'vector-embedding'],
            'agents': ['agent', 'autonomous'],
            'mcp': ['mcp', 'model-context-protocol'],
            'projects': [],
            'interview': ['interview'],
        };

        const keywords = categoryMap[categoryId] || [];
        if (keywords.length === 0) return [];

        return lessons.filter(lesson => {
            const searchText = `${lesson.title} ${lesson.description} ${lesson.topics.join(' ')} ${lesson.tags.join(' ')}`.toLowerCase();
            return keywords.some(keyword => searchText.includes(keyword));
        });
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
                <Link to="/" className="flex items-center gap-2 mb-6">
                    <GraduationCap className="w-8 h-8 text-primary-600" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Learning Hub</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Master AI Engineering</p>
                    </div>
                </Link>

                <nav className="space-y-1">
                    {categories.map(category => {
                        if (category.id.startsWith('divider')) {
                            return (
                                <div key={category.id} className="pt-4 pb-2">
                                    <div className="border-t border-gray-200 dark:border-gray-700" />
                                </div>
                            );
                        }

                        const Icon = category.icon;
                        if (!Icon) return null;

                        const isActive = category.path && location.pathname === category.path;
                        const categoryLessons = category.path ? [] : getLessonsForCategory(category.id);

                        if (category.path) {
                            return (
                                <Link
                                    key={category.id}
                                    to={category.path}
                                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{category.name}</span>
                                </Link>
                            );
                        }

                        return (
                            <div key={category.id}>
                                <div className="sidebar-link cursor-default">
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{category.name}</span>
                                </div>
                                {categoryLessons.length > 0 && (
                                    <div className="ml-8 mt-1 space-y-1">
                                        {categoryLessons.slice(0, 5).map(lesson => (
                                            <Link
                                                key={lesson.id}
                                                to={`/lesson/${lesson.id}`}
                                                className={`block text-sm py-1 px-2 rounded text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 ${location.pathname === `/lesson/${lesson.id}` ? 'text-primary-600 dark:text-primary-400 font-medium' : ''
                                                    }`}
                                            >
                                                Day {lesson.day}: {lesson.title}
                                            </Link>
                                        ))}
                                        {categoryLessons.length > 5 && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
                                                +{categoryLessons.length - 5} more
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}