'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/utils/formatters';
import { useMutation, useQuery } from 'convex/react';
import { Bell, CheckCheck } from 'lucide-react';

const TYPE_STYLES = {
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  success: 'bg-emerald-500',
  error: 'bg-red-500',
} as const;

export function NotificationCenter() {
  const notifications = useQuery(api.modules.notifications.listMyNotifications, { limit: 15 });
  const unreadCount = useQuery(api.modules.notifications.getUnreadCount, {});
  const markAsRead = useMutation(api.modules.notifications.markAsRead);
  const markAllAsRead = useMutation(api.modules.notifications.markAllAsRead);

  const count = unreadCount ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {count > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-brand-foreground ring-2 ring-background">
              {count > 9 ? '9+' : count}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
          <DropdownMenuLabel className="p-0 text-sm">Notifications</DropdownMenuLabel>
          {count > 0 ? (
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => void markAllAsRead({})}>
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          ) : null}
        </div>
        {notifications === undefined ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-5" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <ScrollArea className="max-h-80">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n._id}
                className={cn('cursor-pointer rounded-none px-3 py-3 focus:bg-muted/50', !n.isRead && 'bg-muted/20')}
                onClick={() => {
                  if (!n.isRead) void markAsRead({ notificationId: n._id });
                }}
              >
                <div className="flex w-full gap-2.5">
                  <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', TYPE_STYLES[n.type])} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground/80">{formatRelative(n.createdAt)}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        <DropdownMenuSeparator className="m-0" />
        <div className="px-3 py-2 text-center text-[10px] text-muted-foreground">Real-time via Convex</div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
