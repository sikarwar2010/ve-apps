'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { QuotationActions } from '@/components/quotations/QuotationActions';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { QUOTATION_STATUS } from '@/utils/constants';
import { formatCapacity, formatCurrency, formatDate } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';
import { useRouter } from 'next/navigation';

type Quotation = FunctionReturnType<typeof api.modules.quotations.listQuotations>[number];

const columns: ColumnDef<Quotation>[] = [
  {
    accessorKey: 'quotationNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Quote #" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('quotationNumber')}</span>,
  },
  {
    accessorKey: 'lead',
    header: 'Lead',
    cell: ({ row }) => row.original.lead?.name ?? '—',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} config={QUOTATION_STATUS} />,
  },
  {
    accessorKey: 'systemCapacityKw',
    header: 'Capacity',
    cell: ({ row }) => formatCapacity(row.getValue('systemCapacityKw')),
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total',
    cell: ({ row }) => formatCurrency(row.getValue('totalAmount')),
  },
  {
    accessorKey: 'subsidyAmountEstimated',
    header: 'Subsidy (est.)',
    cell: ({ row }) =>
      row.original.subsidyAmountEstimated ? formatCurrency(row.original.subsidyAmountEstimated) : '—',
  },
  {
    accessorKey: 'validTill',
    header: 'Valid Till',
    cell: ({ row }) => formatDate(row.getValue('validTill')),
  },
  {
    id: 'actions',
    cell: ({ row }) => <QuotationActions quotation={row.original} />,
  },
];

export function QuotationTable() {
  const quotations = useQuery(api.modules.quotations.listQuotations, {});
  const router = useRouter();

  if (quotations === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={quotations}
      filterColumn="quotationNumber"
      filterPlaceholder="Search quotations..."
      onRowClick={(q) => router.push(`/quotations/${q._id}`)}
    />
  );
}
