'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { OrderActions } from '@/components/orders/OrderActions';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { ORDER_STATUS } from '@/utils/constants';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';
import { CheckCircle2, IndianRupee, Package, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Order = FunctionReturnType<typeof api.modules.orders.listOrders>[number];

const ACTIVE_ORDER_STATUSES = ['confirmed', 'in_procurement', 'ready_for_dispatch', 'dispatched', 'installation_pending', 'installed', 'net_meter_pending', 'subsidy_pending'];

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'orderNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order #" />,
    cell: ({ row }) => <span className="font-mono text-xs font-medium text-muted-foreground">{row.getValue('orderNumber')}</span>,
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold">{row.original.customer?.name ?? '—'}</p>
        <p className="font-mono text-[11px] text-muted-foreground">{row.original.customer?.mobile}</p>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} config={ORDER_STATUS} />,
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order Value" />,
    cell: ({ row }) => <span className="font-semibold tabular-nums">{formatCurrency(row.getValue('totalAmount'))}</span>,
  },
  {
    accessorKey: 'netAmount',
    header: 'Net (after subsidy)',
    cell: ({ row }) => (
      <span className="font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
        {formatCurrency(row.getValue('netAmount'))}
      </span>
    ),
  },
  {
    accessorKey: 'orderDate',
    header: 'Order Date',
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.getValue('orderDate'))}</span>,
  },
  {
    id: 'actions',
    cell: ({ row }) => <OrderActions order={row.original} />,
  },
];

function OrderStats({ orders }: { orders: Order[] }) {
  const total = orders.length;
  const active = orders.filter((o) => ACTIVE_ORDER_STATUSES.includes(o.status)).length;
  const completed = orders.filter((o) => o.status === 'completed').length;
  const totalValue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <OrderStatTile icon={<Package className="size-4 text-blue-600" />} label="Total Orders" value={total} />
      <OrderStatTile icon={<TrendingUp className="size-4 text-amber-600" />} label="Active" value={active} />
      <OrderStatTile icon={<CheckCircle2 className="size-4 text-emerald-600" />} label="Completed" value={completed} highlight />
      <OrderStatTile icon={<IndianRupee className="size-4 text-violet-600" />} label="Total Value" value={formatCurrency(totalValue)} />
    </div>
  );
}

function OrderStatTile({
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

export function OrderTable() {
  const orders = useQuery(api.modules.orders.listOrders, {});
  const router = useRouter();

  if (orders === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <OrderStats orders={orders} />
      <DataTable
        columns={columns}
        data={orders}
        filterColumn="orderNumber"
        filterPlaceholder="Search orders…"
        onRowClick={(o) => router.push(`/orders/${o._id}`)}
      />
    </div>
  );
}
