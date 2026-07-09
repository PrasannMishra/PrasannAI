import { ReactNode } from 'react';
import { Sidebar } from './sidebar/Sidebar';
import Header from './Header';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex">
                <Sidebar />
                <div className="flex-1 ml-72">
                    <Header />
                    <main className="p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
