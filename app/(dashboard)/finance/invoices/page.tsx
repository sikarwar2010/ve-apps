import { InvoiceTable } from '@/components/finance/InvoiceTable';
import PageHeader from '@/components/layout/Pageheader';

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Tax invoices and receivables"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Invoices' }]}
      />
      <InvoiceTable />
    </div>
  );
}
