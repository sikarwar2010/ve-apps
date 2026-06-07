import { PaymentTable } from '@/components/finance/PaymentTable';
import PageHeader from '@/components/layout/Pageheader';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Customer receipts and vendor payments"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Payments' }]}
      />
      <PaymentTable />
    </div>
  );
}
