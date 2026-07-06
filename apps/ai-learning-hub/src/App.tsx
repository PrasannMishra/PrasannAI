import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLessonStore } from '@/stores/useLessonStore';
import { useSettingsStore } from '@/stores/useLessonStore';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import LessonPage from '@/pages/LessonPage';
import SearchPage from '@/pages/SearchPage';
import SettingsPage from '@/pages/SettingsPage';

function App() {
    const loadLessons = useLessonStore(state => state.loadLessons);
    const settings = useSettingsStore(state => state.settings);

    useEffect(() => {
        loadLessons();
    }, [loadLessons]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (settings.theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(settings.theme);
        }
    }, [settings.theme]);

    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/lesson/:id" element={<LessonPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;