import { LeadDetailView } from '@/components/leads/LeadDetailView';
import type { Id } from '@/convex/_generated/dataModel';

type PageProps = {
  params: Promise<{ leadId: string }>;
};

export default async function LeadDetailPage({ params }: PageProps) {
  const { leadId } = await params;
  return <LeadDetailView leadId={leadId as Id<'leads'>} />;
}
