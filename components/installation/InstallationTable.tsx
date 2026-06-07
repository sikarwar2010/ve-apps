'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { formatCapacity, formatDate } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';

const JOB_STATUS: Record<string, { label: string; tone: string }> = {
  scheduled: { label: 'Scheduled', tone: 'blue' },
  material_issued: { label: 'Material Issued', tone: 'cyan' },
  in_progress: { label: 'In Progress', tone: 'amber' },
  completed: { label: 'Completed', tone: 'green' },
  customer_signoff: { label: 'Signed Off', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'red' },
};

type Job = FunctionReturnType<typeof api.modules.service.listInstallationJobs>[number];

const columns: ColumnDef<Job>[] = [
  {
    accessorKey: 'jobNumber',
    header: 'Job #',
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('jobNumber')}</span>,
  },
  { accessorKey: 'customer', header: 'Customer', cell: ({ row }) => row.original.customer?.name ?? '—' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} config={JOB_STATUS} />,
  },
  {
    accessorKey: 'systemCapacityKw',
    header: 'Capacity',
    cell: ({ row }) => formatCapacity(row.getValue('systemCapacityKw')),
  },
  { accessorKey: 'scheduledDate', header: 'Scheduled', cell: ({ row }) => formatDate(row.getValue('scheduledDate')) },
  { accessorKey: 'technician', header: 'Lead tech', cell: ({ row }) => row.original.technician?.name ?? '—' },
];

export function InstallationTable() {
  const jobs = useQuery(api.modules.service.listInstallationJobs, {});
  if (jobs === undefined)
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  return <DataTable columns={columns} data={jobs} filterPlaceholder="Search jobs..." />;
}
