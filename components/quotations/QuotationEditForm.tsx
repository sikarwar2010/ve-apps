'use client';

import PageHeader from '@/components/layout/Pageheader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type QuotationEditFormProps = {
  quotationId: Id<'quotations'>;
};

export function QuotationEditForm({ quotationId }: QuotationEditFormProps) {
  const router = useRouter();
  const quotation = useQuery(api.modules.quotations.getQuotationById, { quotationId });
  const updateQuotation = useMutation(api.modules.quotations.updateQuotation);

  const [capacityKw, setCapacityKw] = useState('');
  const [panelCount, setPanelCount] = useState('');
  const [validTill, setValidTill] = useState('');
  const [terms, setTerms] = useState('');
  const [tokenPct, setTokenPct] = useState('10');
  const [deliveryPct, setDeliveryPct] = useState('40');
  const [installPct, setInstallPct] = useState('40');
  const [subsidyPct, setSubsidyPct] = useState('10');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!quotation) return;
    setCapacityKw(String(quotation.systemCapacityKw));
    setPanelCount(String(quotation.panelCount ?? ''));
    setValidTill(new Date(quotation.validTill).toISOString().slice(0, 10));
    setTerms(quotation.termsAndConditions ?? '');
    setTokenPct(String(quotation.tokenAmountPct ?? 10));
    setDeliveryPct(String(quotation.onDeliveryPct ?? 40));
    setInstallPct(String(quotation.onInstallationPct ?? 40));
    setSubsidyPct(String(quotation.onSubsidyPct ?? 10));
  }, [quotation]);

  if (quotation === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!quotation) {
    return <p className="py-16 text-center text-muted-foreground">Quotation not found</p>;
  }

  if (quotation.status !== 'draft' && quotation.status !== 'under_negotiation') {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Only draft quotations can be edited.</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push(`/quotations/${quotationId}`)}>
          Back to quotation
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const kw = parseFloat(capacityKw);
    if (!kw || !validTill) {
      toast.error('Capacity and valid till date are required');
      return;
    }
    setSubmitting(true);
    try {
      await updateQuotation({
        quotationId,
        systemCapacityKw: kw,
        panelCount: panelCount ? parseInt(panelCount, 10) : undefined,
        validTill: new Date(validTill).getTime(),
        termsAndConditions: terms || undefined,
        tokenAmountPct: parseFloat(tokenPct),
        onDeliveryPct: parseFloat(deliveryPct),
        onInstallationPct: parseFloat(installPct),
        onSubsidyPct: parseFloat(subsidyPct),
      });
      toast.success('Quotation updated');
      router.push(`/quotations/${quotationId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={`Edit ${quotation.quotationNumber}`}
        description={quotation.lead?.name ?? 'Draft quotation'}
        breadcrumbs={[
          { label: 'Quotations', href: '/quotations' },
          { label: quotation.quotationNumber, href: `/quotations/${quotationId}` },
          { label: 'Edit' },
        ]}
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">System & validity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="capacityKw">System capacity (kWp)</Label>
              <Input
                id="capacityKw"
                type="number"
                step="0.1"
                value={capacityKw}
                onChange={(e) => setCapacityKw(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="panelCount">Panel count</Label>
              <Input id="panelCount" type="number" value={panelCount} onChange={(e) => setPanelCount(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="validTill">Valid till</Label>
              <Input id="validTill" type="date" value={validTill} onChange={(e) => setValidTill(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Payment milestones (%)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="tokenPct">Token</Label>
              <Input id="tokenPct" type="number" value={tokenPct} onChange={(e) => setTokenPct(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="deliveryPct">On delivery</Label>
              <Input
                id="deliveryPct"
                type="number"
                value={deliveryPct}
                onChange={(e) => setDeliveryPct(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="installPct">On installation</Label>
              <Input id="installPct" type="number" value={installPct} onChange={(e) => setInstallPct(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="subsidyPct">On subsidy</Label>
              <Input id="subsidyPct" type="number" value={subsidyPct} onChange={(e) => setSubsidyPct(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Terms & conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea rows={6} value={terms} onChange={(e) => setTerms(e.target.value)} />
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
