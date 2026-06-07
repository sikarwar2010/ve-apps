'use client';

import type { Doc } from '@/convex/_generated/dataModel';
import { formatDateTime, formatRelative } from '@/utils/formatters';
import { ArrowRightLeft, Calendar, Mail, MessageCircle, Phone, StickyNote, User } from 'lucide-react';

type Activity = Doc<'leadActivities'> & { doneBy?: Doc<'users'> | null };

const ACTIVITY_ICONS = {
  note: StickyNote,
  call: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  visit: User,
  status_change: ArrowRightLeft,
  follow_up_set: Calendar,
  task: Calendar,
} as const;

export function LeadTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
        No activity yet. Add a note or update status to start the timeline.
      </div>
    );
  }

  return (
    <ol className="relative space-y-0">
      {activities.map((activity, index) => {
        const Icon = ACTIVITY_ICONS[activity.type] ?? StickyNote;
        const user = activity.doneBy;

        return (
          <li key={activity._id} className="relative flex gap-4 pb-6 last:pb-0">
            {index < activities.length - 1 ? (
              <span className="absolute top-8 left-3.75 h-[calc(100%-8px)] w-px bg-border/60" />
            ) : null}
            <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background">
              <Icon className="size-3.5 text-muted-foreground" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium capitalize">{activity.type.replace(/_/g, ' ')}</span>
                <span className="text-[10px] text-muted-foreground" title={formatDateTime(activity.createdAt)}>
                  {formatRelative(activity.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground/90">{activity.content}</p>
              {activity.outcome ? <p className="mt-1 text-xs text-muted-foreground">{activity.outcome}</p> : null}
              {user ? <p className="mt-1 text-[10px] text-muted-foreground">by {user.name}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
