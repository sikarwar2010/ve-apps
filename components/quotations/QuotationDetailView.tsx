'use client';

import PageHeader from '@/components/layout/Pageheader';
import { QuotationDocument } from '@/components/quotations/QuotationDocument';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { QUOTATION_STATUS } from '@/utils/constants';
import { useMutation, useQuery } from 'convex/react';
import { CheckCircle2, FileText, Pencil, Printer, Send, ShoppingCart, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const PIPELINE_STEPS = [
  { key: 'draft',     label: 'Draft Created',       doneWhen: () => true },
  { key: 'sent',      label: 'Sent to Customer',     doneWhen: (s: string) => ['sent', 'under_negotiation', 'approved', 'converted_to_order', 'rejected'].includes(s) },
  { key: 'approved',  label: 'Customer Approved',    doneWhen: (s: string) => ['approved', 'converted_to_order'].includes(s) },
  { key: 'order',     label: 'Sales Order Created',  doneWhen: (s: string) => s === 'converted_to_order' },
];

export function QuotationDetailView({ quotationId }: { quotationId: Id<'quotations'> }) {
  const router = useRouter();
  const quotation = useQuery(api.modules.quotations.getQuotationById, { quotationId });
  const document = useQuery(api.modules.quotations.getQuotationDocument, { quotationId });
  const sendQuotation = useMutation(api.modules.quotations.sendQuotation);
  const updateStatus = useMutation(api.modules.quotations.updateQuotationStatus);
  const convertToOrder = useMutation(api.modules.quotations.convertToOrder);
  const deleteQuotation = useMutation(api.modules.quotations.deleteQuotation);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (quotation === undefined || document === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!quotation || !document) {
    return <p className="py-16 text-center text-muted-foreground">Quotation not found</p>;
  }

  async function handleSend() {
    try {
      await sendQuotation({ quotationId });
      toast.success('Quotation marked as sent to customer');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send');
    }
  }

  async function handleApprove() {
    try {
      await updateStatus({ quotationId, status: 'approved' });
      toast.success('Quotation approved by customer');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve');
    }
  }

  async function handleReject() {
    try {
      await updateStatus({ quotationId, status: 'rejected' });
      toast.success('Quotation marked rejected');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  }

  async function handleCreateOrder() {
    try {
      const orderId = await convertToOrder({ quotationId });
      toast.success('Sales order created');
      router.push(`/orders/${orderId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create order');
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await deleteQuotation({ quotationId });
      toast.success('Quotation deleted');
      router.push('/quotations');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  }

  const canSend = quotation.status === 'draft' || quotation.status === 'under_negotiation';
  const canApprove = quotation.status === 'sent' || quotation.status === 'under_negotiation';
  const canOrder = quotation.status === 'approved';
  const isConverted = quotation.status === 'converted_to_order';
  const canEdit = quotation.status === 'draft' || quotation.status === 'under_negotiation';
  const canDelete = quotation.status === 'draft';

  return (
    <div className="space-y-6">
      <PageHeader
        title={quotation.quotationNumber}
        description={`${quotation.lead?.name ?? 'Customer'} · ${quotation.systemCapacityKw} kWp`}
        breadcrumbs={[{ label: 'Quotations', href: '/quotations' }, { label: quotation.quotationNumber }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={quotation.status} config={QUOTATION_STATUS} />
            {quotation.leadId && (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/crm/leads/${quotation.leadId}`}>View Lead</Link>
              </Button>
            )}
            {canSend && (
              <Button size="sm" onClick={() => void handleSend()}>
                <Send className="mr-1.5 size-4" />
                Send to Customer
              </Button>
            )}
            {canApprove && (
              <>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => void handleApprove()}>
                  <CheckCircle2 className="mr-1.5 size-4" />
                  Approved
                </Button>
                <Button size="sm" variant="outline" onClick={() => void handleReject()}>
                  <X className="mr-1.5 size-4" />
                  Rejected
                </Button>
              </>
            )}
            {canOrder && (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => void handleCreateOrder()}>
                <ShoppingCart className="mr-1.5 size-4" />
                Create Sales Order
              </Button>
            )}
            {isConverted && (
              <Button asChild size="sm" variant="secondary">
                <Link href="/orders">View Orders</Link>
              </Button>
            )}
            {canEdit && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/quotations/${quotationId}/edit`}>
                  <Pencil className="mr-1.5 size-4" />
                  Edit
                </Link>
              </Button>
            )}
            {canDelete && (
              <Button size="sm" variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        }
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete quotation?"
        description="Draft quotation will be permanently removed."
        loading={deleteLoading}
        onConfirm={handleDelete}
      />

      <Tabs defaultValue="document">
        <TabsList className="h-9">
          <TabsTrigger value="document" className="gap-1.5 text-xs">
            <FileText className="size-3.5" />
            Customer Quotation
          </TabsTrigger>
          <TabsTrigger value="workflow" className="text-xs">Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="document" className="mt-4 space-y-4">
          <div className="flex justify-end print:hidden">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-1.5 size-4" />
              Print / Save PDF
            </Button>
          </div>
          <QuotationDocument data={document} />
        </TabsContent>

        <TabsContent value="workflow" className="mt-4">
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <h3 className="text-sm font-semibold">Pre-Sales Pipeline</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Track this quotation through the approval workflow</p>

            <ol className="mt-5 space-y-0">
              {PIPELINE_STEPS.map((step, i) => {
                const done = step.doneWhen(quotation.status);
                const isLast = i === PIPELINE_STEPS.length - 1;
                return (
                  <li key={step.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex size-6 items-center justify-center rounded-full ring-2 ${done ? 'bg-emerald-500 ring-emerald-500/20' : 'bg-muted ring-border'}`}>
                        {done ? (
                          <CheckCircle2 className="size-3.5 text-white" />
                        ) : (
                          <span className="size-2 rounded-full bg-muted-foreground/30" />
                        )}
                      </div>
                      {!isLast && <div className={`w-px flex-1 my-1 ${done ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-border'}`} />}
                    </div>
                    <div className={`pb-4 pt-0.5 text-sm ${done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {step.label}
                    </div>
                  </li>
                );
              })}
            </ol>

            {quotation.survey && (
              <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
                Linked survey: <span className="font-mono font-medium">{quotation.survey.surveyNumber}</span>
                {' '}· {quotation.survey.recommendedCapacityKw} kW recommended
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
