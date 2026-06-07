'use client';

import { LeadCard } from '@/components/leads/LeadCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Users } from 'lucide-react';

const COLUMN_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  survey_scheduled: 'Survey Scheduled',
  survey_completed: 'Survey Done',
  quotation_sent: 'Quotation Sent',
  negotiation: 'Negotiation',
};

const COLUMN_COLORS: Record<string, string> = {
  new: 'border-t-blue-500',
  contacted: 'border-t-purple-500',
  interested: 'border-t-indigo-500',
  survey_scheduled: 'border-t-amber-500',
  survey_completed: 'border-t-teal-500',
  quotation_sent: 'border-t-cyan-500',
  negotiation: 'border-t-orange-500',
};

export function LeadKanban() {
  const columns = useQuery(api.modules.lead.getLeadKanban, {});

  if (columns === undefined) {
    return (
      <div className="flex justify-center py-12">
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
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columns.map((column) => (
        <div key={column.status} className="flex w-72 shrink-0 flex-col">
          <div
            className={`mb-3 flex items-center justify-between rounded-t-lg border-t-2 bg-muted/30 px-3 py-2 ${COLUMN_COLORS[column.status] ?? 'border-t-border'}`}
          >
            <span className="text-xs font-semibold">{COLUMN_LABELS[column.status] ?? column.status}</span>
            <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {column.count}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {column.leads.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/50 px-3 py-8 text-center text-xs text-muted-foreground">
                No leads
              </div>
            ) : (
              column.leads.map((lead) => <LeadCard key={lead._id} lead={lead} />)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
