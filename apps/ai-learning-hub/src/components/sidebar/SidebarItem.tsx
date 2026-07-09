import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
    icon?: LucideIcon;
    name: string;
    path?: string;
    isActive?: boolean;
    isCollapsible?: boolean;
    isExpanded?: boolean;
    onToggle?: () => void;
    badge?: string | number;
    children?: React.ReactNode;
    className?: string;
}

export function SidebarItem({
    icon: Icon,
    name,
    path,
    isActive = false,
    isCollapsible = false,
    isExpanded = false,
    onToggle,
    badge,
    children,
    className = '',
}: SidebarItemProps) {
    const baseClasses = 'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200';
    const activeClasses = isActive
        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800';

    if (path) {
        return (
            <Link to={path} className={`${baseClasses} ${activeClasses} ${className}`}>
                <div className="flex items-center gap-3 flex-1">
                    {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                    <span className="flex-1 font-medium text-sm">{name}</span>
                    {isCollapsible && (
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                    {badge !== undefined && (
                        <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {badge}
                        </span>
                    )}
                </div>
            </Link>
        );
    }

    return (
        <div className={`${baseClasses} cursor-pointer ${className}`} onClick={onToggle}>
            <div className="flex items-center gap-3 flex-1">
                {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                <span className="flex-1 font-medium text-sm">{name}</span>
                {isCollapsible && (
                    <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                )}
                {badge !== undefined && (
                    <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {badge}
                    </span>
                )}
            </div>
            {children && isExpanded && <div className="ml-8 mt-1 space-y-1">{children}</div>}
        </div>
    );
}
