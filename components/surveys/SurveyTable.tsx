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
import { useRouter } from 'next/navigation';

type Survey = FunctionReturnType<typeof api.modules.surveys.listSurveys>[number];

const columns: ColumnDef<Survey>[] = [
  {
    accessorKey: 'surveyNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Survey #" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('surveyNumber')}</span>,
  },
  {
    accessorKey: 'lead',
    header: 'Lead / Customer',
    cell: ({ row }) => row.original.lead?.name ?? '—',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} config={SURVEY_STATUS} />,
  },
  {
    accessorKey: 'engineer',
    header: 'Engineer',
    cell: ({ row }) => row.original.engineer?.name ?? '—',
  },
  {
    accessorKey: 'recommendedCapacityKw',
    header: 'Recommended',
    cell: ({ row }) => (row.original.recommendedCapacityKw ? formatCapacity(row.original.recommendedCapacityKw) : '—'),
  },
  {
    accessorKey: 'scheduledAt',
    header: 'Scheduled',
    cell: ({ row }) => formatDateTime(row.getValue('scheduledAt')),
  },
  {
    id: 'actions',
    cell: ({ row }) => <SurveyActions survey={row.original} />,
  },
];

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
    <DataTable
      columns={columns}
      data={surveys}
      filterColumn="surveyNumber"
      filterPlaceholder="Search surveys..."
      onRowClick={(s) => router.push(`/survey/${s._id}`)}
    />
  );
}
