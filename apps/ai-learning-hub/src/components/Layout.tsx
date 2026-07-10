import { ReactNode, useState } from 'react';
import { Sidebar } from './sidebar/Sidebar';
import Header from './Header';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex">
                <Sidebar isCollapsed={isSidebarCollapsed} />
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-0' : 'ml-72'}`}>
                    <Header onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
                    <main className="p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
