'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { leadColumns } from '@/components/leads/lead-columns';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';

export function LeadTable() {
  const leads = useQuery(api.modules.lead.listLeads, {});
  const router = useRouter();

  if (leads === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <DataTable
      columns={leadColumns}
      data={leads}
      filterColumn="name"
      filterPlaceholder="Search leads..."
      onRowClick={(lead) => router.push(`/crm/leads/${lead._id}`)}
    />
  );
}
