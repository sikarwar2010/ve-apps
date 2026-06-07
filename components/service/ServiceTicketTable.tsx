'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { TICKET_STATUS } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';

type Ticket = FunctionReturnType<typeof api.modules.service.listServiceTickets>[number];

const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: 'ticketNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ticket #" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('ticketNumber')}</span>,
  },
  { accessorKey: 'subject', header: 'Subject' },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => row.original.customer?.name ?? '—',
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => String(row.getValue('type')).replace(/_/g, ' '),
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => <span className="capitalize">{row.getValue('priority')}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} config={TICKET_STATUS} />,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
  },
];

export function ServiceTicketTable() {
  const tickets = useQuery(api.modules.service.listServiceTickets, {});

  if (tickets === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  return <DataTable columns={columns} data={tickets} filterColumn="subject" filterPlaceholder="Search tickets..." />;
}
