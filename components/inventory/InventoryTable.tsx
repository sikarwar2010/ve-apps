'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { formatDateTime } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';

type Stock = FunctionReturnType<typeof api.modules.inventory.listInventory>[number];

const columns: ColumnDef<Stock>[] = [
  {
    accessorKey: 'product',
    header: 'Product',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.product?.name ?? '—'}</div>
        <div className="font-mono text-xs text-muted-foreground">{row.original.product?.sku}</div>
      </div>
    ),
  },
  {
    accessorKey: 'warehouse',
    header: 'Warehouse',
    cell: ({ row }) => row.original.warehouse?.name ?? '—',
  },
  { accessorKey: 'availableQty', header: 'Available' },
  { accessorKey: 'reservedQty', header: 'Reserved' },
  { accessorKey: 'totalQty', header: 'Total' },
  {
    accessorKey: 'isLow',
    header: 'Alert',
    cell: ({ row }) =>
      row.original.isLow ? (
        <Badge variant="outline" className="border-transparent bg-red-500/10 text-red-700">
          Low stock
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">OK</span>
      ),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ row }) => formatDateTime(row.getValue('updatedAt')),
  },
];

export function InventoryTable() {
  const stock = useQuery(api.modules.inventory.listInventory, {});

  if (stock === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  return <DataTable columns={columns} data={stock} filterPlaceholder="Search stock..." />;
}
