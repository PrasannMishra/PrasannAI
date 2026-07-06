import { Moon, Sun, Monitor, Type, AlignLeft, AlignCenter, AlignRight, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '@/stores/useLessonStore';
import { Theme } from '@/types';

export default function SettingsPage() {
    const settings = useSettingsStore(state => state.settings);
    const updateSettings = useSettingsStore(state => state.updateSettings);
    const resetProgress = useSettingsStore(state => state.resetProgress);

    const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ];

    const fontSizes = [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
    ];

    const readingWidths = [
        { value: 'narrow', label: 'Narrow', icon: AlignLeft },
        { value: 'medium', label: 'Medium', icon: AlignCenter },
        { value: 'wide', label: 'Wide', icon: AlignRight },
    ];

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

            <div className="space-y-6">
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Theme
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {themes.map(theme => {
                                    const Icon = theme.icon;
                                    return (
                                        <button
                                            key={theme.value}
                                            onClick={() => updateSettings({ theme: theme.value })}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${settings.theme === theme.value
                                                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="text-sm font-medium">{theme.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Font Size
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {fontSizes.map(size => (
                                    <button
                                        key={size.value}
                                        onClick={() => updateSettings({ fontSize: size.value as 'small' | 'medium' | 'large' })}
                                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${settings.fontSize === size.value
                                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{size.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Reading Width
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {readingWidths.map(width => {
                                    const Icon = width.icon;
                                    return (
                                        <button
                                            key={width.value}
                                            onClick={() => updateSettings({ readingWidth: width.value as 'narrow' | 'medium' | 'wide' })}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${settings.readingWidth === width.value
                                                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="text-sm font-medium">{width.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Animations
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Enable smooth transitions and animations
                                </p>
                            </div>
                            <button
                                onClick={() => updateSettings({ animations: !settings.animations })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.animations ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.animations ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Reset Progress
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Clear all progress, bookmarks, and notes
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                                        resetProgress();
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}