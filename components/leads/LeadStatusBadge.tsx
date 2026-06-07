import { cn } from '@/lib/utils';
import type { leadStatusSchema } from '@/schemas/lead/lead.schema';
import type { z } from 'zod';

type LeadStatus = z.infer<typeof leadStatusSchema>;

const statusConfig: Record<LeadStatus, { label: string; dot: string; bg: string; text: string }> = {
  new:              { label: 'New',               dot: 'bg-blue-500',   bg: 'bg-blue-50 dark:bg-blue-500/10',   text: 'text-blue-700 dark:text-blue-400' },
  contacted:        { label: 'Contacted',          dot: 'bg-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400' },
  interested:       { label: 'Interested',         dot: 'bg-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-400' },
  survey_scheduled: { label: 'Survey Scheduled',   dot: 'bg-amber-500',  bg: 'bg-amber-50 dark:bg-amber-500/10',  text: 'text-amber-700 dark:text-amber-400' },
  survey_completed: { label: 'Survey Done',        dot: 'bg-teal-500',   bg: 'bg-teal-50 dark:bg-teal-500/10',   text: 'text-teal-700 dark:text-teal-400' },
  quotation_sent:   { label: 'Quotation Sent',     dot: 'bg-cyan-500',   bg: 'bg-cyan-50 dark:bg-cyan-500/10',   text: 'text-cyan-700 dark:text-cyan-400' },
  negotiation:      { label: 'Negotiation',        dot: 'bg-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400' },
  won:              { label: 'Won',                dot: 'bg-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400' },
  lost:             { label: 'Lost',               dot: 'bg-red-500',    bg: 'bg-red-50 dark:bg-red-500/10',     text: 'text-red-700 dark:text-red-400' },
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.bg, cfg.text)}>
      <span className={cn('size-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}
