'use client';

import { ModeToggle } from '@/components/providers/modetoggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useSidebarStore } from '@/stores/sidebarStore';
import { UserButton } from '@clerk/nextjs';
import { Bell, PanelLeft, Search } from 'lucide-react';

export default function TopNav() {
  const { toggleCollapse } = useSidebarStore();

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-foreground"
        onClick={toggleCollapse}
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="size-4" />
      </Button>

      <div className="relative hidden min-w-0 flex-1 md:block md:max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search leads, customers, orders…"
          className="h-8 border-border/60 bg-muted/40 pl-8 text-sm shadow-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground md:hidden"
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-amber-500" />
        </Button>

        <ModeToggle />

        <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />

        <UserButton
          appearance={{
            elements: {
              avatarBox: 'size-8',
            },
          }}
        />
      </div>
    </header>
  );
}
