import { CustomerTable } from '@/components/customers/CustomerTable';
import PageHeader from '@/components/layout/Pageheader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Converted leads with KYC, DISCOM, and bank details for subsidy"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Customers' }]}
        actions={
          <Button asChild>
            <Link href="/crm/customers/new">
              <Plus className="mr-2 size-4" />
              New Customer
            </Link>
          </Button>
        }
      />
      <CustomerTable />
    </div>
  );
}
