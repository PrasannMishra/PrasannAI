import { Link } from 'react-router-dom';
import { Search, Settings, Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '@/stores/useLessonStore';

export default function Header() {
    const settings = useSettingsStore(state => state.settings);
    const setTheme = useSettingsStore(state => state.setTheme);

    const toggleTheme = () => {
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex-1 max-w-xl">
                    <Link
                        to="/search"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <Search className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-500 dark:text-gray-400">Search lessons...</span>
                        <kbd className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                            ⌘K
                        </kbd>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {settings.theme === 'dark' ? (
                            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        ) : (
                            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        )}
                    </button>

                    <Link
                        to="/settings"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </Link>
                </div>
            </div>
        </header>
    );
}