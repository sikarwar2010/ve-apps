'use client';

import { DataTable } from '@/components/data-table/DataTable';
import PageHeader from '@/components/layout/Pageheader';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { formatDate } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';

const NET_METER_STATUS: Record<string, { label: string; tone: string }> = {
  application_draft: { label: 'Draft', tone: 'slate' },
  application_submitted: { label: 'Submitted', tone: 'blue' },
  inspection_scheduled: { label: 'Inspection Scheduled', tone: 'amber' },
  inspection_done: { label: 'Inspection Done', tone: 'teal' },
  approved: { label: 'Approved', tone: 'green' },
  meter_installed: { label: 'Meter Installed', tone: 'cyan' },
  activated: { label: 'Activated', tone: 'green' },
  rejected: { label: 'Rejected', tone: 'red' },
};

type App = FunctionReturnType<typeof api.modules.subsidy.listNetMeterApplications>[number];

const columns: ColumnDef<App>[] = [
  {
    accessorKey: 'applicationNumber',
    header: 'App #',
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('applicationNumber')}</span>,
  },
  { accessorKey: 'customer', header: 'Customer', cell: ({ row }) => row.original.customer?.name ?? '—' },
  { accessorKey: 'discomName', header: 'DISCOM' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} config={NET_METER_STATUS} />,
  },
  { accessorKey: 'createdAt', header: 'Created', cell: ({ row }) => formatDate(row.getValue('createdAt')) },
];

export default function NetMeterPage() {
  const apps = useQuery(api.modules.subsidy.listNetMeterApplications, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Net Meter"
        description="DISCOM application tracking through meter activation"
        breadcrumbs={[{ label: 'Execution' }, { label: 'Net Meter' }]}
      />
      {apps === undefined ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : (
        <DataTable columns={columns} data={apps} filterPlaceholder="Search applications..." />
      )}
    </div>
  );
}
