'use client';

import PageHeader from '@/components/layout/Pageheader';
import { QuotationDocument } from '@/components/quotations/QuotationDocument';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { QUOTATION_STATUS } from '@/utils/constants';
import { useMutation, useQuery } from 'convex/react';
import { CheckCircle2, FileText, Printer, Send, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function QuotationDetailView({ quotationId }: { quotationId: Id<'quotations'> }) {
  const router = useRouter();
  const quotation = useQuery(api.modules.quotations.getQuotationById, { quotationId });
  const document = useQuery(api.modules.quotations.getQuotationDocument, { quotationId });
  const sendQuotation = useMutation(api.modules.quotations.sendQuotation);
  const updateStatus = useMutation(api.modules.quotations.updateQuotationStatus);
  const convertToOrder = useMutation(api.modules.quotations.convertToOrder);

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

  function handlePrint() {
    window.print();
  }

  const canSend = quotation.status === 'draft' || quotation.status === 'under_negotiation';
  const canApprove = quotation.status === 'sent' || quotation.status === 'under_negotiation';
  const canOrder = quotation.status === 'approved';
  const isConverted = quotation.status === 'converted_to_order';

  return (
    <div className="space-y-6">
      <PageHeader
        title={quotation.quotationNumber}
        description={`${quotation.lead?.name ?? 'Customer'} · ${quotation.systemCapacityKw} kWp`}
        breadcrumbs={[{ label: 'Quotations', href: '/quotations' }, { label: quotation.quotationNumber }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={quotation.status} config={QUOTATION_STATUS} />
            {quotation.leadId ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/crm/leads/${quotation.leadId}`}>View lead</Link>
              </Button>
            ) : null}
            {canSend ? (
              <Button size="sm" onClick={() => void handleSend()}>
                <Send className="mr-1.5 size-4" />
                Send to customer
              </Button>
            ) : null}
            {canApprove ? (
              <>
                <Button size="sm" variant="default" onClick={() => void handleApprove()}>
                  <CheckCircle2 className="mr-1.5 size-4" />
                  Customer approved
                </Button>
                <Button size="sm" variant="outline" onClick={() => void handleReject()}>
                  Rejected
                </Button>
              </>
            ) : null}
            {canOrder ? (
              <Button size="sm" onClick={() => void handleCreateOrder()}>
                <ShoppingCart className="mr-1.5 size-4" />
                Create sales order
              </Button>
            ) : null}
            {isConverted ? (
              <Button asChild size="sm" variant="secondary">
                <Link href="/orders">View orders</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <Tabs defaultValue="document">
        <TabsList>
          <TabsTrigger value="document" className="gap-1.5">
            <FileText className="size-3.5" />
            Customer quotation
          </TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="document" className="mt-4 space-y-4">
          <div className="flex justify-end print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-1.5 size-4" />
              Print / Save PDF
            </Button>
          </div>
          <QuotationDocument data={document} />
        </TabsContent>

        <TabsContent value="workflow" className="mt-4">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-6">
            <h3 className="text-sm font-semibold">Pre-sales pipeline</h3>
            <ol className="mt-4 space-y-3 text-sm">
              {[
                { step: 'Draft', done: true },
                {
                  step: 'Sent to customer',
                  done: ['sent', 'under_negotiation', 'approved', 'converted_to_order', 'rejected'].includes(
                    quotation.status,
                  ),
                },
                { step: 'Customer approved', done: ['approved', 'converted_to_order'].includes(quotation.status) },
                { step: 'Sales order confirmed', done: quotation.status === 'converted_to_order' },
              ].map((s) => (
                <li key={s.step} className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${s.done ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                  <span className={s.done ? 'font-medium' : 'text-muted-foreground'}>{s.step}</span>
                </li>
              ))}
            </ol>
            {quotation.survey ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Linked survey: {quotation.survey.surveyNumber} ({quotation.survey.recommendedCapacityKw} kW recommended)
              </p>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
