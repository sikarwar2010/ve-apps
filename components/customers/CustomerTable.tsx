'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { formatDate } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';
import { useRouter } from 'next/navigation';

type Customer = FunctionReturnType<typeof api.modules.customers.listCustomers>[number];

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'customerNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer #" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('customerNumber')}</span>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue('name')}</div>
        <div className="text-xs text-muted-foreground">{row.original.mobile}</div>
      </div>
    ),
  },
  { accessorKey: 'city', header: 'City' },
  { accessorKey: 'discomName', header: 'DISCOM' },
  {
    accessorKey: 'kycVerified',
    header: 'KYC',
    cell: ({ row }) => (
      <StatusBadge
        status={row.getValue('kycVerified') ? 'approved' : 'draft'}
        config={{ approved: { label: 'Verified', tone: 'green' }, draft: { label: 'Pending', tone: 'amber' } }}
      />
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
  },
];

export function CustomerTable() {
  const customers = useQuery(api.modules.customers.listCustomers, {});
  const router = useRouter();

  if (customers === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={customers}
      filterColumn="name"
      filterPlaceholder="Search customers..."
      onRowClick={(c) => router.push(`/crm/customers/${c._id}`)}
    />
  );
}
