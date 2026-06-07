'use client';

import { LeadSourceBadge } from '@/components/leads/LeadSourceBadge';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import type { Doc } from '@/convex/_generated/dataModel';
import { formatCapacity, formatRelative } from '@/utils/formatters';
import { MapPin, Zap } from 'lucide-react';
import Link from 'next/link';

type LeadCardProps = {
  lead: Doc<'leads'>;
};

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ');
  const letters = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold uppercase text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
      {letters}
    </span>
  );
}

export function LeadCard({ lead }: LeadCardProps) {
  return (
    <Link
      href={`/crm/leads/${lead._id}`}
      className="group block rounded-xl border border-border/60 bg-card p-3.5 shadow-sm transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md cursor-pointer"
    >
      <div className="flex items-start gap-2.5">
        <Initials name={lead.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {lead.name}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{lead.leadNumber}</p>
        </div>
        <LeadSourceBadge source={lead.source} />
      </div>

      <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <MapPin className="size-3 shrink-0 text-slate-400" />
          <span className="truncate">{lead.city}, {lead.state}</span>
        </p>
        {lead.expectedCapacityKw ? (
          <p className="flex items-center gap-1.5">
            <Zap className="size-3 shrink-0 text-amber-500" />
            <span className="font-medium text-foreground/70">{formatCapacity(lead.expectedCapacityKw)}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <LeadStatusBadge status={lead.status} />
        <span className="text-[10px] text-muted-foreground/60">{formatRelative(lead.createdAt)}</span>
      </div>
    </Link>
  );
}
