'use client';

import PageHeader from '@/components/layout/Pageheader';
import { ConvertCustomerDialog } from '@/components/leads/ConvertCustomerDialog';
import { LeadSourceBadge } from '@/components/leads/LeadSourceBadge';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { LeadTimeline } from '@/components/leads/LeadTimeline';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { calculatePMSuryaSubsidy } from '@/lib/subsidyCalculator';
import { formatCapacity, formatCurrency, formatDate } from '@/utils/formatters';
import { useMutation, useQuery } from 'convex/react';
import {
  Building2,
  ChevronDown,
  FileText,
  MapPin,
  Pencil,
  Phone,
  Sun,
  Trash2,
  User,
  Zap,
} from 'lucide-react';
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

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <span className="text-foreground/80">{children}</span>
    </div>
  );
}

export function LeadDetailView({ leadId }: LeadDetailViewProps) {
  const router = useRouter();
  const lead = useQuery(api.modules.lead.getLeadById, { leadId });
  const updateStatus = useMutation(api.modules.lead.updateLeadStatus);
  const addActivity = useMutation(api.modules.lead.addLeadActivity);
  const deleteLead = useMutation(api.modules.lead.deleteLead);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      const result = await deleteLead({ leadId });
      toast.success(result.deleted ? 'Lead deleted' : 'Lead marked as lost');
      setDeleteOpen(false);
      router.push('/crm/leads');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
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
            {['survey_completed', 'interested', 'quotation_sent', 'negotiation', 'contacted'].includes(lead.status) && (
              <Button asChild size="sm" variant="secondary">
                <Link href={`/quotations/new?leadId=${leadId}`}>
                  <FileText className="mr-1.5 size-4" />
                  Create Quotation
                </Link>
              </Button>
            )}
            {lead.status !== 'won' && lead.status !== 'lost' && (
              <ConvertCustomerDialog leadId={leadId} defaultDiscom={lead.discomName} />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Update Status
                  <ChevronDown className="ml-1 size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {NEXT_STATUSES.filter((s) => s !== lead.status).map((status, i, arr) => (
                  <span key={status}>
                    {status === 'won' && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(status)}
                      className={status === 'won' ? 'text-emerald-600 font-medium' : status === 'lost' ? 'text-red-600' : ''}
                    >
                      {status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </DropdownMenuItem>
                  </span>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild variant="outline" size="sm">
              <Link href={`/crm/leads/${leadId}/edit`}>
                <Pencil className="mr-1.5 size-4" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        }
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Remove lead?"
        description="Lead will be deleted if no quotations exist, otherwise marked as lost."
        confirmLabel="Remove"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />

      {/* Metric tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Status</p>
          <div className="mt-1.5"><LeadStatusBadge status={lead.status} /></div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Source</p>
          <div className="mt-1.5"><LeadSourceBadge source={lead.source} /></div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">System Size</p>
          <p className="mt-1 text-lg font-bold tabular-nums">
            {lead.expectedCapacityKw ? formatCapacity(lead.expectedCapacityKw) : <span className="text-muted-foreground text-sm">—</span>}
          </p>
        </div>
        {subsidy ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/20">
            <p className="text-xs text-muted-foreground">PM Surya Subsidy</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
              {formatCurrency(subsidy.subsidyAmount)}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Assigned To</p>
            <p className="mt-1 text-sm font-semibold">{lead.assignedTo?.name ?? 'Unassigned'}</p>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <User className="size-4 text-muted-foreground" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={<Phone className="size-3.5" />}>{lead.mobile}</InfoRow>
              {lead.email && <InfoRow icon={<span className="text-[11px]">@</span>}>{lead.email}</InfoRow>}
              <InfoRow icon={<MapPin className="size-3.5" />}>
                <span>
                  {lead.addressLine1}
                  <br />
                  <span className="text-muted-foreground">{lead.city}, {lead.state} {lead.pincode}</span>
                </span>
              </InfoRow>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Assigned to</p>
                  <p className="mt-0.5 font-semibold">{lead.assignedTo?.name ?? 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="mt-0.5 font-semibold">{formatDate(lead.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {(lead.expectedCapacityKw || lead.monthlyConsumptionKwh || lead.discomName) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Sun className="size-4 text-amber-500" />
                  Solar Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {lead.expectedCapacityKw && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">System size</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Zap className="size-3.5 text-amber-500" />
                      {formatCapacity(lead.expectedCapacityKw)}
                    </span>
                  </div>
                )}
                {lead.monthlyConsumptionKwh && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Monthly use</span>
                    <span className="font-medium">{lead.monthlyConsumptionKwh} kWh</span>
                  </div>
                )}
                {lead.discomName && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">DISCOM</span>
                    <span className="font-medium">{lead.discomName}</span>
                  </div>
                )}
                {subsidy && (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800/30 dark:bg-emerald-950/30">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">PM Surya Ghar (est.)</p>
                      <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(subsidy.subsidyAmount)}
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{subsidy.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {lead.propertyType && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Building2 className="size-4 text-muted-foreground" />
                  Property
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="mt-0.5 font-medium capitalize">{lead.propertyType}</p>
                </div>
                {lead.rooftopType && (
                  <div>
                    <p className="text-xs text-muted-foreground">Rooftop</p>
                    <p className="mt-0.5 font-medium capitalize">{lead.rooftopType}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Add Note</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddNote} className="space-y-3">
                <Label htmlFor="note" className="sr-only">Note</Label>
                <Textarea
                  id="note"
                  placeholder="Call outcome, site visit notes, follow-up details…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button type="submit" size="sm" disabled={isSubmitting || !note.trim()}>
                  {isSubmitting ? 'Saving…' : 'Save Note'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Activity Timeline</CardTitle>
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
