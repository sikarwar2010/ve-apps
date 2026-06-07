'use client';

import { LeadCard } from '@/components/leads/LeadCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Users } from 'lucide-react';

const COLUMN_CONFIG: Record<string, { label: string; accent: string; header: string; count: string }> = {
  new:              { label: 'New',             accent: 'border-t-blue-500',   header: 'bg-blue-50/60 dark:bg-blue-900/10',   count: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' },
  contacted:        { label: 'Contacted',        accent: 'border-t-purple-500', header: 'bg-purple-50/60 dark:bg-purple-900/10', count: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' },
  interested:       { label: 'Interested',       accent: 'border-t-indigo-500', header: 'bg-indigo-50/60 dark:bg-indigo-900/10', count: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' },
  survey_scheduled: { label: 'Survey Scheduled', accent: 'border-t-amber-500',  header: 'bg-amber-50/60 dark:bg-amber-900/10',  count: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
  survey_completed: { label: 'Survey Done',      accent: 'border-t-teal-500',   header: 'bg-teal-50/60 dark:bg-teal-900/10',   count: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300' },
  quotation_sent:   { label: 'Quote Sent',       accent: 'border-t-cyan-500',   header: 'bg-cyan-50/60 dark:bg-cyan-900/10',   count: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300' },
  negotiation:      { label: 'Negotiation',      accent: 'border-t-orange-500', header: 'bg-orange-50/60 dark:bg-orange-900/10', count: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300' },
};

export function LeadKanban() {
  const columns = useQuery(api.modules.lead.getLeadKanban, {});

  if (columns === undefined) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-6" />
      </div>
    );
  }

  const totalLeads = columns.reduce((sum, col) => sum + col.count, 0);

  if (totalLeads === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No leads in pipeline"
        description="Create your first lead to see the kanban board."
        actionLabel="New lead"
        actionHref="/crm/leads/new"
      />
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {columns.map((column) => {
        const cfg = COLUMN_CONFIG[column.status] ?? {
          label: column.status,
          accent: 'border-t-border',
          header: 'bg-muted/30',
          count: 'bg-muted text-muted-foreground',
        };
        return (
          <div key={column.status} className="flex w-67 shrink-0 flex-col">
            <div className={`mb-3 flex items-center justify-between rounded-t-xl border border-b-0 border-border/50 border-t-2 px-3 py-2.5 ${cfg.accent} ${cfg.header}`}>
              <span className="text-xs font-semibold tracking-wide text-foreground/80">{cfg.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${cfg.count}`}>
                {column.count}
              </span>
            </div>
            <div className="flex flex-col gap-2 rounded-b-xl rounded-tr-xl border border-border/40 bg-muted/20 p-2 min-h-20">
              {column.leads.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-6">
                  <p className="text-[11px] text-muted-foreground/50">Empty</p>
                </div>
              ) : (
                column.leads.map((lead) => <LeadCard key={lead._id} lead={lead} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
