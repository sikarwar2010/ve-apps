import { cn } from '@/lib/utils';
import type { leadSourceSchema } from '@/schemas/lead/lead.schema';
import type { z } from 'zod';

type LeadSource = z.infer<typeof leadSourceSchema>;

const sourceConfig: Record<LeadSource, { label: string; className: string }> = {
  website:             { label: 'Website',     className: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400' },
  meta_ads:            { label: 'Meta Ads',    className: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  google_ads:          { label: 'Google Ads',  className: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' },
  walk_in:             { label: 'Walk-in',     className: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' },
  referral:            { label: 'Referral',    className: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' },
  electrician_partner: { label: 'Electrician', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  builder_channel:     { label: 'Builder',     className: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' },
  manual:              { label: 'Manual',      className: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400' },
};

export function LeadSourceBadge({ source }: { source: LeadSource }) {
  const cfg = sourceConfig[source];
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-current/10', cfg.className)}>
      {cfg.label}
    </span>
  );
}
