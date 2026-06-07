'use client';

import PageHeader from '@/components/layout/Pageheader';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { ORDER_STATUS } from '@/utils/constants';
import { formatCapacity, formatCurrency, formatDate } from '@/utils/formatters';
import { useQuery } from 'convex/react';
import Link from 'next/link';

export function OrderDetailView({ orderId }: { orderId: Id<'salesOrders'> }) {
  const order = useQuery(api.modules.orders.getOrderById, { orderId });

  if (order === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!order) return <p className="py-16 text-center text-muted-foreground">Order not found</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.orderNumber}
        description={`${order.customer?.name ?? 'Customer'} · Confirmed ${formatDate(order.orderDate)}`}
        breadcrumbs={[{ label: 'Sales Orders', href: '/orders' }, { label: order.orderNumber }]}
        actions={
          <div className="flex gap-2">
            <StatusBadge status={order.status} config={ORDER_STATUS} />
            {order.quotationId ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/quotations/${order.quotationId}`}>View quotation</Link>
              </Button>
            ) : null}
            {order.leadId ? (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/crm/leads/${order.leadId}`}>View lead</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="font-semibold">{order.customer?.name}</p>
              <p className="text-muted-foreground">{order.customer?.mobile}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">From quotation</p>
              <p className="font-mono text-sm">{order.quotation?.quotationNumber ?? '—'}</p>
              {order.quotation ? (
                <p className="text-muted-foreground">{formatCapacity(order.quotation.systemCapacityKw)}</p>
              ) : null}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gross order value</p>
              <p className="text-lg font-bold">{formatCurrency(order.totalAmount)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Net payable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subsidy (est.)</span>
              <span className="text-emerald-600">− {formatCurrency(order.subsidyAmountEstimated)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Customer pays</span>
              <span>{formatCurrency(order.netAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Payment milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {order.paymentSchedule.map((m) => (
              <div
                key={m.milestone}
                className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{m.milestone}</p>
                  <p className="text-xs text-muted-foreground">{m.duePct}% of net</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(m.dueAmount)}</p>
                  <StatusBadge
                    status={m.status}
                    config={{
                      pending: { label: 'Pending', tone: 'amber' },
                      partial: { label: 'Partial', tone: 'blue' },
                      paid: { label: 'Paid', tone: 'green' },
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
