'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { formatCurrency, formatCurrencyCompact } from '@/utils/formatters';
import { useQuery } from 'convex/react';

export function ReportsAging() {
  const aging = useQuery(api.modules.finance.getAgingReceivables, {});

  if (aging === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  const buckets = [
    { label: 'Current', ...aging.current },
    { label: '1–30 days overdue', ...aging.days1_30 },
    { label: '31–60 days', ...aging.days31_60 },
    { label: '61–90 days', ...aging.days61_90 },
    { label: '90+ days', ...aging.above90 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Accounts receivable aging</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-2xl font-bold">{formatCurrency(aging.totalOutstanding)} total outstanding</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {buckets.map((b) => (
            <div key={b.label} className="rounded-lg border border-border/50 p-3">
              <p className="text-xs text-muted-foreground">{b.label}</p>
              <p className="text-lg font-semibold">{formatCurrencyCompact(b.amount)}</p>
              <p className="text-[10px] text-muted-foreground">{b.count} invoices</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
