'use client';

import { LeadSourceBadge } from '@/components/leads/LeadSourceBadge';
import type { Doc } from '@/convex/_generated/dataModel';
import { formatCapacity, formatRelative } from '@/utils/formatters';
import { MapPin, Zap } from 'lucide-react';
import Link from 'next/link';

type LeadCardProps = {
  lead: Doc<'leads'>;
};

export function LeadCard({ lead }: LeadCardProps) {
  return (
    <Link
      href={`/crm/leads/${lead._id}`}
      className="block rounded-xl border border-border/60 bg-card p-3 shadow-sm transition-all hover:border-amber-500/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{lead.name}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{lead.leadNumber}</p>
        </div>
        <LeadSourceBadge source={lead.source} />
      </div>
      <div className="mt-2.5 space-y-1 text-[11px] text-muted-foreground">
        <p className="flex items-center gap-1">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">
            {lead.city}, {lead.state}
          </span>
        </p>
        {lead.expectedCapacityKw ? (
          <p className="flex items-center gap-1">
            <Zap className="size-3 shrink-0 text-amber-500" />
            {formatCapacity(lead.expectedCapacityKw)}
          </p>
        ) : null}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground/80">{formatRelative(lead.createdAt)}</p>
    </Link>
  );
}
