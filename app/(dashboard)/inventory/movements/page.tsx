import { StockMovementsTable } from '@/components/inventory/StockMovementsTable';
import PageHeader from '@/components/layout/Pageheader';

export default function MovementsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Movements"
        description="Audit trail of GRN, dispatch, transfers, and adjustments"
        breadcrumbs={[{ label: 'Supply Chain' }, { label: 'Movements' }]}
      />
      <StockMovementsTable />
    </div>
  );
}
