'use client';

import PageHeader from '@/components/layout/Pageheader';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function CustomerDetailView({ customerId }: { customerId: Id<'customers'> }) {
  const router = useRouter();
  const customer = useQuery(api.modules.customers.getCustomerById, { customerId });
  const deleteCustomer = useMutation(api.modules.customers.deleteCustomer);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteCustomer({ customerId });
      toast.success('Customer deactivated');
      router.push('/crm/customers');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
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
          <div className="flex gap-2">
            {customer.leadId ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/crm/leads/${customer.leadId}`}>View lead</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href={`/crm/customers/${customerId}/edit`}>
                <Pencil className="mr-1.5 size-4" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-1.5 size-4" />
              Deactivate
            </Button>
          </div>
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
            {customer.bankAccountNumber ? (
              <p className="text-muted-foreground">
                Bank: {customer.bankName} · {customer.bankIfsc}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Deactivate customer?"
        description="Customer will be hidden from lists. Existing orders are preserved."
        confirmLabel="Deactivate"
        loading={loading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
