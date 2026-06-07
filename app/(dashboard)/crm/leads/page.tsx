import PageHeader from '@/components/layout/Pageheader';
import { LeadsView } from '@/components/leads/LeadsView';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Management"
        description="Track pipeline in table or kanban — real-time from Convex"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Leads' }]}
        actions={
          <Link href="/crm/leads/new">
            <Button>
              <Plus className="mr-2 size-4" />
              New Lead
            </Button>
          </Link>
        }
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading leads…</div>}>
        <LeadsView />
      </Suspense>
    </div>
  );
}
