'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { INVOICE_STATUS } from '@/utils/constants';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';

type Invoice = FunctionReturnType<typeof api.modules.finance.listInvoices>[number];

const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: 'invoiceNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice #" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('invoiceNumber')}</span>,
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => row.original.customer?.name ?? '—',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} config={INVOICE_STATUS} />,
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total',
    cell: ({ row }) => formatCurrency(row.getValue('totalAmount')),
  },
  {
    accessorKey: 'balanceDue',
    header: 'Balance',
    cell: ({ row }) => formatCurrency(row.getValue('balanceDue')),
  },
  {
    accessorKey: 'dueDate',
    header: 'Due',
    cell: ({ row }) => formatDate(row.getValue('dueDate')),
  },
];

export function InvoiceTable() {
  const invoices = useQuery(api.modules.finance.listInvoices, {});

  if (invoices === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <DataTable columns={columns} data={invoices} filterColumn="invoiceNumber" filterPlaceholder="Search invoices..." />
  );
}
