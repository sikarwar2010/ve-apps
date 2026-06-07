import { AuditLogTable } from '@/components/audit/AuditLogTable';
import PageHeader from '@/components/layout/Pageheader';

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Immutable change history across the ERP"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Audit Logs' }]}
      />
      <AuditLogTable />
    </div>
  );
}
