import { Badge } from '@/components/ui/badge';
import type { leadSourceSchema } from '@/schemas/lead/lead.schema';
import type { z } from 'zod';

type LeadSource = z.infer<typeof leadSourceSchema>;

const sourceLabels: Record<LeadSource, string> = {
  website: 'Website',
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  walk_in: 'Walk-in',
  referral: 'Referral',
  electrician_partner: 'Electrician',
  builder_channel: 'Builder',
  manual: 'Manual',
};

export function LeadSourceBadge({ source }: { source: LeadSource }) {
  return (
    <Badge variant="secondary" className="font-normal">
      {sourceLabels[source]}
    </Badge>
  );
}
