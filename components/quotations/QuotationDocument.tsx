'use client';

import { StatusBadge } from '@/components/status/StatusBadge';
import { api } from '@/convex/_generated/api';
import { calculatePMSuryaSubsidy } from '@/lib/subsidyCalculator';
import { QUOTATION_STATUS } from '@/utils/constants';
import { formatCapacity, formatCurrency, formatDate } from '@/utils/formatters';
import type { FunctionReturnType } from 'convex/server';
import { Sun } from 'lucide-react';

type DocData = NonNullable<FunctionReturnType<typeof api.modules.quotations.getQuotationDocument>>;

type QuotationDocumentProps = {
  data: DocData;
  className?: string;
};

export function QuotationDocument({ data, className }: QuotationDocumentProps) {
  const { quotation, company, billTo, survey, primaryBank } = data;
  const subsidy = calculatePMSuryaSubsidy(quotation.systemCapacityKw);
  const netPayable = quotation.netAmountAfterSubsidy ?? quotation.totalAmount - subsidy.subsidyAmount;

  const milestones = [
    { label: 'Token / Advance', pct: quotation.tokenAmountPct ?? 10 },
    { label: 'On Material Delivery', pct: quotation.onDeliveryPct ?? 40 },
    { label: 'On Installation', pct: quotation.onInstallationPct ?? 40 },
    { label: 'On Subsidy Release', pct: quotation.onSubsidyPct ?? 10 },
  ];

  return (
    <article
      className={`quotation-document mx-auto max-w-[210mm] bg-white text-slate-900 shadow-lg print:shadow-none ${className ?? ''}`}
    >
      {/* Header band */}
      <header className="border-b-4 border-amber-500 bg-linear-to-r from-slate-900 to-slate-800 px-8 py-6 text-white print:bg-slate-900">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-amber-500 text-slate-900">
              <Sun className="size-7" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{company?.name ?? 'Surya Solar Dealership'}</h1>
              <p className="text-xs text-slate-300">{company?.legalName}</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="text-lg font-bold text-amber-400">QUOTATION</p>
            <p className="font-mono font-semibold">{quotation.quotationNumber}</p>
            <p className="mt-1 text-xs text-slate-400">
              Date: {formatDate(quotation.createdAt)}
              <br />
              Valid till: {formatDate(quotation.validTill)}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-8 py-6">
        {/* Company + customer */}
        <div className="grid gap-6 sm:grid-cols-2">
          <section className="text-sm">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">From</h2>
            <p className="font-semibold">{company?.name}</p>
            <p className="text-slate-600">{company?.addressLine1}</p>
            <p className="text-slate-600">
              {company?.city}, {company?.state} — {company?.pincode}
            </p>
            <p className="mt-2 text-slate-600">GSTIN: {company?.gstin}</p>
            <p className="text-slate-600">PAN: {company?.pan}</p>
            <p className="text-slate-600">
              {company?.phone} · {company?.email}
            </p>
          </section>
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Bill To</h2>
            {billTo ? (
              <>
                <p className="text-base font-semibold">{billTo.name}</p>
                <p className="text-slate-600">{billTo.mobile}</p>
                {'email' in billTo && billTo.email ? <p className="text-slate-600">{billTo.email}</p> : null}
                <p className="mt-2 text-slate-600">{billTo.addressLine1}</p>
                <p className="text-slate-600">
                  {billTo.city}, {billTo.state} — {billTo.pincode}
                </p>
              </>
            ) : (
              <p className="text-slate-500">Customer details pending</p>
            )}
          </section>
        </div>

        {/* System specification */}
        <section className="rounded-lg border border-amber-200/80 bg-amber-50/50 p-4">
          <h2 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-amber-800">Proposed Solar System</h2>
          <div className="grid gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Capacity</p>
              <p className="font-semibold">{formatCapacity(quotation.systemCapacityKw)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Solar Panels</p>
              <p className="font-semibold">{quotation.panelCount} Nos</p>
            </div>
            {survey?.recommendedCapacityKw ? (
              <div>
                <p className="text-xs text-slate-500">Survey Ref</p>
                <p className="font-mono text-xs font-semibold">{survey.surveyNumber}</p>
              </div>
            ) : null}
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <StatusBadge status={quotation.status} config={QUOTATION_STATUS} />
            </div>
          </div>
        </section>

        {/* Line items */}
        <section>
          <h2 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Scope of Work & Pricing
          </h2>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-600">
                  <th className="px-3 py-2.5 font-semibold">#</th>
                  <th className="px-3 py-2.5 font-semibold">Description</th>
                  <th className="px-3 py-2.5 font-semibold">HSN</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Qty</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Rate (₹)</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Taxable (₹)</th>
                  <th className="px-3 py-2.5 text-right font-semibold">GST %</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {quotation.lineItems.map((item, i) => (
                  <tr key={`${item.sku}-${i}`} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium">{item.productName}</p>
                      <p className="font-mono text-[10px] text-slate-400">{item.sku}</p>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs">{item.hsnCode}</td>
                    <td className="px-3 py-2.5 text-right">{item.quantity}</td>
                    <td className="px-3 py-2.5 text-right">{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2.5 text-right">{item.taxableAmount.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2.5 text-right">{item.taxRate}%</td>
                    <td className="px-3 py-2.5 text-right font-medium">{item.lineTotal.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Totals + subsidy */}
        <div className="grid gap-6 sm:grid-cols-2">
          <section className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-800">
              PM Surya Ghar Subsidy (Estimated)
            </h2>
            <p className="text-2xl font-bold text-emerald-700">{formatCurrency(subsidy.subsidyAmount)}</p>
            <p className="mt-1 text-xs text-emerald-800/80">{subsidy.description}</p>
            <p className="mt-2 text-[11px] text-emerald-700/70">
              Eligible up to {subsidy.eligibleCapacityKw} kW · Credited to customer bank account by Govt. of India
            </p>
          </section>
          <section className="space-y-1.5 text-sm">
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">Taxable value</span>
              <span>{formatCurrency(quotation.taxableValue)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">CGST</span>
              <span>{formatCurrency(quotation.cgstAmount)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-slate-600">SGST</span>
              <span>{formatCurrency(quotation.sgstAmount)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-2 font-semibold">
              <span>Gross total</span>
              <span>{formatCurrency(quotation.totalAmount)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-emerald-700">
              <span>Less: PM Surya subsidy (est.)</span>
              <span>− {formatCurrency(subsidy.subsidyAmount)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-slate-900 px-3 py-3 text-base font-bold text-white">
              <span>Net payable by customer</span>
              <span>{formatCurrency(netPayable)}</span>
            </div>
          </section>
        </div>

        {/* Payment schedule */}
        <section>
          <h2 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Payment Schedule</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {milestones.map((m) => (
              <div
                key={m.label}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm"
              >
                <span>
                  {m.label} <span className="text-slate-400">({m.pct}%)</span>
                </span>
                <span className="font-semibold">{formatCurrency((netPayable * m.pct) / 100)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bank details */}
        {primaryBank ? (
          <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Bank Details for Payment
            </h2>
            <p>
              <strong>{primaryBank.bankName}</strong> · A/C: {primaryBank.accountNumber} · IFSC: {primaryBank.ifsc}
            </p>
            <p className="text-slate-600">{primaryBank.branch}</p>
          </section>
        ) : null}

        {/* Terms */}
        <section>
          <h2 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Terms & Conditions</h2>
          <ol className="list-decimal space-y-1 pl-4 text-[11px] leading-relaxed text-slate-600">
            {(quotation.termsAndConditions ?? '').split('\n').map((line, i) => (
              <li key={i}>{line.replace(/^\d+\.\s*/, '')}</li>
            ))}
          </ol>
        </section>

        {/* Signatures */}
        <footer className="grid gap-8 border-t border-slate-200 pt-8 sm:grid-cols-2">
          <div>
            <div className="mb-12 border-b border-slate-300" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Authorized Signatory</p>
            <p className="text-sm font-medium">{company?.name}</p>
          </div>
          <div>
            <div className="mb-12 border-b border-slate-300" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer Acceptance</p>
            <p className="text-sm text-slate-600">Name, signature & date</p>
          </div>
        </footer>
      </div>
    </article>
  );
}
