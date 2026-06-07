'use client';

import { CustomerActions } from '@/components/customers/CustomerActions';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { formatDate } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';
import { ShieldCheck, ShieldAlert, Users, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Customer = FunctionReturnType<typeof api.modules.customers.listCustomers>[number];

const KYC_CONFIG = {
  approved: { label: 'Verified',  tone: 'green' },
  draft:    { label: 'Pending',   tone: 'amber' },
} as const;

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ');
  const letters = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold uppercase text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
      {letters}
    </span>
  );
}

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'customerNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer #" />,
    cell: ({ row }) => <span className="font-mono text-xs font-medium text-muted-foreground">{row.getValue('customerNumber')}</span>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
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
    accessorKey: 'city',
    header: 'Location',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.getValue('city')}</span>,
  },
  {
    accessorKey: 'discomName',
    header: 'DISCOM',
    cell: ({ row }) => (
      <span className={row.getValue('discomName') ? 'text-sm' : 'text-sm text-muted-foreground'}>
        {row.getValue('discomName') ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'kycVerified',
    header: 'KYC',
    cell: ({ row }) => (
      <StatusBadge
        status={row.getValue('kycVerified') ? 'approved' : 'draft'}
        config={KYC_CONFIG}
      />
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.getValue('createdAt'))}</span>,
  },
  {
    id: 'actions',
    cell: ({ row }) => <CustomerActions customer={row.original} />,
  },
];

function CustomerStats({ customers }: { customers: Customer[] }) {
  const total = customers.length;
  const kycVerified = customers.filter((c) => c.kycVerified).length;
  const kycPending = total - kycVerified;
  const discoms = new Set(customers.map((c) => c.discomName).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <CustStatTile icon={<Users className="size-4 text-violet-600" />} label="Total Customers" value={total} />
      <CustStatTile icon={<ShieldCheck className="size-4 text-emerald-600" />} label="KYC Verified" value={kycVerified} highlight />
      <CustStatTile icon={<ShieldAlert className="size-4 text-amber-600" />} label="KYC Pending" value={kycPending} />
      <CustStatTile icon={<Building2 className="size-4 text-slate-500" />} label="DISCOMs" value={discoms} />
    </div>
  );
}

function CustStatTile({
  icon, label, value, highlight,
}: {
  icon: React.ReactNode; label: string; value: number; highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${highlight ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-950/20' : 'border-border/60 bg-card'}`}>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold tabular-nums leading-none mt-0.5 ${highlight ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

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
    <div className="space-y-4">
      <CustomerStats customers={customers} />
      <DataTable
        columns={columns}
        data={customers}
        filterColumn="name"
        filterPlaceholder="Search customers…"
        onRowClick={(c) => router.push(`/crm/customers/${c._id}`)}
      />
    </div>
  );
}
