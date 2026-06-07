'use client';

import PageHeader from '@/components/layout/Pageheader';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { QUOTATION_STATUS } from '@/utils/constants';
import { formatCapacity, formatCurrency } from '@/utils/formatters';
import { useMutation, useQuery } from 'convex/react';
import Link from 'next/link';
import { toast } from 'sonner';

export function CustomerDetailView({ customerId }: { customerId: Id<'customers'> }) {
  const customer = useQuery(api.modules.customers.getCustomerById, { customerId });

  if (customer === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!customer) {
    return <p className="py-16 text-center text-muted-foreground">Customer not found</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description={`${customer.customerNumber} · ${customer.mobile}`}
        breadcrumbs={[
          { label: 'CRM', href: '/crm/customers' },
          { label: 'Customers', href: '/crm/customers' },
          { label: customer.customerNumber },
        ]}
        actions={
          customer.leadId ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/crm/leads/${customer.leadId}`}>View lead</Link>
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Contact & address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{customer.email ?? 'No email'}</p>
            <p>
              {customer.addressLine1}, {customer.city}, {customer.state} {customer.pincode}
            </p>
            <StatusBadge
              status={customer.kycVerified ? 'approved' : 'draft'}
              config={{
                approved: { label: 'KYC Verified', tone: 'green' },
                draft: { label: 'KYC Pending', tone: 'amber' },
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">DISCOM & compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>DISCOM: {customer.discomName}</p>
            <p>Consumer #: {customer.discomConsumerNo}</p>
            <p className="capitalize">Property: {customer.propertyType}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
        description={order.customer?.name ?? 'Sales order'}
        breadcrumbs={[{ label: 'Orders', href: '/orders' }, { label: order.orderNumber }]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Financials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Total: {formatCurrency(order.totalAmount)}</p>
            <p>Subsidy (est.): {formatCurrency(order.subsidyAmountEstimated)}</p>
            <p className="font-semibold">Net payable: {formatCurrency(order.netAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Payment milestones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.paymentSchedule.map((m) => (
              <div
                key={m.milestone}
                className="flex justify-between rounded-lg border border-border/50 px-3 py-2 text-sm"
              >
                <span>{m.milestone}</span>
                <span className="font-medium">{formatCurrency(m.dueAmount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function QuotationDetailView({ quotationId }: { quotationId: Id<'quotations'> }) {
  const quotation = useQuery(api.modules.quotations.getQuotationById, { quotationId });
  const updateStatus = useMutation(api.modules.quotations.updateQuotationStatus);

  if (quotation === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!quotation) return <p className="py-16 text-center text-muted-foreground">Quotation not found</p>;

  async function handleStatus(status: 'sent' | 'approved') {
    try {
      await updateStatus({ quotationId, status });
      toast.success(`Quotation ${status}`);
    } catch {
      toast.error('Update failed');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={quotation.quotationNumber}
        description={quotation.lead?.name ?? 'Quotation'}
        breadcrumbs={[{ label: 'Quotations', href: '/quotations' }, { label: quotation.quotationNumber }]}
        actions={
          <div className="flex gap-2">
            <StatusBadge status={quotation.status} config={QUOTATION_STATUS} />
            {quotation.status === 'draft' ? (
              <Button size="sm" onClick={() => void handleStatus('sent')}>
                Mark sent
              </Button>
            ) : quotation.status === 'sent' ? (
              <Button size="sm" onClick={() => void handleStatus('approved')}>
                Approve
              </Button>
            ) : null}
          </div>
        }
      />
      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">System</p>
            <p className="font-semibold">{formatCapacity(quotation.systemCapacityKw)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-semibold">{formatCurrency(quotation.totalAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">After subsidy</p>
            <p className="font-semibold text-emerald-600">{formatCurrency(quotation.netAmountAfterSubsidy ?? 0)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
