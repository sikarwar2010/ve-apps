'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { formatDateTime } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';

type AuditLog = FunctionReturnType<typeof api.modules.audit.listAuditLogs>[number];

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: 'createdAt',
    header: 'When',
    cell: ({ row }) => formatDateTime(row.getValue('createdAt')),
  },
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => row.original.user?.name ?? '—',
  },
  { accessorKey: 'action', header: 'Action' },
  { accessorKey: 'entityType', header: 'Entity' },
  {
    accessorKey: 'entityId',
    header: 'Entity ID',
    cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('entityId')}</span>,
  },
];

export function AuditLogTable() {
  const logs = useQuery(api.modules.audit.listAuditLogs, { limit: 100 });

  if (logs === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  return <DataTable columns={columns} data={logs} filterColumn="action" filterPlaceholder="Filter actions..." />;
}
