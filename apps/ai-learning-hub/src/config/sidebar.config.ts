import {
    LayoutDashboard,
    Search,
    Settings,
    FolderOpen,
    BookMarked,
    GraduationCap
} from 'lucide-react';

export interface SidebarConfig {
    appName: string;
    appTagline: string;
    logoIcon: typeof GraduationCap;
    sections: SidebarSection[];
}

export interface SidebarSection {
    id: string;
    type: 'navigation' | 'roadmap' | 'concepts' | 'other';
    title?: string;
    items?: SidebarItem[];
}

export interface SidebarItem {
    id: string;
    name: string;
    icon?: typeof LayoutDashboard;
    path?: string;
    badge?: string | number;
}

export const sidebarConfig: SidebarConfig = {
    appName: 'AI Learning Hub',
    appTagline: 'Master AI Engineering',
    logoIcon: GraduationCap,
    sections: [
        {
            id: 'main-navigation',
            type: 'navigation',
            items: [
                { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/' },
                { id: 'search', name: 'Search', icon: Search, path: '/search' },
                { id: 'settings', name: 'Settings', icon: Settings, path: '/settings' },
            ],
        },
        {
            id: 'learning-path',
            type: 'roadmap',
            title: 'AI Engineer Roadmap',
        },
        {
            id: 'concepts',
            type: 'concepts',
            title: 'Concepts',
        },
        {
            id: 'other',
            type: 'other',
            title: 'Other',
            items: [
                { id: 'projects', name: 'Projects', icon: FolderOpen },
                { id: 'interview', name: 'Interview Preparation', icon: BookMarked },
            ],
        },
    ],
};