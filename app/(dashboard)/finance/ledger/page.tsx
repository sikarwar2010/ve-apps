import { ReportsAging } from '@/components/finance/LedgerView';
import PageHeader from '@/components/layout/Pageheader';

export default function LedgerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Ledger"
        description="Outstanding receivables and aging analysis"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Ledger' }]}
      />
      <ReportsAging />
    </div>
  );
}
