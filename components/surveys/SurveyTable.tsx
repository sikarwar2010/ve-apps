'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { StatusBadge } from '@/components/status/StatusBadge';
import { SurveyActions } from '@/components/surveys/SurveyActions';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { SURVEY_STATUS } from '@/utils/constants';
import { formatCapacity, formatDateTime } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from 'convex/react';
import { FunctionReturnType } from 'convex/server';
import { CalendarCheck, CalendarClock, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Survey = FunctionReturnType<typeof api.modules.surveys.listSurveys>[number];

const columns: ColumnDef<Survey>[] = [
  {
    accessorKey: 'surveyNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Survey #" />,
    cell: ({ row }) => <span className="font-mono text-xs font-medium text-muted-foreground">{row.getValue('surveyNumber')}</span>,
  },
  {
    accessorKey: 'lead',
    header: 'Lead / Customer',
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold">{row.original.lead?.name ?? '—'}</p>
        {row.original.lead && (
          <p className="text-xs text-muted-foreground">{(row.original.lead as { city?: string }).city}</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} config={SURVEY_STATUS} />,
  },
  {
    accessorKey: 'engineer',
    header: 'Engineer',
    cell: ({ row }) => (
      <span className={row.original.engineer ? 'text-sm font-medium' : 'text-sm text-muted-foreground'}>
        {row.original.engineer?.name ?? 'Unassigned'}
      </span>
    ),
  },
  {
    accessorKey: 'recommendedCapacityKw',
    header: 'Recommended',
    cell: ({ row }) =>
      row.original.recommendedCapacityKw ? (
        <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
          {formatCapacity(row.original.recommendedCapacityKw)}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: 'scheduledAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Scheduled" />,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDateTime(row.getValue('scheduledAt'))}</span>,
  },
  {
    id: 'actions',
    cell: ({ row }) => <SurveyActions survey={row.original} />,
  },
];

function SurveyStats({ surveys }: { surveys: Survey[] }) {
  const scheduled = surveys.filter((s) => s.status === 'scheduled').length;
  const inProgress = surveys.filter((s) => s.status === 'in_progress').length;
  const completed = surveys.filter((s) => s.status === 'completed').length;
  const cancelled = surveys.filter((s) => s.status === 'cancelled').length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <SurveyStatTile icon={<CalendarClock className="size-4 text-blue-600" />} label="Scheduled" value={scheduled} color="blue" />
      <SurveyStatTile icon={<CalendarCheck className="size-4 text-amber-600" />} label="In Progress" value={inProgress} color="amber" />
      <SurveyStatTile icon={<CheckCircle2 className="size-4 text-emerald-600" />} label="Completed" value={completed} color="emerald" highlight />
      <SurveyStatTile icon={<XCircle className="size-4 text-slate-400" />} label="Cancelled" value={cancelled} color="slate" />
    </div>
  );
}

function SurveyStatTile({
  icon, label, value, color, highlight,
}: {
  icon: React.ReactNode; label: string; value: number; color: string; highlight?: boolean;
}) {
  const hlClass = highlight
    ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-950/20'
    : 'border-border/60 bg-card';
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${hlClass}`}>
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

export function SurveyTable() {
  const surveys = useQuery(api.modules.surveys.listSurveys, {});
  const router = useRouter();

  if (surveys === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SurveyStats surveys={surveys} />
      <DataTable
        columns={columns}
        data={surveys}
        filterColumn="surveyNumber"
        filterPlaceholder="Search surveys…"
        onRowClick={(s) => router.push(`/survey/${s._id}`)}
      />
    </div>
  );
}
