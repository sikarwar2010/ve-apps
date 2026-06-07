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
import { BadgeIndianRupee, FileCheck2, FileClock, IndianRupee } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Quotation = FunctionReturnType<typeof api.modules.quotations.listQuotations>[number];

const columns: ColumnDef<Quotation>[] = [
  {
    accessorKey: 'quotationNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Quote #" />,
    cell: ({ row }) => <span className="font-mono text-xs font-medium text-muted-foreground">{row.getValue('quotationNumber')}</span>,
  },
  {
    accessorKey: 'lead',
    header: 'Customer',
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold">{row.original.lead?.name ?? '—'}</p>
        {row.original.lead && (
          <p className="font-mono text-[11px] text-muted-foreground">{(row.original.lead as { leadNumber?: string }).leadNumber}</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} config={QUOTATION_STATUS} />,
  },
  {
    accessorKey: 'systemCapacityKw',
    header: 'Capacity',
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">{formatCapacity(row.getValue('systemCapacityKw'))}</span>
    ),
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums">{formatCurrency(row.getValue('totalAmount'))}</span>
    ),
  },
  {
    accessorKey: 'subsidyAmountEstimated',
    header: 'Subsidy (est.)',
    cell: ({ row }) =>
      row.original.subsidyAmountEstimated ? (
        <span className="font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
          {formatCurrency(row.original.subsidyAmountEstimated)}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: 'validTill',
    header: 'Valid Till',
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.getValue('validTill'))}</span>,
  },
  {
    id: 'actions',
    cell: ({ row }) => <QuotationActions quotation={row.original} />,
  },
];

function QuotationStats({ quotations }: { quotations: Quotation[] }) {
  const total = quotations.length;
  const active = quotations.filter((q) => ['sent', 'under_negotiation'].includes(q.status)).length;
  const approved = quotations.filter((q) => q.status === 'approved').length;
  const totalValue = quotations
    .filter((q) => !['rejected', 'expired'].includes(q.status))
    .reduce((s, q) => s + q.totalAmount, 0);
  const totalSubsidy = quotations
    .filter((q) => !['rejected', 'expired'].includes(q.status))
    .reduce((s, q) => s + (q.subsidyAmountEstimated ?? 0), 0);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <QuoteStatTile icon={<FileClock className="size-4 text-blue-600" />} label="Total Quotes" value={total} />
      <QuoteStatTile icon={<BadgeIndianRupee className="size-4 text-amber-600" />} label="Active / Negotiation" value={active} />
      <QuoteStatTile icon={<FileCheck2 className="size-4 text-emerald-600" />} label="Approved" value={approved} highlight />
      <QuoteStatTile icon={<IndianRupee className="size-4 text-violet-600" />} label="Pipeline Value" value={formatCurrency(totalValue)} />
    </div>
  );
}

function QuoteStatTile({
  icon, label, value, highlight,
}: {
  icon: React.ReactNode; label: string; value: string | number; highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${highlight ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-950/20' : 'border-border/60 bg-card'}`}>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold tabular-nums leading-none mt-0.5 ${highlight ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

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
    <div className="space-y-4">
      <QuotationStats quotations={quotations} />
      <DataTable
        columns={columns}
        data={quotations}
        filterColumn="quotationNumber"
        filterPlaceholder="Search quotations…"
        onRowClick={(q) => router.push(`/quotations/${q._id}`)}
      />
    </div>
  );
}
