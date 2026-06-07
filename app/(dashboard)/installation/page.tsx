import { InstallationTable } from '@/components/installation/InstallationTable';
import PageHeader from '@/components/layout/Pageheader';

export default function InstallationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Installation"
        description="Technician jobs and commissioning checklists"
        breadcrumbs={[{ label: 'Execution' }, { label: 'Installation' }]}
      />
      <InstallationTable />
    </div>
  );
}
