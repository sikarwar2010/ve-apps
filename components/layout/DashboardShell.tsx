'use client';

import AppSidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      defaultOpen
      className="h-svh max-h-svh bg-background"
      style={
        {
          '--sidebar-width': '16.5rem',
          '--sidebar-width-icon': '3rem',
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="flex h-svh max-h-svh flex-col overflow-hidden bg-background">
        <TopNav />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div aria-hidden className="dashboard-surface pointer-events-none absolute inset-0" />
          <div aria-hidden className="dashboard-grid-bg pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain scroll-smooth">
            <div className="mx-auto w-full max-w-400 p-4 md:p-6 lg:p-8">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
