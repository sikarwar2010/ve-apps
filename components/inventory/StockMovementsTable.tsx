'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { formatDateTime } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';

type Movement = FunctionReturnType<typeof api.modules.inventory.listStockMovements>[number];

const columns: ColumnDef<Movement>[] = [
  {
    accessorKey: 'createdAt',
    header: 'When',
    cell: ({ row }) => formatDateTime(row.getValue('createdAt')),
  },
  { accessorKey: 'type', header: 'Type', cell: ({ row }) => String(row.getValue('type')).replace(/_/g, ' ') },
  {
    accessorKey: 'product',
    header: 'Product',
    cell: ({ row }) => row.original.product?.name ?? '—',
  },
  { accessorKey: 'quantity', header: 'Qty' },
  {
    accessorKey: 'warehouse',
    header: 'Warehouse',
    cell: ({ row }) => row.original.warehouse?.name ?? '—',
  },
  { accessorKey: 'referenceType', header: 'Ref' },
];

export function StockMovementsTable() {
  const movements = useQuery(api.modules.inventory.listStockMovements, {});

  if (movements === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  return <DataTable columns={columns} data={movements} filterPlaceholder="Filter movements..." />;
}
