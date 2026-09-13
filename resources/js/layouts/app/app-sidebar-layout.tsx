import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(0,100,0,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(200,16,46,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.72))] dark:bg-[radial-gradient(circle_at_top_left,rgba(0,128,0,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(200,16,46,0.16),transparent_30%),linear-gradient(180deg,rgba(2,6,23,1),rgba(15,23,42,1))]"
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="relative">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
