import PageHeader from '@/components/layout/Pageheader';
import { QuotationTable } from '@/components/quotations/QuotationTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function QuotationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        description="GST quotes with PM Surya subsidy and payment milestones"
        breadcrumbs={[{ label: 'Pre-Sales' }, { label: 'Quotations' }]}
        actions={
          <Button asChild size="sm">
            <Link href="/quotations/new">
              <Plus className="mr-2 size-4" />
              New quotation
            </Link>
          </Button>
        }
      />
      <QuotationTable />
    </div>
  );
}
