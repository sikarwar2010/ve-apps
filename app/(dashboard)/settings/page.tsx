import PageHeader from '@/components/layout/Pageheader';
import { SettingsView } from '@/components/settings/SettingsView';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Company, branches, warehouses, and users"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Settings' }]}
      />
      <SettingsView />
    </div>
  );
}
