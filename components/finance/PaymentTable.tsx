'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';

type Payment = FunctionReturnType<typeof api.modules.finance.listPayments>[number];

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'paymentNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Payment #" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('paymentNumber')}</span>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (row.getValue('type') === 'received' ? 'Received' : 'Paid'),
  },
  {
    accessorKey: 'customer',
    header: 'Party',
    cell: ({ row }) => row.original.customer?.name ?? row.original.vendor?.name ?? '—',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => formatCurrency(row.getValue('amount')),
  },
  { accessorKey: 'mode', header: 'Mode', cell: ({ row }) => String(row.getValue('mode')).toUpperCase() },
  {
    accessorKey: 'paymentDate',
    header: 'Date',
    cell: ({ row }) => formatDate(row.getValue('paymentDate')),
  },
];

export function PaymentTable() {
  const payments = useQuery(api.modules.finance.listPayments, {});

  if (payments === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <DataTable columns={columns} data={payments} filterColumn="paymentNumber" filterPlaceholder="Search payments..." />
  );
}
