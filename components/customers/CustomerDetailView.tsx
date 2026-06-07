'use client';

import PageHeader from '@/components/layout/Pageheader';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import Link from 'next/link';

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
            {customer.accountManager ? (
              <p className="text-muted-foreground">Account manager: {customer.accountManager.name}</p>
            ) : null}
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
