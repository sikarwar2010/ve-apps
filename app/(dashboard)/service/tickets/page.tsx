import PageHeader from '@/components/layout/Pageheader';
import { ServiceTicketTable } from '@/components/service/ServiceTicketTable';

export default function ServiceTicketsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Tickets"
        description="After-sales complaints, warranty claims, and AMC visits"
        breadcrumbs={[{ label: 'After-Sales' }, { label: 'Tickets' }]}
      />
      <ServiceTicketTable />
    </div>
  );
}
