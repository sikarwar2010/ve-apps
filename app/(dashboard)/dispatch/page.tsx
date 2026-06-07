import { DispatchTable } from '@/components/dispatch/DispatchTable';
import PageHeader from '@/components/layout/Pageheader';

export default function DispatchPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispatch"
        description="Pick, pack, and ship material to installation sites"
        breadcrumbs={[{ label: 'Supply Chain' }, { label: 'Dispatch' }]}
      />
      <DispatchTable />
    </div>
  );
}
