'use client';

import PageHeader from '@/components/layout/Pageheader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { DEFAULT_QUOTATION_TERMS, PAYMENT_MILESTONES_DEFAULT } from '@/lib/presales';
import { calculatePMSuryaSubsidy } from '@/lib/subsidyCalculator';
import { formatCurrency } from '@/utils/formatters';
import { useMutation, useQuery } from 'convex/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export function QuotationBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preLeadId = searchParams.get('leadId') ?? '';
  const preSurveyId = searchParams.get('surveyId') ?? '';

  const leads = useQuery(api.modules.lead.listLeads, { limit: 200 });
  const products = useQuery(api.modules.products.listProducts, {});
  const createQuotation = useMutation(api.modules.quotations.createQuotation);

  const [leadId, setLeadId] = useState(preLeadId);
  const [capacityKw, setCapacityKw] = useState('5');
  const [panelCount, setPanelCount] = useState('10');
  const [validDays, setValidDays] = useState('30');
  const [terms, setTerms] = useState(DEFAULT_QUOTATION_TERMS);
  const [submitting, setSubmitting] = useState(false);

  const selectedLead = leads?.find((l) => l._id === leadId);
  const eligibleLeads = useMemo(() => leads?.filter((l) => !['won', 'lost'].includes(l.status)) ?? [], [leads]);

  useEffect(() => {
    if (preLeadId) setLeadId(preLeadId);
  }, [preLeadId]);

  useEffect(() => {
    if (selectedLead?.expectedCapacityKw) {
      setCapacityKw(String(selectedLead.expectedCapacityKw));
      const panels = Math.ceil((selectedLead.expectedCapacityKw * 1000) / 540);
      setPanelCount(String(panels || 10));
    }
  }, [selectedLead?.expectedCapacityKw, selectedLead?._id]);

  const subsidy = calculatePMSuryaSubsidy(parseFloat(capacityKw) || 0);

  const previewTotal = useMemo(() => {
    if (!products?.length) return 0;
    const kw = parseFloat(capacityKw) || 0;
    const panels = parseInt(panelCount, 10) || 0;
    const panel = products.find((p) => p.category === 'panel');
    const inverter = products.find((p) => p.category === 'inverter');
    const structure = products.find((p) => p.category === 'structure');
    const labor = products.find((p) => p.category === 'labor');
    let total = 0;
    if (panel) total += (panel.mrp ?? 15000) * panels * 1.12;
    if (inverter) total += (inverter.mrp ?? 35000) * 1.12;
    if (structure) total += (structure.mrp ?? 22000) * 1.18;
    if (labor) total += (labor.mrp ?? 12000) * 1.18;
    return Math.round(total);
  }, [products, capacityKw, panelCount]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadId || !products?.length) return;

    const kw = parseFloat(capacityKw);
    const panels = parseInt(panelCount, 10);
    const panel = products.find((p) => p.category === 'panel') ?? products[0];
    const inverter = products.find((p) => p.category === 'inverter') ?? products[0];
    const structure = products.find((p) => p.category === 'structure');
    const labor = products.find((p) => p.category === 'labor');

    const lineItems = [
      {
        productId: panel._id,
        productName: panel.name,
        sku: panel.sku,
        quantity: panels,
        unitPrice: panel.mrp ?? panel.standardCost ?? 15000,
        taxRate: panel.gstRate,
        hsnCode: panel.hsnCode,
      },
      {
        productId: inverter._id,
        productName: inverter.name,
        sku: inverter.sku,
        quantity: 1,
        unitPrice: inverter.mrp ?? inverter.standardCost ?? 35000,
        taxRate: inverter.gstRate,
        hsnCode: inverter.hsnCode,
      },
    ];

    if (structure) {
      lineItems.push({
        productId: structure._id,
        productName: structure.name,
        sku: structure.sku,
        quantity: 1,
        unitPrice: structure.mrp ?? structure.standardCost ?? 22000,
        taxRate: structure.gstRate,
        hsnCode: structure.hsnCode,
      });
    }
    if (labor) {
      lineItems.push({
        productId: labor._id,
        productName: labor.name,
        sku: labor.sku,
        quantity: 1,
        unitPrice: labor.mrp ?? labor.standardCost ?? 12000,
        taxRate: labor.gstRate,
        hsnCode: labor.hsnCode,
      });
    }

    setSubmitting(true);
    try {
      const validTill = Date.now() + parseInt(validDays, 10) * 86400000;
      const id = await createQuotation({
        leadId: leadId as Id<'leads'>,
        surveyId: preSurveyId ? (preSurveyId as Id<'surveys'>) : undefined,
        systemCapacityKw: kw,
        panelCount: panels,
        validTill,
        lineItems,
        ...PAYMENT_MILESTONES_DEFAULT,
        termsAndConditions: terms,
      });
      toast.success('Draft quotation created');
      router.push(`/quotations/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create quotation');
    } finally {
      setSubmitting(false);
    }
  }

  if (leads === undefined || products === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="New quotation"
        description="Enterprise quote with GST, PM Surya subsidy, and payment milestones"
        breadcrumbs={[{ label: 'Quotations', href: '/quotations' }, { label: 'New' }]}
      />

      {selectedLead && selectedLead.status !== 'survey_completed' && selectedLead.status !== 'interested' ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          Tip: Complete a site survey first for accurate system sizing. You can still draft a quote for interested
          leads.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">1. Customer & system</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Lead</Label>
              <Select value={leadId} onValueChange={setLeadId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleLeads.map((l) => (
                    <SelectItem key={l._id} value={l._id}>
                      {l.name} — {l.city} ({l.status.replace(/_/g, ' ')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="kw">Capacity (kWp)</Label>
                <Input
                  id="kw"
                  type="number"
                  step="0.1"
                  value={capacityKw}
                  onChange={(e) => setCapacityKw(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="panels">Panel count</Label>
                <Input id="panels" type="number" value={panelCount} onChange={(e) => setPanelCount(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="valid">Valid (days)</Label>
                <Input id="valid" type="number" value={validDays} onChange={(e) => setValidDays(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">2. Commercial summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Est. gross (incl. GST)</p>
              <p className="text-lg font-bold">{formatCurrency(previewTotal)}</p>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="text-xs text-muted-foreground">PM Surya subsidy</p>
              <p className="text-lg font-bold text-emerald-700">{formatCurrency(subsidy.subsidyAmount)}</p>
              <p className="text-[10px] text-muted-foreground">{subsidy.description}</p>
            </div>
            <div className="rounded-lg bg-slate-900 p-3 text-white">
              <p className="text-xs text-slate-400">Est. net payable</p>
              <p className="text-lg font-bold">{formatCurrency(Math.max(0, previewTotal - subsidy.subsidyAmount))}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">3. Terms (printed on quotation)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={6}
              className="text-xs leading-relaxed"
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={submitting || !leadId} className="w-full" size="lg">
          {submitting ? 'Creating draft…' : 'Create draft quotation'}
        </Button>
      </form>
    </div>
  );
}
