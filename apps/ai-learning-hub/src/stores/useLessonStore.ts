import { create } from 'zustand';
import { Lesson, UserProgress, AppSettings, Theme } from '@/types';
// @ts-ignore - ContentApi is a JS module without TypeScript declarations
import ContentApi from "../service/ContentApi";

interface LessonStore {
    lessons: Lesson[];
    isLoading: boolean;
    error: string | null;
    loadLessons: () => Promise<void>;
    loadContentById: (id: string) => Promise<void>;
    getLessonById: (id: string) => Lesson | undefined;
    getAdjacentLessons: (currentId: string) => { previous?: Lesson; next?: Lesson };
}

const loadFromApi = async () => {
    try {
        return await ContentApi.getContentIndex();
    } catch (error) {
        console.error('Store - Failed to load lessons from content service:', error);
        //return null;
    }
};


const loadIndexFromGit = async (filePath: string) => {
    try {
        return await ContentApi.getContentIndexByPathFromGit(filePath);
    } catch (error) {
        console.error('Store - Failed to load lessons from GitHub:', error);
        return null;
    }
};

const getContentByIdFromGit = async (id: string) => {
    try {
        return await ContentApi.getContentByIdFromGit(id);
    } catch (error) {
        console.error('Store - Failed to load lessons from GitHub:', error);
        return null;
    }
};

export const useLessonStore = create<LessonStore>((set, get) => ({
    lessons: [],
    isLoading: false,
    error: null,

    loadLessons: async () => {
        set({ isLoading: true, error: null });
        const lessons = (import.meta.env.CONTENT_SERVICE_ENABLED && await loadFromApi()) ?? (await loadIndexFromGit('generated/content-index.json'));

        if (!lessons?.length) {
            set({
                error: 'Failed to load lessons.',
                isLoading: false,
            });
            return;
        }

        console.log('Store - Loaded lessons:', lessons.length);

        set({
            lessons,
            isLoading: false,
        });
    },

    getLessonById: (id: string) => {
        return get().lessons.find(lesson => lesson.id === id);
    },

    loadContentById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const lessonContent = (import.meta.env.CONTENT_SERVICE_ENABLED && await ContentApi.getContentById(id, true)) ?? (await getContentByIdFromGit(id));
            //find the lesson in the store and update its content
            if (lessonContent) {
                const lessons = get().lessons.map(lesson =>
                    lesson.id === id
                        ? { ...lesson, content: lessonContent }
                        : lesson
                )
                set({ lessons });
            }

        } catch (error) {
            console.error('Store - Failed to load lessons:', error);
            set({ error: 'Failed to load lessons' });
        } finally {
            set({ isLoading: false });
        }
    },

    getAdjacentLessons: (currentId: string) => {
        const lessons = get().lessons;
        const currentIndex = lessons.findIndex(lesson => lesson.id === currentId);

        return {
            previous: currentIndex > 0 ? lessons[currentIndex - 1] : undefined,
            next: currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : undefined,
        };
    },
}));

const STORAGE_KEY = 'ai-learning-hub-progress';

function loadProgressFromStorage(): UserProgress {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading progress:', error);
    }

    return {
        completedLessons: [],
        readingProgress: {},
        bookmarks: [],
        notes: [],
        quizScores: {},
        assignmentsCompleted: [],
    };
}

function saveProgressToStorage(progress: UserProgress): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

interface ProgressStore {
    progress: UserProgress;
    updateProgress: (updates: Partial<UserProgress>) => void;
    markLessonComplete: (lessonId: string) => void;
    updateReadingProgress: (lessonId: string, percentage: number) => void;
    addBookmark: (bookmark: Omit<UserProgress['bookmarks'][0], 'id' | 'createdAt'>) => void;
    removeBookmark: (bookmarkId: string) => void;
    addNote: (note: Omit<UserProgress['notes'][0], 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateNote: (noteId: string, content: string) => void;
    deleteNote: (noteId: string) => void;
    resetProgress: () => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
    progress: loadProgressFromStorage(),

    updateProgress: (updates) => {
        const newProgress = { ...get().progress, ...updates };
        saveProgressToStorage(newProgress);
        set({ progress: newProgress });
    },

    markLessonComplete: (lessonId: string) => {
        const { progress } = get();
        if (!progress.completedLessons.includes(lessonId)) {
            const newProgress = {
                ...progress,
                completedLessons: [...progress.completedLessons, lessonId],
            };
            saveProgressToStorage(newProgress);
            set({ progress: newProgress });
        }
    },

    updateReadingProgress: (lessonId: string, percentage: number) => {
        const { progress } = get();
        const newProgress = {
            ...progress,
            readingProgress: { ...progress.readingProgress, [lessonId]: percentage },
        };
        saveProgressToStorage(newProgress);
        set({ progress: newProgress });
    },

    addBookmark: (bookmark) => {
        const { progress } = get();
        const newBookmark = {
            ...bookmark,
            id: `bookmark-${Date.now()}`,
            createdAt: new Date(),
        };
        const newProgress = {
            ...progress,
            bookmarks: [...progress.bookmarks, newBookmark],
        };
        saveProgressToStorage(newProgress);
        set({ progress: newProgress });
    },

    removeBookmark: (bookmarkId: string) => {
        const { progress } = get();
        const newProgress = {
            ...progress,
            bookmarks: progress.bookmarks.filter(b => b.id !== bookmarkId),
        };
        saveProgressToStorage(newProgress);
        set({ progress: newProgress });
    },

    addNote: (note) => {
        const { progress } = get();
        const newNote = {
            ...note,
            id: `note-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const newProgress = {
            ...progress,
            notes: [...progress.notes, newNote],
        };
        saveProgressToStorage(newProgress);
        set({ progress: newProgress });
    },

    updateNote: (noteId: string, content: string) => {
        const { progress } = get();
        const newProgress = {
            ...progress,
            notes: progress.notes.map(note =>
                note.id === noteId
                    ? { ...note, content, updatedAt: new Date() }
                    : note
            ),
        };
        saveProgressToStorage(newProgress);
        set({ progress: newProgress });
    },

    deleteNote: (noteId: string) => {
        const { progress } = get();
        const newProgress = {
            ...progress,
            notes: progress.notes.filter(n => n.id !== noteId),
        };
        saveProgressToStorage(newProgress);
        set({ progress: newProgress });
    },

    resetProgress: () => {
        const newProgress = {
            completedLessons: [],
            readingProgress: {},
            bookmarks: [],
            notes: [],
            quizScores: {},
            assignmentsCompleted: [],
        };
        saveProgressToStorage(newProgress);
        set({ progress: newProgress });
    },
}));

const SETTINGS_KEY = 'ai-learning-hub-settings';

interface SettingsStore {
    settings: AppSettings;
    updateSettings: (updates: Partial<AppSettings>) => void;
    setTheme: (theme: Theme) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => {
    const loadSettings = (): AppSettings => {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }

        return {
            theme: 'system',
            fontSize: 'medium',
            readingWidth: 'medium',
            animations: true,
        };
    };

    return {
        settings: loadSettings(),

        updateSettings: (updates) => {
            const newSettings = { ...get().settings, ...updates };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
            set({ settings: newSettings });
        },

        setTheme: (theme: Theme) => {
            const newSettings = { ...get().settings, theme };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
            set({ settings: newSettings });
        },
    };
});