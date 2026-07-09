import { ReactNode } from 'react';
import { SidebarItem } from './SidebarItem';

interface SidebarGroupProps {
    title: string;
    children: ReactNode;
    defaultExpanded?: boolean;
    sectionId: string;
}

export function SidebarGroup({ title, children, defaultExpanded = false, sectionId }: SidebarGroupProps) {
    return (
        <div className="space-y-1">
            <SidebarItem
                name={title}
                isCollapsible
                isExpanded={defaultExpanded}
                onToggle={() => { }}
            />
            {defaultExpanded && <div className="ml-4 space-y-1">{children}</div>}
        </div>
    );
}