import PageHeader from '@/components/layout/Pageheader';
import { LeadTable } from '@/components/leads/LeadTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export default function LeadPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Management"
        description="Track and manage your sales pipeline"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Leads' }]}
        actions={
          <Link href="/crm/leads/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Lead
            </Button>
          </Link>
        }
      />
      <Suspense fallback={<div>Loading leads...</div>}>
        <LeadTable />
      </Suspense>
    </div>
  );
}
