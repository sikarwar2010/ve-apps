import PageHeader from '@/components/layout/Pageheader';
import { OrderTable } from '@/components/orders/OrderTable';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        description="Confirmed deals with milestone payment schedules"
        breadcrumbs={[{ label: 'Pre-Sales' }, { label: 'Sales Orders' }]}
      />
      <OrderTable />
    </div>
  );
}
