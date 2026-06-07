import { CustomerTable } from '@/components/customers/CustomerTable';
import PageHeader from '@/components/layout/Pageheader';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Converted leads with KYC, DISCOM, and bank details for subsidy"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Customers' }]}
      />
      <CustomerTable />
    </div>
  );
}
