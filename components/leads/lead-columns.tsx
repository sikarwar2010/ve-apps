import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { LeadActions } from '@/components/leads/LeadActions';
import { LeadSourceBadge } from '@/components/leads/LeadSourceBadge';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import type { Lead } from '@/components/leads/types';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';

export const leadColumns: ColumnDef<Lead>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'leadNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Lead #" />,
    cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.getValue('leadNumber')}</span>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue('name')}</div>
        <div className="text-xs text-muted-foreground">{row.original.mobile}</div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <LeadStatusBadge status={row.getValue('status')} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => <LeadSourceBadge source={row.getValue('source')} />,
  },
  {
    accessorKey: 'expectedCapacityKw',
    header: 'Capacity',
    cell: ({ row }) => (row.getValue('expectedCapacityKw') ? `${row.getValue('expectedCapacityKw')} kW` : '—'),
  },
  {
    accessorKey: 'city',
    header: 'City',
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
    cell: ({ row }) => row.original.assignedTo?.name ?? 'Unassigned',
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => formatDistanceToNow(new Date(row.getValue('createdAt')), { addSuffix: true }),
  },
  {
    id: 'actions',
    cell: ({ row }) => <LeadActions lead={row.original} />,
  },
];
