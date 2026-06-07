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
          '--sidebar-width': '17rem',
          '--sidebar-width-icon': '3.25rem',
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="flex h-svh max-h-svh flex-col overflow-hidden border-l border-border/60 bg-background">
        <TopNav />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,oklch(0.78_0.14_75/0.14),transparent)] dark:bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,oklch(0.55_0.12_75/0.08),transparent)]"
          />
          <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain scroll-smooth">
            <div className="mx-auto w-full max-w-400 p-4 md:p-6 lg:p-8">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
