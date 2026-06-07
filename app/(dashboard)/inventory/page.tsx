import { InventoryTable } from '@/components/inventory/InventoryTable';
import PageHeader from '@/components/layout/Pageheader';

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Real-time stock across warehouses with low-stock alerts"
        breadcrumbs={[{ label: 'Supply Chain' }, { label: 'Stock' }]}
      />
      <InventoryTable />
    </div>
  );
}
