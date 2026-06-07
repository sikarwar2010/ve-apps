import PageHeader from '@/components/layout/Pageheader';
import { ReportsView } from '@/components/reports/ReportsView';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & MIS"
        description="Sales funnel, revenue, and operations analytics"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Reports' }]}
      />
      <ReportsView />
    </div>
  );
}
