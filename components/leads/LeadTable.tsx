'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { leadColumns } from '@/components/leads/lead-columns';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { LEAD_STATUS } from '@/utils/constants';
import { useQuery } from 'convex/react';
import { TrendingUp, Users, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PIPELINE_STATUSES = ['new', 'contacted', 'interested', 'survey_scheduled', 'survey_completed', 'quotation_sent', 'negotiation'];

function PipelineStats({ leads }: { leads: { status: string; expectedCapacityKw?: number | null }[] }) {
  const total = leads.length;
  const active = leads.filter((l) => PIPELINE_STATUSES.includes(l.status)).length;
  const won = leads.filter((l) => l.status === 'won').length;
  const totalKw = leads.reduce((s, l) => s + (l.expectedCapacityKw ?? 0), 0);

  const statusCounts = PIPELINE_STATUSES.map((s) => ({
    status: s,
    label: LEAD_STATUS[s]?.label ?? s,
    count: leads.filter((l) => l.status === s).length,
  }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={<Users className="size-4 text-emerald-600" />} label="Total Leads" value={total} />
        <StatTile icon={<TrendingUp className="size-4 text-blue-600" />} label="Active Pipeline" value={active} />
        <StatTile icon={<Zap className="size-4 text-amber-500" />} label="Total Capacity" value={`${totalKw.toFixed(1)} kW`} />
        <StatTile
          icon={<span className="size-2 rounded-full bg-emerald-500 mt-1" />}
          label="Won"
          value={won}
          highlight
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {statusCounts.map(({ status, label, count }) => (
          <div key={status} className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs">
            <span className="font-medium text-foreground/70">{label}</span>
            <span className="font-bold tabular-nums text-foreground">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${highlight ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-950/20' : 'border-border/60 bg-card'}`}>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold tabular-nums leading-none mt-0.5 ${highlight ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

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
    <div className="space-y-4">
      <PipelineStats leads={leads} />
      <DataTable
        columns={leadColumns}
        data={leads}
        filterColumn="name"
        filterPlaceholder="Search leads by name…"
        onRowClick={(lead) => router.push(`/crm/leads/${lead._id}`)}
      />
    </div>
  );
}
