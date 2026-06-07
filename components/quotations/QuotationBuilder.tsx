'use client';

import PageHeader from '@/components/layout/Pageheader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { calculatePMSuryaSubsidy } from '@/lib/subsidyCalculator';
import { formatCurrency } from '@/utils/formatters';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function QuotationBuilder() {
  const router = useRouter();
  const leads = useQuery(api.modules.lead.listLeads, { limit: 100 });
  const products = useQuery(api.modules.products.listProducts, {});
  const createQuotation = useMutation(api.modules.quotations.createQuotation);

  const [leadId, setLeadId] = useState('');
  const [capacityKw, setCapacityKw] = useState('5');
  const [panelCount, setPanelCount] = useState('10');
  const [submitting, setSubmitting] = useState(false);

  const subsidy = calculatePMSuryaSubsidy(parseFloat(capacityKw) || 0);

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
      const validTill = Date.now() + 30 * 86400000;
      const id = await createQuotation({
        leadId: leadId as Id<'leads'>,
        systemCapacityKw: kw,
        panelCount: panels,
        validTill,
        lineItems,
      });
      toast.success('Quotation created');
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
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="New quotation"
        description="Auto-build from product catalog with PM Surya subsidy"
        breadcrumbs={[{ label: 'Quotations', href: '/quotations' }, { label: 'New' }]}
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Lead & system</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Lead</Label>
              <Select value={leadId} onValueChange={setLeadId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((l) => (
                    <SelectItem key={l._id} value={l._id}>
                      {l.name} — {l.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="kw">System capacity (kW)</Label>
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
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
              <p className="text-muted-foreground">PM Surya subsidy estimate</p>
              <p className="text-lg font-semibold text-emerald-700">{formatCurrency(subsidy.subsidyAmount)}</p>
              <p className="text-xs text-muted-foreground">{subsidy.description}</p>
            </div>
          </CardContent>
        </Card>
        <Button type="submit" disabled={submitting || !leadId} className="w-full">
          {submitting ? 'Creating…' : 'Create draft quotation'}
        </Button>
      </form>
    </div>
  );
}
