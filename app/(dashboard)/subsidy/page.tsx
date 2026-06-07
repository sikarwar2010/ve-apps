import PageHeader from '@/components/layout/Pageheader';
import { SubsidyTable } from '@/components/subsidy/SubsidyTable';

export default function SubsidyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="PM Surya Subsidy"
        description="Central subsidy application lifecycle and disbursement tracking"
        breadcrumbs={[{ label: 'Compliance' }, { label: 'Subsidy' }]}
      />
      <SubsidyTable />
    </div>
  );
}
