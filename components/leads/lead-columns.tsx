import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { LeadActions } from '@/components/leads/LeadActions';
import { LeadSourceBadge } from '@/components/leads/LeadSourceBadge';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import type { Lead } from '@/components/leads/types';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ');
  const letters = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold uppercase text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
      {letters}
    </span>
  );
}

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
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium text-muted-foreground">{row.getValue('leadNumber')}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <Initials name={row.getValue('name')} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{row.getValue('name')}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{row.original.mobile}</p>
        </div>
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
    cell: ({ row }) =>
      row.getValue('expectedCapacityKw') ? (
        <span className="font-medium tabular-nums">{row.getValue('expectedCapacityKw')} kW</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: 'city',
    header: 'Location',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.getValue('city')}</span>
    ),
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned',
    cell: ({ row }) => (
      <span className={row.original.assignedTo ? 'text-sm font-medium' : 'text-sm text-muted-foreground'}>
        {row.original.assignedTo?.name ?? 'Unassigned'}
      </span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(row.getValue('createdAt')), { addSuffix: true })}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <LeadActions lead={row.original} />,
  },
];
