'use client';

import PageHeader from '@/components/layout/Pageheader';
import { ConvertCustomerDialog } from '@/components/leads/ConvertCustomerDialog';
import { LeadSourceBadge } from '@/components/leads/LeadSourceBadge';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { LeadTimeline } from '@/components/leads/LeadTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { calculatePMSuryaSubsidy } from '@/lib/subsidyCalculator';
import { formatCapacity, formatCurrency, formatDate } from '@/utils/formatters';
import { useMutation, useQuery } from 'convex/react';
import { ChevronDown, MapPin, Phone, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const NEXT_STATUSES = [
  'new',
  'contacted',
  'interested',
  'survey_scheduled',
  'survey_completed',
  'quotation_sent',
  'negotiation',
  'won',
  'lost',
] as const;

type LeadDetailViewProps = {
  leadId: Id<'leads'>;
};

export function LeadDetailView({ leadId }: LeadDetailViewProps) {
  const router = useRouter();
  const lead = useQuery(api.modules.lead.getLeadById, { leadId });
  const updateStatus = useMutation(api.modules.lead.updateLeadStatus);
  const addActivity = useMutation(api.modules.lead.addLeadActivity);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (lead === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (lead === null) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Lead not found.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/crm/leads">Back to leads</Link>
        </Button>
      </div>
    );
  }

  const subsidy = lead.expectedCapacityKw != null ? calculatePMSuryaSubsidy(lead.expectedCapacityKw) : null;

  async function handleStatusChange(status: (typeof NEXT_STATUSES)[number]) {
    try {
      await updateStatus({ leadId, status });
      toast.success(`Status updated to ${status.replace(/_/g, ' ')}`);
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setIsSubmitting(true);
    try {
      await addActivity({ leadId, type: 'note', content: note.trim() });
      setNote('');
      toast.success('Note added');
    } catch {
      toast.error('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={lead.name}
        description={`${lead.leadNumber} · ${lead.city}, ${lead.state}`}
        breadcrumbs={[
          { label: 'CRM', href: '/crm/leads' },
          { label: 'Leads', href: '/crm/leads' },
          { label: lead.leadNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {lead.status !== 'won' && lead.status !== 'lost' ? (
              <ConvertCustomerDialog leadId={leadId} defaultDiscom={lead.discomName} />
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Update status
                  <ChevronDown className="ml-1 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {NEXT_STATUSES.filter((s) => s !== lead.status).map((status) => (
                  <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                    {status.replace(/_/g, ' ')}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" onClick={() => router.push('/crm/leads')}>
              Back
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <LeadStatusBadge status={lead.status} />
                <LeadSourceBadge source={lead.source} />
              </div>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Phone className="size-3.5" />
                  {lead.mobile}
                </p>
                {lead.email ? <p>{lead.email}</p> : null}
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    {lead.addressLine1}
                    <br />
                    {lead.city}, {lead.state} {lead.pincode}
                  </span>
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-xs">
                <p className="text-muted-foreground">Assigned to</p>
                <p className="mt-0.5 font-medium">{lead.assignedTo?.name ?? 'Unassigned'}</p>
                <p className="mt-2 text-muted-foreground">Created</p>
                <p className="mt-0.5 font-medium">{formatDate(lead.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {(lead.expectedCapacityKw || subsidy) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Zap className="size-4 text-amber-500" />
                  Solar profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {lead.expectedCapacityKw ? (
                  <p>
                    System size: <strong>{formatCapacity(lead.expectedCapacityKw)}</strong>
                  </p>
                ) : null}
                {lead.monthlyConsumptionKwh ? (
                  <p className="text-muted-foreground">Consumption: {lead.monthlyConsumptionKwh} kWh/mo</p>
                ) : null}
                {lead.discomName ? <p className="text-muted-foreground">DISCOM: {lead.discomName}</p> : null}
                {subsidy ? (
                  <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-xs text-muted-foreground">PM Surya subsidy (est.)</p>
                    <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(subsidy.subsidyAmount)}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{subsidy.description}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Add note</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddNote} className="space-y-3">
                <div>
                  <Label htmlFor="note" className="sr-only">
                    Note
                  </Label>
                  <Textarea
                    id="note"
                    placeholder="Call outcome, site visit notes, follow-up details…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button type="submit" size="sm" disabled={isSubmitting || !note.trim()}>
                  {isSubmitting ? 'Saving…' : 'Save note'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Activity timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadTimeline activities={lead.activities} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
