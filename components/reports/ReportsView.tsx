'use client';

import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { formatCurrency, formatCurrencyCompact } from '@/utils/formatters';
import { useQuery } from 'convex/react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function ReportsView() {
  const mis = useQuery(api.modules.reports.getMISReport, {});
  const chart = useQuery(api.modules.reports.getMonthlyRevenueChart, { year: new Date().getFullYear() });
  const aging = useQuery(api.modules.finance.getAgingReceivables, {});

  if (mis === undefined || chart === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Leads (30d)</p>
          <p className="text-2xl font-bold">{mis.leads.total}</p>
          <p className="text-xs text-emerald-600">{mis.leads.conversionRate}% conversion</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Orders (30d)</p>
          <p className="text-2xl font-bold">{mis.orders.total}</p>
          <p className="text-xs text-muted-foreground">{formatCurrencyCompact(mis.orders.totalValue)} value</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Revenue collected</p>
          <p className="text-2xl font-bold">{formatCurrencyCompact(mis.revenue.totalCollected)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">kW installed</p>
          <p className="text-2xl font-bold">{mis.operations.totalKwInstalled} kWp</p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold">Monthly revenue & orders</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {aging ? (
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold">Aging receivables</h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Current', data: aging.current },
              { label: '1–30 days', data: aging.days1_30 },
              { label: '31–60 days', data: aging.days31_60 },
              { label: '61–90 days', data: aging.days61_90 },
              { label: '90+ days', data: aging.above90 },
              { label: 'Total', data: { count: 0, amount: aging.totalOutstanding } },
            ].map((b) => (
              <div key={b.label} className="rounded-lg border border-border/50 bg-muted/20 p-3">
                <p className="text-[11px] text-muted-foreground">{b.label}</p>
                <p className="text-lg font-semibold">{formatCurrencyCompact(b.data.amount)}</p>
                {b.label !== 'Total' ? (
                  <p className="text-[10px] text-muted-foreground">{b.data.count} invoices</p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
