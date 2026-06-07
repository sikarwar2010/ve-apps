'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { formatDate } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';

const DISPATCH_STATUS: Record<string, { label: string; tone: string }> = {
  picking: { label: 'Picking', tone: 'blue' },
  packed: { label: 'Packed', tone: 'cyan' },
  dispatched: { label: 'Dispatched', tone: 'amber' },
  in_transit: { label: 'In Transit', tone: 'orange' },
  delivered: { label: 'Delivered', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'red' },
};

type Dispatch = FunctionReturnType<typeof api.modules.service.listDispatches>[number];

const columns: ColumnDef<Dispatch>[] = [
  {
    accessorKey: 'dispatchNumber',
    header: 'Dispatch #',
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('dispatchNumber')}</span>,
  },
  { accessorKey: 'order', header: 'Order', cell: ({ row }) => row.original.order?.orderNumber ?? '—' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} config={DISPATCH_STATUS} />,
  },
  { accessorKey: 'transporterName', header: 'Transporter', cell: ({ row }) => row.getValue('transporterName') ?? '—' },
  { accessorKey: 'lrNumber', header: 'LR #', cell: ({ row }) => row.getValue('lrNumber') ?? '—' },
  { accessorKey: 'createdAt', header: 'Created', cell: ({ row }) => formatDate(row.getValue('createdAt')) },
];

export function DispatchTable() {
  const dispatches = useQuery(api.modules.service.listDispatches, {});
  if (dispatches === undefined)
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  return <DataTable columns={columns} data={dispatches} filterPlaceholder="Search dispatches..." />;
}
