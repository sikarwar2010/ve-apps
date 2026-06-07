import PageHeader from '@/components/layout/Pageheader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type PageProps = {
  params: Promise<{ leadId: string }>;
};

export default async function EditLeadPage({ params }: PageProps) {
  const { leadId } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Lead"
        description="Full lead edit form is coming in the next sprint."
        breadcrumbs={[{ label: 'CRM', href: '/crm/leads' }, { label: 'Leads', href: '/crm/leads' }, { label: 'Edit' }]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/crm/leads/${leadId}`}>View lead</Link>
          </Button>
        }
      />
      <div className="rounded-xl border border-dashed border-border/60 px-6 py-16 text-center text-sm text-muted-foreground">
        Inline editing will reuse the intake studio form with pre-filled data. For now, update status and notes on the
        detail page.
      </div>
    </div>
  );
}
