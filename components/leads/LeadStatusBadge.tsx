import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { leadStatusSchema } from '@/schemas/lead/lead.schema';
import type { z } from 'zod';

type LeadStatus = z.infer<typeof leadStatusSchema>;

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  contacted: { label: 'Contacted', className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400' },
  interested: { label: 'Interested', className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' },
  survey_scheduled: { label: 'Survey Scheduled', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  survey_completed: { label: 'Survey Done', className: 'bg-teal-500/10 text-teal-700 dark:text-teal-400' },
  quotation_sent: { label: 'Quotation Sent', className: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400' },
  negotiation: { label: 'Negotiation', className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
  won: { label: 'Won', className: 'bg-green-500/10 text-green-700 dark:text-green-400' },
  lost: { label: 'Lost', className: 'bg-red-500/10 text-red-700 dark:text-red-400' },
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn('border-transparent font-normal', config.className)}>
      {config.label}
    </Badge>
  );
}
