'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { ORDER_STATUS } from '@/utils/constants';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';
import { useRouter } from 'next/navigation';

type Order = FunctionReturnType<typeof api.modules.orders.listOrders>[number];

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'orderNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order #" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('orderNumber')}</span>,
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => row.original.customer?.name ?? '—',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} config={ORDER_STATUS} />,
  },
  {
    accessorKey: 'totalAmount',
    header: 'Order Value',
    cell: ({ row }) => formatCurrency(row.getValue('totalAmount')),
  },
  {
    accessorKey: 'netAmount',
    header: 'Net (after subsidy)',
    cell: ({ row }) => formatCurrency(row.getValue('netAmount')),
  },
  {
    accessorKey: 'orderDate',
    header: 'Order Date',
    cell: ({ row }) => formatDate(row.getValue('orderDate')),
  },
];

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
    <DataTable
      columns={columns}
      data={orders}
      filterColumn="orderNumber"
      filterPlaceholder="Search orders..."
      onRowClick={(o) => router.push(`/orders/${o._id}`)}
    />
  );
}
