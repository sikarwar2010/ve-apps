'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { SUBSIDY_STATUS } from '@/utils/constants';
import { formatCapacity, formatCurrency, formatDate } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';

type SubsidyApp = FunctionReturnType<typeof api.modules.subsidy.listSubsidyApplications>[number];

const columns: ColumnDef<SubsidyApp>[] = [
  {
    accessorKey: 'applicationNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Application #" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('applicationNumber')}</span>,
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => row.original.customer?.name ?? '—',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} config={SUBSIDY_STATUS} />,
  },
  {
    accessorKey: 'systemCapacityKw',
    header: 'Capacity',
    cell: ({ row }) => formatCapacity(row.getValue('systemCapacityKw')),
  },
  {
    accessorKey: 'subsidyAmountEligible',
    header: 'Eligible',
    cell: ({ row }) => formatCurrency(row.getValue('subsidyAmountEligible')),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
  },
];

export function SubsidyTable() {
  const apps = useQuery(api.modules.subsidy.listSubsidyApplications, {});

  if (apps === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={apps}
      filterColumn="applicationNumber"
      filterPlaceholder="Search applications..."
    />
  );
}
