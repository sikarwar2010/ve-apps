import { LeadEditForm } from '@/components/leads/LeadEditForm';
import type { Id } from '@/convex/_generated/dataModel';

type PageProps = {
  params: Promise<{ leadId: string }>;
};

export default async function EditLeadPage({ params }: PageProps) {
  const { leadId } = await params;
  return <LeadEditForm leadId={leadId as Id<'leads'>} />;
}
